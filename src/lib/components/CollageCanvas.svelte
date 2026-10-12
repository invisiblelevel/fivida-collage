<script lang="ts">
  import { open, save } from '@tauri-apps/plugin-dialog';
  import { readFile, writeFile } from '@tauri-apps/plugin-fs';
  import { Plus, Trash2, Download, Shuffle, ImagePlus } from '@lucide/svelte';
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t } from '$lib/i18n/index.js';
  import type { SelectedImage, Cell } from '$lib/state/appState.svelte.js';

  const app = getAppState();
  const tr = $derived((key: string, params?: Record<string, string | number>, n?: number) => t(app.locale, key, params, n));

  let canvasEl: HTMLCanvasElement | undefined = $state();
  let wrapperEl: HTMLDivElement | undefined = $state();
  let rendering = $state(false);
  let exporting = $state(false);
  let error = $state('');

  let loadedImages: HTMLImageElement[] = [];
  let imagesVersion = $state(0);
  let loadedForKey = '';

  type CellRect = { x: number; y: number; w: number; h: number; shape?: 'rect' | 'circle' | 'ellipse' | 'hexagon' | 'diamond' | 'star' };
  let layout: CellRect[] = $state([]);

  // Drag-n-drop
  let dragFrom = $state<number | null>(null);
  let dragTo = $state<number | null>(null);
  let canGrab = $state(false);

  // Ротация
  let rotatingIndex = $state<number | null>(null);
  let rotatingAngle = $state(0);
  let rotationStartAngle = 0;
  let rotationStartMouse = 0;

  // Hover на канвасе
  let canvasHoveredIndex = $state<number | null>(null);

  // Отмена/тротлинг рендера
  let renderToken = 0;
  let renderScheduled = false;

  // ---------- Утилиты сетки ----------

  function buildGridCells(cols: number, rows: number): Cell[] {
    const cells: Cell[] = [];
    const cw = 1 / cols;
    const ch = 1 / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ x: c * cw, y: r * ch, w: cw, h: ch });
      }
    }
    return cells;
  }

  function currentCells(): Cell[] {
    if (app.collage.layout !== null && app.collage.layout.length > 0) {
      return app.collage.layout;
    }
    return buildGridCells(app.collage.columns, app.collage.rows);
  }

  // ---------- Загрузка файлов ----------

  function makeThumbUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  async function pickFiles() {
    try {
      const selected = await open({
        multiple: true,
        filters: [{
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'webp'],
        }],
      });

      if (!selected) return;
      const paths = Array.isArray(selected) ? selected : [selected];

      const images: SelectedImage[] = [];
      for (const path of paths) {
        const data = await readFile(path);
        const name = path.split(/[\\/]/).pop() ?? 'image';
        const file = new File([data], name);
        images.push({
          file,
          path,
          thumbUrl: makeThumbUrl(file),
        });
      }

      app.addCollageImages(images);
      error = '';
      await loadAllImages();
      scheduleRender();
    } catch (e) {
      error = String(e);
    }
  }

  async function pickAndReplace(index: number) {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'webp'],
        }],
      });
      if (!selected) return;
      const path = Array.isArray(selected) ? selected[0] : selected;
      const data = await readFile(path);
      const name = path.split(/[\\/]/).pop() ?? 'image';
      const file = new File([data], name);
      const newImage: SelectedImage = {
        file,
        path,
        thumbUrl: makeThumbUrl(file),
      };
      app.replaceCollageImage(index, newImage);
      error = '';
      await loadAllImages();
      scheduleRender();
    } catch (e) {
      error = String(e);
    }
  }

  function removeAt(index: number) {
    app.removeCollageImage(index);
  }

  // ---------- Предзагрузка изображений ----------

  function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }

  let loadingKey = '';

  async function loadAllImages() {
    const files = app.collageImages.map((i) => i.file);
    const key = files.map((f) => f.name).join('|') + '::' + files.length;

    if (key === loadedForKey && loadedImages.length === files.length) {
      return;
    }
    if (key === loadingKey) {
      return;
    }

    loadingKey = key;
    try {
      const loaded = await Promise.all(files.map(loadImageFromFile));
      loadedImages = loaded;
      loadedForKey = key;
      imagesVersion++;
    } finally {
      loadingKey = '';
    }
  }

  // ---------- Рендер ----------

  function drawCoverRaw(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number, dy: number,
    dw: number, dh: number
  ) {
    const imgAspect = img.width / img.height;
    const cellAspect = dw / dh;

    let sx = 0, sy = 0, sw = img.width, sh = img.height;

    if (imgAspect > cellAspect) {
      sw = img.height * cellAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / cellAspect;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  function drawCoverRotated(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number, dy: number,
    dw: number, dh: number,
    angleDeg: number
  ) {
    if (angleDeg === 0) {
      drawCoverRaw(ctx, img, dx, dy, dw, dh);
      return;
    }

    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));

    const scale = Math.max(
      (dw * cos + dh * sin) / dw,
      (dw * sin + dh * cos) / dh
    );

    const scaledW = dw * scale;
    const scaledH = dh * scale;

    ctx.save();
    ctx.translate(dx + dw / 2, dy + dh / 2);
    ctx.rotate(rad);
    drawCoverRaw(ctx, img, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
    ctx.restore();
  }

  async function renderCollage(token: number) {
    if (!canvasEl || app.collageImages.length === 0) return;

    rendering = true;
    error = '';

    try {
      const W = app.collage.outputWidth;
      const cells = currentCells();
      const H = W;

      const gapPx = app.collage.gap;
      const bg = app.collage.backgroundColor;

      canvasEl.width = W;
      canvasEl.height = H;
      const ctx = canvasEl.getContext('2d');
      if (!ctx) throw new Error(tr('errors.noContext'));

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      if (token !== renderToken) return;

      const cellsPx: CellRect[] = [];
      const borderW = app.collage.borderWidth;
      const borderCol = app.collage.borderColor;
      const radius = app.collage.borderRadius;
      const shadowInt = app.collage.shadowIntensity;

      const shadowAlpha = (shadowInt / 100) * 0.55;
      const shadowBlur = (shadowInt / 100) * 30;
      const shadowOffsetY = (shadowInt / 100) * 12;

      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        const innerW = W - gapPx * 2;
        const innerH = H - gapPx * 2;

        const dx = gapPx + c.x * innerW;
        const dy = gapPx + c.y * innerH;
        const dw = c.w * innerW - gapPx;
        const dh = c.h * innerH - gapPx;

        const safeW = Math.max(1, dw);
        const safeH = Math.max(1, dh);

        const shape: 'rect' | 'circle' | 'ellipse' | 'hexagon' | 'diamond' | 'star' = c.shape ?? 'rect';

        cellsPx.push({ x: dx, y: dy, w: safeW, h: safeH, shape });

        const img = loadedImages[i];
        if (!img) continue;

        if (shadowInt > 0) {
          ctx.save();
          ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`;
          ctx.shadowBlur = shadowBlur;
          ctx.shadowOffsetY = shadowOffsetY;
          ctx.fillStyle = '#000';
          applyShapePath(ctx, shape, dx, dy, safeW, safeH, radius);
          ctx.fill();
          ctx.restore();
        }

        const rotation = app.collageRotations[i] ?? 0;
        drawCellPhoto(ctx, img, dx, dy, safeW, safeH, shape, radius, rotation);

        if (borderW > 0) {
          ctx.save();
          ctx.strokeStyle = borderCol;
          ctx.lineWidth = borderW;
          const half = borderW / 2;
          applyShapePath(
            ctx, shape,
            dx + half, dy + half,
            Math.max(0, safeW - borderW),
            Math.max(0, safeH - borderW),
            Math.max(0, radius - half)
          );
          ctx.stroke();
          ctx.restore();
        }
      }

      layout = cellsPx;
    } catch (e) {
      error = String(e);
    } finally {
      rendering = false;
    }
  }

  function scheduleRender() {
    renderToken++;
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
      renderScheduled = false;
      const token = renderToken;
      renderCollage(token);
    });
  }

  // ---------- Пути фигур ----------

  function roundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: number
  ) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function ellipsePath(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number
  ) {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.closePath();
  }

  function hexagonPath(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number
  ) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + rx * Math.cos(a);
      const py = cy + ry * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function diamondPath(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number
  ) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.lineTo(cx + rx, cy);
    ctx.lineTo(cx, cy + ry);
    ctx.lineTo(cx - rx, cy);
    ctx.closePath();
  }

  function starPath(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number
  ) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rOuter = Math.min(w, h) / 2;
    const rInner = rOuter * 0.38;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const isOuter = i % 2 === 0;
      const r = isOuter ? rOuter : rInner;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const px = cx + r * Math.cos(a);
      const py = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function applyShapePath(
    ctx: CanvasRenderingContext2D,
    shape: string,
    x: number, y: number,
    w: number, h: number,
    radius: number
  ) {
    if (shape === 'rect') {
      roundRectPath(ctx, x, y, w, h, radius);
    } else if (shape === 'hexagon') {
      hexagonPath(ctx, x, y, w, h);
    } else if (shape === 'diamond') {
      diamondPath(ctx, x, y, w, h);
    } else if (shape === 'star') {
      starPath(ctx, x, y, w, h);
    } else {
      ellipsePath(ctx, x, y, w, h);
    }
  }

  function pointInPolygon(px: number, py: number, points: number[]): boolean {
    let inside = false;
    const n = points.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = points[i * 2], yi = points[i * 2 + 1];
      const xj = points[j * 2], yj = points[j * 2 + 1];
      const intersect =
        (yi > py) !== (yj > py) &&
        px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function getShapePoints(
    shape: string,
    x: number, y: number,
    w: number, h: number
  ): number[] {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const pts: number[] = [];

    if (shape === 'diamond') {
      const rx = w / 2;
      const ry = h / 2;
      pts.push(cx, cy - ry, cx + rx, cy, cx, cy + ry, cx - rx, cy);
    } else if (shape === 'star') {
      const rOuter = Math.min(w, h) / 2;
      const rInner = rOuter * 0.38;
      for (let i = 0; i < 10; i++) {
        const isOuter = i % 2 === 0;
        const r = isOuter ? rOuter : rInner;
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        pts.push(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
    } else if (shape === 'hexagon') {
      const rx = w / 2;
      const ry = h / 2;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        pts.push(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
      }
    }
    return pts;
  }

  function drawCellPhoto(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number, dy: number,
    dw: number, dh: number,
    shape: 'rect' | 'circle' | 'ellipse' | 'hexagon' | 'diamond' | 'star',
    radius: number,
    angleDeg: number
  ) {
    if (shape === 'rect') {
      if (radius > 0) {
        ctx.save();
        roundRectPath(ctx, dx, dy, dw, dh, radius);
        ctx.clip();
        drawCoverRotated(ctx, img, dx, dy, dw, dh, angleDeg);
        ctx.restore();
      } else {
        drawCoverRotated(ctx, img, dx, dy, dw, dh, angleDeg);
      }
      return;
    }

    ctx.save();
    applyShapePath(ctx, shape, dx, dy, dw, dh, radius);
    ctx.clip();
    drawCoverRotated(ctx, img, dx, dy, dw, dh, angleDeg);
    ctx.restore();
  }

  // ---------- Экспорт ----------

  async function exportCollage() {
    if (!canvasEl || app.collageImages.length === 0) return;

    try {
      const path = await save({
        defaultPath: `collage-${Date.now()}.png`,
        filters: [
          { name: 'PNG', extensions: ['png'] },
          { name: 'JPEG', extensions: ['jpg', 'jpeg'] },
          { name: 'WebP', extensions: ['webp'] },
        ],
      });

      if (!path) return;

      exporting = true;
      error = '';

      const lower = path.toLowerCase();
      let mime = 'image/png';
      let quality = 1.0;

      if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        mime = 'image/jpeg';
        quality = 0.9;
      } else if (lower.endsWith('.webp')) {
        mime = 'image/webp';
        quality = 0.9;
      } else if (lower.endsWith('.png')) {
        mime = 'image/png';
        quality = 1.0;
      }

      const blob = await new Promise<Blob | null>((resolve) => {
        canvasEl!.toBlob((b) => resolve(b), mime, quality);
      });

      if (!blob) throw new Error(tr('errors.blob'));

      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      await writeFile(path, bytes);
    } catch (e) {
      error = String(e);
    } finally {
      exporting = false;
    }
  }

  function clearAll() {
    app.clearCollageImages();
    loadedImages = [];
    loadedForKey = '';
    error = '';
    dragFrom = null;
    dragTo = null;
    canvasHoveredIndex = null;
    rotatingIndex = null;
  }

  // ---------- Хит-тест ----------

  function cellIndexAt(e: PointerEvent): number | null {
    if (!wrapperEl || layout.length === 0) return null;
    const canvasRect = canvasEl?.getBoundingClientRect();
    if (!canvasRect) return null;

    const relX = ((e.clientX - canvasRect.left) / canvasRect.width) * (canvasEl!.width);
    const relY = ((e.clientY - canvasRect.top) / canvasRect.height) * (canvasEl!.height);

    for (let i = layout.length - 1; i >= 0; i--) {
      const c = layout[i];
      const shape = c.shape ?? 'rect';

      if (shape === 'rect') {
        if (relX >= c.x && relX <= c.x + c.w && relY >= c.y && relY <= c.y + c.h) {
          return i;
        }
      } else if (shape === 'hexagon' || shape === 'diamond' || shape === 'star') {
        const pts = getShapePoints(shape, c.x, c.y, c.w, c.h);
        if (pts.length > 0 && pointInPolygon(relX, relY, pts)) {
          return i;
        }
      } else {
        const cx = c.x + c.w / 2;
        const cy = c.y + c.h / 2;
        const rx = c.w / 2;
        const ry = c.h / 2;
        const nx = (relX - cx) / rx;
        const ny = (relY - cy) / ry;
        if (nx * nx + ny * ny <= 1) {
          return i;
        }
      }
    }
    return null;
  }

  const filledCells = $derived(app.collageImages.length);

  function isCellFilled(i: number): boolean {
    return i < filledCells;
  }

  // ---------- Drag-n-drop ----------

  function onPointerDown(e: PointerEvent) {
    const i = cellIndexAt(e);
    if (i === null || !isCellFilled(i)) return;
    dragFrom = i;
    dragTo = i;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (dragFrom === null && rotatingIndex === null) {
      const i = cellIndexAt(e);
      canGrab = i !== null && isCellFilled(i);

      if (i !== null && isCellFilled(i)) {
        canvasHoveredIndex = i;
      } else {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const overAction = el && (el as HTMLElement).closest('.rotate-handle, .cell-action');
        if (!overAction) {
          canvasHoveredIndex = null;
        }
      }
      return;
    }
    if (dragFrom === null) return;
    const i = cellIndexAt(e);
    if (i !== null && isCellFilled(i)) {
      dragTo = i;
    } else {
      dragTo = null;
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (dragFrom !== null && dragTo !== null && dragFrom !== dragTo) {
      app.swapCollageImages(dragFrom, dragTo);
    }
    dragFrom = null;
    dragTo = null;
    const i = cellIndexAt(e);
    canGrab = i !== null && isCellFilled(i);
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }

  function onPointerLeave() {
    if (dragFrom === null) canGrab = false;
    if (rotatingIndex === null) canvasHoveredIndex = null;
  }

  // ---------- Ротация ----------

  function cellCenter(i: number): { cx: number; cy: number } | null {
    if (i < 0 || i >= layout.length) return null;
    const c = layout[i];
    return { cx: c.x + c.w / 2, cy: c.y + c.h / 2 };
  }

  function angleFromCenter(e: PointerEvent, center: { cx: number; cy: number }): number {
    const canvasRect = canvasEl!.getBoundingClientRect();
    const relX = ((e.clientX - canvasRect.left) / canvasRect.width) * canvasEl!.width;
    const relY = ((e.clientY - canvasRect.top) / canvasRect.height) * canvasEl!.height;
    const dx = relX - center.cx;
    const dy = relY - center.cy;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return deg;
  }

  function startRotation(e: PointerEvent, i: number) {
    e.stopPropagation();
    e.preventDefault();
    const center = cellCenter(i);
    if (!center) return;

    rotatingIndex = i;
    rotatingAngle = app.collageRotations[i] ?? 0;
    rotationStartAngle = rotatingAngle;
    rotationStartMouse = angleFromCenter(e, center);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function moveRotation(e: PointerEvent) {
    if (rotatingIndex === null) return;
    const center = cellCenter(rotatingIndex);
    if (!center) return;

    const currentMouse = angleFromCenter(e, center);
    let delta = currentMouse - rotationStartMouse;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    let newAngle = rotationStartAngle + delta;
    newAngle = ((newAngle % 360) + 360) % 360;

    rotatingAngle = newAngle;
    app.setRotation(rotatingIndex, newAngle);
  }

  function endRotation(e: PointerEvent) {
    if (rotatingIndex === null) return;
    rotatingIndex = null;
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }

  function resetRotation(e: MouseEvent, i: number) {
    e.stopPropagation();
    e.preventDefault();
    app.setRotation(i, 0);
  }

  // ---------- Реактивность ----------

  $effect(() => {
    app.collage.columns;
    app.collage.rows;
    app.collage.gap;
    app.collage.backgroundColor;
    app.collage.outputWidth;
    app.collage.layout;
    app.collage.borderWidth;
    app.collage.borderColor;
    app.collage.borderRadius;
    app.collage.shadowIntensity;
    app.collageRotations.length;
    app.collageRotations.join(',');
    imagesVersion;
    scheduleRender();
  });
</script>

<div class="collage-viewport">
  {#if app.collageImages.length === 0}
    <div class="empty">
      {#if error}
        <p class="error">{error}</p>
      {/if}
      <button class="load-btn" onclick={pickFiles}>
        <Plus size={22} strokeWidth={2} />
        <span>{tr('toolbar.addPhoto')}</span>
      </button>
    </div>
  {:else}
    <div class="toolbar">
      <span class="photo-count">
        {tr('toolbar.photo', { n: app.collageImages.length }, app.collageImages.length)}
      </span>
      <div class="toolbar-divider"></div>
      <button class="tool-btn" onclick={pickFiles} disabled={rendering || exporting}>
        <Plus size={14} />
        {tr('toolbar.add')}
      </button>
      <button class="tool-btn" onclick={() => app.shuffleCollageImages()} disabled={rendering || exporting || app.collageImages.length < 2}>
        <Shuffle size={14} />
        {tr('toolbar.shuffle')}
      </button>
      <button class="tool-btn primary" onclick={exportCollage} disabled={rendering || exporting}>
        <Download size={14} />
        {exporting ? tr('toolbar.saving') : tr('toolbar.save')}
      </button>
      <button class="tool-btn" onclick={clearAll} disabled={rendering || exporting}>
        <Trash2 size={14} />
        {tr('toolbar.clear')}
      </button>
    </div>

    <div class="canvas-area">
      {#if error}
        <p class="error">{error}</p>
      {/if}

      <div
        class="canvas-wrapper"
        class:can-grab={canGrab}
        class:grabbing={dragFrom !== null}
        bind:this={wrapperEl}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerUp}
        onpointercancel={onPointerUp}
        onpointerleave={onPointerLeave}
      >
        <canvas bind:this={canvasEl} class:rendering={rendering || exporting}></canvas>

        <div class="overlay" style="aspect-ratio: {canvasEl?.width ?? 1} / {canvasEl?.height ?? 1};">
          {#each layout as cell, i}
            <div
              class="cell-highlight"
              class:round={cell.shape === 'circle' || cell.shape === 'ellipse'}
              class:hex={cell.shape === 'hexagon'}
              class:diamond={cell.shape === 'diamond'}
              class:star={cell.shape === 'star'}
              class:dragging-from={dragFrom === i}
              class:dragging-to={dragTo === i && dragFrom !== i}
              style="
                left: {(cell.x / (canvasEl?.width ?? 1)) * 100}%;
                top: {(cell.y / (canvasEl?.height ?? 1)) * 100}%;
                width: {(cell.w / (canvasEl?.width ?? 1)) * 100}%;
                height: {(cell.h / (canvasEl?.height ?? 1)) * 100}%;
              "
            ></div>
          {/each}
        </div>

        <div class="cell-controls-layer">
          {#each layout as cell, i}
            {#if i < app.collageImages.length && (canvasHoveredIndex === i || rotatingIndex === i)}
              <div
                class="cell-controls"
                style="
                  left: {(cell.x / (canvasEl?.width ?? 1)) * 100}%;
                  top: {(cell.y / (canvasEl?.height ?? 1)) * 100}%;
                  width: {(cell.w / (canvasEl?.width ?? 1)) * 100}%;
                  height: {(cell.h / (canvasEl?.height ?? 1)) * 100}%;
                "
              >
                <div class="cell-actions-top">
                  <button
                    class="cell-action"
                    title={tr('cell.replace')}
                    onpointerdown={(e) => e.stopPropagation()}
                    onclick={(e) => { e.stopPropagation(); pickAndReplace(i); }}
                  >
                    <ImagePlus size={14} strokeWidth={2.2} />
                  </button>
                  <button
                    class="cell-action danger"
                    title={tr('cell.remove')}
                    onpointerdown={(e) => e.stopPropagation()}
                    onclick={(e) => { e.stopPropagation(); removeAt(i); }}
                  >
                    <Trash2 size={14} strokeWidth={2.2} />
                  </button>
                </div>

                <button
                  class="rotate-handle"
                  class:active={rotatingIndex === i}
                  onpointerdown={(e) => startRotation(e, i)}
                  onpointermove={moveRotation}
                  onpointerup={endRotation}
                  onpointercancel={endRotation}
                  ondblclick={(e) => resetRotation(e, i)}
                  title={tr('cell.rotate')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>

                {#if rotatingIndex === i}
                  <div class="rotate-badge">{Math.round(rotatingAngle)}°</div>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .collage-viewport {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-base);
    min-width: 0;
    min-height: 0;
    position: relative;
  }

  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .load-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 18px 32px;
    border-radius: var(--radius);
    background: var(--accent);
    color: white;
    font-size: 16px; font-weight: 600; letter-spacing: 0.2px;
    box-shadow: 0 4px 16px var(--accent-glow);
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .load-btn:hover {
    background: var(--accent-hover);
    box-shadow: 0 6px 22px var(--accent-glow);
    transform: translateY(-1px);
  }
  .load-btn:active { transform: translateY(0); }

  .toolbar {
    position: absolute;
    top: 12px; left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex; gap: 6px; align-items: center;
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(10px);
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }

  .photo-count {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    padding: 0 6px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .toolbar-divider {
    width: 1px;
    height: 18px;
    background: rgba(255, 255, 255, 0.15);
    margin: 0 2px;
  }

  .tool-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px;
    border-radius: var(--radius-sm);
    color: rgba(255, 255, 255, 0.85);
    font-size: 12.5px; font-weight: 500;
    transition: all 0.15s ease;
    background: transparent; border: none;
    cursor: pointer;
  }
  .tool-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  .tool-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .tool-btn.primary { background: var(--accent); color: white; }
  .tool-btn.primary:hover:not(:disabled) { background: var(--accent-hover); }

  .canvas-area {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    padding-top: 72px;
    overflow: auto;
    min-height: 0;
    position: relative;
  }

  .canvas-wrapper {
    position: relative;
    max-width: 100%; max-height: 100%;
    display: inline-flex;
    align-items: center; justify-content: center;
    user-select: none;
    touch-action: none;
  }
  .canvas-wrapper.can-grab { cursor: grab; }
  .canvas-wrapper.grabbing,
  .canvas-wrapper.grabbing:active { cursor: grabbing; }

  canvas {
    max-width: 100%; max-height: 100%;
    object-fit: contain;
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    transition: opacity 0.15s;
    display: block;
  }
  canvas.rendering { opacity: 0.4; }

  .overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    border-radius: var(--radius);
    overflow: hidden;
  }

  .cell-highlight {
    position: absolute;
    border-radius: 4px;
    border: 2px solid transparent;
    transition: border-color 0.12s ease, background 0.12s ease, opacity 0.12s ease;
    pointer-events: none;
  }

  .cell-highlight.round { border-radius: 50%; }

  .cell-highlight.hex {
    clip-path: polygon(
      50% 0%, 93% 25%, 93% 75%,
      50% 100%, 7% 75%, 7% 25%
    );
  }

  .cell-highlight.diamond {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  .cell-highlight.star {
    clip-path: polygon(
      50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%,
      50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%
    );
  }

  .cell-highlight.dragging-from {
    border-color: var(--accent);
    background: rgba(124, 108, 255, 0.25);
    opacity: 0.6;
  }
  .cell-highlight.dragging-to {
    border-color: var(--accent);
    background: var(--accent-soft);
    box-shadow: 0 0 0 3px var(--accent-soft), inset 0 0 20px var(--accent-glow);
  }

  .cell-controls-layer {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    border-radius: var(--radius);
  }

  .cell-controls {
    position: absolute;
    pointer-events: none;
  }

  .cell-actions-top {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 5px;
    pointer-events: none;
  }

  .cell-action {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(6px);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    pointer-events: auto;
    transition: transform 0.12s, background 0.12s;
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 0;
    z-index: 5;
  }
  .cell-action:hover {
    transform: scale(1.1);
    background: var(--accent);
  }
  .cell-action.danger:hover {
    background: #e5484d;
  }

  .rotate-handle {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(6px);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    pointer-events: auto;
    transition: transform 0.12s, background 0.12s;
    border: 1px solid rgba(255, 255, 255, 0.25);
    z-index: 5;
    padding: 0;
  }
  .rotate-handle:hover {
    transform: scale(1.1);
    background: var(--accent);
  }
  .rotate-handle.active {
    cursor: grabbing;
    background: var(--accent);
    transform: scale(1.15);
  }

  .rotate-badge {
    position: absolute;
    right: 50px;
    bottom: 14px;
    padding: 3px 7px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
    font-variant-numeric: tabular-nums;
    pointer-events: none;
    z-index: 6;
  }

  .error {
    color: #ff6b6b;
    font-size: 13px;
    position: absolute;
    top: 16px; left: 16px;
    z-index: 20;
  }
</style>