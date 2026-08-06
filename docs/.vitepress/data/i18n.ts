/**
 * The handful of strings the docs' own components render.
 *
 * Page content is localised by living in `docs/ko` or `docs/en`. This file is
 * only for the chrome that is drawn in Vue or React rather than in Markdown —
 * the "show code" toggle, the props table's column headings.
 */

export type Locale = 'ko' | 'en';

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Which language to render, taken from the page's own `lang`.
 *
 * Deliberately not derived from VitePress's `localeIndex`: that is `root` for
 * whichever locale is currently the default, so reading it would silently mean
 * "Korean" or "English" depending on a setting in `config.ts`. The BCP-47 tag
 * on the page says what the page actually is.
 */
export function localeOf(lang: string | undefined): Locale {
  return lang?.startsWith('ko') ? 'ko' : DEFAULT_LOCALE;
}

/**
 * The URL prefix of the locale a page is in — `''` for the root locale and
 * `/ko` for the rest. Derived from `localeIndex`, which is exactly the folder
 * name for every non-root locale, so this stays right whichever locale
 * `config.ts` makes the default.
 */
export function basePath(localeIndex: string | undefined): string {
  return !localeIndex || localeIndex === 'root' ? '' : `/${localeIndex}`;
}

const strings = {
  showCode: { ko: '코드 보기', en: 'Show code' },
  hideCode: { ko: '코드 숨기기', en: 'Hide code' },
  viewDark: { ko: '이 예시만 다크 모드로 보기', en: 'View this example in dark mode' },
  viewLight: { ko: '이 예시만 라이트 모드로 보기', en: 'View this example in light mode' },
  propColumn: { ko: 'Prop', en: 'Prop' },
  typeColumn: { ko: '타입', en: 'Type' },
  defaultColumn: { ko: '기본값', en: 'Default' },
  descriptionColumn: { ko: '설명', en: 'Description' },
  required: { ko: '필수', en: 'Required' }
} as const;

export type StringKey = keyof typeof strings;

export function t(locale: Locale, key: StringKey): string {
  return strings[key][locale];
}
