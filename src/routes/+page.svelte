<script lang="ts">
  import LeftPanel from '$lib/components/LeftPanel.svelte';
  import CollageCanvas from '$lib/components/CollageCanvas.svelte';
  import RightPanel from '$lib/components/RightPanel.svelte';
  import AboutModal from '$lib/components/AboutModal.svelte';
  import SupportModal from '$lib/components/SupportModal.svelte';
  import { getAppState } from '$lib/state/appState.svelte.js';

  const app = getAppState();
</script>

<div class="app">
  <LeftPanel />
  <CollageCanvas />
  <RightPanel />
</div>

{#if app.showAbout}
  <AboutModal />
{/if}

{#if app.showSupport}
  <SupportModal />
{/if}

<style>
  .app { display: flex; height: 100vh; width: 100vw; }
</style>