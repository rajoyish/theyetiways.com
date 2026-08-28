import { getCollection, getEntries, getEntry, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;
export type Author = CollectionEntry<"authors">;

const isVisible = (post: Post) =>
  import.meta.env.PROD ? post.data.draft === false : true;

const byNewest = (a: Post, b: Post) =>
  b.data.pubDate.getTime() - a.data.pubDate.getTime();

/** All publishable posts, newest first. Drafts are hidden in production only. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", isVisible);
  return posts.sort(byNewest);
}

/** The most recent post flagged `featured`, or the newest post as a fallback. */
export async function getFeaturedPost(): Promise<Post | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.data.featured) ?? posts[0];
}

/** Posts written (or co-written) by a given author id. */
export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.authors.some((ref) => ref.id === authorId));
}

/** Posts in a given category. */
export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.category === category);
}

/** Resolve a post's author references to full author entries, in family order. */
export async function resolveAuthors(post: Post): Promise<Author[]> {
  const entries = await getEntries(post.data.authors);
  return entries
    .filter((entry): entry is Author => Boolean(entry))
    .sort((a, b) => a.data.order - b.data.order);
}

/**
 * Up to `limit` related posts: same category first, then any remaining posts
 * that share a tag, never including the post itself.
 */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const posts = (await getPublishedPosts()).filter((p) => p.id !== post.id);
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

export { getEntry };
