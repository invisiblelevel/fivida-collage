<script lang="ts">
  import { Grid3x3, LayoutGrid, Shapes, Palette } from '@lucide/svelte';
  import ModeButton from './ModeButton.svelte';
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t } from '$lib/i18n/index.js';

  const app = getAppState();
  const tr = $derived((key: string) => t(app.locale, key));
</script>

<aside class="left-panel">
  <ModeButton
    icon={Palette}
    label={tr('sections.style')}
    selected={app.activeSection === 'style'}
    onclick={() => app.setSection('style')}
  />
  <ModeButton
    icon={Grid3x3}
    label={tr('sections.grids')}
    selected={app.activeSection === 'grids'}
    onclick={() => app.setSection('grids')}
  />
  <ModeButton
    icon={LayoutGrid}
    label={tr('sections.layouts')}
    selected={app.activeSection === 'layouts'}
    onclick={() => app.setSection('layouts')}
  />
  <ModeButton
    icon={Shapes}
    label={tr('sections.figures')}
    selected={app.activeSection === 'figures'}
    onclick={() => app.setSection('figures')}
  />
</aside>

<style>
  .left-panel {
    width: 96px;
    flex-shrink: 0;
    background: var(--bg-panel);
    border-right: 1px solid var(--border);
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>