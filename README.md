# Fivida Collage

**Build photo collages in one click** · **Сборка фотоколлажей в один клик** · **一键生成照片拼贴**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](../../releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6.svg)](#install)
[![Tauri](https://img.shields.io/badge/tauri-2.12-24C8DB.svg)](https://tauri.app/)
[![Svelte](https://img.shields.io/badge/svelte-5-FF3E00.svg)](https://svelte.dev/)
[![Languages](https://img.shields.io/badge/languages-EN%20%7C%20RU%20%7C%20ZH-orange.svg)](#languages)

[🇬🇧 English](#english) · [🇷🇺 Русский](#русский) · [🇨🇳 中文](#中文)

---

## English

Fivida Collage is a lightweight desktop app for building photo collages. Works fully offline — no clouds, subscriptions or data collection.

Pick photos → choose a layout or figure → fine-tune borders and shadows → export. Everything happens on your machine, nothing is sent anywhere.

### Features

- **15 regular grid layouts** — from 1×2 to 5×3
- **~19 irregular layouts** — Journal, Mosaic, Film strip, Polaroid, Pyramid, and more
- **7 figures** — Circle, Ellipse, Pyramid, Hexagon, Honeycomb, Diamonds, Stars
- **Free rotation** — grab the handle and turn each photo to any angle with auto-scaling
- **Drag-n-drop** — swap photos between cells directly on the canvas
- **Borders and shadows** — thickness, color, corner radius, shadow intensity
- **Custom HSV color picker** with HEX input
- **Export** — PNG / JPEG / WebP
- **Three languages** — English, Russian, Simplified Chinese, with system auto-detection
- **Interface zoom** — 100% / 150% / 200%
- **Fully offline** — installer bundles WebView2, works without internet

### Layouts and figures

| Category | Count | Examples |
|---|---|---|
| Regular grids | 15 | 1×2, 2×2, 3×3, 4×3, 5×3 |
| Irregular layouts | 19 | Journal, Header, Triptych, Mosaic, Film strip, Polaroid |
| Figures | 7 | Circle, Ellipse, Pyramid, Hexagon, Honeycomb, Diamonds, Stars |

### Tech Stack

Tauri 2.12 · SvelteKit + Svelte 5 (runes) · TypeScript · Rust · Vite 7 · Canvas 2D

### Install

Download **Fivida Collage Setup v1.0.0.exe** from [Releases](../../releases), run, install (choose English / Russian / Chinese). No dependencies needed — everything is bundled, including WebView2 runtime.

Windows 10 version 1903 or newer / Windows 11 (64-bit).

### Build from source

Requirements:

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.75+
- Windows 10/11 with WebView2 (usually preinstalled)

```bash
git clone https://github.com/<YOUR_USERNAME>/fivida-collage.git
cd fivida-collage

npm install

# Dev mode
npm run tauri dev

# Release build
npm run tauri build
The installer will appear in src-tauri/target/release/bundle/nsis/.

License
MIT — see LICENSE.

Author
INV.LVL · @invisiblelevel

Русский
Fivida Collage — лёгкое десктопное приложение для сборки коллажей из фотографий. Работает полностью оффлайн — без облаков, подписок и сбора данных.

Выбрал фото → выбрал раскладку или фигуру → подкрутил рамки и тени → экспортировал. Всё происходит на твоей машине, ничего никуда не отправляется.

Что умеет
15 регулярных сеток — от 1×2 до 5×3

~19 нерегулярных раскладок — Журнал, Мозаика, Киноплёнка, Полароид, Пирамида и другие

7 фигур — Круг, Овал, Пирамида, Шестиугольник, Соты, Ромбы, Звёзды

Свободный поворот — схвати значок и крути фото на любой угол, с автомасштабом

Drag-n-drop — перетаскивай фото между ячейками прямо на канвасе

Рамки и тени — толщина, цвет, скругление, интенсивность тени

Кастомный HSV-пикер с HEX-инпутом

Экспорт — PNG / JPEG / WebP

Три языка — английский, русский, китайский (упрощённый), с авто-определением системного

Зум интерфейса — 100% / 150% / 200%

Полностью оффлайн — установщик содержит WebView2, работает без интернета

Раскладки и фигуры
Категория	Количество	Примеры
Регулярные сетки	15	1×2, 2×2, 3×3, 4×3, 5×3
Нерегулярные раскладки	19	Журнал, Шапка, Триптих, Мозаика, Киноплёнка, Полароид
Фигуры	7	Круг, Овал, Пирамида, Шестиугольник, Соты, Ромбы, Звёзды
Стек
Tauri 2.12 · SvelteKit + Svelte 5 (runes) · TypeScript · Rust · Vite 7 · Canvas 2D

Установка
Скачай Fivida Collage Setup v1.0.0.exe из раздела Releases, запусти, установи (выбери язык: русский / английский / китайский). Зависимости не нужны — всё вшито в инсталлер, включая WebView2.

Поддерживается Windows 10 (версия 1903+) / Windows 11 (64-bit).

Сборка из исходников
Требования:

Node.js 18+

Rust 1.75+

Windows 10/11 с WebView2 (обычно уже установлен)

bash
git clone https://github.com/<ТВОЙ_ЮЗЕРНЕЙМ>/fivida-collage.git
cd fivida-collage

npm install

# Dev-режим
npm run tauri dev

# Релиз
npm run tauri build
Готовый установщик появится в src-tauri/target/release/bundle/nsis/.

Лицензия
MIT — см. LICENSE.

Автор
INV.LVL · @invisiblelevel

中文
Fivida Collage 是一款轻量的桌面照片拼贴工具。完全离线运行——无需云端、订阅或数据收集。

选照片 → 选布局或图形 → 调整边框与阴影 → 导出。所有处理都在本机完成，不会上传到任何地方。

功能
15 种规则网格布局 — 从 1×2 到 5×3

约 19 种不规则布局 — 杂志、马赛克、胶片、拍立得、金字塔等

7 种图形 — 圆形、椭圆、金字塔、六边形、蜂窝、菱形、星形

自由旋转 — 抓住手柄，任意角度旋转每张照片，自动缩放

拖放 — 直接在画布上交换单元格中的照片

边框与阴影 — 厚度、颜色、圆角、阴影强度

自定义 HSV 取色器，支持 HEX 输入

导出 — PNG / JPEG / WebP

三种语言 — 英语、俄语、简体中文，支持系统自动检测

界面缩放 — 100% / 150% / 200%

完全离线 — 安装包内置 WebView2，无需网络即可运行

布局与图形
类别	数量	示例
规则网格	15	1×2、2×2、3×3、4×3、5×3
不规则布局	19	杂志、顶栏、三联、马赛克、胶片、拍立得
图形	7	圆形、椭圆、金字塔、六边形、蜂窝、菱形、星形
技术栈
Tauri 2.12 · SvelteKit + Svelte 5 (runes) · TypeScript · Rust · Vite 7 · Canvas 2D

安装
从 Releases 下载 Fivida Collage Setup v1.0.0.exe，运行并安装（可选英语 / 俄语 / 中文）。无需任何依赖 — 全部已打包，含 WebView2 运行时。

支持 Windows 10（1903 或更新版本）/ Windows 11（64 位）。

从源码构建
环境要求：

Node.js 18+

Rust 1.75+

Windows 10/11 且已安装 WebView2（通常系统自带）

bash
git clone https://github.com/<YOUR_USERNAME>/fivida-collage.git
cd fivida-collage

npm install

# 开发模式
npm run tauri dev

# 发布构建
npm run tauri build
安装包将生成于 src-tauri/target/release/bundle/nsis/。

许可证
MIT — 见 LICENSE。

作者
INV.LVL · @invisiblelevel