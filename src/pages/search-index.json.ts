import type { APIRoute } from "astro";
import { getImage } from "astro:assets";
import { getPublishedPosts, resolveAuthors } from "../lib/posts";
import { youTubeThumb } from "../lib/youtube";
import { formatStoryDate } from "../lib/site";
import type { SearchDoc } from "../lib/search";

/**
 * The whole story index as JSON, built once at build time and scored in the
 * browser by `/search`. It carries only what a result row needs, so the file
 * stays small enough to fetch on the first keystroke.
 */
export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const docs: SearchDoc[] = await Promise.all(
    posts.map(async (post) => {
      const authors = await resolveAuthors(post);
      const thumb = post.data.cover
        ? (await getImage({ src: post.data.cover, width: 320, height: 180 })).src
        : youTubeThumb(post.data.youtube, "mqdefault");

      return {
        url: `/blog/${post.id}`,
        title: post.data.title,
        description: post.data.description,
        category: post.data.category,
        tags: post.data.tags,
        authors: authors.map((author) => author.data.name),
        date: post.data.pubDate.toISOString(),
        dateLabel: formatStoryDate(post.data.pubDate),
        thumb,
      };
    }),
  );

  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
