<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import { setAppState } from '$lib/state/appState.svelte.js';
  import { getCurrentWebview } from '@tauri-apps/api/webview';

  const app = setAppState();

  function handleKeydown(e: KeyboardEvent) {
    // Проверяем физическую клавишу (e.code), чтобы работало на любой раскладке
    const isZ = e.code === 'KeyZ';
    const isY = e.code === 'KeyY';

    // Undo (Ctrl+Z)
    if ((e.ctrlKey || e.metaKey) && isZ && !e.shiftKey) {
      e.preventDefault();
      app.undo();
    }
    
    // Redo (Ctrl+Y или Ctrl+Shift+Z)
    if ((e.ctrlKey || e.metaKey) && (isY || (isZ && e.shiftKey))) {
      e.preventDefault();
      app.redo();
    }
  }

  onMount(async () => {
    app.initLocale();
    
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

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  let { children } = $props();
</script>

{@render children()}