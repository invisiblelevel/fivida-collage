<script lang="ts">
  import type { Cell } from '$lib/state/appState.svelte.js';

  interface Props {
    cols?: number;
    rows?: number;
    cells?: Cell[];
    size?: number;
    gap?: number;
  }

  let { cols, rows, cells, size = 36, gap = 3 }: Props = $props();

  const pad = 2;
  const inner = size - pad * 2;

  type ShapeKind = 'rect' | 'circle' | 'ellipse' | 'hexagon' | 'diamond' | 'star';
  type ShapeRect = { x: number; y: number; w: number; h: number; shape: ShapeKind };

  const rects = $derived.by((): ShapeRect[] => {
    if (cells && cells.length > 0) {
      return cells.map((c) => ({
        x: pad + c.x * inner,
        y: pad + c.y * inner,
        w: c.w * inner - gap * 0.6,
        h: c.h * inner - gap * 0.6,
        shape: (c.shape ?? 'rect') as ShapeKind,
      }));
    }

    if (!cols || !rows) return [];
    const cellW = (inner - gap * (cols - 1)) / cols;
    const cellH = (inner - gap * (rows - 1)) / rows;
    const out: ShapeRect[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          x: pad + c * (cellW + gap),
          y: pad + r * (cellH + gap),
          w: cellW,
          h: cellH,
          shape: 'rect',
        });
      }
    }
    return out;
  });

  function hexPoints(cx: number, cy: number, r: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
    }
    return pts.join(' ');
  }

  function diamondPoints(cx: number, cy: number, rx: number, ry: number): string {
    return `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;
  }

  function starPoints(cx: number, cy: number, rOuter: number, rInner: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const isOuter = i % 2 === 0;
      const r = isOuter ? rOuter : rInner;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
    }
    return pts.join(' ');
  }
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  xmlns="http://www.w3.org/2000/svg"
>
  {#each rects as r}
    {#if r.shape === 'rect'}
      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="1.5" fill="currentColor" />
    {:else if r.shape === 'hexagon'}
      <polygon
        points={hexPoints(r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) / 2)}
        fill="currentColor"
      />
    {:else if r.shape === 'diamond'}
      <polygon
        points={diamondPoints(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2)}
        fill="currentColor"
      />
    {:else if r.shape === 'star'}
      <polygon
        points={starPoints(r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) / 2, Math.min(r.w, r.h) * 0.19)}
        fill="currentColor"
      />
    {:else}
      <ellipse
        cx={r.x + r.w / 2}
        cy={r.y + r.h / 2}
        rx={r.w / 2}
        ry={r.h / 2}
        fill="currentColor"
      />
    {/if}
  {/each}
</svg>

<style>
  svg { display: block; }
</style>