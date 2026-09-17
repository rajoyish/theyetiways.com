/**
 * Builds two pictures per story video from its YouTube Shorts thumbnail.
 *
 * Every story is a YouTube Short, and the only 16:9 thumbnail YouTube serves
 * for a Short is a composite: the sharp 9:16 frame in the middle, a darkened
 * cover-scaled copy of the same frame filling the sides. This script cuts the
 * middle panel out once and writes it twice:
 *
 *   src/assets/thumbs/<id>.jpg           1200x630 (1.91:1), the middle of the
 *                                        frame anchored a little above centre,
 *                                        for the hero and the story cards
 *   src/assets/thumbs/portrait/<id>.jpg  540x960 (9:16), the whole frame, for
 *                                        the OG card, which crops it from the
 *                                        top to fill its picture column
 *
 * Both are upscaled with Lanczos so nothing downstream has to scale a 405px
 * strip itself.
 *
 * Runs before `astro dev` and `astro build` (see package.json). The output
 * folder is gitignored: an id whose files both exist is skipped, so a run only
 * fetches what is new. Delete a file to rebuild it.
 *
 * The hero, story cards and OG cards all read from this folder through
 * `src/lib/thumbs.ts`, which falls back to the raw YouTube thumbnail when a
 * file is missing, so a failed fetch degrades the page rather than the build.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src/content/posts");
const OUT_DIR = path.join(ROOT, "src/assets/thumbs");
const PORTRAIT_DIR = path.join(OUT_DIR, "portrait");

const LANDSCAPE = { width: 1200, height: 630 };
const PORTRAIT = { width: 540, height: 960 };
/* Vertical anchor for the landscape crop, as a share of the slack above and
   below. 0 is the top of the portrait frame, 0.5 its centre. Faces sit in the
   top third of a Shorts frame. */
const ANCHOR = 0.35;
const CONCURRENCY = 4;

const ID_PATTERN = /[A-Za-z0-9_-]{11}/;

/** Collects every distinct video id from the `youtube:` frontmatter line. */
async function collectIds() {
  const ids = new Set();
  const files = await fs.readdir(POSTS_DIR, { recursive: true });
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const text = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
    const line = text.match(/^youtube:\s*["']?([^"'\n]+)/m)?.[1]?.trim();
    if (!line) continue;
    const id = line.match(/(?:v=|shorts\/|embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1]
      ?? (ID_PATTERN.test(line) && line.length === 11 ? line : null);
    if (id) ids.add(id);
  }
  return [...ids].sort();
}

/** Fetches the best composite YouTube has; `maxresdefault` is not guaranteed. */
async function fetchComposite(id) {
  for (const quality of ["maxresdefault", "sddefault", "hqdefault"]) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${quality}.jpg`);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`no thumbnail served for ${id}`);
}

/**
 * Geometry of the Shorts panel inside a composite of any size. `sddefault`
 * and `hqdefault` are 4:3 with the 16:9 composite letterboxed inside, so the
 * content box is derived from the width and centred vertically.
 */
function panelRegion(width, height) {
  const contentHeight = Math.round((width * 9) / 16);
  const contentTop = Math.round((height - contentHeight) / 2);
  const panelWidth = Math.round((contentHeight * 9) / 16);
  const panelLeft = Math.round((width - panelWidth) / 2);
  return { left: panelLeft, top: contentTop, width: panelWidth, height: contentHeight };
}

/** The 1.91:1 window inside a panel of the given size. */
function landscapeRegion(width, height) {
  const cropHeight = Math.round((width * LANDSCAPE.height) / LANDSCAPE.width);
  const top = Math.round((height - cropHeight) * ANCHOR);
  return { left: 0, top, width, height: cropHeight };
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/** Resizes, sharpens and writes one picture through a temp file. */
async function write(input, { width, height }, out) {
  await sharp(input)
    .resize(width, height, { kernel: "lanczos3" })
    /* A light pass to bring edges back after a ~2-4x upscale. Stronger values
       halo the JPEG blocks in the source. */
    .sharpen({ sigma: 1, m1: 0.3, m2: 0.5 })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(`${out}.tmp`);
  await fs.rename(`${out}.tmp`, out);
}

async function buildOne(id) {
  const landscapeOut = path.join(OUT_DIR, `${id}.jpg`);
  const portraitOut = path.join(PORTRAIT_DIR, `${id}.jpg`);
  const [hasLandscape, hasPortrait] = await Promise.all([
    exists(landscapeOut),
    exists(portraitOut),
  ]);
  if (hasLandscape && hasPortrait) return "kept";

  const composite = await fetchComposite(id);
  const { width, height } = await sharp(composite).metadata();
  const panel = await sharp(composite).extract(panelRegion(width, height)).toBuffer();
  const { width: panelWidth, height: panelHeight } = await sharp(panel).metadata();

  if (!hasPortrait) await write(panel, PORTRAIT, portraitOut);
  if (!hasLandscape) {
    const window = await sharp(panel).extract(landscapeRegion(panelWidth, panelHeight)).toBuffer();
    await write(window, LANDSCAPE, landscapeOut);
  }
  return "built";
}

async function main() {
  await fs.mkdir(PORTRAIT_DIR, { recursive: true });
  const ids = await collectIds();
  const counts = { built: 0, kept: 0, failed: 0 };

  const queue = [...ids];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let id = queue.shift(); id; id = queue.shift()) {
        try {
          counts[await buildOne(id)]++;
        } catch (error) {
          counts.failed++;
          console.warn(`thumbs: ${id} skipped (${error.message})`);
        }
      }
    }),
  );

  console.log(
    `thumbs: ${counts.built} built, ${counts.kept} kept, ${counts.failed} failed ` +
      `(${ids.length} videos)`,
  );
}

await main();
