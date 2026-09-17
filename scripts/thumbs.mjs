/**
 * Builds one hero image per story video into `src/assets/thumbs/<id>.jpg`.
 *
 * Every story is a YouTube Short, and the only 16:9 thumbnail YouTube serves
 * for a Short is a composite: the sharp 9:16 frame in the middle, a darkened
 * cover-scaled copy of the same frame filling the sides. This script cuts the
 * middle panel out, crops it to the Open Graph shape (1200x630, 1.91:1)
 * anchored a little above centre (faces sit in the top third of a portrait
 * frame), and upscales it with Lanczos so the browser never has to scale a
 * 405px strip itself. The same shape is used for every picture box on the
 * site, so one file serves the hero, the cards and the OG card.
 *
 * Runs before `astro dev` and `astro build` (see package.json). The output
 * folder is gitignored: an id whose file already exists is skipped, so a run
 * only fetches what is new. Delete a file to rebuild it.
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

const OUT_WIDTH = 1200;
const OUT_HEIGHT = 630;
/* Vertical anchor for the crop, as a share of the slack above and below.
   0 is the top of the portrait frame, 0.5 its centre. */
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
function panelCrop(width, height) {
  const contentHeight = Math.round((width * 9) / 16);
  const contentTop = Math.round((height - contentHeight) / 2);
  const panelWidth = Math.round((contentHeight * 9) / 16);
  const panelLeft = Math.round((width - panelWidth) / 2);
  const cropHeight = Math.round((panelWidth * OUT_HEIGHT) / OUT_WIDTH);
  const cropTop = contentTop + Math.round((contentHeight - cropHeight) * ANCHOR);
  return { left: panelLeft, top: cropTop, width: panelWidth, height: cropHeight };
}

async function buildOne(id) {
  const out = path.join(OUT_DIR, `${id}.jpg`);
  try {
    await fs.access(out);
    return "kept";
  } catch {
    /* not built yet */
  }

  const composite = await fetchComposite(id);
  const { width, height } = await sharp(composite).metadata();
  const region = panelCrop(width, height);

  await sharp(composite)
    .extract(region)
    .resize(OUT_WIDTH, OUT_HEIGHT, { kernel: "lanczos3" })
    /* A light pass to bring edges back after a ~4x upscale. Stronger values
       halo the JPEG blocks in the source. */
    .sharpen({ sigma: 1, m1: 0.3, m2: 0.5 })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(`${out}.tmp`);
  await fs.rename(`${out}.tmp`, out);
  return "built";
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
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
