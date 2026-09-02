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
 * An author's prose in one locale, falling back to the English fields when a
 * translation is missing. Names are never translated.
 */
export function authorText(author: Author, lang: Locale) {
  const translated = lang === DEFAULT_LOCALE ? undefined : author.data.i18n?.[lang];
  return {
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
