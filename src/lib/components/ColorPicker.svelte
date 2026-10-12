<script lang="ts">
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t } from '$lib/i18n/index.js';

  const app = getAppState();
  const tr = $derived((key: string) => t(app.locale, key));
  interface RGB { r: number; g: number; b: number; }

  interface Props {
    rgb?: RGB;
    onchange?: (c: RGB) => void;
    onapply?: () => void;
    oncancel?: () => void;
  }

  let {
    rgb = { r: 95, g: 85, b: 75 },
    onchange = () => {},
    onapply = () => {},
    oncancel = () => {},
  }: Props = $props();

  // Внутреннее состояние — HSV (h: 0..360, s: 0..1, v: 0..1)
  let h = $state(0);
  let s = $state(0);
  let v = $state(0);

  let lastEmitted = $state({ r: rgb.r, g: rgb.g, b: rgb.b });

  $effect(() => {
    const incoming = { r: rgb.r, g: rgb.g, b: rgb.b };
    if (
      incoming.r === lastEmitted.r &&
      incoming.g === lastEmitted.g &&
      incoming.b === lastEmitted.b
    ) {
      return;
    }
    const { h: nh, s: ns, v: nv } = rgbToHsv(incoming.r, incoming.g, incoming.b);
    h = nh; s = ns; v = nv;
    lastEmitted = incoming;
  });

  function emitChange() {
    const c = hsvToRgb(h, s, v);
    lastEmitted = c;
    onchange(c);
  }

  // ═══ Палитра-квадрат ═══
  let paletteEl = $state<HTMLDivElement>();
  let draggingPalette = false;

  function pickFromPalette(e: PointerEvent) {
    if (!paletteEl) return;
    const rect = paletteEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    s = x;
    v = 1 - y;
    emitChange();
  }

  function paletteDown(e: PointerEvent) {
    if (!paletteEl) return;
    draggingPalette = true;
    paletteEl.setPointerCapture(e.pointerId);
    pickFromPalette(e);
  }
  function paletteMove(e: PointerEvent) {
    if (!draggingPalette) return;
    pickFromPalette(e);
  }
  function paletteUp(e: PointerEvent) {
    draggingPalette = false;
    if (paletteEl?.hasPointerCapture(e.pointerId)) paletteEl.releasePointerCapture(e.pointerId);
  }

  // ═══ Hue-слайдер ═══
  let hueEl = $state<HTMLDivElement>();
  let draggingHue = false;

  function pickHue(e: PointerEvent) {
    if (!hueEl) return;
    const rect = hueEl.getBoundingClientRect();
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    h = y * 360;
    emitChange();
  }
  function hueDown(e: PointerEvent) {
    if (!hueEl) return;
    draggingHue = true;
    hueEl.setPointerCapture(e.pointerId);
    pickHue(e);
  }
  function hueMove(e: PointerEvent) {
    if (!draggingHue) return;
    pickHue(e);
  }
  function hueUp(e: PointerEvent) {
    draggingHue = false;
    if (hueEl?.hasPointerCapture(e.pointerId)) hueEl.releasePointerCapture(e.pointerId);
  }

  // ═══ HEX ═══
  let hexInput = $state('');
  let hexFocused = $state(false);

  $effect(() => {
    const cur = hsvToRgb(h, s, v);
    const hex = rgbToHex(cur.r, cur.g, cur.b);
    if (!hexFocused) {
      hexInput = hex;
    }
  });

  function normalizeHex(raw: string): RGB | null {
    let t = raw.trim().replace(/^#/, '');
    if (t.length === 3) {
      t = t.split('').map((c) => c + c).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(t)) return null;
    return {
      r: parseInt(t.slice(0, 2), 16),
      g: parseInt(t.slice(2, 4), 16),
      b: parseInt(t.slice(4, 6), 16),
    };
  }

  function onHexInput(e: Event) {
    const raw = (e.currentTarget as HTMLInputElement).value;
    hexInput = raw;
    const parsed = normalizeHex(raw);
    if (parsed) {
      const { h: nh, s: ns, v: nv } = rgbToHsv(parsed.r, parsed.g, parsed.b);
      h = nh; s = ns; v = nv;
      lastEmitted = parsed;
      onchange(parsed);
    }
  }

  function onHexBlur() {
    hexFocused = false;
    if (!normalizeHex(hexInput)) {
      const cur = hsvToRgb(h, s, v);
      hexInput = rgbToHex(cur.r, cur.g, cur.b);
    } else {
      const parsed = normalizeHex(hexInput)!;
      hexInput = rgbToHex(parsed.r, parsed.g, parsed.b);
    }
  }

  function onHexKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      (e.currentTarget as HTMLInputElement).blur();
    }
  }

  // ═══ Конвертеры ═══
  function rgbToHsv(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let hh = 0;
    if (d !== 0) {
      if (max === r) hh = ((g - b) / d) % 6;
      else if (max === g) hh = (b - r) / d + 2;
      else hh = (r - g) / d + 4;
      hh *= 60;
      if (hh < 0) hh += 360;
    }
    const ss = max === 0 ? 0 : d / max;
    return { h: hh, s: ss, v: max };
  }
  function hsvToRgb(hh: number, ss: number, vv: number): RGB {
    const c = vv * ss;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = vv - c;
    let r = 0, g = 0, b = 0;
    if (hh < 60)       { r = c; g = x; b = 0; }
    else if (hh < 120) { r = x; g = c; b = 0; }
    else if (hh < 180) { r = 0; g = c; b = x; }
    else if (hh < 240) { r = 0; g = x; b = c; }
    else if (hh < 300) { r = x; g = 0; b = c; }
    else               { r = c; g = 0; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }
  function rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  const currentRgb = $derived(hsvToRgb(h, s, v));
</script>

<div class="picker">
  <div class="picker-body">
    <div
      class="palette"
      style="background: hsl({h}, 100%, 50%);"
      bind:this={paletteEl}
      onpointerdown={paletteDown}
      onpointermove={paletteMove}
      onpointerup={paletteUp}
      onpointercancel={paletteUp}
    >
      <div class="palette-white"></div>
      <div class="palette-black"></div>
      <div
        class="palette-cursor"
        style="left: {(s * 100)}%; top: {((1 - v) * 100)}%;"
      ></div>
    </div>

    <div
      class="hue"
      bind:this={hueEl}
      onpointerdown={hueDown}
      onpointermove={hueMove}
      onpointerup={hueUp}
      onpointercancel={hueUp}
    >
      <div class="hue-cursor" style="top: {(h / 360) * 100}%;"></div>
    </div>
  </div>

  <div class="row">
    <div class="preview" style="background: rgb({currentRgb.r}, {currentRgb.g}, {currentRgb.b});"></div>
    <input
      class="hex-input"
      type="text"
      maxlength="7"
      value={hexInput}
      oninput={onHexInput}
      onfocus={() => (hexFocused = true)}
      onblur={onHexBlur}
      onkeydown={onHexKeydown}
      spellcheck="false"
      autocomplete="off"
    />
  </div>

  <div class="rgb-info">R {currentRgb.r} · G {currentRgb.g} · B {currentRgb.b}</div>

  <div class="buttons">
    <button type="button" class="btn-cancel" onclick={oncancel}>{tr('colorPicker.cancel')}</button>
    <button type="button" class="btn-apply" onclick={onapply}>{tr('colorPicker.apply')}</button>
  </div>
</div>

<style>
  .picker {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    background: var(--bg-base);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }

  .picker-body {
    display: flex;
    gap: 8px;
  }

  .palette {
    flex: 1;
    height: 150px;
    position: relative;
    border-radius: 4px;
    cursor: crosshair;
    overflow: hidden;
    touch-action: none;
  }
  .palette-white {
    position: absolute; inset: 0;
    background: linear-gradient(to right, white, transparent);
    pointer-events: none;
  }
  .palette-black {
    position: absolute; inset: 0;
    background: linear-gradient(to top, black, transparent);
    pointer-events: none;
  }
  .palette-cursor {
    position: absolute;
    width: 12px; height: 12px;
    border: 2px solid white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,0,0,0.4);
    pointer-events: none;
  }

  .hue {
    width: 16px;
    height: 150px;
    position: relative;
    border-radius: 4px;
    cursor: pointer;
    background: linear-gradient(to bottom,
      hsl(0, 100%, 50%),
      hsl(60, 100%, 50%),
      hsl(120, 100%, 50%),
      hsl(180, 100%, 50%),
      hsl(240, 100%, 50%),
      hsl(300, 100%, 50%),
      hsl(360, 100%, 50%)
    );
    touch-action: none;
  }
  .hue-cursor {
    position: absolute;
    left: 50%; transform: translate(-50%, -50%);
    width: 20px; height: 6px;
    background: white;
    border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.6);
    pointer-events: none;
  }

  .row {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .preview {
    width: 32px; height: 32px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    flex-shrink: 0;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
  }
  .hex-input {
    flex: 1;
    min-width: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 12px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: border-color 0.15s;
  }
  .hex-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .rgb-info {
    font-size: 10px;
    color: var(--text-muted);
    text-align: center;
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    letter-spacing: 0.3px;
  }

  .buttons {
    display: flex;
    gap: 8px;
    margin-top: 2px;
  }
  .btn-cancel, .btn-apply {
    flex: 1;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--border);
    transition: all 0.15s;
  }
  .btn-cancel {
    background: var(--bg-surface);
    color: var(--text-secondary);
  }
  .btn-cancel:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }
  .btn-apply {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }
  .btn-apply:hover {
    background: var(--accent-hover);
  }
</style>