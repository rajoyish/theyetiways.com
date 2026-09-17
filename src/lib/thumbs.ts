import path from "node:path";
import fs from "node:fs";
import type { ImageMetadata } from "astro";
import type { Post } from "./posts";
import { youTubeThumb } from "./youtube";

/**
 * Story pictures, built by `scripts/thumbs.mjs` into `src/assets/thumbs/`
 * before every dev run and build. Every file is 1200x630, the Open Graph
 * shape, and every picture box on the site uses the same 1.91:1 ratio. The folder is gitignored, so it is read
 * through a glob rather than imported by name: a missing file is `undefined`,
 * not a build error, and callers fall back to YouTube's own thumbnail.
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
 * On-disk path of the built hero, for build-time renderers such as the OG
 * card that read bytes rather than serve an `<img>`. `process.cwd()` is the
 * project root during `astro build`.
 */
export function postThumbFile(post: Post): string | undefined {
  const file = path.join(process.cwd(), "src/assets/thumbs", `${post.data.youtube}.jpg`);
  return fs.existsSync(file) ? file : undefined;
}
