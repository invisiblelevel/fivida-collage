<script lang="ts">
  import { onMount } from 'svelte';
  import { X, Copy, Check, Bitcoin } from '@lucide/svelte';
  import { getAppState } from '$lib/state/appState.svelte.js';
  import { t } from '$lib/i18n/index.js';

  const app = getAppState();
  const tr = $derived((key: string) => t(app.locale, key));

  const BTC = 'bc1q2ka70s4vtmrskandqj8l4d6n3kdxyxa7kf3wf7';
  const USDT = 'TUjY9p6oxKmeCQwNZwMfHqHdXuabaHpgT7';

  let copiedWhich = $state<string | null>(null);

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') app.closeSupport();
  }

  onMount(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function copy(text: string, which: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedWhich = which;
      setTimeout(() => {
        if (copiedWhich === which) copiedWhich = null;
      }, 1800);
    } catch {
      // fallback: textarea
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      copiedWhich = which;
      setTimeout(() => {
        if (copiedWhich === which) copiedWhich = null;
      }, 1800);
    }
  }
</script>

<div
  class="modal-backdrop"
  role="presentation"
  onclick={() => app.closeSupport()}
>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    onclick={(e) => e.stopPropagation()}
  >
    <button class="close-btn" onclick={() => app.closeSupport()} title={tr('about.close')}>
      <X size={16} />
    </button>

    <div class="modal-body">
      <h2>{tr('support.title')}</h2>
      <p class="subtitle">{tr('support.subtitle')}</p>

      <div class="wallet">
        <div class="wallet-header">
          <Bitcoin size={14} class="icon" />
          <span class="wallet-name">BTC</span>
        </div>
        <div class="wallet-row">
          <code class="address">{BTC}</code>
          <button
            class="copy-btn"
            class:copied={copiedWhich === 'btc'}
            onclick={() => copy(BTC, 'btc')}
          >
            {#if copiedWhich === 'btc'}
              <Check size={14} />
              <span>{tr('support.copied')}</span>
            {:else}
              <Copy size={14} />
              <span>{tr('support.copy')}</span>
            {/if}
          </button>
        </div>
      </div>

      <div class="wallet">
        <div class="wallet-header">
          <Bitcoin size={14} class="icon" />
          <span class="wallet-name">USDT (TRC-20)</span>
        </div>
        <div class="wallet-row">
          <code class="address">{USDT}</code>
          <button
            class="copy-btn"
            class:copied={copiedWhich === 'usdt'}
            onclick={() => copy(USDT, 'usdt')}
          >
            {#if copiedWhich === 'usdt'}
              <Check size={14} />
              <span>{tr('support.copied')}</span>
            {:else}
              <Copy size={14} />
              <span>{tr('support.copy')}</span>
            {/if}
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <p class="thanks">{tr('support.thanks')}</p>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 1100;
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
    max-width: 520px;
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

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 22px;
    font-style: italic;
  }

  .wallet {
    margin-bottom: 18px;
  }
  .wallet:last-of-type {
    margin-bottom: 0;
  }

  .wallet-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }
  .wallet-header .icon {
    color: var(--accent);
  }
  .wallet-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.4px;
  }

  .wallet-row {
    display: flex;
    align-items: stretch;
    gap: 8px;
  }

  .address {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    background: var(--bg-base);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 11.5px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    user-select: text;
    -webkit-user-select: text;
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 14px;
    background: var(--accent);
    color: white;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .copy-btn:hover {
    background: var(--accent-hover);
  }
  .copy-btn.copied {
    background: #2ea043;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 22px 0 16px;
  }

  .thanks {
    text-align: center;
    font-size: 12px;
    color: var(--text-muted);
  }
</style>