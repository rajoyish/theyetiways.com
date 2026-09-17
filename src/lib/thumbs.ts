import path from "node:path";
import fs from "node:fs";
import type { ImageMetadata } from "astro";
import type { Post } from "./posts";
import { youTubeThumb } from "./youtube";

/**
 * Story pictures, built by `scripts/thumbs.mjs` into `src/assets/thumbs/`
 * before every dev run and build. The top level holds one 1200x630 (1.91:1)
 * landscape crop per video, the shape every picture box on the site uses;
 * `portrait/` holds the whole 9:16 frame for the OG card. The folder is
 * gitignored, so it is read through a glob rather than imported by name: a
 * missing file is `undefined`, not a build error, and callers fall back to
 * YouTube's own thumbnail.
 */
const thumbs = import.meta.glob<ImageMetadata>("/src/assets/thumbs/*.jpg", {
  eager: true,
  import: "default",
});

const byId = new Map(
  Object.entries(thumbs).map(([file, image]) => [path.basename(file, ".jpg"), image]),
);

/** The built hero for a video id, when the script has produced one. */
export function videoThumb(id: string): ImageMetadata | undefined {
  return byId.get(id);
}

/** A story's picture: a hand-picked cover wins, then the built hero. */
export function postThumb(post: Post): ImageMetadata | undefined {
  return post.data.cover ?? videoThumb(post.data.youtube);
}

/** YouTube's own composite, for when nothing has been built. */
export function postThumbFallback(post: Post): string {
  return youTubeThumb(post.data.youtube, "hqdefault");
}

/**
 * On-disk path of the built 9:16 frame, for the OG card, which reads bytes
 * rather than serving an `<img>`. `process.cwd()` is the project root during
 * `astro build`.
 */
export function postPortraitFile(post: Post): string | undefined {
  const file = path.join(
    process.cwd(),
    "src/assets/thumbs/portrait",
    `${post.data.youtube}.jpg`,
  );
  return fs.existsSync(file) ? file : undefined;
}
