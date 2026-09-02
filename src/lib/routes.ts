/**
 * `getStaticPaths` helpers for the locale-prefixed routes under
 * `src/pages/[lang]/`.
 *
 * English is not in these lists: it keeps the bare paths it has always had,
 * served by the matching route at the root of `src/pages/`.
 */

import { TRANSLATED_LOCALES, type Locale } from "./i18n";

export interface LangParams {
  params: { lang: Locale };
  props: { lang: Locale };
}

/** One entry per translated locale — the whole path list for a static page. */
export function langPaths(): LangParams[] {
  return TRANSLATED_LOCALES.map((lang) => ({
    params: { lang },
    props: { lang },
  }));
}
