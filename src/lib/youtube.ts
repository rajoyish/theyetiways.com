/**
 * YouTube URL / ID helpers.
 *
 * Every post on The Yeti Ways is built around a video, so the `youtube` field
 * is required in the content schema. Authors may paste any common YouTube URL
 * shape or a bare 11-character ID — `extractYouTubeId` normalises them all.
 */

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * Pull the 11-character video ID out of any of:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/shorts/ID
 *   - https://www.youtube-nocookie.com/embed/ID
 *   - a bare ID
 * Returns `null` when nothing valid is found.
 */
export function extractYouTubeId(input: string): string | null {
  const value = input?.trim();
  if (!value) return null;

  if (ID_PATTERN.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return ID_PATTERN.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    const v = url.searchParams.get("v");
    if (v && ID_PATTERN.test(v)) return v;

    const parts = url.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "v");
    if (marker !== -1 && parts[marker + 1] && ID_PATTERN.test(parts[marker + 1])) {
      return parts[marker + 1];
    }
  }

  return null;
}

export type ThumbQuality = "maxresdefault" | "hqdefault" | "mqdefault" | "sddefault";

/** Thumbnail URL for a video ID. `maxresdefault` is not guaranteed to exist. */
export function youTubeThumb(id: string, quality: ThumbQuality = "maxresdefault"): string {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

/** Privacy-friendly embed URL (no cookies until playback). */
export function youTubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/** Canonical watch URL, handy for RSS and "watch on YouTube" links. */
export function youTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
