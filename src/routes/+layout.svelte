<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import { setAppState } from '$lib/state/appState.svelte.js';
  import { getCurrentWebview } from '@tauri-apps/api/webview';

  const app = setAppState();

  onMount(async () => {
    // 1. Автоопределение языка (если пользователь ещё не выбирал)
    app.initLocale();

    // 2. Восстановление зума из localStorage
    const saved = localStorage.getItem('fivida.zoom');
    if (saved) {
      const lvl = parseFloat(saved);
      if (!isNaN(lvl) && lvl > 0) {
        app.setZoom(lvl);
        try {
          await getCurrentWebview().setZoom(lvl);
        } catch (e) {
          console.error('restore zoom failed', e);
        }
      }
    }
  });

  let { children } = $props();
</script>

{@render children()}