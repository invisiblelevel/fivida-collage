<script lang="ts">
  import type { Component } from 'svelte';
  import type { LucideProps } from '@lucide/svelte';

  interface Props {
    icon: Component<LucideProps>;
    label: string;
    selected: boolean;
    onclick: () => void;
  }

  let { icon: Icon, label, selected, onclick }: Props = $props();
</script>

<button class="mode-btn" class:selected {onclick}>
  <div class="icon-wrap">
    <Icon size={22} strokeWidth={1.75} />
  </div>
  <span>{label}</span>
</button>

<style>
  .mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 16px 10px;
    color: var(--text-muted);
    border-radius: var(--radius);
    transition: all 0.18s ease;
  }

  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    transition: all 0.18s ease;
  }

  .mode-btn:hover {
    color: var(--text-secondary);
  }

  .mode-btn:hover .icon-wrap {
    background: var(--bg-surface);
  }

  .mode-btn.selected {
    color: var(--accent);
  }

  .mode-btn.selected .icon-wrap {
    background: var(--accent-soft);
    box-shadow: 0 0 0 1px var(--accent-glow) inset;
  }

  span {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
</style>