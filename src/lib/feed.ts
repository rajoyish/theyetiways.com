/**
 * Shared body for the per-locale RSS feeds, so `/rss.xml` and
 * `/<lang>/rss.xml` can never drift apart.
 */

import rss from "@astrojs/rss";
import { getPublishedPosts, postPath } from "./posts";
import { SITE } from "./site";
import {
  LOCALES,
  categoryLabel,
  localizePath,
  useTranslations,
  type Locale,
} from "./i18n";

export async function localeFeed(lang: Locale, site: URL | undefined) {
  const posts = await getPublishedPosts(lang);
  const t = useTranslations(lang);
  const origin = site ?? new URL(SITE.url);

  return rss({
    title: `${SITE.name} — ${t.stories.title}`,
    description: t.meta.description,
    /* The channel link points at this locale's home, not the site root, so a
       reader who subscribes to the Italian feed lands on the Italian site.
       Item links are absolute paths, so they resolve against the origin
       regardless of the trailing segment here. */
    site: new URL(localizePath("/", lang), origin),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `${postPath(post)}/`,
      categories: [categoryLabel(post.data.category, lang), ...post.data.tags],
    })),
    customData: `<language>${LOCALES[lang].rssLanguage}</language>`,
  });
}
