<script lang="ts">
  import { onMount } from 'svelte';
  import { X, Heart } from '@lucide/svelte';
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t } from '$lib/i18n/index.js';

  const app = getAppState();
  const tr = $derived((key: string, params?: Record<string, string | number>) => t(app.locale, key, params));

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') app.closeAbout();
  }

  onMount(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

<div
  class="modal-backdrop"
  role="presentation"
  onclick={() => app.closeAbout()}
>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    onclick={(e) => e.stopPropagation()}
  >
    <button class="close-btn" onclick={() => app.closeAbout()} title={tr('about.close')}>
      <X size={16} />
    </button>

    <div class="modal-body">
      <h1>{tr('app.name')}</h1>
      <p class="version">{tr('about.version', { v: '1.0.0' })}</p>

      <p class="description">{tr('about.description')}</p>

      <div class="divider"></div>

      <button class="support-btn" onclick={() => app.openSupport()}>
        <Heart size={16} />
        {tr('about.support')}
      </button>

      <div class="divider"></div>

      <div class="footer">
        <p class="license">{tr('about.license')}</p>
        <p class="copyright">{tr('about.copyright')}</p>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fade-in 0.15s ease;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    position: relative;
    width: 100%;
    max-width: 460px;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    animation: pop-in 0.18s ease;
  }

  @keyframes pop-in {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(6px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.12s;
  }
  .close-btn:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }

  .modal-body {
    padding: 28px 28px 22px;
  }

  h1 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.3px;
    margin-bottom: 4px;
  }

  .version {
    font-size: 12px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    margin-bottom: 18px;
  }

  .description {
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-secondary);
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 20px 0;
  }

  .support-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 11px 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .support-btn:hover {
    background: var(--accent-soft);
    border-color: var(--accent);
    color: var(--accent);
  }

  .footer {
    text-align: center;
  }
  .license {
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }
  .copyright {
    font-size: 11px;
    color: var(--text-muted);
  }
</style>