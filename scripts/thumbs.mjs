/**
 * Builds two pictures per story video from its YouTube thumbnail.
 *
 * A story video is either a YouTube Short or a regular 16:9 upload, and
 * `detectFormat` tells them apart. The answer is cached in
 * `src/assets/thumbs/formats.json`, so each video is probed once.
 *
 * Shorts: the only 16:9 thumbnail YouTube serves for a Short is a composite:
 * the sharp 9:16 frame in the middle, a darkened cover-scaled copy of the same
 * frame filling the sides. This script cuts the middle panel out once and
 * writes it twice:
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
 * 16:9 videos: the thumbnail is the uploaded picture itself, with no blurred
 * sides to cut away, so it is used whole:
 *
 *   src/assets/thumbs/<id>.jpg           1200x630, the full frame with only a
 *                                        sliver trimmed top and bottom
 *   src/assets/thumbs/portrait/<id>.jpg  560x630, the middle of the frame at
 *                                        the OG card's picture-column shape,
 *                                        so the card shows the centre of the
 *                                        shot rather than its top-left
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
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src/content/posts");
const OUT_DIR = path.join(ROOT, "src/assets/thumbs");
const PORTRAIT_DIR = path.join(OUT_DIR, "portrait");
const MESH_JSON = path.join(OUT_DIR, "mesh-gradients.json");
const FORMATS_JSON = path.join(OUT_DIR, "formats.json");

const LANDSCAPE = { width: 1200, height: 630 };
const PORTRAIT = { width: 540, height: 960 };
/* The OG card's picture column (see `IMAGE_WIDTH` in src/lib/og.ts). */
const COLUMN = { width: 560, height: 630 };
/* Fallback detector threshold: mean edge detail of the side strips over that
   of the middle panel. Shorts composites score 0.06 to 0.33 (the sides are a
   blurred copy); 16:9 uploads score 0.75 and up. */
const SIDE_DETAIL_THRESHOLD = 0.5;
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

/** The 16:9 content box of a thumbnail; 4:3 sizes letterbox it. */
function contentRegion(width, height) {
  const contentHeight = Math.min(height, Math.round((width * 9) / 16));
  return { left: 0, top: Math.round((height - contentHeight) / 2), width, height: contentHeight };
}

/** Mean absolute difference between a region and a blurred copy of it. */
async function edgeDetail(image, region) {
  const grey = sharp(image).extract(region).greyscale();
  const [raw, soft] = await Promise.all([
    grey.clone().raw().toBuffer(),
    grey.clone().blur(2).raw().toBuffer(),
  ]);
  let sum = 0;
  for (let i = 0; i < raw.length; i++) sum += Math.abs(raw[i] - soft[i]);
  return sum / raw.length;
}

/**
 * Fallback detector: a Shorts composite's sides are a blurred copy of the
 * frame, so they hold far less edge detail than the sharp middle panel. Only
 * used when YouTube's own answer is unavailable, because a 16:9 shot with a
 * soft, out-of-focus background can score like a Short.
 */
async function looksLikeShort(composite) {
  const { width, height } = await sharp(composite).metadata();
  const panel = panelRegion(width, height);
  const strip = Math.round(panel.left * 0.8);
  const side = (left) => ({ left, top: panel.top, width: strip, height: panel.height });
  const [left, right, middle] = await Promise.all([
    edgeDetail(composite, side(0)),
    edgeDetail(composite, side(width - strip)),
    edgeDetail(composite, panel),
  ]);
  return (left + right) / 2 / middle < SIDE_DETAIL_THRESHOLD;
}

/**
 * Whether a video was uploaded as a Short or as a regular 16:9 video.
 *
 * YouTube answers this itself: `/shorts/<id>` serves the Short for a Short and
 * redirects to `/watch?v=<id>` for anything else. The URL in frontmatter is
 * no guide, since a Short pasted as a watch link plays just the same. When
 * that request fails or lands somewhere unexpected (a consent page, a rate
 * limit), the thumbnail itself is measured instead.
 *
 * @returns {Promise<"short" | "landscape">}
 */
export async function detectFormat(id, composite) {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${id}`, {
      method: "HEAD",
      redirect: "manual",
    });
    if (res.status === 200) return "short";
    const location = res.headers.get("location") ?? "";
    if (res.status >= 300 && res.status < 400 && /\/watch\?v=/.test(location)) {
      return "landscape";
    }
  } catch {
    /* fall through to the image check */
  }
  return (await looksLikeShort(composite)) ? "short" : "landscape";
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

/** Shorts: cut the sharp middle panel out of the composite. */
async function buildShort(composite, landscapeOut, portraitOut) {
  const { width, height } = await sharp(composite).metadata();
  const panel = await sharp(composite).extract(panelRegion(width, height)).toBuffer();
  const { width: panelWidth, height: panelHeight } = await sharp(panel).metadata();
  await write(panel, PORTRAIT, portraitOut);
  const window = await sharp(panel).extract(landscapeRegion(panelWidth, panelHeight)).toBuffer();
  await write(window, LANDSCAPE, landscapeOut);
}

/** 16:9 videos: the uploaded thumbnail, whole, with nothing blurred. */
async function buildLandscape(composite, landscapeOut, portraitOut) {
  const { width, height } = await sharp(composite).metadata();
  const frame = await sharp(composite).extract(contentRegion(width, height)).toBuffer();
  const cover = (size) =>
    sharp(frame).resize(size.width, size.height, { fit: "cover", position: "centre" }).toBuffer();
  const [wide, column] = await Promise.all([cover(LANDSCAPE), cover(COLUMN)]);
  await write(wide, LANDSCAPE, landscapeOut);
  await write(column, COLUMN, portraitOut);
}

/**
 * Builds one video's pictures. A video whose format is not yet recorded is
 * detected and rebuilt even when its files exist, so pictures cut before
 * detection existed (every video was once treated as a Short) are redone.
 */
async function buildOne(id, formats) {
  const landscapeOut = path.join(OUT_DIR, `${id}.jpg`);
  const portraitOut = path.join(PORTRAIT_DIR, `${id}.jpg`);
  const [hasLandscape, hasPortrait] = await Promise.all([
    exists(landscapeOut),
    exists(portraitOut),
  ]);
  if (formats[id] && hasLandscape && hasPortrait) return "kept";

  const composite = await fetchComposite(id);
  const format = formats[id] ?? (await detectFormat(id, composite));
  if (format === "landscape") await buildLandscape(composite, landscapeOut, portraitOut);
  else await buildShort(composite, landscapeOut, portraitOut);
  formats[id] = format;
  return "built";
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const BASE_STOPS = [
  { x: 55, y: 12 },
  { x: 9, y: 74 },
  { x: 96, y: 31 },
  { x: 42, y: 24 },
  { x: 32, y: 52 },
  { x: 2, y: 51 },
  { x: 11, y: 53 },
];

async function extractMeshGradient(imageInput, id) {
  const { data } = await sharp(imageInput)
    .resize(96, 96, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const NUM_BINS = 12;
  const bins = Array.from({ length: NUM_BINS }, () => []);

  for (let i = 0; i < data.length; i += 3) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    if (l < 10 || l > 95 || s < 10) continue;
    const binIdx = Math.floor((h % 360) / (360 / NUM_BINS));
    bins[binIdx].push({ h, s, l, score: s * (1 - Math.abs(l - 55) / 50) });
  }

  const candidates = [];
  for (let i = 0; i < NUM_BINS; i++) {
    const bin = bins[i];
    if (bin.length < 5) continue;
    bin.sort((a, b) => b.score - a.score);
    const top = bin.slice(0, Math.max(1, Math.floor(bin.length * 0.15)));
    const avgH = Math.round(top.reduce((acc, p) => acc + p.h, 0) / top.length);
    const avgS = Math.round(top.reduce((acc, p) => acc + p.s, 0) / top.length);
    const avgL = Math.round(top.reduce((acc, p) => acc + p.l, 0) / top.length);
    candidates.push({
      h: avgH,
      s: Math.min(95, Math.max(55, Math.round(avgS * 1.25))),
      l: Math.min(
        78,
        Math.max(58, avgL < 50 ? avgL + 25 : avgL > 80 ? avgL - 10 : avgL),
      ),
      weight: bin.reduce((acc, p) => acc + p.score, 0),
    });
  }

  candidates.sort((a, b) => b.weight - a.weight);

  while (candidates.length < 8) {
    const base = candidates[0] || { h: 210, s: 70, l: 65 };
    const newH = (base.h + candidates.length * 45) % 360;
    candidates.push({ h: newH, s: base.s, l: base.l, weight: 1 });
  }

  const baseColor = hslToHex(candidates[0].h, candidates[0].s, candidates[0].l);
  const hash = hashString(id);
  const stops = BASE_STOPS.map((stop, i) => {
    const jitterX = ((hash >> (i * 3)) & 15) - 7;
    const jitterY = ((hash >> (i * 3 + 1)) & 15) - 7;
    const x = Math.max(0, Math.min(100, stop.x + jitterX));
    const y = Math.max(0, Math.min(100, stop.y + jitterY));
    const color = candidates[i + 1];
    return {
      at: `${x}% ${y}%`,
      hsla: `hsla(${color.h},${color.s}%,${color.l}%,1)`,
    };
  });

  const gradients = stops.map(
    (s) => `radial-gradient(at ${s.at}, ${s.hsla} 0px, transparent 50%)`,
  );

  return {
    backgroundColor: baseColor,
    backgroundImage: gradients.join(",\n"),
    style: `background-color: ${baseColor}; background-image: ${gradients.join(", ")};`,
  };
}

async function readJson(file) {
  if (!(await exists(file))) return {};
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return {};
  }
}

function sortKeys(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));
}

async function main() {
  await fs.mkdir(PORTRAIT_DIR, { recursive: true });
  const ids = await collectIds();
  const counts = { built: 0, kept: 0, failed: 0 };
  const formats = await readJson(FORMATS_JSON);
  const built = new Set();

  const queue = [...ids];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let id = queue.shift(); id; id = queue.shift()) {
        try {
          const result = await buildOne(id, formats);
          counts[result]++;
          if (result === "built") built.add(id);
        } catch (error) {
          counts.failed++;
          console.warn(`thumbs: ${id} skipped (${error.message})`);
        }
      }
    }),
  );

  await fs.writeFile(FORMATS_JSON, JSON.stringify(sortKeys(formats), null, 2), "utf8");

  const meshGradients = await readJson(MESH_JSON);
  let meshUpdated = false;
  /* A rebuilt picture gets a fresh mesh, read from the new pixels. */
  for (const id of built) {
    if (meshGradients[id]) {
      delete meshGradients[id];
      meshUpdated = true;
    }
  }
  for (const id of ids) {
    const portraitOut = path.join(PORTRAIT_DIR, `${id}.jpg`);
    if (!meshGradients[id] && (await exists(portraitOut))) {
      try {
        meshGradients[id] = await extractMeshGradient(portraitOut, id);
        meshUpdated = true;
      } catch (error) {
        console.warn(`thumbs: mesh for ${id} failed (${error.message})`);
      }
    }
  }

  if (meshUpdated || !(await exists(MESH_JSON))) {
    await fs.writeFile(MESH_JSON, JSON.stringify(meshGradients, null, 2), "utf8");
  }

  const landscapes = ids.filter((id) => formats[id] === "landscape").length;
  console.log(
    `thumbs: ${counts.built} built, ${counts.kept} kept, ${counts.failed} failed ` +
      `(${ids.length} videos, ${landscapes} 16:9, ${Object.keys(meshGradients).length} mesh gradients)`,
  );
}

/* Run only as a script, so `detectFormat` can be imported without side effects. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
