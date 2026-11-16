import path from "node:path";
import fs from "node:fs";
import type { ImageMetadata } from "astro";
import type { Post } from "./posts";
import { youTubeThumb } from "./youtube";

/**
 * Story pictures, built by `scripts/thumbs.mjs` into `src/assets/thumbs/`
 * before every dev run and build. The top level holds one 1200x630 (1.91:1)
 * landscape picture per video, the shape every picture box on the site uses;
 * `portrait/` holds the OG card's picture: the whole 9:16 frame of a Short, or
 * the middle of a 16:9 video. The folder is
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

const portraitThumbs = import.meta.glob<ImageMetadata>(
  "/src/assets/thumbs/portrait/*.jpg",
  {
    eager: true,
    import: "default",
  },
);

const portraitById = new Map(
  Object.entries(portraitThumbs).map(([file, image]) => [
    path.basename(file, ".jpg"),
    image,
  ]),
);

export type VideoFormat = "short" | "landscape";

let formats: Record<string, VideoFormat> | undefined;

/**
 * Whether a video was uploaded as a Short or as a regular 16:9 video, as
 * recorded by `detectFormat` in `scripts/thumbs.mjs`. A video the script has
 * not reached yet counts as a Short, the layout every story had before.
 */
export function videoFormat(id: string): VideoFormat {
  if (!formats) {
    const file = path.join(process.cwd(), "src/assets/thumbs/formats.json");
    try {
      formats = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      formats = {};
    }
  }
  return formats?.[id] ?? "short";
}

/** True for a regular 16:9 upload, whose thumbnail is shown whole. */
export function isLandscapeVideo(id: string): boolean {
  return videoFormat(id) === "landscape";
}

/**
 * The built portrait for a video id: the 9:16 frame of a Short, or the
 * middle of a 16:9 video at the OG card's picture-column shape.
 */
export function videoPortraitThumb(id: string): ImageMetadata | undefined {
  return portraitById.get(id);
}

/** A story's portrait picture: a hand-picked cover wins, then the built portrait frame. */
export function postPortraitThumb(post: Post): ImageMetadata | undefined {
  return post.data.cover ?? videoPortraitThumb(post.data.youtube);
}

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
 * On-disk path of the built portrait picture, for the OG card, which reads bytes
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
