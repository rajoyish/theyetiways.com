/**
 * Story search, scored in the browser.
 *
 * The site builds to static files, so there is nothing to query at request
 * time. Instead the build emits every story as a `SearchDoc` (see
 * `src/pages/search-index.json.ts`) and the search page scores that index
 * client-side. Nothing here touches Astro, the DOM, or `astro:content`, so
 * both the build and the browser can import it.
 */

export interface SearchDoc {
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  authors: string[];
  /** ISO timestamp — breaks ties between equally relevant stories. */
  date: string;
  /** Pre-formatted date, so the browser doesn't re-derive it per result. */
  dateLabel: string;
  thumb: string;
}

/** Searchable fields, most telling first. A term match scores `weight`. */
const FIELDS: { read: (doc: SearchDoc) => string; weight: number }[] = [
  { read: (doc) => doc.title, weight: 10 },
  { read: (doc) => doc.tags.join(" "), weight: 6 },
  { read: (doc) => doc.category, weight: 5 },
  { read: (doc) => doc.authors.join(" "), weight: 4 },
  { read: (doc) => doc.description, weight: 3 },
];

/**
 * Lowercase and strip accents one code point at a time, so every index in the
 * folded string still points at the same character in the original.
 * `highlightSegments` needs that alignment to mark the untouched text.
 */
export function fold(value: string): string {
  return Array.from(value)
    .map((char) => char.normalize("NFD")[0]!.toLowerCase())
    .join("");
}

/**
 * Split a query into search terms. Punctuation is a separator, never a term.
 *
 * The separator class is any character that is neither a letter nor a number in
 * *any* script, not just ASCII — an `[^a-z0-9]` class would throw away a
 * Cyrillic or CJK query whole and return no terms at all. Chinese and Japanese
 * do not space their words, so a query in those scripts arrives as one long
 * term and matches by substring, which is exactly what `termScore` does.
 */
export function tokenize(query: string): string[] {
  return fold(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * How well one term matches one field: a whole word beats a word start, which
 * beats a hit buried mid-word. 0 means the field doesn't contain the term.
 */
function termScore(haystack: string, term: string): number {
  const at = haystack.indexOf(term);
  if (at < 0) return 0;
  const isWordy = (char: string | undefined) =>
    Boolean(char) && /[\p{L}\p{N}]/u.test(char!);
  const startsWord = !isWordy(haystack[at - 1]);
  const endsWord = !isWordy(haystack[at + term.length]);
  if (startsWord && endsWord) return 1;
  return startsWord ? 0.7 : 0.4;
}

export interface PreparedDoc {
  doc: SearchDoc;
  /** Folded field text, parallel to `FIELDS`. */
  fields: string[];
  time: number;
}

/** Fold every field once up front, so typing doesn't re-fold the whole index. */
export function prepareDocs(docs: SearchDoc[]): PreparedDoc[] {
  return docs.map((doc) => ({
    doc,
    fields: FIELDS.map((field) => fold(field.read(doc))),
    time: new Date(doc.date).getTime(),
  }));
}

/**
 * Stories matching every term in `query`, most relevant first, newest first
 * within a tie. An empty query matches nothing — the page decides what to
 * show in that case.
 */
export function searchDocs(docs: PreparedDoc[], query: string): SearchDoc[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const hits: { doc: SearchDoc; score: number; time: number }[] = [];

  for (const entry of docs) {
    let total = 0;
    for (const term of terms) {
      // A term scores from its strongest field; one that lands nowhere drops
      // the story, so extra words narrow the results rather than widen them.
      let best = 0;
      for (const [index, field] of FIELDS.entries()) {
        best = Math.max(best, field.weight * termScore(entry.fields[index]!, term));
      }
      if (best === 0) {
        total = 0;
        break;
      }
      total += best;
    }
    if (total > 0) hits.push({ doc: entry.doc, score: total, time: entry.time });
  }

  return hits
    .sort((a, b) => b.score - a.score || b.time - a.time)
    .map((hit) => hit.doc);
}

export interface Segment {
  text: string;
  match: boolean;
}

/**
 * Split `text` into alternating plain and matched runs, ready to be escaped
 * and wrapped in `<mark>`. HTML stays out of here; the caller escapes.
 */
export function highlightSegments(text: string, terms: string[]): Segment[] {
  if (terms.length === 0) return [{ text, match: false }];

  const haystack = fold(text);
  const ranges: [number, number][] = [];

  for (const term of terms) {
    for (let from = 0; ; ) {
      const at = haystack.indexOf(term, from);
      if (at < 0) break;
      ranges.push([at, at + term.length]);
      from = at + term.length;
    }
  }
  if (ranges.length === 0) return [{ text, match: false }];

  // Terms can overlap ("yet" and "yeti"); merge so nothing is marked twice.
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  const segments: Segment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false });
    segments.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}
