import type { APIRoute, GetStaticPaths } from "astro";
import { getPublishedPosts, resolveAuthors } from "../../lib/posts";
import { renderOgPng, type OgAccent, type OgCard } from "../../lib/og";
import { SITE } from "../../lib/site";

/**
 * Open Graph images, one PNG per story plus a site-wide default.
 *
 * This is a prerendered endpoint, so `astro build` writes real files to
 * `dist/og/<slug>.png` — a new story gets its card the moment it builds, with
 * no script to remember and no generated PNGs committed to the repo. Because
 * the card is rendered from the post's own frontmatter, a retitled story gets a
 * corrected card automatically instead of quietly keeping a stale one.
 */

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();

  const cards = await Promise.all(
    posts.map(async (post) => {
      const authors = await resolveAuthors(post);
      return {
        params: { slug: post.id },
        props: {
          card: {
            title: post.data.title,
            description: post.data.description,
            eyebrow: post.data.category,
            byline: authors.map((author) => author.data.name).join(" & "),
            /* The lead author's colour tints the card, so a Mama story reads
               pink and a Babu story mint, exactly as it does on the site. */
            accent: (authors[0]?.data.accent ?? "blue") as OgAccent,
          } satisfies OgCard,
        },
      };
    }),
  );

  return [
    ...cards,
    {
      params: { slug: "default" },
      props: {
        card: {
          title: SITE.tagline,
          description: SITE.description,
          /* No eyebrow here: the footer already carries the site name, and
             repeating it above the title just doubles the words. */
        } satisfies OgCard,
      },
    },
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng(props.card as OgCard);

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
