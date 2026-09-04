#!/usr/bin/env node
/**
 * Checks Yeti Ways stories against the rules in ../SKILL.md and
 * ../references/locales.md.
 *
 *   node check-story.mjs                       every post
 *   node check-story.mjs <translation-key>     one story in every locale it has
 *   node check-story.mjs src/content/posts/en/foo.md ...
 *
 * Errors fail the run (exit 1). Warnings print and do not.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, relative, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");
const POSTS = join(ROOT, "src/content/posts");

/* A number followed by a unit of time. The storyboard's timestamp column is
   production metadata, so a counted duration in the prose is nearly always a
   beat number that escaped. Clock time ("two in the morning") is fine and does
   not match, because it names an hour rather than a length.

   The number words run one to ten, the teens and tens that show up in these
   stories, and the vague counts ("a few", "half a"), which are stopwatch time
   too: the unit word is what makes it counted. Compounds fall out for free,
   since "twenty-five seconds" matches on its second half. */
const NUM = {
  en: "a|an|half a|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|"
    + "thirteen|fourteen|fifteen|twenty|thirty|forty|fifty|sixty|ninety|"
    + "couple of|few|several",
  es: "un|una|media|medio|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|"
    + "quince|veinte|treinta|cuarenta|cincuenta|noventa|unos|unas|pocos|varios",
  fr: "un|une|demi|demie|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|"
    + "quinze|vingt|trente|quarante|cinquante|quelques",
  de: "ein|eine|halbe|halben|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|"
    + "fünfzehn|zwanzig|dreißig|vierzig|fünfzig|neunzig|paar",
  pt: "um|uma|meio|meia|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|"
    + "quinze|vinte|trinta|quarenta|cinquenta|noventa|poucos|alguns",
  it: "un|uno|una|mezzo|mezza|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|undici|"
    + "dodici|quindici|venti|trenta|quaranta|cinquanta|novanta|pochi|qualche",
  /* Russian declines its numerals, so the tens carry a wildcard ending. */
  ru: "одна|одну|пол|две|два|три|четыре|пять|шесть|семь|восемь|девять|десять|"
    + "двенадцать|пятнадцать|двадцат\\p{L}*|тридцат\\p{L}*|сорок|пятьдесят|"
    + "девяност\\p{L}*|несколько",
  ja: "十[一二三四五六七八九]?|[一二三四五六七八九]十?|半|数|何",
  ko: "이십|삼십|사십|오십|육십|칠십|팔십|구십|스무|스물|서른|마흔|반|"
    + "일|이|삼|사|오|육|칠|팔|구|십|한|두|세|네|다섯|여섯|일곱|여덟|아홉|몇",
  zh: "十[一二三四五六七八九]?|[一二三四五六七八九两]十?|半|几",
};

const CLOCK = String.raw`\d{1,2}:\d{2}`;

const duration = (locale, units) =>
  [new RegExp(String.raw`(?<!\p{L})(\d+|${NUM[locale]})[\s-](${units})(?!\p{L})`, "giu"),
   new RegExp(CLOCK, "g")];

/* Japanese, Korean, and Chinese take neither guard: particles and suffixes
   attach straight to the unit (`一分間は`, `일 분을`), so a trailing letter is
   normal rather than a sign the match is part of another word. The number words
   are specific enough on their own, longest first so `사십 초` doesn't match as
   `십 초`. The space is optional. */
const cjkDuration = (locale, units) =>
  [new RegExp(String.raw`(\d+|${NUM[locale]})\s*(${units})`, "gu"),
   new RegExp(CLOCK, "g")];

/** Per-locale rules. Mirrors the table in references/locales.md. */
const LOCALES = {
  en: { heading: "The Yeti Way", min: 2400, max: 3100, latinDash: true,
        duration: duration("en", "seconds?|minutes?"),
        clipped: [/\b(Papa|Mama|Babu)\b(?!\s*Yeti)/g],
        /* Third-person role words always stand in for a name. */
        roles: [/\b(his father|her father|his mother|her mother|the little one)\b/gi],
        /* A narrator may introduce the spouse once as "my wife" or "my husband"
           and carry them with pronouns after that. A second use means the story
           needed the name at the first one. English only. The other locales say
           this their own way, so check those by eye. */
        spouse: /\b(my wife|my husband)\b/gi },
  es: { duration: duration("es", "segundos?|minutos?"),
        heading: "La manera Yeti", min: 2500, max: 3200, latinDash: true,
        clipped: [/(?<!\p{L})(Papá|Mamá|Babu)(?!\s*Yeti)/gu] },
  fr: { duration: duration("fr", "secondes?|minutes?"),
        heading: "La manière Yeti", min: 2700, max: 3500, latinDash: true,
        clipped: [/(?<!\p{L})(Papa|Maman|Babu)(?!\s*Yeti)/gu] },
  de: { duration: duration("de", "sekunden?|minuten?"),
        heading: "Der Yeti-Weg", min: 2600, max: 3350, latinDash: true,
        clipped: [/(?<!\p{L})(Papa|Mama|Babu)(?!\s*Yeti)/gu] },
  pt: { duration: duration("pt", "segundos?|minutos?"),
        heading: "O jeito Yeti", min: 2450, max: 3200, latinDash: true,
        clipped: [/(?<!\p{L})(Papai|Mamãe|Babu)(?!\s*Yeti)/gu] },
  it: { duration: duration("it", "second[oi]|minut[oi]"),
        heading: "Il modo Yeti", min: 2550, max: 3300, latinDash: true,
        clipped: [/(?<!\p{L})(Papà|Mamma|Babu)(?!\s*Yeti)/gu] },
  ru: { duration: duration("ru", "секунд\\p{L}*|минут\\p{L}*"),
        heading: "Путь йети", min: 2300, max: 3000, latinDash: false,
        clipped: [/(?<!\p{L})(Пап|Мам)[аыуеой]{1,2}(?!\s*Йети)/gu,
                  /(?<!\p{L})Бабу(?!\s*Йети)/gu] },
  ja: { duration: [...cjkDuration("ja", "秒|分間"),
                   /* A bare 十 in front of 分 is left alone: 十分 is far more
                      often "enough" than "ten minutes". Write 10分 for the
                      duration and it gets caught. */
                   /(\d+|[一二三四五六七八九]十|十[一二三四五六七八九]|[一二三四五六七八九])\s*分(?!間)/gu],
        heading: "イエティのやり方", min: 1100, max: 1450, latinDash: true,
        clipped: [/(パパ|ママ|ババ)(?!\s*イエティ)/g] },
  ko: { duration: cjkDuration("ko", "초|분"),
        heading: "예티의 방식", min: 1250, max: 1650, latinDash: true,
        clipped: [/(아빠|엄마|바부)(?!\s*예티)/g] },
  zh: { duration: cjkDuration("zh", "秒|分钟"),
        heading: "雪人的走法", min: 800, max: 1120, latinDash: false,
        clipped: [/(?<!雪人\s*)(爸爸|妈妈)/g, /(?<!小\s*)巴布/g] },
};

/* Frontmatter fields that must be byte-identical across a story's locales. */
const SHARED = ["translationKey", "youtube", "pubDate", "category", "authors",
                "featured", "draft"];

const CATEGORIES = ["Family", "Relationships", "Parenting", "Growing Up",
                    "Life Lessons"];

let errors = 0;
let warnings = 0;
const fail = (file, msg) => { errors++; console.log(`  ERROR  ${file}: ${msg}`); };
const warn = (file, msg) => { warnings++; console.log(`  warn   ${file}: ${msg}`); };

/** Every post file on disk, as { locale, slug, path }. */
function allPosts() {
  const out = [];
  for (const locale of readdirSync(POSTS, { withFileTypes: true })) {
    if (!locale.isDirectory() || !LOCALES[locale.name]) continue;
    for (const file of readdirSync(join(POSTS, locale.name))) {
      if (file.endsWith(".md")) {
        out.push({ locale: locale.name, slug: basename(file, ".md"),
                   path: join(POSTS, locale.name, file) });
      }
    }
  }
  return out;
}

/** Minimal frontmatter reader: scalars and `- item` lists, values unquoted. */
function parse(path) {
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const data = {};
  let key = null;
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && key) {
      (data[key] = Array.isArray(data[key]) ? data[key] : []).push(strip(item[1]));
      continue;
    }
    const pair = line.match(/^([A-Za-z][\w]*):\s*(.*)$/);
    if (pair) {
      key = pair[1];
      data[key] = pair[2] === "" ? [] : strip(pair[2]);
    }
  }
  return { data, body: match[2] };
}

const strip = (v) => v.trim().replace(/^["'](.*)["']$/, "$1");

function checkFile(post) {
  const name = relative(ROOT, post.path);
  const rules = LOCALES[post.locale];
  const parsed = parse(post.path);
  if (!parsed) return fail(name, "no frontmatter block");
  const { data, body } = parsed;
  const text = body.trim();

  /* Frontmatter */
  for (const field of ["translationKey", "youtube", "title", "description",
                       "pubDate", "authors", "category"]) {
    if (!data[field] || data[field].length === 0) fail(name, `missing ${field}`);
  }
  if (data.category && !CATEGORIES.includes(data.category)) {
    fail(name, `category "${data.category}" is not an English category key`);
  }
  if (data.pubDate && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:45$/.test(data.pubDate)) {
    warn(name, `pubDate "${data.pubDate}" is not a Nepal-time timestamp`);
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(post.slug)) {
    fail(name, "slug is not ASCII kebab-case");
  }
  if (data.cover && data.cover.startsWith("/")) {
    fail(name, "cover must be a path under src/, not a /public URL");
  }

  /* Length */
  const len = [...text].length;
  if (len < rules.min || len > rules.max) {
    warn(name, `body is ${len} chars, outside the ${rules.min} to ${rules.max} budget`);
  }

  /* Structure */
  if (/^# /m.test(text)) fail(name, "body has an H1; the layout renders the title");
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  if (headings.length !== 3) {
    fail(name, `${headings.length} "##" sections, expected exactly 3`);
  }
  if (headings.at(-1) !== rules.heading) {
    fail(name, `closing heading is "${headings.at(-1) ?? "(none)"}", expected "${rules.heading}"`);
  }
  const quotes = text.split(/\n\s*\n/).filter((b) => b.trimStart().startsWith(">"));
  if (quotes.length !== 1) {
    fail(name, `${quotes.length} blockquotes, expected exactly 1`);
  }
  if (/youtube\.com|youtu\.be|<iframe/i.test(text)) {
    fail(name, "body links or embeds the video; PostLayout already renders it");
  }

  /* Punctuation */
  const scan = `${data.title}\n${data.description}\n${text}`;
  if (rules.latinDash) {
    for (const hit of scan.matchAll(/[—–]|--/g)) {
      fail(name, `dash "${hit[0]}" at ${context(scan, hit.index)}`);
    }
  } else {
    for (const hit of scan.matchAll(/–|--/g)) {
      fail(name, `wrong dash "${hit[0]}" at ${context(scan, hit.index)}`);
    }
  }

  /* Duration */
  for (const pattern of rules.duration ?? []) {
    for (const hit of scan.matchAll(pattern)) {
      fail(name, `counted time "${hit[0].trim()}" at ${context(scan, hit.index)}`);
    }
  }

  /* Names */
  for (const pattern of rules.clipped) {
    for (const hit of scan.matchAll(pattern)) {
      fail(name, `clipped name "${hit[0]}" at ${context(scan, hit.index)}`);
    }
  }
  for (const pattern of rules.roles ?? []) {
    for (const hit of scan.matchAll(pattern)) {
      fail(name, `role word "${hit[0]}" standing in for a name at ${context(scan, hit.index)}`);
    }
  }
  const spouse = rules.spouse ? [...scan.matchAll(rules.spouse)] : [];
  if (spouse.length > 1) {
    warn(name, `"${spouse[0][0]}" used ${spouse.length} times; the spouse gets one `
      + `introduction, then pronouns, then the full name`);
  }

  return data;
}

const context = (text, index) =>
  `"...${text.slice(Math.max(0, index - 30), index + 30).replace(/\n/g, " ")}..."`;

/** Cross-locale checks for one translationKey group. */
function checkGroup(key, entries) {
  const english = entries.find((e) => e.post.locale === "en");
  const missing = Object.keys(LOCALES).filter(
    (l) => !entries.some((e) => e.post.locale === l),
  );
  if (!english) {
    fail(key, "no English original");
  } else {
    for (const { post, data } of entries) {
      if (post.locale === "en") continue;
      for (const field of SHARED) {
        const a = JSON.stringify(english.data[field] ?? null);
        const b = JSON.stringify(data[field] ?? null);
        if (a !== b) {
          fail(relative(ROOT, post.path), `${field} is ${b}, English has ${a}`);
        }
      }
      if (data.title === english.data.title) {
        warn(relative(ROOT, post.path), "title is still the English one");
      }
    }
  }
  if (missing.length) {
    warn(key, `no translation in: ${missing.join(", ")}`);
  }
}

/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const posts = allPosts();
let selected = posts;

if (args.length) {
  const paths = args.filter((a) => a.endsWith(".md"));
  const keys = args.filter((a) => !a.endsWith(".md"));
  const wanted = new Set();
  for (const p of paths) {
    const abs = resolve(p);
    if (!existsSync(abs)) { console.log(`ERROR  ${p}: no such file`); errors++; continue; }
    wanted.add(abs);
    const parsed = parse(abs);
    if (parsed?.data.translationKey) keys.push(parsed.data.translationKey);
  }
  selected = posts.filter((p) => {
    if (wanted.has(p.path)) return true;
    const parsed = parse(p.path);
    return parsed && keys.includes(parsed.data.translationKey);
  });
  if (!selected.length) {
    console.log(`Nothing matched: ${args.join(" ")}`);
    process.exit(1);
  }
}

const groups = new Map();
for (const post of selected) {
  const data = checkFile(post);
  if (!data?.translationKey) continue;
  const list = groups.get(data.translationKey) ?? [];
  list.push({ post, data });
  groups.set(data.translationKey, list);
}
for (const [key, entries] of groups) checkGroup(key, entries);

console.log(
  `\n${selected.length} file(s) in ${groups.size} story group(s): ` +
  `${errors} error(s), ${warnings} warning(s)`,
);
process.exit(errors ? 1 : 0);
