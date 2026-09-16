import { getCollection, getEntries, getEntry, type CollectionEntry } from "astro:content";
import {
  DEFAULT_LOCALE,
  isLocale,
  localizePath,
  type Locale,
} from "./i18n";

export type Post = CollectionEntry<"posts">;
export type Author = CollectionEntry<"authors">;

const isVisible = (post: Post) =>
  import.meta.env.PROD ? post.data.draft === false : true;

const byNewest = (a: Post, b: Post) =>
  b.data.pubDate.getTime() - a.data.pubDate.getTime();

/* ------------------------------------------------------------------ */
/* Locale + slug                                                       */
/* ------------------------------------------------------------------ */

/**
 * A post `id` is `<locale>/<slug>`, because the collection loads from
 * `src/content/posts/<locale>/`. These two split it back apart; nothing else
 * in the codebase should be parsing a post id by hand.
 */

export function postLocale(post: Post): Locale {
  const first = post.id.split("/")[0];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** The story's own slug, with the locale directory removed. */
export function postSlug(post: Post): string {
  const [first, ...rest] = post.id.split("/");
  return isLocale(first) ? rest.join("/") : post.id;
}

/** Where the story lives, prefix included. English keeps its bare path. */
export function postPath(post: Post): string {
  return localizePath(`/blog/${postSlug(post)}`, postLocale(post));
}

/** Path to the generated OG card for a story. */
export function postOgPath(post: Post): string {
  return `/og/${post.id}.png`;
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

/**
 * Publishable posts in one locale, newest first. Drafts are hidden in
 * production only. Every listing goes through here, so a locale never shows a
 * story written in another language.
 */
export async function getPublishedPosts(lang: Locale): Promise<Post[]> {
  const posts = await getCollection(
    "posts",
    (post) => isVisible(post) && postLocale(post) === lang,
  );
  return posts.sort(byNewest);
}

/** Every publishable post across every locale — for build-time route lists. */
export async function getAllPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", isVisible);
  return posts.sort(byNewest);
}

/** The most recent post flagged `featured`, or the newest post as a fallback. */
export async function getFeaturedPost(lang: Locale): Promise<Post | undefined> {
  const posts = await getPublishedPosts(lang);
  return posts.find((p) => p.data.featured) ?? posts[0];
}

/** Posts written (or co-written) by a given author id, in one locale. */
export async function getPostsByAuthor(
  authorId: string,
  lang: Locale,
): Promise<Post[]> {
  const posts = await getPublishedPosts(lang);
  return posts.filter((p) => p.data.authors.some((ref) => ref.id === authorId));
}

/** Posts in a given category, in one locale. */
export async function getPostsByCategory(
  category: string,
  lang: Locale,
): Promise<Post[]> {
  const posts = await getPublishedPosts(lang);
  return posts.filter((p) => p.data.category === category);
}

/* ------------------------------------------------------------------ */
/* Tags                                                                */
/* ------------------------------------------------------------------ */

/**
 * Tags are translated per locale and written as plain lowercase words, some
 * with spaces (`kleine gesten`, `перед сном`). The slug only collapses that
 * whitespace: the letters stay as they are, so `/ja/tags/ハグ` is a real
 * address rather than a transliteration nobody would guess.
 */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Path to a tag listing in one locale, prefix included. */
export function tagPath(tag: string, lang: Locale): string {
  return localizePath(`/tags/${tagSlug(tag)}`, lang);
}

export interface TagSummary {
  /** The tag as written in frontmatter, from the first post that carries it. */
  tag: string;
  slug: string;
  count: number;
}

/** Every tag used in one locale, most used first, then alphabetical. */
export async function getTags(lang: Locale): Promise<TagSummary[]> {
  const posts = await getPublishedPosts(lang);
  const bySlug = new Map<string, TagSummary>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = tagSlug(tag);
      const entry = bySlug.get(slug);
      if (entry) entry.count += 1;
      else bySlug.set(slug, { tag, slug, count: 1 });
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, lang),
  );
}

/** Posts carrying a tag (matched by slug, so case and spacing don't matter). */
export async function getPostsByTag(tag: string, lang: Locale): Promise<Post[]> {
  const slug = tagSlug(tag);
  const posts = await getPublishedPosts(lang);
  return posts.filter((p) => p.data.tags.some((t) => tagSlug(t) === slug));
}

/**
 * The same tag in other locales, keyed by locale.
 *
 * Tags carry no translation key of their own, but the ten versions of a story
 * list their tags in the same order, so a tag's position in one post maps to
 * its translation in each sibling post. Every post carrying the tag votes,
 * and the most common answer per locale wins, which absorbs the odd post
 * whose translator reordered the list.
 */
export async function getTagTranslations(
  tag: string,
  lang: Locale,
): Promise<Partial<Record<Locale, string>>> {
  const slug = tagSlug(tag);
  const posts = await getPostsByTag(tag, lang);
  const votes = new Map<Locale, Map<string, number>>();

  for (const post of posts) {
    const index = post.data.tags.findIndex((t) => tagSlug(t) === slug);
    const siblings = await getTranslations(post);
    for (const [code, sibling] of Object.entries(siblings) as [Locale, Post][]) {
      const candidate = sibling.data.tags[index];
      if (code === lang || candidate === undefined) continue;
      const tally = votes.get(code) ?? new Map<string, number>();
      tally.set(candidate, (tally.get(candidate) ?? 0) + 1);
      votes.set(code, tally);
    }
  }

  const out: Partial<Record<Locale, string>> = { [lang]: tag };
  for (const [code, tally] of votes) {
    out[code] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
  return out;
}

/**
 * The same story in every locale that has it, keyed by locale.
 * `hreflang` and the language picker both read from this, so a reader who
 * switches language on a story lands on that story rather than the home page.
 */
export async function getTranslations(
  post: Post,
): Promise<Partial<Record<Locale, Post>>> {
  const siblings = await getCollection(
    "posts",
    (entry) =>
      isVisible(entry) && entry.data.translationKey === post.data.translationKey,
  );
  const out: Partial<Record<Locale, Post>> = {};
  for (const entry of siblings) out[postLocale(entry)] = entry;
  return out;
}

/** Resolve a post's author references to full author entries, in family order. */
export async function resolveAuthors(post: Post): Promise<Author[]> {
  const entries = await getEntries(post.data.authors);
  return entries
    .filter((entry): entry is Author => Boolean(entry))
    .sort((a, b) => a.data.order - b.data.order);
}

/**
 * Up to `limit` related posts from the same locale: same category first, then
 * any remaining posts that share a tag, never including the post itself.
 */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const posts = (await getPublishedPosts(postLocale(post))).filter(
    (p) => p.id !== post.id,
  );
  const sameCategory = posts.filter((p) => p.data.category === post.data.category);
  const sharesTag = posts.filter(
    (p) =>
      !sameCategory.includes(p) &&
      p.data.tags.some((tag) => post.data.tags.includes(tag)),
  );
  return [...sameCategory, ...sharesTag].slice(0, limit);
}

/** All authors, in family order. */
export async function getFamily(): Promise<Author[]> {
  const authors = await getCollection("authors");
  return authors.sort((a, b) => a.data.order - b.data.order);
}

/**
 * An author's name and prose in one locale, falling back to the English
 * fields when a translation is missing. The name is the locale's own form of
 * it, the one the stories use in their prose, so the byline matches the body.
 */
export function authorText(author: Author, lang: Locale) {
  const translated = lang === DEFAULT_LOCALE ? undefined : author.data.i18n?.[lang];
  return {
    name: translated?.name ?? author.data.name,
    tagline: translated?.tagline ?? author.data.tagline,
    bio: translated?.bio ?? author.data.bio,
    nepaliNote: translated?.nepaliNote ?? author.data.nepaliNote,
  };
}

/** Path to an author page in one locale. */
export function authorPath(authorId: string, lang: Locale): string {
  return localizePath(`/authors/${authorId}`, lang);
}

export { getEntry };
