/**
 * JSON-LD structured-data builders.
 *
 * Every helper returns a plain object ready to be `JSON.stringify`-ed into a
 * `<script type="application/ld+json">` tag. Keep the shapes aligned with
 * https://schema.org and Google's structured-data guidelines.
 */

import { SITE, SOCIAL_CHANNELS } from "./site";
import { LOCALES, useTranslations, type Locale } from "./i18n";

/** Absolute URL for the org logo, reused across schemas. */
function logo(site: URL) {
  return {
    "@type": "ImageObject",
    url: new URL("/favicon.svg", site).href,
  } as const;
}

/**
 * Site-wide `WebSite` node — emitted on every page.
 *
 * `url` stays the bare origin in every locale so all ten language editions
 * resolve to one WebSite entity; the locale shows up in `inLanguage` and in
 * the `hreflang` links, which is where crawlers look for it.
 */
export function websiteSchema(site: URL, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    alternateName: SITE.domain,
    url: site.href,
    description: useTranslations(lang).meta.description,
    inLanguage: LOCALES[lang].tag,
    publisher: { "@id": `${site.href}#organization` },
  };
}

/** Site-wide `Organization` node — emitted on every page. */
export function organizationSchema(site: URL, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.href}#organization`,
    name: SITE.name,
    url: site.href,
    logo: logo(site),
    description: useTranslations(lang).meta.description,
    sameAs: SOCIAL_CHANNELS.map((channel) => channel.href),
  };
}

export interface BlogPostingInput {
  title: string;
  description: string;
  url: URL;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  authors: { name: string; url: string }[];
  section: string;
  tags: string[];
}

/** `BlogPosting` node for an individual story. */
export function blogPostingSchema(
  input: BlogPostingInput,
  site: URL,
  lang: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: input.url.href,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url.href },
    image: [input.image],
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    author: input.authors.map((author) => ({
      "@type": "Person",
      name: author.name,
      url: author.url,
    })),
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: logo(site),
    },
    articleSection: input.section,
    keywords: input.tags.join(", "),
    inLanguage: LOCALES[lang].tag,
  };
}

/** `BreadcrumbList` node built from an ordered list of crumbs. */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface PersonInput {
  name: string;
  description: string;
  url: URL;
  image?: string;
  sameAs?: string[];
}

/** `ProfilePage` + `Person` node for an author page. */
export function profilePageSchema(input: PersonInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: input.name,
      description: input.description,
      url: input.url.href,
      ...(input.image ? { image: input.image } : {}),
      ...(input.sameAs && input.sameAs.length > 0
        ? { sameAs: input.sameAs }
        : {}),
      worksFor: { "@type": "Organization", name: SITE.name },
    },
  };
}
