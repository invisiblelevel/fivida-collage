<script lang="ts">
  import { getAppState } from '$lib/state/appState.svelte.js';
  import CollagePresetIcon from '../CollagePresetIcon.svelte';

  const app = getAppState();

  const gridPresets: { cols: number; rows: number; label: string }[] = [
    { cols: 1, rows: 2, label: '1×2' },
    { cols: 2, rows: 1, label: '2×1' },
    { cols: 1, rows: 3, label: '1×3' },
    { cols: 3, rows: 1, label: '3×1' },
    { cols: 1, rows: 4, label: '1×4' },
    { cols: 4, rows: 1, label: '4×1' },
    { cols: 2, rows: 2, label: '2×2' },
    { cols: 2, rows: 3, label: '2×3' },
    { cols: 3, rows: 2, label: '3×2' },
    { cols: 3, rows: 3, label: '3×3' },
    { cols: 3, rows: 4, label: '3×4' },
    { cols: 4, rows: 3, label: '4×3' },
    { cols: 4, rows: 4, label: '4×4' },
    { cols: 5, rows: 3, label: '5×3' },
    { cols: 3, rows: 5, label: '3×5' },
  ];

  const isLayoutActive = $derived(app.collage.layout !== null);

  function isActive(cols: number, rows: number): boolean {
    return !isLayoutActive
      && app.collage.columns === cols
      && app.collage.rows === rows;
  }
</script>

<div class="presets">
  {#each gridPresets as preset}
    <button
      class="preset-btn"
      class:active={isActive(preset.cols, preset.rows)}
      onclick={() => app.applyGridPreset(preset.cols, preset.rows)}
      title={preset.label}
    >
      <CollagePresetIcon cols={preset.cols} rows={preset.rows} size={36} />
      <span class="preset-label">{preset.label}</span>
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