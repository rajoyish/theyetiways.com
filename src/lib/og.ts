import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { SITE } from "./site";

/**
 * Open Graph card rendering.
 *
 * Layout comes from satori, which lays out a flexbox tree using the real font
 * metrics and wraps long titles properly; resvg then rasterises the SVG to the
 * PNG that crawlers actually want. Nothing here writes to disk — the endpoint
 * at `src/pages/og/[...slug].png.ts` calls `renderOgPng` and Astro emits the
 * bytes as a file during the build.
 *
 * Every card is 1200x630, the size Facebook, X, LinkedIn, and Slack all expect.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/**
 * Fonts are read from disk at build time, not imported, so Vite never tries to
 * bundle a .ttf into the SSR chunk. `process.cwd()` is the project root during
 * `astro build`, which survives the temp directory Astro bundles endpoints into
 * (`import.meta.url` does not).
 */
const fontPath = (file: string) => path.join(process.cwd(), "src/lib/fonts", file);

let fontCache: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function loadFonts() {
  return [
    {
      name: "Bangers",
      data: fs.readFileSync(fontPath("Bangers-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Besley",
      data: fs.readFileSync(fontPath("Besley-400.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Besley",
      data: fs.readFileSync(fontPath("Besley-600.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}

/** The three Yeti family accents, keyed by an author's `accent` field. */
const ACCENTS = {
  blue: "#2a84d3",
  pink: "#f06baa",
  mint: "#6bcdb2",
} as const;

export type OgAccent = keyof typeof ACCENTS;

export interface OgCard {
  /** Headline. Wraps to at most three lines, then clips. */
  title: string;
  /** One supporting line under the title. Wraps to at most two lines. */
  description?: string;
  /** Small tracked label above the title — the post's category. */
  eyebrow?: string;
  /** Byline in the footer, e.g. "Mama Yeti". */
  byline?: string;
  /** Which family accent tints the rule and the corner wash. */
  accent?: OgAccent;
}

/* Design tokens, mirrored from src/styles/global.css. The card is always the
   light theme: an OG image is baked once and can't follow a viewer's setting. */
const INK = "#131316";
const BODY = "#3c3c43";
const MUTED = "#5f5f68";
const CANVAS = "#fafafa";

/**
 * The brand snowflake, inlined as a data URI. Satori renders `img` reliably,
 * where its support for raw `svg` children is partial.
 */
const markDataUri = (color: string) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="${color}" stroke-width="1.6" stroke-linecap="round">` +
    `<path d="M12 2v20M3.34 7l17.32 10M3.34 17L20.66 7"/>` +
    `<path d="M12 5.5 9.6 7.7M12 5.5l2.4 2.2M12 18.5l-2.4-2.2M12 18.5l2.4 2.2"/>` +
    `<path d="M5.5 8.9l.2 3.2M5.5 8.9l-3 .9M18.5 15.1l-.2-3.2M18.5 15.1l3-.9"/>` +
    `<path d="M18.5 8.9l-.2 3.2M18.5 8.9l3 .9M5.5 15.1l.2-3.2M5.5 15.1l-3-.9"/>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

/**
 * Long titles get a smaller size rather than a clipped third line. Satori
 * measures properly, so this only has to be coarse: the thresholds are tuned
 * against Bangers, which is narrow and sets far more text per line than a
 * text face would.
 */
const titleSize = (title: string) => {
  if (title.length > 58) return 68;
  if (title.length > 38) return 82;
  return 96;
};

/**
 * Trims to a character budget on a word boundary. Satori's `WebkitLineClamp`
 * is unreliable here, and an overflowing block pushes the footer off the card
 * rather than clipping, so the text is cut before layout instead of after.
 */
const clamp = (text: string, max: number) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}\u2026`;
};

/* Budgets measured against the rendered card: three lines of Bangers at the
   smallest title size, three of Besley at 28px. The description budget clears
   the 180-character ceiling the yeti-story skill writes to, so a normal
   description arrives whole and the ellipsis is a backstop, not the norm. */
const TITLE_MAX = 90;
const DESCRIPTION_MAX = 185;

/** Builds the satori element tree for one card. */
function cardTree(card: OgCard) {
  const accent = ACCENTS[card.accent ?? "blue"];
  const footer = [SITE.name, card.byline].filter(Boolean).join("  ·  ");

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: CANVAS,
        padding: "72px 90px",
        fontFamily: "Besley",
        position: "relative",
      },
      children: [
        /* A slim accent rule down the left edge — the same `accent-edge`
           device the story cards use on the site. */
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "14px",
              backgroundColor: accent,
            },
          },
        },

        /* Header: mark + eyebrow */
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexShrink: 0,
            },
            children: [
              {
                type: "img",
                props: { src: markDataUri(accent), width: 46, height: 46 },
              },
              card.eyebrow && {
                type: "div",
                props: {
                  style: {
                    fontSize: "24px",
                    letterSpacing: "3px",
                    color: MUTED,
                    textTransform: "uppercase",
                  },
                  children: card.eyebrow,
                },
              },
            ].filter(Boolean),
          },
        },

        /* Body: title + description */
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", flexShrink: 1 },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontFamily: "Bangers",
                    fontSize: `${titleSize(card.title)}px`,
                    lineHeight: 1.08,
                    letterSpacing: "1px",
                    color: INK,
                  },
                  children: clamp(card.title, TITLE_MAX),
                },
              },
              card.description && {
                type: "div",
                props: {
                  style: {
                    marginTop: "22px",
                    fontSize: "28px",
                    lineHeight: 1.4,
                    color: BODY,
                  },
                  children: clamp(card.description, DESCRIPTION_MAX),
                },
              },
            ].filter(Boolean),
          },
        },

        /* Footer: byline on the left, domain on the right. Both stay on one
           line — a wrapping footer was what collided with the body block. */
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              gap: "24px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "26px",
                    fontWeight: 600,
                    color: INK,
                    whiteSpace: "nowrap",
                  },
                  children: footer,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "22px",
                    color: MUTED,
                    whiteSpace: "nowrap",
                  },
                  children: SITE.domain,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/**
 * Renders one card to PNG bytes.
 *
 * The bytes are copied into a plain `Uint8Array<ArrayBuffer>` because resvg
 * hands back a Node `Buffer`, whose `ArrayBufferLike` backing store does not
 * satisfy `BodyInit` when the endpoint wraps it in a `Response`.
 */
export async function renderOgPng(card: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  fontCache ??= await loadFonts();

  const svg = await satori(cardTree(card) as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: fontCache,
  });

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
  })
    .render()
    .asPng();

  const bytes = new Uint8Array(png.byteLength);
  bytes.set(png);
  return bytes;
}
