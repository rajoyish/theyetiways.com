import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { extractYouTubeId } from "./lib/youtube";
import { CATEGORIES } from "./lib/site";

/**
 * `authors` — one JSON file per family member in `src/content/authors/`.
 * The filename (e.g. `papa-yeti.json`) becomes the entry `id`.
 */
const authors = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/authors" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.enum(["Papa Yeti", "Mama Yeti", "Babu Yeti"]),
      // e.g. "Babu means son in Nepali"
      nepaliNote: z.string().optional(),
      tagline: z.string(),
      bio: z.string(),
      avatar: image(),
      // Per-author accent — one of the three Yeti family colors.
      accent: z.enum(["blue", "pink", "mint"]).default("blue"),
      // Family sort order (Papa 1, Mama 2, Babu 3).
      order: z.number(),
      socials: z
        .array(z.object({ label: z.string(), href: z.url() }))
        .optional(),
    }),
});

/**
 * `posts` — one Markdown file per story in `src/content/posts/`.
 * Every post is anchored to a YouTube video (`youtube`, required). The field
 * accepts any common YouTube URL or a bare ID and is normalised to the
 * 11-character video ID at load time.
 */
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      // 1+ Yetis — an array so a post can carry the family's dual perspective.
      authors: z.array(reference("authors")).nonempty(),
      youtube: z.string().transform((value, ctx) => {
        const id = extractYouTubeId(value);
        if (!id) {
          ctx.addIssue({
            code: "custom",
            message: `Invalid YouTube URL or ID: "${value}"`,
          });
          return z.NEVER;
        }
        return id;
      }),
      category: z.enum(CATEGORIES),
      tags: z.array(z.string()).default([]),
      // Optional custom cover; falls back to the YouTube thumbnail.
      cover: image().optional(),
      coverAlt: z.string().default(""),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { authors, posts };
