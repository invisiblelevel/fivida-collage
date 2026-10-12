//! Порт remove_soap_adaptive + boost_saturation из pbr_generator.py.
//! Работает на нативном разрешении, без апскейла.
//! Адаптивный unsharp: усиливает только «мыльные» зоны, не галлюцинирует.

use crate::color::{lab_to_srgb, srgb_to_lab};
use image::{GrayImage, ImageBuffer, Luma, Rgb, RgbImage};

/// Взять L-канал из RGB (как Y в sRGB, приближение к LAB L*).
fn extract_l(rgb: &RgbImage) -> GrayImage {
    let (w, h) = (rgb.width(), rgb.height());
    let mut out: GrayImage = ImageBuffer::new(w, h);
    for y in 0..h {
        for x in 0..w {
            let p = rgb.get_pixel(x, y).0;
            let lum = (0.299 * p[0] as f32 + 0.587 * p[1] as f32 + 0.114 * p[2] as f32)
                .clamp(0.0, 255.0) as u8;
            out.put_pixel(x, y, Luma([lum]));
        }
    }
    out
}

/// Записать новый L обратно в RGB через LAB (сохраняя a*, b*).
fn write_l_back(rgb: &RgbImage, new_l: &GrayImage) -> RgbImage {
    let (w, h) = (rgb.width(), rgb.height());
    let mut out: RgbImage = ImageBuffer::new(w, h);
    for y in 0..h {
        for x in 0..w {
            let p = rgb.get_pixel(x, y).0;
            let srgb = [
                p[0] as f32 / 255.0,
                p[1] as f32 / 255.0,
                p[2] as f32 / 255.0,
            ];
            let lab = srgb_to_lab(srgb);
            let l_new = new_l.get_pixel(x, y).0[0] as f32 / 255.0 * 100.0;
            let new_srgb = lab_to_srgb([l_new, lab[1], lab[2]]);
            out.put_pixel(
                x, y,
                Rgb([
                    (new_srgb[0].clamp(0.0, 1.0) * 255.0) as u8,
                    (new_srgb[1].clamp(0.0, 1.0) * 255.0) as u8,
                    (new_srgb[2].clamp(0.0, 1.0) * 255.0) as u8,
                ]),
            );
        }
    }
    out
}

/// Адаптивный unsharp по средним частотам.
/// Работает только в зонах, где локальная контрастность (std) ниже медианы.
pub fn remove_soap_adaptive(
    rgb: &RgbImage,
    strength: f32,
    window: u32,
    _threshold: f32,
) -> RgbImage {
    if strength <= 0.0 {
        return rgb.clone();
    }

    let (w, h) = (rgb.width(), rgb.height());
    let k = if window % 2 == 1 { window } else { window + 1 };
    let radius = (k as f32) / 2.0;

    // 1. L-канал
    let l = extract_l(rgb);

    // 2. Локальное среднее и std через box-blur
    let mean = image::imageops::blur(&l, radius);

    // L*L для дисперсии
    let mut l_sq: GrayImage = ImageBuffer::new(w, h);
    for y in 0..h {
        for x in 0..w {
            let v = l.get_pixel(x, y).0[0] as f32;
            let sq = ((v * v) / 255.0).clamp(0.0, 255.0) as u8;
            l_sq.put_pixel(x, y, Luma([sq]));
        }
    }
    let sq_mean = image::imageops::blur(&l_sq, radius);

    // std = sqrt(avg(L*L) - mean^2)
    let mut std_values: Vec<f32> = Vec::with_capacity((w * h) as usize);
    for y in 0..h {
        for x in 0..w {
            let m = mean.get_pixel(x, y).0[0] as f32;
            let sqm = sq_mean.get_pixel(x, y).0[0] as f32 * (255.0 / 255.0);
            let var = (sqm * 255.0 - m * m).max(0.0);
            std_values.push(var.sqrt());
        }
    }

    // Медиана std
    let mut sorted = std_values.clone();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let median = sorted[sorted.len() / 2].max(1e-6);

    // deficit = clip((1.2 - ratio) / 0.6, 0, 1)
    let mut deficit: Vec<f32> = Vec::with_capacity(std_values.len());
    let mut dmax = 0.0f32;
    for &s in &std_values {
        let ratio = s / median;
        let d = ((1.2 - ratio) / 0.6).clamp(0.0, 1.0);
        if d > dmax { dmax = d; }
        deficit.push(d);
    }

    if dmax < 0.05 {
        return rgb.clone();
    }

    // Размытие deficit
    let mut deficit_img: GrayImage = ImageBuffer::new(w, h);
    for y in 0..h {
        for x in 0..w {
            let i = (y * w + x) as usize;
            deficit_img.put_pixel(x, y, Luma([(deficit[i] * 255.0) as u8]));
        }
    }
    let deficit_blur = image::imageops::blur(&deficit_img, (k as f32) / 3.0);

    let mut deficit_final: Vec<f32> = Vec::with_capacity((w * h) as usize);
    for y in 0..h {
        for x in 0..w {
            let mut d = deficit_blur.get_pixel(x, y).0[0] as f32 / 255.0;
            if d < 0.20 { d = 0.0; }
            deficit_final.push(d);
        }
    }

    // Unsharp по средним частотам
    let l_blur_2_5 = image::imageops::blur(&l, 2.5);
    let l_blur_6 = image::imageops::blur(&l, 6.0);

    let mut l_sharp: Vec<f32> = Vec::with_capacity((w * h) as usize);
    for y in 0..h {
        for x in 0..w {
            let lv = l.get_pixel(x, y).0[0] as f32;
            let b25 = l_blur_2_5.get_pixel(x, y).0[0] as f32;
            let b6 = l_blur_6.get_pixel(x, y).0[0] as f32;
            let detail = (lv - b25) * 0.7 + (lv - b6) * 0.4;
            let i = (y * w + x) as usize;
            let boosted = lv + detail * strength * 3.0 * deficit_final[i];
            l_sharp.push(boosted.clamp(0.0, 255.0));
        }
    }

    // Soft-clip через tanh (ограничивает ореолы)
    let mut l_sharp_img: GrayImage = ImageBuffer::new(w, h);
    for y in 0..h {
        for x in 0..w {
            let i = (y * w + x) as usize;
            l_sharp_img.put_pixel(x, y, Luma([l_sharp[i].round() as u8]));
        }
    }
    let local_mean = image::imageops::blur(&l_sharp_img, 3.0);
    let mut l_clipped: Vec<f32> = Vec::with_capacity((w * h) as usize);
    for y in 0..h {
        for x in 0..w {
            let lv = l_sharp_img.get_pixel(x, y).0[0] as f32;
            let lm = local_mean.get_pixel(x, y).0[0] as f32;
            let clip = 14.0f32;
            let soft = clip * ((lv - lm) / clip).tanh();
            l_clipped.push((lm + soft).clamp(0.0, 255.0));
        }
    }

    // Смешивание
    let mut l_final: GrayImage = ImageBuffer::new(w, h);
    for y in 0..h {
        for x in 0..w {
            let i = (y * w + x) as usize;
            let lv = l.get_pixel(x, y).0[0] as f32;
            let d = deficit_final[i];
            let mixed = lv * (1.0 - d) + l_clipped[i] * d;
            l_final.put_pixel(x, y, Luma([mixed.clamp(0.0, 255.0) as u8]));
        }
    }

    write_l_back(rgb, &l_final)
}

/// Поднять насыщенность. strength: 1.15 = +15%, 1.0 = без изменений.
pub fn boost_saturation(rgb: &RgbImage, strength: f32) -> RgbImage {
    if (strength - 1.0).abs() < 1e-3 {
        return rgb.clone();
    }
    let (w, h) = (rgb.width(), rgb.height());
    let mut out: RgbImage = ImageBuffer::new(w, h);
    for y in 0..h {
        for x in 0..w {
            let p = rgb.get_pixel(x, y).0;
            let r = p[0] as f32;
            let g = p[1] as f32;
            let b = p[2] as f32;
            let lum = 0.299 * r + 0.587 * g + 0.114 * b;
            let nr = (lum + (r - lum) * strength).clamp(0.0, 255.0) as u8;
            let ng = (lum + (g - lum) * strength).clamp(0.0, 255.0) as u8;
            let nb = (lum + (b - lum) * strength).clamp(0.0, 255.0) as u8;
            out.put_pixel(x, y, Rgb([nr, ng, nb]));
        }
    }
    out
}