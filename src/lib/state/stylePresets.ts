export interface StylePreset {
  id: string;
  nameKey: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  shadowIntensity: number;
  gap: number;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'clean',
    nameKey: 'presets.clean',
    borderWidth: 0,
    borderColor: '#000000',
    borderRadius: 0,
    shadowIntensity: 0,
    gap: 0, // Плотная сетка без отступов
  },
  {
    id: 'polaroid',
    nameKey: 'presets.polaroid',
    borderWidth: 20, // Очень толстая белая рамка
    borderColor: '#ffffff',
    borderRadius: 0,
    shadowIntensity: 30,
    gap: 25, // Большие отступы, чтобы рамки не сливались
  },
  {
    id: 'film',
    nameKey: 'presets.film',
    borderWidth: 8, // Темная рамка
    borderColor: '#1a1a1f',
    borderRadius: 0,
    shadowIntensity: 0, // Без теней, как на плёнке
    gap: 12,
  },
  {
    id: 'shadowbox',
    nameKey: 'presets.shadowbox',
    borderWidth: 0,
    borderColor: '#000000',
    borderRadius: 24, // Сильное скругление
    shadowIntensity: 80, // Очень глубокая тень
    gap: 30,
  },
  {
    id: 'bold',
    nameKey: 'presets.bold',
    borderWidth: 12,
    borderColor: '#bf00ff', // Яркий акцентный фиолетовый
    borderRadius: 30,
    shadowIntensity: 50,
    gap: 15,
  },
  {
    id: 'minimal',
    nameKey: 'presets.minimal',
    borderWidth: 1, // Еле заметная тонкая линия
    borderColor: '#444444',
    borderRadius: 0,
    shadowIntensity: 15,
    gap: 8,
  },
];