/**
 * Shared body for the per-locale search indexes.
 *
 * Each locale gets its own file so the browser only ever downloads, and only
 * ever matches against, stories written in the language being read.
 */

import { getImage } from "astro:assets";
import { authorText, getPublishedPosts, postPath, resolveAuthors } from "./posts";
import { postThumb, postThumbFallback } from "./thumbs";
import { categoryLabel, formatDate, type Locale } from "./i18n";
import type { SearchDoc } from "./search";

export async function localeSearchIndex(lang: Locale): Promise<Response> {
  const posts = await getPublishedPosts(lang);

  const docs: SearchDoc[] = await Promise.all(
    posts.map(async (post) => {
      const authors = await resolveAuthors(post);
      const picture = postThumb(post);
      const thumb = picture
        ? (await getImage({ src: picture, width: 320, height: 168 })).src
        : postThumbFallback(post);

      return {
        url: postPath(post),
        title: post.data.title,
        description: post.data.description,
        category: categoryLabel(post.data.category, lang),
        tags: post.data.tags,
        authors: authors.map((author) => authorText(author, lang).name),
        date: post.data.pubDate.toISOString(),
        dateLabel: formatDate(post.data.pubDate, lang),
        thumb,
      };
    }),
  );

  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
