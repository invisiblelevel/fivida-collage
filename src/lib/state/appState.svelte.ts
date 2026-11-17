import { getContext, setContext } from 'svelte';
import { getInitialLocale, saveLocale, mapSystemLocale, type Locale } from '$lib/i18n/index.js';
import { STYLE_PRESETS } from './stylePresets.js';

export type CollageSection = 'grids' | 'layouts' | 'figures' | 'style';
export type CellShape = 'rect' | 'circle' | 'ellipse' | 'hexagon' | 'diamond' | 'star';
export type FigureKind = 'circle' | 'ellipse' | 'pyramid' | 'hexagon' | 'honeycomb' | 'diamonds' | 'stars';
export type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';

export type BackgroundType = 'color' | 'pattern' | 'image' | 'transparent';
export type ImageFit = 'cover' | 'contain' | 'stretch';
export type PatternKind = 'dots' | 'grid' | 'grid-bold' | 'diagonal' | 'diagonal-cross' | 'chevron' | 'waves' | 'crosses' | 'plus-grid' | 'triangles' | 'hexagons' | 'circles' | 'dashes' | 'confetti';

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

export interface BackgroundSettings {
  type: BackgroundType;
  color: string;
  pattern: PatternKind;
  patternColor: string;
  patternScale: number;
  image: SelectedImage | null;
  imageFit: ImageFit;
  imageBackdrop: string;
}

export interface CollageSettings {
  columns: number;
  rows: number;
  gap: number;
  aspectRatio: AspectRatio;
  background: BackgroundSettings;
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

interface HistorySnapshot {
  collage: CollageSettings;
  rotations: number[];
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
    aspectRatio: '1:1',
    background: {
      type: 'color',
      color: '#ffffff',
      pattern: 'dots',
      patternColor: '#222222',
      patternScale: 1.0,
      image: null,
      imageFit: 'cover',
      imageBackdrop: '#ffffff',
    },
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

  // История (Undo/Redo)
  history = $state<HistorySnapshot[]>([]);
  historyIndex = $state(-1);
  maxHistory = 50;

  constructor() {
    this.pushHistory();
  }

  pushHistory() {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    const snapshot: HistorySnapshot = {
      collage: JSON.parse(JSON.stringify(this.collage)),
      rotations: [...this.collageRotations]
    };
    this.history.push(snapshot);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreHistory();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreHistory();
    }
  }

  restoreHistory() {
    const snap = this.history[this.historyIndex];
    if (!snap) return;
    this.collage = JSON.parse(JSON.stringify(snap.collage));
    this.collageRotations = [...snap.rotations];
  }

  setSection(s: CollageSection) { this.activeSection = s; }
  setLocale(l: Locale) { this.locale = l; saveLocale(l); }

  initLocale() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('fivida.locale');
      if (saved === 'ru' || saved === 'en' || saved === 'zh') return;
    }
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

  openAbout() { this.showAbout = true; }
  closeAbout() { this.showAbout = false; this.showSupport = false; }
  openSupport() { this.showSupport = true; }
  closeSupport() { this.showSupport = false; }

  addCollageImages(images: SelectedImage[]) {
    this.collageImages = [...this.collageImages, ...images];
    this.collageRotations = [...this.collageRotations, ...images.map(() => 0)];
    this.pushHistory();
  }

  removeCollageImage(index: number) {
    const img = this.collageImages[index];
    if (img?.thumbUrl) URL.revokeObjectURL(img.thumbUrl);
    this.collageImages = this.collageImages.filter((_, i) => i !== index);
    this.collageRotations = this.collageRotations.filter((_, i) => i !== index);
    if (this.collageHoveredIndex === index) this.collageHoveredIndex = null;
    this.pushHistory();
  }

  replaceCollageImage(index: number, newImage: SelectedImage) {
    if (index < 0 || index >= this.collageImages.length) return;
    const old = this.collageImages[index];
    if (old?.thumbUrl) URL.revokeObjectURL(old.thumbUrl);

    const arr = [...this.collageImages];
    arr[index] = newImage;
    this.collageImages = arr;

    const rot = [...this.collageRotations];
    rot[index] = 0;
    this.collageRotations = rot;
    this.pushHistory();
  }

  clearCollageImages() {
    for (const img of this.collageImages) {
      if (img.thumbUrl) URL.revokeObjectURL(img.thumbUrl);
    }
    this.collageImages = [];
    this.collageRotations = [];
    this.collageHoveredIndex = null;
    this.pushHistory();
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
    this.pushHistory();
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
    this.pushHistory();
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
    if (key !== 'gap' && key !== 'borderWidth' && key !== 'borderRadius' && key !== 'shadowIntensity') {
       this.pushHistory();
    }
  }

  updateBackground<K extends keyof BackgroundSettings>(key: K, value: BackgroundSettings[K]) {
    this.collage = {
      ...this.collage,
      background: { ...this.collage.background, [key]: value }
    };
    this.pushHistory();
  }

  setBackgroundImage(file: File, path: string = '') {
    if (this.collage.background.image?.thumbUrl) {
      URL.revokeObjectURL(this.collage.background.image.thumbUrl);
    }
    const img: SelectedImage = { file, path, thumbUrl: URL.createObjectURL(file) };
    this.updateBackground('image', img);
    this.updateBackground('type', 'image');
  }

  clearBackgroundImage() {
    if (this.collage.background.image?.thumbUrl) {
      URL.revokeObjectURL(this.collage.background.image.thumbUrl);
    }
    this.updateBackground('image', null);
    this.updateBackground('type', 'color');
  }

  applyStylePreset(id: string) {
    const preset = STYLE_PRESETS.find(p => p.id === id);
    if (!preset) return;

    this.collage = {
      ...this.collage,
      borderWidth: preset.borderWidth,
      borderColor: preset.borderColor,
      borderRadius: preset.borderRadius,
      shadowIntensity: preset.shadowIntensity,
      gap: preset.gap,
    };
    this.pushHistory();
  }

  applyGridPreset(cols: number, rows: number) {
    this.collage = { ...this.collage, columns: cols, rows: rows, layout: null, activeFigure: null };
    this.pushHistory();
  }

  applyLayoutPreset(cells: Cell[], visualCols: number, visualRows: number) {
    this.collage = { ...this.collage, columns: visualCols, rows: visualRows, layout: cells, activeFigure: null };
    this.pushHistory();
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
      columns: 1, rows: 1, layout: cells,
      activeFigure: kind, figurePhotoCount: count, figureScale: scale,
    };
    this.pushHistory();
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
function circleLayout(n: number, scale: number): Cell[] { /* Оставь свой старый код */ return []; }
function ellipseLayout(n: number, scale: number): Cell[] { /* Оставь свой старый код */ return []; }
function pyramidLayout(n: number, scale: number): Cell[] { /* Оставь свой старый код */ return []; }
function hexagonLayout(scale: number): Cell[] { /* Оставь свой старый код */ return []; }
function honeycombLayout(scale: number): Cell[] { /* Оставь свой старый код */ return []; }
function diamondsLayout(n: number, scale: number): Cell[] { /* Оставь свой старый код */ return []; }
function starsLayout(n: number, scale: number): Cell[] { /* Оставь свой старый код */ return []; }

const KEY = Symbol('app-state');
export function setAppState() { return setContext(KEY, new AppState()); }
export function getAppState() { return getContext<AppState>(KEY); }