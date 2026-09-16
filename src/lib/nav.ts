/**
 * Localized navigation, assembled per request from the string table and the
 * locale-aware path helpers. Kept out of `site.ts` so the constants module
 * stays free of i18n imports.
 */

import {
  categoryPath,
  categoryLabel,
  localizePath,
  useTranslations,
  type Locale,
} from "./i18n";
import { authorText, getFamily } from "./posts";
import { CATEGORIES, SOCIAL_CHANNELS } from "./site";

export interface NavLink {
  label: string;
  href: string;
  /** Locale-neutral path, used to decide which link is the current page. */
  path?: string;
  external?: boolean;
}

/** The header's primary nav. */
export function navLinks(lang: Locale): NavLink[] {
  const t = useTranslations(lang);
  return [
    { label: t.nav.home, path: "/" },
    { label: t.nav.stories, path: "/blog" },
    { label: t.nav.family, path: "/authors" },
    { label: t.nav.about, path: "/about" },
    { label: t.nav.contact, path: "/contact" },
  ].map((link) => ({ ...link, href: localizePath(link.path, lang) }));
}

export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

export async function footerColumns(lang: Locale): Promise<FooterColumn[]> {
  const t = useTranslations(lang);
  const family = await getFamily();
  const local = (path: string, label: string): NavLink => ({
    label,
    path,
    href: localizePath(path, lang),
  });

  return [
    {
      heading: t.footer.explore,
      links: [
        local("/blog", t.common.allStories),
        local("/search", t.nav.search),
        ...CATEGORIES.map((category) => ({
          label: categoryLabel(category, lang),
          href: categoryPath(category, lang),
        })),
      ],
    },
    {
      heading: t.footer.family,
      links: family.map((author) =>
        local(`/authors/${author.id}`, authorText(author, lang).name),
      ),
    },
    {
      heading: t.footer.follow,
      links: SOCIAL_CHANNELS.map((channel) => ({ ...channel, external: true })),
    },
    {
      heading: t.footer.more,
      links: [
        local("/about", t.nav.about),
        local("/contact", t.nav.contact),
        local("/privacy", t.legal.privacy.title),
        local("/terms", t.legal.terms.title),
        {
          label: t.footer.rss,
          href: localizePath("/rss.xml", lang),
        },
      ],
    },
  ];
}
