<script lang="ts">
  import { onMount } from 'svelte';
  import type { StylePreset } from '$lib/state/stylePresets.js';

  let { preset }: { preset: StylePreset } = $props();
  let canvasEl: HTMLCanvasElement | undefined = $state();

  function render() {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const W = canvasEl.width;
    const H = canvasEl.height;
    const gap = preset.gap / 2; // Уменьшаем пропорционально для превью
    const cols = 2;
    const rows = 2;
    const cellW = (W - gap * 3) / cols;
    const cellH = (H - gap * 3) / rows;

    ctx.clearRect(0, 0, W, H);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gap + c * (cellW + gap);
        const y = gap + r * (cellH + gap);
        
        // Рисуем тень
        if (preset.shadowIntensity > 0) {
          ctx.save();
          ctx.shadowColor = `rgba(0, 0, 0, ${(preset.shadowIntensity / 100) * 0.55})`;
          ctx.shadowBlur = (preset.shadowIntensity / 100) * 10; // Уменьшено для превью
          ctx.shadowOffsetY = (preset.shadowIntensity / 100) * 4;
          ctx.fillStyle = '#000';
          
          if (preset.borderRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(x, y, cellW, cellH, Math.min(preset.borderRadius / 2, cellW / 2, cellH / 2));
            ctx.fill();
          } else {
            ctx.fillRect(x, y, cellW, cellH);
          }
          ctx.restore();
        }

        // Рисуем картинку (имитация цветным прямоугольником)
        ctx.save();
        if (preset.borderRadius > 0) {
          ctx.beginPath();
          ctx.roundRect(x, y, cellW, cellH, Math.min(preset.borderRadius / 2, cellW / 2, cellH / 2));
          ctx.clip();
        }
        ctx.fillStyle = '#444'; // Цвет фотографии (серый)
        ctx.fillRect(x, y, cellW, cellH);
        
        // Рисуем рамку (если есть)
        if (preset.borderWidth > 0) {
          ctx.strokeStyle = preset.borderColor;
          ctx.lineWidth = Math.max(1, preset.borderWidth / 4); // Уменьшено для превью
          if (preset.borderRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(x + ctx.lineWidth/2, y + ctx.lineWidth/2, cellW - ctx.lineWidth, cellH - ctx.lineWidth, Math.min((preset.borderRadius - ctx.lineWidth) / 2, cellW / 2, cellH / 2));
            ctx.stroke();
          } else {
            ctx.strokeRect(x + ctx.lineWidth/2, y + ctx.lineWidth/2, cellW - ctx.lineWidth, cellH - ctx.lineWidth);
          }
        }
        ctx.restore();
      }
    }
  }

  onMount(() => {
    render();
  });

  // Перерисовываем, если пресет изменился (на всякий случай)
  $effect(() => {
    preset;
    render();
  });
</script>

<canvas bind:this={canvasEl} width="80" height="80" style="width: 100%; height: 100%; display: block;"></canvas>