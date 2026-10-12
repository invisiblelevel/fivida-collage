<script lang="ts">
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t } from '$lib/i18n/index.js';

  const app = getAppState();
  const tr = $derived((key: string) => t(app.locale, key));

    const figures: {
    kind: 'circle' | 'ellipse' | 'pyramid' | 'hexagon' | 'honeycomb' | 'diamonds' | 'stars';
    labelKey: string;
  }[] = [
    { kind: 'circle', labelKey: 'figures.circle' },
    { kind: 'ellipse', labelKey: 'figures.ellipse' },
    { kind: 'pyramid', labelKey: 'figures.pyramid' },
    { kind: 'hexagon', labelKey: 'figures.hexagon' },
    { kind: 'honeycomb', labelKey: 'figures.honeycomb' },
    { kind: 'diamonds', labelKey: 'figures.diamonds' },
    { kind: 'stars', labelKey: 'figures.stars' },
  ];

  function isActive(kind: typeof figures[number]['kind']): boolean {
    return app.collage.activeFigure === kind;
  }

  function applyFigure(kind: typeof figures[number]['kind']) {
    app.applyFigure(kind, app.collage.figurePhotoCount, app.collage.figureScale);
  }

  const hideCountSlider = $derived(
    app.collage.activeFigure === 'hexagon' || app.collage.activeFigure === 'honeycomb'
  );
</script>

<div class="section">
  <div class="figures">
    {#each figures as fig}
      <button
        class="figure-btn"
        class:active={isActive(fig.kind)}
        onclick={() => applyFigure(fig.kind)}
        title={tr(fig.labelKey)}
      >
        <div class="figure-preview">
          {#if fig.kind === 'circle'}
            <div class="dot" style="left: 50%; top: 8%;"></div>
            <div class="dot" style="left: 88%; top: 30%;"></div>
            <div class="dot" style="left: 88%; top: 70%;"></div>
            <div class="dot" style="left: 50%; top: 92%;"></div>
            <div class="dot" style="left: 12%; top: 70%;"></div>
            <div class="dot" style="left: 12%; top: 30%;"></div>
          {:else if fig.kind === 'ellipse'}
            <div class="dot" style="left: 50%; top: 12%;"></div>
            <div class="dot" style="left: 88%; top: 35%;"></div>
            <div class="dot" style="left: 88%; top: 65%;"></div>
            <div class="dot" style="left: 50%; top: 88%;"></div>
            <div class="dot" style="left: 12%; top: 65%;"></div>
            <div class="dot" style="left: 12%; top: 35%;"></div>
          {:else if fig.kind === 'pyramid'}
            <div class="dot" style="left: 50%; top: 18%;"></div>
            <div class="dot" style="left: 35%; top: 50%;"></div>
            <div class="dot" style="left: 65%; top: 50%;"></div>
            <div class="dot" style="left: 20%; top: 82%;"></div>
            <div class="dot" style="left: 50%; top: 82%;"></div>
            <div class="dot" style="left: 80%; top: 82%;"></div>
          {:else if fig.kind === 'hexagon'}
            <div class="dot" style="left: 50%; top: 50%;"></div>
            <div class="dot" style="left: 50%; top: 15%;"></div>
            <div class="dot" style="left: 80%; top: 32%;"></div>
            <div class="dot" style="left: 80%; top: 68%;"></div>
            <div class="dot" style="left: 50%; top: 85%;"></div>
            <div class="dot" style="left: 20%; top: 68%;"></div>
            <div class="dot" style="left: 20%; top: 32%;"></div>
          {:else if fig.kind === 'honeycomb'}
            <!-- плотная упаковка гексагонов: упрощённая миниатюра из 7 точек -->
            <div class="dot" style="left: 50%; top: 22%;"></div>
            <div class="dot" style="left: 20%; top: 38%;"></div>
            <div class="dot" style="left: 80%; top: 38%;"></div>
            <div class="dot" style="left: 50%; top: 50%;"></div>
            <div class="dot" style="left: 20%; top: 62%;"></div>
            <div class="dot" style="left: 80%; top: 62%;"></div>
            <div class="dot" style="left: 50%; top: 78%;"></div>
          {:else if fig.kind === 'diamonds'}
            <div class="dot" style="left: 30%; top: 30%;"></div>
            <div class="dot" style="left: 70%; top: 30%;"></div>
            <div class="dot" style="left: 30%; top: 70%;"></div>
            <div class="dot" style="left: 70%; top: 70%;"></div>
          {:else if fig.kind === 'stars'}
            <div class="dot" style="left: 30%; top: 30%;"></div>
            <div class="dot" style="left: 70%; top: 30%;"></div>
            <div class="dot" style="left: 30%; top: 70%;"></div>
            <div class="dot" style="left: 70%; top: 70%;"></div>
            <div class="dot" style="left: 50%; top: 50%;"></div>
          {/if}
        </div>
        <span class="figure-label">{fig.label}</span>
      </button>
    {/each}
  </div>

  {#if app.collage.activeFigure}
    {#if hideCountSlider}
      <p class="hint">
        {app.collage.activeFigure === 'hexagon'
          ? tr('figures.hintHexagon')
          : tr('figures.hintHoneycomb')}
      </p>
    {:else}
      <div class="slider-field">
        <div class="slider-header">
          <label>{tr('figures.photoCount')}</label>
          <span class="value">{app.collage.figurePhotoCount}</span>
        </div>
        <input
          type="range" min="4" max="16"
          value={app.collage.figurePhotoCount}
          oninput={(e) => app.updateFigureCount(Number((e.currentTarget as HTMLInputElement).value))}
        />
      </div>
    {/if}

    <div class="slider-field">
      <div class="slider-header">
        <label>{tr('figures.photoScale')}</label>
        <span class="value">{Math.round(app.collage.figureScale * 100)}%</span>
      </div>
      <input
        type="range" min="50" max="150" step="5"
        value={Math.round(app.collage.figureScale * 100)}
        oninput={(e) => app.updateFigureScale(Number((e.currentTarget as HTMLInputElement).value) / 100)}
      />
    </div>

    <p class="hint">{tr('figures.hintOverlap')}</p>
  {:else}
    <p class="hint">{tr('figures.hintPick')}</p>
  {/if}
</div>

<style>
  .section { display: flex; flex-direction: column; gap: 18px; }

  .figures {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .figure-btn {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 14px 8px 10px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .figure-btn:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-1px);
  }
  .figure-btn.active {
    background: var(--accent-soft);
    border-color: var(--accent);
    color: var(--accent);
  }

  .figure-preview {
    width: 44px; height: 44px;
    position: relative;
    border-radius: 6px;
    border: 1px dashed currentColor;
    opacity: 0.85;
  }

  .dot {
    position: absolute;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
    transform: translate(-50%, -50%);
  }

  .figure-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2px;
    color: var(--text-secondary);
  }
  .figure-btn.active .figure-label { color: var(--accent); }

  .slider-field {
    display: flex; flex-direction: column; gap: 8px;
    padding-top: 4px;
  }
  .slider-header {
    display: flex; align-items: center; justify-content: space-between;
    color: var(--text-secondary);
  }
  .slider-header label {
    font-size: 12px; font-weight: 500; letter-spacing: 0.2px;
  }
  .slider-header .value {
    font-size: 12px; font-weight: 600;
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }

  input[type="range"] {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 4px;
    background: var(--bg-surface); border-radius: 2px;
    outline: none; cursor: pointer;
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
  input[type="range"]:hover::-webkit-slider-thumb { box-shadow: 0 0 0 6px var(--accent-glow); }
  input[type="range"]:active::-webkit-slider-thumb { transform: scale(1.15); box-shadow: 0 0 0 8px var(--accent-glow); }

  .hint {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.4;
  }
</style>