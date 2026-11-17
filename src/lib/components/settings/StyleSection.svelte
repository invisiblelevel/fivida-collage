<script lang="ts">
  import {
    Columns3, Rows3, Space, Palette, Image as ImageIcon, Pipette,
    Square, Sun, Ratio
  } from '@lucide/svelte';
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t } from '$lib/i18n/index.js';
  import { open } from '@tauri-apps/plugin-dialog';
  import { readFile } from '@tauri-apps/plugin-fs';
  import ColorPicker from '../ColorPicker.svelte';
  import { STYLE_PRESETS } from '$lib/state/stylePresets.js';
  import StylePresetPreview from '../StylePresetPreview.svelte';

  const app = getAppState();
  const tr = $derived((key: string) => t(app.locale, key));

  const presetColors = ['#ffffff', '#000000', '#1a1a1f', '#7c6cff', '#ff6b6b', '#4ecdc4'];
  const sizePresets = [1024, 2048, 4096];
  const aspectRatios = ['1:1', '4:5', '16:9', '9:16'] as const;
  
  const patternsList = [
    'dots', 'grid', 'grid-bold', 'diagonal', 'diagonal-cross', 'chevron', 
    'waves', 'crosses', 'plus-grid', 'triangles', 'hexagons', 'circles', 
    'dashes', 'confetti'
  ];

  const isLayoutActive = $derived(app.collage.layout !== null);

  // --- Пикер ---
  let pickerTarget = $state<'bg' | 'pattern' | 'border' | 'backdrop' | null>(null);
  let draftColor = $state('#000000');

  function hexToRgb(hex: string) {
    const t = hex.replace(/^#/, '');
    const full = t.length === 3 ? t.split('').map(c => c + c).join('') : t;
    return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
  }
  function rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function openPicker(target: 'bg' | 'pattern' | 'border' | 'backdrop', initial: string) {
    pickerTarget = target;
    draftColor = initial;
  }

  function applyPicker() {
    if (pickerTarget === 'bg') app.updateBackground('color', draftColor);
    if (pickerTarget === 'pattern') app.updateBackground('patternColor', draftColor);
    if (pickerTarget === 'border') app.updateCollage('borderColor', draftColor);
    if (pickerTarget === 'backdrop') app.updateBackground('imageBackdrop', draftColor);
    pickerTarget = null;
  }

  async function pickBgImage() {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
      });
      if (!selected) return;
      const path = Array.isArray(selected) ? selected[0] : selected;
      const data = await readFile(path);
      const name = path.split(/[\\/]/).pop() ?? 'bg';
      const file = new File([data], name);
      app.setBackgroundImage(file, path);
    } catch (e) {
      console.error(e);
    }
  }
</script>

<div class="section">
  <!-- ─── ПРЕСЕТЫ СТИЛЕЙ ─── -->
  <div class="field">
    <div class="field-header">
      <label>Стили</label>
    </div>
    <div class="preset-grid">
      {#each STYLE_PRESETS as preset}
        <button class="style-preset-btn" onclick={() => app.applyStylePreset(preset.id)} title={tr(preset.nameKey)}>
          <div class="preset-preview-wrap">
            <StylePresetPreview {preset} />
          </div>
          <span class="preset-name">{tr(preset.nameKey)}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="divider"></div>

  <!-- Колонки -->
  <div class="field">
    <div class="field-header">
      <Columns3 size={14} />
      <label>{tr('style.columns')}</label>
      <span class="value">{app.collage.columns}</span>
    </div>
    <input type="range" min="1" max="8" bind:value={app.collage.columns} disabled={isLayoutActive} />
  </div>

  <!-- Строки -->
  <div class="field">
    <div class="field-header">
      <Rows3 size={14} />
      <label>{tr('style.rows')}</label>
      <span class="value">{app.collage.rows}</span>
    </div>
    <input type="range" min="1" max="8" bind:value={app.collage.rows} disabled={isLayoutActive} />
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

  <!-- Пропорции -->
  <div class="field">
    <div class="field-header">
      <Ratio size={14} />
      <label>Пропорции</label>
    </div>
    <div class="segmented">
      {#each aspectRatios as ratio}
        <button class="seg-btn" class:active={app.collage.aspectRatio === ratio} onclick={() => app.updateCollage('aspectRatio', ratio)}>
          {ratio}
        </button>
      {/each}
    </div>
  </div>

  <!-- ─── ФОН ─── -->
  <div class="divider"></div>

  <div class="field">
    <div class="field-header">
      <Palette size={14} />
      <label>{tr('style.background')}</label>
    </div>

    <div class="segmented">
      <button class="seg-btn" class:active={app.collage.background.type === 'color'} onclick={() => app.updateBackground('type', 'color')}>{tr('style.bgColor')}</button>
      <button class="seg-btn" class:active={app.collage.background.type === 'pattern'} onclick={() => app.updateBackground('type', 'pattern')}>{tr('style.bgPattern')}</button>
      <button class="seg-btn" class:active={app.collage.background.type === 'image'} onclick={() => app.updateBackground('type', 'image')}>{tr('style.bgImage')}</button>
      <button class="seg-btn" class:active={app.collage.background.type === 'transparent'} onclick={() => app.updateBackground('type', 'transparent')}>{tr('style.bgTransparent')}</button>
    </div>

    {#if app.collage.background.type === 'color'}
      <div class="colors" style="margin-top: 8px;">
        <button class="color-swatch picker-swatch" class:active={!presetColors.includes(app.collage.background.color.toLowerCase())} onclick={() => openPicker('bg', app.collage.background.color)} title={tr('style.customColor')}>
          {#if !presetColors.includes(app.collage.background.color.toLowerCase())}
            <span class="custom-color-fill" style="background: {app.collage.background.color}"></span>
          {/if}
          <Pipette size={14} strokeWidth={1.75} />
        </button>
        {#each presetColors as color}
          <button class="color-swatch" class:active={app.collage.background.color.toLowerCase() === color.toLowerCase()} style="background: {color}" onclick={() => app.updateBackground('color', color)} title={color} />
        {/each}
      </div>
    {/if}

    {#if app.collage.background.type === 'pattern'}
      <div class="pattern-grid">
        {#each patternsList as pKind}
          <button class="pattern-btn" class:active={app.collage.background.pattern === pKind} onclick={() => app.updateBackground('pattern', pKind as any)} title={pKind}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="background: {app.collage.background.color}">
              <defs>
                <pattern id="pat-{pKind}" patternUnits="userSpaceOnUse" width="40" height="40">
                  {#if pKind === 'dots'}
                    <circle cx="5" cy="5" r="1.5" fill={app.collage.background.patternColor} /><circle cx="25" cy="25" r="1.5" fill={app.collage.background.patternColor} />
                  {:else if pKind === 'grid'}
                    <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke={app.collage.background.patternColor} stroke-width="0.5" />
                  {:else if pKind === 'grid-bold'}
                    <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke={app.collage.background.patternColor} stroke-width="2" />
                  {:else if pKind === 'diagonal'}
                    <path d="M -10 50 L 50 -10 M 10 -10 L 50 30 M -10 30 L 30 50" stroke={app.collage.background.patternColor} stroke-width="1" />
                  {:else if pKind === 'diagonal-cross'}
                    <path d="M -10 50 L 50 -10 M 10 -10 L 50 30 M -10 30 L 30 50 M -10 -10 L 50 50" stroke={app.collage.background.patternColor} stroke-width="0.5" />
                  {:else if pKind === 'chevron'}
                    <path d="M 0 10 L 20 30 L 40 10 M 0 30 L 20 50 L 40 30" stroke={app.collage.background.patternColor} stroke-width="1" fill="none" />
                  {:else if pKind === 'waves'}
                    <path d="M 0 10 Q 10 2 20 10 T 40 10 M 0 30 Q 10 22 20 30 T 40 30" stroke={app.collage.background.patternColor} stroke-width="1" fill="none" />
                  {:else if pKind === 'crosses'}
                    <path d="M 10 8 L 10 12 M 8 10 L 12 10 M 30 28 L 30 32 M 28 30 L 32 30" stroke={app.collage.background.patternColor} stroke-width="1" stroke-linecap="round" />
                  {:else if pKind === 'plus-grid'}
                    <path d="M 16 12 L 24 12 M 20 8 L 20 16" stroke={app.collage.background.patternColor} stroke-width="1.5" stroke-linecap="round" />
                  {:else if pKind === 'triangles'}
                    <path d="M 0 40 L 20 0 L 40 40 Z" stroke={app.collage.background.patternColor} stroke-width="1" fill="none" />
                  {:else if pKind === 'hexagons'}
                    <path d="M 20 0 L 37 10 L 37 30 L 20 40 L 3 30 L 3 10 Z" stroke={app.collage.background.patternColor} stroke-width="1" fill="none" />
                  {:else if pKind === 'circles'}
                    <circle cx="20" cy="20" r="12" stroke={app.collage.background.patternColor} stroke-width="1" fill="none" />
                  {:else if pKind === 'dashes'}
                    <path d="M 10 0 L 10 10 M 30 20 L 30 30" stroke={app.collage.background.patternColor} stroke-width="2" />
                  {:else if pKind === 'confetti'}
                    <rect x="5" y="5" width="3" height="3" fill={app.collage.background.patternColor} transform="rotate(15 6 6)" />
                    <rect x="25" y="15" width="4" height="4" fill={app.collage.background.patternColor} transform="rotate(45 27 17)" />
                    <circle cx="35" cy="35" r="1.5" fill={app.collage.background.patternColor} />
                  {/if}
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pat-{pKind})" />
            </svg>
          </button>
        {/each}
      </div>
      
      <div class="field" style="margin-top: 12px;">
        <div class="field-header"><label>{tr('style.customColor')}</label></div>
        <div class="colors">
          <button class="color-swatch picker-swatch" onclick={() => openPicker('pattern', app.collage.background.patternColor)} title={tr('style.customColor')}>
            <span class="custom-color-fill" style="background: {app.collage.background.patternColor}"></span>
            <Pipette size={14} strokeWidth={1.75} />
          </button>
          {#each presetColors as color}
            <button class="color-swatch" class:active={app.collage.background.patternColor === color} style="background: {color}" onclick={() => app.updateBackground('patternColor', color)} />
          {/each}
        </div>
      </div>

      <div class="field" style="margin-top: 12px;">
        <div class="field-header">
          <label>Масштаб</label>
          <span class="value">{Math.round(app.collage.background.patternScale * 100)}%</span>
        </div>
        <input type="range" min="0.5" max="3" step="0.1" bind:value={app.collage.background.patternScale} />
      </div>
    {/if}

    {#if app.collage.background.type === 'image'}
      <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
        {#if app.collage.background.image}
          <div class="bg-preview">
            <img src={app.collage.background.image.thumbUrl} alt="bg" />
            <button class="remove-btn" onclick={() => app.clearBackgroundImage()}>×</button>
          </div>
          <div class="segmented">
            <button class="seg-btn" class:active={app.collage.background.imageFit === 'cover'} onclick={() => app.updateBackground('imageFit', 'cover')}>{tr('style.fitCover')}</button>
            <button class="seg-btn" class:active={app.collage.background.imageFit === 'contain'} onclick={() => app.updateBackground('imageFit', 'contain')}>{tr('style.fitContain')}</button>
            <button class="seg-btn" class:active={app.collage.background.imageFit === 'stretch'} onclick={() => app.updateBackground('imageFit', 'stretch')}>{tr('style.fitStretch')}</button>
          </div>
          {#if app.collage.background.imageFit === 'contain'}
             <div class="field" style="margin-top: 4px;">
                <div class="field-header"><label>{tr('style.imageBackdrop')}</label></div>
                <div class="colors">
                  <button class="color-swatch picker-swatch" onclick={() => openPicker('backdrop', app.collage.background.imageBackdrop)}>
                    <span class="custom-color-fill" style="background: {app.collage.background.imageBackdrop}"></span>
                    <Pipette size={14} strokeWidth={1.75} />
                  </button>
                  {#each presetColors as color}
                    <button class="color-swatch" class:active={app.collage.background.imageBackdrop === color} style="background: {color}" onclick={() => app.updateBackground('imageBackdrop', color)} />
                  {/each}
                </div>
             </div>
          {/if}
        {:else}
          <button class="load-bg-btn" onclick={pickBgImage}>
            <ImageIcon size={14} /> {tr('style.uploadBg')}
          </button>
        {/if}
      </div>
    {/if}

    {#if pickerTarget !== null}
      <div class="picker-wrap">
        <ColorPicker rgb={hexToRgb(draftColor)} onchange={(c) => (draftColor = rgbToHex(c.r, c.g, c.b))} onapply={applyPicker} oncancel={() => (pickerTarget = null)} />
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
    <input type="range" min="0" max="20" bind:value={app.collage.borderWidth} />
  </div>

  {#if app.collage.borderWidth > 0}
    <div class="field">
      <div class="field-header"><label>{tr('style.borderColor')}</label></div>
      <div class="colors">
        <button class="color-swatch picker-swatch" class:active={!presetColors.includes(app.collage.borderColor.toLowerCase())} onclick={() => openPicker('border', app.collage.borderColor)}>
          {#if !presetColors.includes(app.collage.borderColor.toLowerCase())}
            <span class="custom-color-fill" style="background: {app.collage.borderColor}"></span>
          {/if}
          <Pipette size={14} strokeWidth={1.75} />
        </button>
        {#each presetColors as color}
          <button class="color-swatch" class:active={app.collage.borderColor.toLowerCase() === color.toLowerCase()} style="background: {color}" onclick={() => app.updateCollage('borderColor', color)} />
        {/each}
      </div>
    </div>

    <div class="field">
      <div class="field-header">
        <label>{tr('style.borderRadius')}</label>
        <span class="value">{app.collage.borderRadius} px</span>
      </div>
      <input type="range" min="0" max="40" bind:value={app.collage.borderRadius} />
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
    <input type="range" min="0" max="100" bind:value={app.collage.shadowIntensity} />
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
        <button class="seg-btn" class:active={app.collage.outputWidth === size} onclick={() => app.updateCollage('outputWidth', size)}>
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
  
  .hint { font-size: 11px; color: var(--text-muted); line-height: 1.4; }

  .divider { height: 1px; background: var(--border); margin: 2px 0; }

  input[type="range"] {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 4px; background: var(--bg-surface); border-radius: 2px;
    outline: none; cursor: pointer;
  }
  input[type="range"]:disabled { opacity: 0.35; cursor: not-allowed; }
  input[type="range"]::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: var(--bg-surface); }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 14px; height: 14px; border-radius: 50%; background: var(--accent); margin-top: -5px;
    box-shadow: 0 0 0 0 var(--accent-glow); transition: box-shadow 0.15s, transform 0.1s;
  }
  input[type="range"]:not(:disabled):hover::-webkit-slider-thumb { box-shadow: 0 0 0 6px var(--accent-glow); }
  input[type="range"]:not(:disabled):active::-webkit-slider-thumb { transform: scale(1.15); box-shadow: 0 0 0 8px var(--accent-glow); }

  .colors { display: flex; gap: 8px; flex-wrap: wrap; }
  .color-swatch {
    position: relative; width: 32px; height: 32px; border-radius: var(--radius-sm);
    border: 2px solid transparent; transition: all 0.15s;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    display: flex; align-items: center; justify-content: center;
    color: var(--text-secondary); cursor: pointer;
  }
  .color-swatch:hover { transform: translateY(-1px); }
  .color-swatch.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .picker-swatch { background: var(--bg-surface); overflow: hidden; }
  .picker-swatch:hover, .picker-swatch.active { color: var(--accent); }
  .custom-color-fill { position: absolute; right: 3px; bottom: 3px; width: 10px; height: 10px; border-radius: 3px; box-shadow: 0 0 0 1.5px var(--bg-surface), 0 0 0 2.5px rgba(0,0,0,0.4); pointer-events: none; }
  .picker-swatch svg { position: relative; z-index: 1; }
  .picker-wrap { margin-top: 4px; }

  .segmented { display: flex; background: var(--bg-surface); border-radius: var(--radius-sm); padding: 3px; gap: 2px; }
  .seg-btn {
    flex: 1; padding: 6px 8px; font-size: 12px; font-weight: 500; color: var(--text-muted);
    border-radius: 4px; transition: all 0.15s; font-variant-numeric: tabular-nums; cursor: pointer;
  }
  .seg-btn:hover { color: var(--text-primary); }
  .seg-btn.active { background: var(--bg-elevated); color: var(--accent); box-shadow: var(--shadow-sm); }

  .load-bg-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 8px; background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .load-bg-btn:hover { border-color: var(--accent); color: var(--accent); }

  .bg-preview {
    width: 100%; height: 100px; position: relative; border-radius: var(--radius-sm); overflow: hidden;
    border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
    background: #000;
  }
  .bg-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .remove-btn {
    position: absolute; top: 4px; right: 4px; width: 20px; height: 20px;
    background: rgba(0,0,0,0.6); color: #fff; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; cursor: pointer; font-size: 14px;
  }
  .remove-btn:hover { background: #ff4444; }

  .pattern-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-top: 8px;
  }
  .pattern-btn {
    aspect-ratio: 1;
    border-radius: var(--radius-sm);
    border: 2px solid transparent;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
    background: var(--bg-surface);
  }
  .pattern-btn:hover { transform: scale(1.05); }
  .pattern-btn.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }

  /* Стили для пресетов */
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .style-preset-btn {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    background: transparent; border: none; cursor: pointer; padding: 0;
    color: var(--text-secondary);
  }
  .style-preset-btn:hover .preset-preview-wrap { border-color: var(--accent); transform: translateY(-1px); }
  .preset-preview-wrap {
    width: 100%; aspect-ratio: 1; background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: all 0.15s;
    box-sizing: border-box;
  }
  .preset-name {
    font-size: 11px; font-weight: 500; letter-spacing: 0.2px;
  }
</style>