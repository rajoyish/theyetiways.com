import rss from "@astrojs/rss";
import { getPublishedPosts } from "../lib/posts";
import { SITE } from "../lib/site";

export async function GET(context) {
  const posts = await getPublishedPosts();

  return rss({
    title: `${SITE.name} — Stories`,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}
