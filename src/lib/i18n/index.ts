import ru from './locales/ru.js';
import en from './locales/en.js';
import zh from './locales/zh.js';

export type Locale = 'ru' | 'en' | 'zh';

const dictionaries: Record<Locale, any> = { ru, en, zh };

const STORAGE_KEY = 'fivida.locale';

export function getInitialLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'ru';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'ru' || saved === 'en' || saved === 'zh') return saved;
  // Fallback до определения системного языка
  return 'ru';
}

// Маппинг системной локали в наш Locale
export function mapSystemLocale(sysLocale: string | null | undefined): Locale {
  if (!sysLocale) return 'ru';
  const l = sysLocale.toLowerCase();
  if (l.startsWith('zh')) return 'zh';
  if (l.startsWith('ru')) return 'ru';
  return 'en';
}

export function saveLocale(l: Locale) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, l);
  }
}

/**
 * Перевод по ключу.
 * - key — строка вида "toolbar.add" или "grids.journal"
 * - params — подстановки вида { n: 5 }, { name: 'photo.jpg' }
 *   В словаре используем шаблон "{n} фото" — функция заменит {n} на значение.
 * - n — для плюрализации: если задан, ищем ключ "_one" при n===1 (для EN),
 *   иначе "_many". Для RU/ZH можно задавать только "_many".
 */
export function t(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
  n?: number
): string {
  const dict = dictionaries[locale] ?? dictionaries.ru;
  const fallback = dictionaries.ru;

  // Плюрализация: если передан n и есть ключи _one / _many
  let resolvedKey = key;
  if (typeof n === 'number') {
    const suffix = n === 1 ? '_one' : '_many';
    if (resolveKey(dict, key + suffix) !== undefined) {
      resolvedKey = key + suffix;
    } else if (resolveKey(fallback, key + suffix) !== undefined) {
      resolvedKey = key + suffix;
    } else {
      // Без суффикса — берём как есть
      resolvedKey = key;
    }
  }

  let str = resolveKey(dict, resolvedKey);
  if (str === undefined) str = resolveKey(fallback, resolvedKey);
  if (str === undefined) str = resolvedKey; // ключ как fallback

  // Подстановки
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  if (typeof n === 'number') {
    str = str.replace(/\{n\}/g, String(n));
  }

  return str;
}

function resolveKey(obj: any, key: string): string | undefined {
  const parts = key.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export const localeLabels: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  zh: '中',
};