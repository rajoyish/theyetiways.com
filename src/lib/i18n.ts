/**
 * Locale registry and URL helpers.
 *
 * English is the default locale and keeps the bare paths it has always had
 * (`/blog/...`), so nothing that is already indexed moves. Every other locale
 * lives under its own prefix (`/es/blog/...`). Pages never take a `lang` prop:
 * components read it back out of `Astro.url` with `getLangFromUrl`, which keeps
 * the prefix and the rendered text from drifting apart.
 */

import { CATEGORIES, type Category } from "./site";

export const DEFAULT_LOCALE = "en";

export interface LocaleMeta {
  /** Name of the language, written in that language, for the picker. */
  label: string;
  /** `<html lang>` and `hreflang` value. */
  tag: string;
  /** `og:locale` value. */
  ogLocale: string;
  /** Passed to `toLocaleDateString`. */
  dateLocale: string;
  /** RSS `<language>` value. */
  rssLanguage: string;
  dir: "ltr" | "rtl";
}

export const LOCALES = {
  en: {
    label: "English",
    tag: "en",
    ogLocale: "en_US",
    dateLocale: "en-US",
    rssLanguage: "en-us",
    dir: "ltr",
  },
  es: {
    label: "Español",
    tag: "es",
    ogLocale: "es_ES",
    dateLocale: "es-ES",
    rssLanguage: "es",
    dir: "ltr",
  },
  ja: {
    label: "日本語",
    tag: "ja",
    ogLocale: "ja_JP",
    dateLocale: "ja-JP",
    rssLanguage: "ja",
    dir: "ltr",
  },
  fr: {
    label: "Français",
    tag: "fr",
    ogLocale: "fr_FR",
    dateLocale: "fr-FR",
    rssLanguage: "fr",
    dir: "ltr",
  },
  de: {
    label: "Deutsch",
    tag: "de",
    ogLocale: "de_DE",
    dateLocale: "de-DE",
    rssLanguage: "de",
    dir: "ltr",
  },
  pt: {
    label: "Português",
    tag: "pt",
    ogLocale: "pt_BR",
    dateLocale: "pt-BR",
    rssLanguage: "pt",
    dir: "ltr",
  },
  ko: {
    label: "한국어",
    tag: "ko",
    ogLocale: "ko_KR",
    dateLocale: "ko-KR",
    rssLanguage: "ko",
    dir: "ltr",
  },
  it: {
    label: "Italiano",
    tag: "it",
    ogLocale: "it_IT",
    dateLocale: "it-IT",
    rssLanguage: "it",
    dir: "ltr",
  },
  ru: {
    label: "Русский",
    tag: "ru",
    ogLocale: "ru_RU",
    dateLocale: "ru-RU",
    rssLanguage: "ru",
    dir: "ltr",
  },
  /* The URL prefix stays the bare `zh`, but the `hreflang` is `zh-Hans`: the
     translation is Simplified, and a Traditional edition would be `zh-Hant`
     later without disturbing this one. */
  zh: {
    label: "简体中文",
    tag: "zh-Hans",
    ogLocale: "zh_CN",
    dateLocale: "zh-CN",
    rssLanguage: "zh-cn",
    dir: "ltr",
  },
} as const satisfies Record<string, LocaleMeta>;

export type Locale = keyof typeof LOCALES;

export const LOCALE_CODES = Object.keys(LOCALES) as Locale[];

/** The nine prefixed locales — the params for every `src/pages/[lang]/` route. */
export const TRANSLATED_LOCALES = LOCALE_CODES.filter(
  (code): code is Exclude<Locale, typeof DEFAULT_LOCALE> => code !== DEFAULT_LOCALE,
);

export const isLocale = (value: string): value is Locale =>
  Object.hasOwn(LOCALES, value);

/** The locale a pathname belongs to, from its first segment. */
export function getLangFromUrl(url: URL | string): Locale {
  const pathname = typeof url === "string" ? url : url.pathname;
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** A pathname with any locale prefix removed, e.g. `/es/blog` -> `/blog`. */
export function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) segments.shift();
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

/**
 * A locale-neutral path (always starting `/`) rewritten for `lang`.
 * English is returned untouched; the rest gain their prefix.
 */
export function localizePath(path: string, lang: Locale): string {
  if (lang === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${lang}/` : `/${lang}${path}`;
}

/**
 * `hreflang` targets for a page, as locale -> absolute path.
 *
 * `build` maps a locale to that locale's *unprefixed* path, which is how pages
 * whose slug is itself translated (stories, categories) declare their pairs.
 * Returning `undefined` drops a locale, so a story with no French translation
 * simply gets no French alternate rather than a link to a 404.
 */
export function localeAlternates(
  build: (lang: Locale) => string | undefined,
): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const lang of LOCALE_CODES) {
    const path = build(lang);
    if (path) out[lang] = localizePath(path, lang);
  }
  return out;
}

/** Alternates for a page that has the same path in every locale. */
export function mirrorAlternates(pathname: string): Partial<Record<Locale, string>> {
  const neutral = stripLocale(pathname);
  return localeAlternates(() => neutral);
}

/** A story date in the reader's language, still read in the family's timezone. */
export function formatDate(date: Date, lang: Locale): string {
  return date.toLocaleDateString(LOCALES[lang].dateLocale, {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export { CATEGORIES, type Category };

/* ------------------------------------------------------------------ */
/* Strings                                                             */
/* ------------------------------------------------------------------ */

import { UI } from "./ui";
import type { UiStrings } from "./ui";

/** The whole string table for one locale. Call it once at the top of a file. */
export function useTranslations(lang: Locale): UiStrings {
  return UI[lang];
}

/**
 * The right form of "story" for `count`, chosen by the locale's own plural
 * rules rather than by `count === 1`. English and most of the Latin-script
 * locales only ever reach `one` and `other`; Russian also has a `few` form for
 * 2-4, and the CJK locales have no plural at all and return the same word
 * every time.
 */
const pluralRules = new Map<Locale, Intl.PluralRules>();

export function storyCount(count: number, lang: Locale): string {
  let rules = pluralRules.get(lang);
  if (!rules) {
    rules = new Intl.PluralRules(LOCALES[lang].dateLocale);
    pluralRules.set(lang, rules);
  }
  const t = UI[lang].common;
  switch (rules.select(count)) {
    case "one":
      return t.story;
    case "few":
      return t.storiesFew;
    default:
      return t.stories;
  }
}

/** Replaces `{name}` placeholders in a template string. */
export function fill(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(vars, key) ? String(vars[key]) : match,
  );
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

/**
 * A category is stored in post frontmatter under its English name, which stays
 * the stable key. Only the label a reader sees and the slug in the URL are
 * translated, so `/de/categories/beziehungen` and `/categories/relationships`
 * describe the same set of posts.
 */

export function categoryLabel(category: Category, lang: Locale): string {
  return UI[lang].category.labels[category];
}

export function categorySlugFor(category: Category, lang: Locale): string {
  return UI[lang].category.slugs[category];
}

export function categoryBlurb(category: Category, lang: Locale): string {
  return UI[lang].category.blurbs[category];
}

/** Reverse of `categorySlugFor`, scoped to one locale's slug table. */
export function categoryFromLocalizedSlug(
  slug: string,
  lang: Locale,
): Category | undefined {
  return CATEGORIES.find((category) => categorySlugFor(category, lang) === slug);
}

/** Path to a category listing in one locale, prefix included. */
export function categoryPath(category: Category, lang: Locale): string {
  return localizePath(`/categories/${categorySlugFor(category, lang)}`, lang);
}
