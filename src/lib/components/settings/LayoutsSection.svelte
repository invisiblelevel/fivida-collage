<script lang="ts">
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t } from '$lib/i18n/index.js';
  import type { Cell } from '$lib/state/appState.svelte.js';
  import CollagePresetIcon from '../CollagePresetIcon.svelte';

  const app = getAppState();
  const tr = $derived((key: string) => t(app.locale, key));

  interface LayoutPreset {
    id: string;
    label: string;
    cols: number;
    rows: number;
    cells: Cell[];
  }

    interface LayoutPreset {
    id: string;
    labelKey: string;
    cols: number;
    rows: number;
    cells: Cell[];
  }

  const layoutPresets: LayoutPreset[] = [
    // ----- На 3 фото -----
    {
      id: 'journal-3', labelKey: 'layouts.journal', cols: 2, rows: 2,
      cells: [
        { x: 0, y: 0, w: 2/3, h: 1 },
        { x: 2/3, y: 0, w: 1/3, h: 1/2 },
        { x: 2/3, y: 1/2, w: 1/3, h: 1/2 },
      ],
    },
    {
      id: 'header-3', labelKey: 'layouts.header', cols: 2, rows: 2,
      cells: [
        { x: 0, y: 0, w: 1, h: 1/2 },
        { x: 0, y: 1/2, w: 1/2, h: 1/2 },
        { x: 1/2, y: 1/2, w: 1/2, h: 1/2 },
      ],
    },
    {
      id: 'header-3-r', labelKey: 'layouts.headerDown', cols: 2, rows: 2,
      cells: [
        { x: 0, y: 0, w: 1/2, h: 1/2 },
        { x: 1/2, y: 0, w: 1/2, h: 1/2 },
        { x: 0, y: 1/2, w: 1, h: 1/2 },
      ],
    },
    {
      id: 'triptych', labelKey: 'layouts.triptych', cols: 3, rows: 1,
      cells: [
        { x: 0, y: 0, w: 1/4, h: 1 },
        { x: 1/4, y: 0, w: 1/2, h: 1 },
        { x: 3/4, y: 0, w: 1/4, h: 1 },
      ],
    },

    // ----- На 4 фото -----
    {
      id: 'journal-4', labelKey: 'layouts.journal', cols: 2, rows: 3,
      cells: [
        { x: 0, y: 0, w: 1/2, h: 1 },
        { x: 1/2, y: 0, w: 1/2, h: 1/3 },
        { x: 1/2, y: 1/3, w: 1/2, h: 1/3 },
        { x: 1/2, y: 2/3, w: 1/2, h: 1/3 },
      ],
    },
    {
      id: 'header-4', labelKey: 'layouts.header', cols: 3, rows: 2,
      cells: [
        { x: 0, y: 0, w: 1, h: 1/2 },
        { x: 0, y: 1/2, w: 1/3, h: 1/2 },
        { x: 1/3, y: 1/2, w: 1/3, h: 1/2 },
        { x: 2/3, y: 1/2, w: 1/3, h: 1/2 },
      ],
    },
    {
      id: 'header-4-r', labelKey: 'layouts.headerDown', cols: 3, rows: 2,
      cells: [
        { x: 0, y: 0, w: 1/3, h: 1/2 },
        { x: 1/3, y: 0, w: 1/3, h: 1/2 },
        { x: 2/3, y: 0, w: 1/3, h: 1/2 },
        { x: 0, y: 1/2, w: 1, h: 1/2 },
      ],
    },
    {
      id: 'big-top-4', labelKey: 'layouts.bigTop', cols: 3, rows: 2,
      cells: [
        { x: 0, y: 0, w: 1, h: 2/3 },
        { x: 0, y: 2/3, w: 1/3, h: 1/3 },
        { x: 1/3, y: 2/3, w: 1/3, h: 1/3 },
        { x: 2/3, y: 2/3, w: 1/3, h: 1/3 },
      ],
    },
    {
      id: 'film-4', labelKey: 'layouts.film', cols: 2, rows: 3,
      cells: [
        { x: 0, y: 0, w: 1, h: 1/4 },
        { x: 0, y: 1/4, w: 1/2, h: 1/2 },
        { x: 1/2, y: 1/4, w: 1/2, h: 1/2 },
        { x: 0, y: 3/4, w: 1, h: 1/4 },
      ],
    },

    // ----- На 5 фото -----
    {
      id: 'mosaic-5', labelKey: 'layouts.mosaic', cols: 3, rows: 2,
      cells: [
        { x: 0, y: 0, w: 2/3, h: 1/2 },
        { x: 2/3, y: 0, w: 1/3, h: 1/2 },
        { x: 0, y: 1/2, w: 1/3, h: 1/2 },
        { x: 1/3, y: 1/2, w: 1/3, h: 1/2 },
        { x: 2/3, y: 1/2, w: 1/3, h: 1/2 },
      ],
    },
    {
      id: 'mosaic-5-r', labelKey: 'layouts.mosaicDown', cols: 3, rows: 2,
      cells: [
        { x: 0, y: 0, w: 1/3, h: 1/2 },
        { x: 1/3, y: 0, w: 1/3, h: 1/2 },
        { x: 2/3, y: 0, w: 1/3, h: 1/2 },
        { x: 0, y: 1/2, w: 2/3, h: 1/2 },
        { x: 2/3, y: 1/2, w: 1/3, h: 1/2 },
      ],
    },
    {
      id: 'journal-5', labelKey: 'layouts.journal', cols: 2, rows: 4,
      cells: [
        { x: 0,   y: 0,    w: 2/3, h: 1   },
        { x: 2/3, y: 0,    w: 1/3, h: 1/4 },
        { x: 2/3, y: 1/4,  w: 1/3, h: 1/4 },
        { x: 2/3, y: 1/2,  w: 1/3, h: 1/4 },
        { x: 2/3, y: 3/4,  w: 1/3, h: 1/4 },
      ],
    },
    {
      id: 'pyramid-5', labelKey: 'layouts.pyramid', cols: 4, rows: 2,
      cells: [
        { x: 1/4, y: 0, w: 1/4, h: 1/2 },
        { x: 2/4, y: 0, w: 1/4, h: 1/2 },
        { x: 0,   y: 1/2, w: 1/4, h: 1/2 },
        { x: 1/4, y: 1/2, w: 1/4, h: 1/2 },
        { x: 2/4, y: 1/2, w: 1/4, h: 1/2 },
        { x: 3/4, y: 1/2, w: 1/4, h: 1/2 },
      ],
    },
    {
      id: 'polaroid-5', labelKey: 'layouts.polaroid', cols: 3, rows: 3,
      cells: [
        { x: 0,   y: 0,   w: 1/3, h: 1/3 },
        { x: 2/3, y: 0,   w: 1/3, h: 1/3 },
        { x: 1/3, y: 1/3, w: 1/3, h: 1/3 },
        { x: 0,   y: 2/3, w: 1/3, h: 1/3 },
        { x: 2/3, y: 2/3, w: 1/3, h: 1/3 },
      ],
    },

    // ----- На 6 фото -----
    {
      id: 'journal-6', labelKey: 'layouts.journal', cols: 2, rows: 5,
      cells: [
        { x: 0,   y: 0,   w: 1/2, h: 1   },
        { x: 1/2, y: 0,   w: 1/2, h: 1/5 },
        { x: 1/2, y: 1/5, w: 1/2, h: 1/5 },
        { x: 1/2, y: 2/5, w: 1/2, h: 1/5 },
        { x: 1/2, y: 3/5, w: 1/2, h: 1/5 },
        { x: 1/2, y: 4/5, w: 1/2, h: 1/5 },
      ],
    },
    {
      id: 'header-6', labelKey: 'layouts.header', cols: 3, rows: 3,
      cells: [
        { x: 0,   y: 0,   w: 1,   h: 1/3 },
        { x: 0,   y: 1/3, w: 1/3, h: 1/3 },
        { x: 1/3, y: 1/3, w: 1/3, h: 1/3 },
        { x: 2/3, y: 1/3, w: 1/3, h: 1/3 },
        { x: 0,   y: 2/3, w: 1/2, h: 1/3 },
        { x: 1/2, y: 2/3, w: 1/2, h: 1/3 },
      ],
    },
    {
      id: 'film-6', labelKey: 'layouts.film', cols: 2, rows: 4,
      cells: [
        { x: 0,   y: 0,   w: 1,   h: 1/6 },
        { x: 0,   y: 1/6, w: 1/2, h: 1/3 },
        { x: 1/2, y: 1/6, w: 1/2, h: 1/3 },
        { x: 0,   y: 1/2, w: 1/2, h: 1/3 },
        { x: 1/2, y: 1/2, w: 1/2, h: 1/3 },
        { x: 0,   y: 5/6, w: 1,   h: 1/6 },
      ],
    },

    // ----- На 7 фото -----
    {
      id: 'mosaic-7', labelKey: 'layouts.mosaic', cols: 3, rows: 3,
      cells: [
        { x: 0,   y: 0,   w: 1,   h: 1/2 },
        { x: 0,   y: 1/2, w: 1/3, h: 1/4 },
        { x: 1/3, y: 1/2, w: 1/3, h: 1/4 },
        { x: 2/3, y: 1/2, w: 1/3, h: 1/4 },
        { x: 0,   y: 3/4, w: 1/3, h: 1/4 },
        { x: 1/3, y: 3/4, w: 1/3, h: 1/4 },
        { x: 2/3, y: 3/4, w: 1/3, h: 1/4 },
      ],
    },

    // ----- На 8 фото -----
    {
      id: 'mosaic-8', labelKey: 'layouts.mosaic', cols: 3, rows: 3,
      cells: [
        { x: 0,   y: 0,   w: 1/2, h: 1/2 },
        { x: 1/2, y: 0,   w: 1/2, h: 1/2 },
        { x: 0,   y: 1/2, w: 1/3, h: 1/4 },
        { x: 1/3, y: 1/2, w: 1/3, h: 1/4 },
        { x: 2/3, y: 1/2, w: 1/3, h: 1/4 },
        { x: 0,   y: 3/4, w: 1/3, h: 1/4 },
        { x: 1/3, y: 3/4, w: 1/3, h: 1/4 },
        { x: 2/3, y: 3/4, w: 1/3, h: 1/4 },
      ],
    },
  ];

  const isLayoutActive = $derived(app.collage.layout !== null);

  function isActive(preset: LayoutPreset): boolean {
    if (!isLayoutActive) return false;
    const a = app.collage.layout!;
    if (a.length !== preset.cells.length) return false;
    for (let i = 0; i < a.length; i++) {
      const x = a[i], y = preset.cells[i];
      if (
        Math.abs(x.x - y.x) > 1e-6 ||
        Math.abs(x.y - y.y) > 1e-6 ||
        Math.abs(x.w - y.w) > 1e-6 ||
        Math.abs(x.h - y.h) > 1e-6
      ) return false;
    }
    return true;
  }

  function apply(preset: LayoutPreset) {
    app.applyLayoutPreset(preset.cells, preset.cols, preset.rows);
  }
</script>

<div class="presets">
  {#each layoutPresets as preset}
    <button
      class="preset-btn"
      class:active={isActive(preset)}
      onclick={() => apply(preset)}
      title={tr(preset.labelKey)}
    >
      <CollagePresetIcon cells={preset.cells} size={36} />
      <span class="preset-label">{tr(preset.labelKey)}</span>
    </button>
  {/each}
</div>

<style>
  .presets {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .preset-btn {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 10px 6px 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .preset-btn:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-1px);
  }
  .preset-btn.active {
    background: var(--accent-soft);
    border-color: var(--accent);
    color: var(--accent);
  }
  .preset-label {
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.2px;
    color: var(--text-muted);
  }
  .preset-btn.active .preset-label { color: var(--accent); }
</style>