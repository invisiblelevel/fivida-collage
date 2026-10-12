import { getContext, setContext } from 'svelte';
import { getInitialLocale, saveLocale, mapSystemLocale, type Locale } from '$lib/i18n/index.js';

export type CollageSection = 'grids' | 'layouts' | 'figures' | 'style';
export type CellShape = 'rect' | 'circle' | 'ellipse' | 'hexagon' | 'diamond' | 'star';
export type FigureKind = 'circle' | 'ellipse' | 'pyramid' | 'hexagon' | 'honeycomb' | 'diamonds' | 'stars';

export interface SelectedImage {
  file: File;
  path: string;
  thumbUrl: string;
}

export interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: CellShape;
}

export interface CollageSettings {
  columns: number;
  rows: number;
  gap: number;
  backgroundColor: string;
  outputWidth: number;
  layout: Cell[] | null;
  activeFigure: FigureKind | null;
  figurePhotoCount: number;
  figureScale: number;

  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  shadowIntensity: number;
}

export class AppState {
  activeSection = $state<CollageSection>('grids');
  locale = $state<Locale>(getInitialLocale());
  zoomLevel = $state<number>(1.0);

  // Модалки
  showAbout = $state(false);
  showSupport = $state(false);

  collageImages = $state<SelectedImage[]>([]);
  collageRotations = $state<number[]>([]);

  collageHoveredIndex = $state<number | null>(null);
  collage = $state<CollageSettings>({
    columns: 2,
    rows: 2,
    gap: 10,
    backgroundColor: '#ffffff',
    outputWidth: 1024,
    layout: null,
    activeFigure: null,
    figurePhotoCount: 6,
    figureScale: 1.0,

    borderWidth: 0,
    borderColor: '#000000',
    borderRadius: 0,
    shadowIntensity: 0,
  });

  setSection(s: CollageSection) {
    this.activeSection = s;
  }

  setLocale(l: Locale) {
    this.locale = l;
    saveLocale(l);
  }

  initLocale() {
    // Если язык уже сохранён пользователем — не переопределяем
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('fivida.locale');
      if (saved === 'ru' || saved === 'en' || saved === 'zh') return;
    }
    // Определяем язык системы через navigator.language
    const sysLocale = typeof navigator !== 'undefined' ? navigator.language : null;
    const mapped = mapSystemLocale(sysLocale);
    this.locale = mapped;
    saveLocale(mapped);
  }

  setZoom(level: number) {
    this.zoomLevel = level;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fivida.zoom', String(level));
    }
  }

  openAbout() {
    this.showAbout = true;
  }
  closeAbout() {
    this.showAbout = false;
    this.showSupport = false;
  }
  openSupport() {
    this.showSupport = true;
  }
  closeSupport() {
    this.showSupport = false;
  }

  addCollageImages(images: SelectedImage[]) {
    this.collageImages = [...this.collageImages, ...images];
    this.collageRotations = [...this.collageRotations, ...images.map(() => 0)];
  }

  removeCollageImage(index: number) {
    const img = this.collageImages[index];
    if (img?.thumbUrl) URL.revokeObjectURL(img.thumbUrl);
    this.collageImages = this.collageImages.filter((_, i) => i !== index);
    this.collageRotations = this.collageRotations.filter((_, i) => i !== index);
    if (this.collageHoveredIndex === index) this.collageHoveredIndex = null;
  }

  // Заменить фото в конкретной ячейке: старое удаляется, новое встаёт на его место
  replaceCollageImage(index: number, newImage: SelectedImage) {
    if (index < 0 || index >= this.collageImages.length) return;
    const old = this.collageImages[index];
    if (old?.thumbUrl) URL.revokeObjectURL(old.thumbUrl);

    const arr = [...this.collageImages];
    arr[index] = newImage;
    this.collageImages = arr;

    // Сбрасываем поворот для новой картинки
    const rot = [...this.collageRotations];
    rot[index] = 0;
    this.collageRotations = rot;
  }

  clearCollageImages() {
    for (const img of this.collageImages) {
      if (img.thumbUrl) URL.revokeObjectURL(img.thumbUrl);
    }
    this.collageImages = [];
    this.collageRotations = [];
    this.collageHoveredIndex = null;
  }

  swapCollageImages(a: number, b: number) {
    if (a === b) return;
    const arr = [...this.collageImages];
    const rot = [...this.collageRotations];
    if (a < 0 || b < 0 || a >= arr.length || b >= arr.length) return;
    [arr[a], arr[b]] = [arr[b], arr[a]];
    [rot[a], rot[b]] = [rot[b], rot[a]];
    this.collageImages = arr;
    this.collageRotations = rot;
  }

  shuffleCollageImages() {
    const arr = [...this.collageImages];
    const rot = [...this.collageRotations];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
      [rot[i], rot[j]] = [rot[j], rot[i]];
    }
    this.collageImages = arr;
    this.collageRotations = rot;
  }

  setRotation(index: number, angle: number) {
    if (index < 0 || index >= this.collageImages.length) return;
    const rot = [...this.collageRotations];
    while (rot.length < this.collageImages.length) rot.push(0);
    rot[index] = angle;
    this.collageRotations = rot;
  }

  updateCollage<K extends keyof CollageSettings>(key: K, value: CollageSettings[K]) {
    this.collage = { ...this.collage, [key]: value };
  }

  applyGridPreset(cols: number, rows: number) {
    this.collage = {
      ...this.collage,
      columns: cols,
      rows: rows,
      layout: null,
      activeFigure: null,
    };
  }

  applyLayoutPreset(cells: Cell[], visualCols: number, visualRows: number) {
    this.collage = {
      ...this.collage,
      columns: visualCols,
      rows: visualRows,
      layout: cells,
      activeFigure: null,
    };
  }

  applyFigure(kind: FigureKind, n: number, scale = this.collage.figureScale) {
    let cells: Cell[];
    let count = n;

    switch (kind) {
      case 'circle': cells = circleLayout(n, scale); break;
      case 'ellipse': cells = ellipseLayout(n, scale); break;
      case 'pyramid': cells = pyramidLayout(n, scale); break;
      case 'hexagon': cells = hexagonLayout(scale); count = 7; break;
      case 'honeycomb': cells = honeycombLayout(scale); count = 19; break;
      case 'diamonds': cells = diamondsLayout(n, scale); break;
      case 'stars': cells = starsLayout(n, scale); break;
    }

    this.collage = {
      ...this.collage,
      columns: 1,
      rows: 1,
      layout: cells,
      activeFigure: kind,
      figurePhotoCount: count,
      figureScale: scale,
    };
  }

  updateFigureCount(n: number) {
    if (!this.collage.activeFigure) return;
    if (this.collage.activeFigure === 'hexagon') return;
    if (this.collage.activeFigure === 'honeycomb') return;
    this.applyFigure(this.collage.activeFigure, n, this.collage.figureScale);
  }

  updateFigureScale(scale: number) {
    if (!this.collage.activeFigure) return;
    this.applyFigure(this.collage.activeFigure, this.collage.figurePhotoCount, scale);
  }
}

// ---------- Генераторы фигур ----------

function circleLayout(n: number, scale: number): Cell[] {
  const R = 0.36;
  const baseD = Math.min(0.30, (2 * Math.PI * R) / n * 0.92);
  const d = baseD * scale;
  const cells: Cell[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const cx = 0.5 + R * Math.cos(angle);
    const cy = 0.5 + R * Math.sin(angle);
    cells.push({ x: cx - d / 2, y: cy - d / 2, w: d, h: d, shape: 'circle' });
  }
  return cells;
}

function ellipseLayout(n: number, scale: number): Cell[] {
  const a = 0.40;
  const b = 0.28;
  const baseD = 0.26;
  const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
  const perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  const baseCell = Math.min(baseD, (perimeter / n) * 0.9);
  const d = baseCell * scale;
  const cells: Cell[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const cx = 0.5 + a * Math.cos(angle);
    const cy = 0.5 + b * Math.sin(angle);
    cells.push({ x: cx - d / 2, y: cy - d / 2, w: d, h: d, shape: 'ellipse' });
  }
  return cells;
}

function pyramidLayout(n: number, scale: number): Cell[] {
  const levels: number[] = [];
  let remaining = n;
  let level = 1;
  while (remaining > 0 && level <= 6) {
    const take = Math.min(level, remaining);
    levels.push(take);
    remaining -= take;
    level++;
  }
  const maxLevel = Math.max(...levels);
  const cellBase = (1 / maxLevel) * 0.92;
  const d = cellBase * scale;
  const cells: Cell[] = [];
  const totalLevels = levels.length;
  const totalH = totalLevels * d;
  const startY = 0.5 - totalH / 2;
  for (let li = 0; li < levels.length; li++) {
    const count = levels[li];
    const rowW = count * d;
    const startX = 0.5 - rowW / 2;
    const y = startY + li * d;
    for (let i = 0; i < count; i++) {
      const x = startX + i * d;
      cells.push({ x, y, w: d, h: d, shape: 'circle' });
    }
  }
  return cells;
}

function hexagonLayout(scale: number): Cell[] {
  const cells: Cell[] = [];
  const R = 0.30;
  const baseD = 0.28;
  const d = baseD * scale;
  cells.push({ x: 0.5 - d / 2, y: 0.5 - d / 2, w: d, h: d, shape: 'hexagon' });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const cx = 0.5 + R * Math.cos(angle);
    const cy = 0.5 + R * Math.sin(angle);
    cells.push({ x: cx - d / 2, y: cy - d / 2, w: d, h: d, shape: 'hexagon' });
  }
  return cells;
}

function honeycombLayout(scale: number): Cell[] {
  const baseD = 0.22;
  const d = baseD * scale;
  const stepX = d * 0.87;
  const stepY = d * 0.75;
  const rowCounts = [3, 4, 5, 4, 3];
  const totalRows = rowCounts.length;
  const cells: Cell[] = [];
  const centerY = 0.5;
  for (let row = 0; row < totalRows; row++) {
    const rowCount = rowCounts[row];
    const rowW = rowCount * stepX;
    const startX = 0.5 - rowW / 2 + stepX / 2;
    for (let col = 0; col < rowCount; col++) {
      const cx = startX + col * stepX;
      const cy = centerY + (row - (totalRows - 1) / 2) * stepY;
      cells.push({ x: cx - d / 2, y: cy - d / 2, w: d, h: d, shape: 'hexagon' });
    }
  }
  return cells;
}

function diamondsLayout(n: number, scale: number): Cell[] {
  const size = Math.max(1, Math.floor(Math.sqrt(n)));
  const step = 1 / size;
  const d = step * 1.05 * scale;
  const startX = 0.5 - (size * step) / 2 + step / 2;
  const startY = 0.5 - (size * step) / 2 + step / 2;
  const cells: Cell[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cx = startX + col * step;
      const cy = startY + row * step;
      cells.push({ x: cx - d / 2, y: cy - d / 2, w: d, h: d, shape: 'diamond' });
    }
  }
  return cells;
}

function starsLayout(n: number, scale: number): Cell[] {
  const size = Math.max(1, Math.floor(Math.sqrt(n)));
  const step = 1 / size;
  const d = step * 1.05 * scale;
  const startX = 0.5 - (size * step) / 2 + step / 2;
  const startY = 0.5 - (size * step) / 2 + step / 2;
  const cells: Cell[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cx = startX + col * step;
      const cy = startY + row * step;
      cells.push({ x: cx - d / 2, y: cy - d / 2, w: d, h: d, shape: 'star' });
    }
  }
  return cells;
}

const KEY = Symbol('app-state');

export function setAppState() {
  return setContext(KEY, new AppState());
}

export function getAppState() {
  return getContext<AppState>(KEY);
}