import type { PatternKind } from '$lib/state/appState.svelte.js';

// Размер одного тайла в пикселях (внутри SVG)
const SIZE = 100;

// Вспомогательная функция для создания строки SVG
function svg(inner: string, width = SIZE, height = SIZE): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${inner}</svg>`;
}

export function getPatternSVG(kind: PatternKind, color: string): string {
  switch (kind) {
    case 'dots':
      return svg(`<circle cx="10" cy="10" r="2" fill="${color}"/><circle cx="60" cy="60" r="2" fill="${color}"/>`);
      
    case 'grid':
      return svg(`<path d="M 0 50 L 100 50 M 50 0 L 50 100" stroke="${color}" stroke-width="1" fill="none"/>`);
      
    case 'grid-bold':
      return svg(`<path d="M 0 50 L 100 50 M 50 0 L 50 100" stroke="${color}" stroke-width="4" fill="none"/>`);
      
    case 'diagonal':
      return svg(`<path d="M -25 125 L 125 -25 M 25 -25 L 125 75 M -25 75 L 75 125" stroke="${color}" stroke-width="2" fill="none"/>`);
      
    case 'diagonal-cross':
      return svg(`<path d="M -25 125 L 125 -25 M 25 -25 L 125 75 M -25 75 L 75 125 M -25 -25 L 125 125 M 25 125 L 125 25 M -25 25 L 75 -25" stroke="${color}" stroke-width="1.5" fill="none"/>`);
      
    case 'chevron':
      return svg(`<path d="M 0 25 L 50 75 L 100 25 M 0 75 L 50 125 L 100 75" stroke="${color}" stroke-width="2" fill="none"/>`);
      
    case 'waves':
      return svg(`<path d="M 0 25 Q 25 5 50 25 T 100 25 M 0 75 Q 25 55 50 75 T 100 75" stroke="${color}" stroke-width="2" fill="none"/>`);
      
    case 'crosses':
      return svg(`<path d="M 10 8 L 10 12 M 8 10 L 12 10 M 60 58 L 60 62 M 58 60 L 62 60" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`);
      
    case 'plus-grid':
      return svg(`<path d="M 40 30 L 60 30 M 50 20 L 50 40" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`);
      
    case 'triangles':
      return svg(`<path d="M 0 100 L 50 0 L 100 100 Z" stroke="${color}" stroke-width="2" fill="none"/>`);
      
    case 'hexagons':
      return svg(`<path d="M 50 0 L 93 25 L 93 75 L 50 100 L 7 75 L 7 25 Z" stroke="${color}" stroke-width="2" fill="none"/>`);
      
    case 'circles':
      return svg(`<circle cx="50" cy="50" r="30" stroke="${color}" stroke-width="2" fill="none"/>`);
      
    case 'dashes':
      return svg(`<path d="M 25 0 L 25 25 M 75 50 L 75 75" stroke="${color}" stroke-width="4" fill="none"/>`);
      
    case 'confetti':
      // Детерминированный "рандом", чтобы при тайлинге не было швов
      return svg(`
        <rect x="15" y="15" width="6" height="6" fill="${color}" transform="rotate(15 18 18)"/>
        <rect x="65" y="35" width="8" height="8" fill="${color}" transform="rotate(45 69 39)"/>
        <rect x="35" y="75" width="5" height="5" fill="${color}" transform="rotate(30 37 77)"/>
        <circle cx="85" cy="85" r="3" fill="${color}"/>
        <circle cx="10" cy="60" r="2" fill="${color}"/>
      `);
      
    default:
      return svg('');
  }
}