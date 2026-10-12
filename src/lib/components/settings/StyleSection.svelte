<script lang="ts">
  import {
    Columns3, Rows3, Space, Palette, Image as ImageIcon, Pipette,
    Square, Sun,
  } from '@lucide/svelte';
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t } from '$lib/i18n/index.js';
  import ColorPicker from '../ColorPicker.svelte';

  const app = getAppState();
  const tr = $derived((key: string) => t(app.locale, key));

  const presetColors = ['#ffffff', '#000000', '#1a1a1f', '#7c6cff', '#ff6b6b', '#4ecdc4'];
  const sizePresets = [1024, 2048, 4096];

  const isLayoutActive = $derived(app.collage.layout !== null);

  // --- Пикер фона ---
  let pickerBgOpen = $state(false);
  let draftBgColor = $state('#000000');

  // --- Пикер рамки ---
  let pickerBorderOpen = $state(false);
  let draftBorderColor = $state('#000000');

  function hexToRgb(hex: string) {
    const t = hex.replace(/^#/, '');
    const full = t.length === 3 ? t.split('').map(c => c + c).join('') : t;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }
  function rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  const isCustomBg = $derived(
    !presetColors.includes(app.collage.backgroundColor.toLowerCase())
  );
  const isCustomBorder = $derived(
    !presetColors.includes(app.collage.borderColor.toLowerCase())
  );

  function openBgPicker() {
    draftBgColor = app.collage.backgroundColor;
    pickerBgOpen = true;
    pickerBorderOpen = false;
  }
  function applyBgPicker() {
    app.collage.backgroundColor = draftBgColor;
    pickerBgOpen = false;
  }

  function openBorderPicker() {
    draftBorderColor = app.collage.borderColor;
    pickerBorderOpen = true;
    pickerBgOpen = false;
  }
  function applyBorderPicker() {
    app.collage.borderColor = draftBorderColor;
    pickerBorderOpen = false;
  }
</script>

<div class="section">
  <!-- Колонки -->
  <div class="field">
    <div class="field-header">
      <Columns3 size={14} />
      <label>{tr('style.columns')}</label>
      <span class="value">{app.collage.columns}</span>
    </div>
    <input
      type="range" min="1" max="8"
      bind:value={app.collage.columns}
      disabled={isLayoutActive}
    />
  </div>

  <!-- Строки -->
  <div class="field">
    <div class="field-header">
      <Rows3 size={14} />
      <label>{tr('style.rows')}</label>
      <span class="value">{app.collage.rows}</span>
    </div>
    <input
      type="range" min="1" max="8"
      bind:value={app.collage.rows}
      disabled={isLayoutActive}
    />
  </div>

  <!-- Отступ -->
  <div class="field">
    <div class="field-header">
      <Space size={14} />
      <label>{tr('style.gap')}</label>
      <span class="value">{app.collage.gap} px</span>
    </div>
    <input type="range" min="0" max="50" bind:value={app.collage.gap} />
  </div>

  <!-- Цвет фона -->
  <div class="field">
    <div class="field-header">
      <Palette size={14} />
      <label>{tr('style.backgroundColor')}</label>
    </div>

    <div class="colors">
      <button
        class="color-swatch picker-swatch"
        class:active={isCustomBg}
        onclick={openBgPicker}
        title={tr('style.customColor')}
      >
        {#if isCustomBg}
          <span
            class="custom-color-fill"
            style="background: {app.collage.backgroundColor}"
          ></span>
        {/if}
        <Pipette size={14} strokeWidth={1.75} />
      </button>

      {#each presetColors as color}
        <button
          class="color-swatch"
          class:active={app.collage.backgroundColor.toLowerCase() === color.toLowerCase()}
          style="background: {color}"
          onclick={() => (app.collage.backgroundColor = color)}
          title={color}
        />
      {/each}
    </div>

    {#if pickerBgOpen}
      <div class="picker-wrap">
        <ColorPicker
          rgb={hexToRgb(draftBgColor)}
          onchange={(c) => (draftBgColor = rgbToHex(c.r, c.g, c.b))}
          onapply={applyBgPicker}
          oncancel={() => (pickerBgOpen = false)}
        />
      </div>
    {/if}
  </div>

  <!-- ─── Рамка ─── -->
  <div class="divider"></div>

  <div class="field">
    <div class="field-header">
      <Square size={14} />
      <label>{tr('style.border')}</label>
      <span class="value">{app.collage.borderWidth} px</span>
    </div>
    <input
      type="range" min="0" max="20"
      bind:value={app.collage.borderWidth}
    />
  </div>

  {#if app.collage.borderWidth > 0}
    <!-- Цвет рамки -->
    <div class="field">
      <div class="field-header">
        <label>{tr('style.borderColor')}</label>
      </div>

      <div class="colors">
        <button
          class="color-swatch picker-swatch"
          class:active={isCustomBorder}
          onclick={openBorderPicker}
          title={tr('style.customColor')}
        >
          {#if isCustomBorder}
            <span
              class="custom-color-fill"
              style="background: {app.collage.borderColor}"
            ></span>
          {/if}
          <Pipette size={14} strokeWidth={1.75} />
        </button>

        {#each presetColors as color}
          <button
            class="color-swatch"
            class:active={app.collage.borderColor.toLowerCase() === color.toLowerCase()}
            style="background: {color}"
            onclick={() => (app.collage.borderColor = color)}
            title={color}
          />
        {/each}
      </div>

      {#if pickerBorderOpen}
        <div class="picker-wrap">
          <ColorPicker
            rgb={hexToRgb(draftBorderColor)}
            onchange={(c) => (draftBorderColor = rgbToHex(c.r, c.g, c.b))}
            onapply={applyBorderPicker}
            oncancel={() => (pickerBorderOpen = false)}
          />
        </div>
      {/if}
    </div>

    <!-- Скругление -->
    <div class="field">
      <div class="field-header">
        <label>{tr('style.borderRadius')}</label>
        <span class="value">{app.collage.borderRadius} px</span>
      </div>
      <input
        type="range" min="0" max="40"
        bind:value={app.collage.borderRadius}
      />
    </div>
  {/if}

  <!-- ─── Тени ─── -->
  <div class="divider"></div>

  <div class="field">
    <div class="field-header">
      <Sun size={14} />
      <label>{tr('style.shadow')}</label>
      <span class="value">{app.collage.shadowIntensity}%</span>
    </div>
    <input
      type="range" min="0" max="100"
      bind:value={app.collage.shadowIntensity}
    />
  </div>

  <!-- Размер вывода -->
  <div class="divider"></div>

  <div class="field">
    <div class="field-header">
      <ImageIcon size={14} />
      <label>{tr('style.outputSize')}</label>
    </div>
    <div class="segmented">
      {#each sizePresets as size}
        <button
          class="seg-btn"
          class:active={app.collage.outputWidth === size}
          onclick={() => (app.collage.outputWidth = size)}
        >
          {size}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .section { display: flex; flex-direction: column; gap: 18px; }
  .field { display: flex; flex-direction: column; gap: 10px; }
  .field-header { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
  .field-header label { font-size: 12px; font-weight: 500; letter-spacing: 0.2px; flex: 1; }
  .value { font-size: 12px; font-weight: 600; color: var(--accent); font-variant-numeric: tabular-nums; }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 2px 0;
  }

  input[type="range"] {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 4px;
    background: var(--bg-surface); border-radius: 2px;
    outline: none; cursor: pointer;
  }
  input[type="range"]:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  input[type="range"]::-webkit-slider-runnable-track {
    height: 4px; border-radius: 2px; background: var(--bg-surface);
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--accent); margin-top: -5px;
    box-shadow: 0 0 0 0 var(--accent-glow);
    transition: box-shadow 0.15s, transform 0.1s;
  }
  input[type="range"]:not(:disabled):hover::-webkit-slider-thumb { box-shadow: 0 0 0 6px var(--accent-glow); }
  input[type="range"]:not(:disabled):active::-webkit-slider-thumb { transform: scale(1.15); box-shadow: 0 0 0 8px var(--accent-glow); }

  .colors { display: flex; gap: 8px; flex-wrap: wrap; }

  .color-swatch {
    position: relative;
    width: 32px; height: 32px;
    border-radius: var(--radius-sm);
    border: 2px solid transparent;
    transition: all 0.15s;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    display: flex; align-items: center; justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
  }
  .color-swatch:hover { transform: translateY(-1px); }
  .color-swatch.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .picker-swatch { background: var(--bg-surface); overflow: hidden; }
  .picker-swatch:hover { color: var(--accent); }
  .picker-swatch.active { color: var(--accent); }

  .custom-color-fill {
    position: absolute;
    right: 3px; bottom: 3px;
    width: 10px; height: 10px;
    border-radius: 3px;
    box-shadow: 0 0 0 1.5px var(--bg-surface), 0 0 0 2.5px rgba(0,0,0,0.4);
    pointer-events: none;
  }
  .picker-swatch svg { position: relative; z-index: 1; }
  .picker-wrap { margin-top: 4px; }

  .segmented {
    display: flex;
    background: var(--bg-surface);
    border-radius: var(--radius-sm);
    padding: 3px; gap: 2px;
  }
  .seg-btn {
    flex: 1; padding: 6px 8px;
    font-size: 12px; font-weight: 500;
    color: var(--text-muted);
    border-radius: 4px;
    transition: all 0.15s;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }
  .seg-btn:hover { color: var(--text-primary); }
  .seg-btn.active {
    background: var(--bg-elevated);
    color: var(--accent);
    box-shadow: var(--shadow-sm);
  }
</style>