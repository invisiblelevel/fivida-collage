<script lang="ts">
  import { Info, ZoomIn } from '@lucide/svelte';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t, localeLabels } from '$lib/i18n/index.js';
  import type { Locale } from '$lib/i18n/index.js';
  import GridsSection from './settings/GridsSection.svelte';
  import LayoutsSection from './settings/LayoutsSection.svelte';
  import FiguresSection from './settings/FiguresSection.svelte';
  import StyleSection from './settings/StyleSection.svelte';

  const app = getAppState();
  const tr = $derived((key: string) => t(app.locale, key));

  const currentTitle = $derived(tr(`sections.${app.activeSection}`));

  const locales: Locale[] = ['ru', 'en', 'zh'];

  // Зум: цикл 100% → 150% → 200% → 100%
  async function cycleZoom() {
    const next = app.zoomLevel === 1.0 ? 1.5
               : app.zoomLevel === 1.5 ? 2.0
               : 1.0;
    app.setZoom(next);
    try {
      await getCurrentWebview().setZoom(next);
    } catch (e) {
      console.error('setZoom failed', e);
    }
  }
</script>

<aside class="right-panel">
  <div class="panel-header">
    <div class="header-left">
      <h3>{currentTitle}</h3>
      <div class="accent-line"></div>
    </div>
    <div class="header-right">
      <div class="lang-switch">
        {#each locales as loc}
          <button
            class="lang-btn"
            class:active={app.locale === loc}
            onclick={() => app.setLocale(loc)}
            title={localeLabels[loc]}
          >
            {localeLabels[loc]}
          </button>
        {/each}
      </div>

      <button
        class="icon-btn"
        onclick={cycleZoom}
        title={`Zoom: ${Math.round(app.zoomLevel * 100)}%`}
      >
        <ZoomIn size={16} />
      </button>

      <button
        class="icon-btn"
        onclick={() => app.openAbout()}
        title={tr('about.title')}
      >
        <Info size={16} />
      </button>
    </div>
  </div>

  {#if app.activeSection === 'grids'}
    <GridsSection />
  {:else if app.activeSection === 'layouts'}
    <LayoutsSection />
  {:else if app.activeSection === 'figures'}
    <FiguresSection />
  {:else if app.activeSection === 'style'}
    <StyleSection />
  {/if}
</aside>

<style>
  /* Стили — как были. Добавляется только .icon-btn для лупы — идентично Info. */
  .right-panel {
    width: 320px;
    flex-shrink: 0;
    background: var(--bg-panel);
    border-left: 1px solid var(--border);
    padding: 20px;
    overflow-y: auto;
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 24px;
  }

  .header-left { flex: 1; min-width: 0; }

  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    margin-bottom: 8px;
  }

  .accent-line {
    width: 32px;
    height: 2px;
    background: var(--accent);
    border-radius: 1px;
    box-shadow: 0 0 8px var(--accent-glow);
  }

  .lang-switch {
    display: flex;
    gap: 2px;
    padding: 2px;
    background: var(--bg-surface);
    border-radius: 6px;
    border: 1px solid var(--border);
  }

  .lang-btn {
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.3px;
    line-height: 1;
  }
  .lang-btn:hover { color: var(--text-primary); }
  .lang-btn.active { background: var(--accent); color: white; }

  .icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    background: transparent;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.15s ease;
    padding: 0;
  }
  .icon-btn:hover {
    background: var(--bg-elevated);
    color: var(--accent);
    border-color: var(--accent);
  }
</style>