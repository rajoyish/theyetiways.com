---
name: yeti-story
description: Write a new The Yeti Ways blog story from a YouTube Shorts link plus a storyboard table, then publish it in all ten locales the site serves. Trigger when the user provides a YouTube video/short URL and a storyboard (shot list) and asks for a story, post, or blog entry, when the user asks to translate an existing story, or runs /yeti-story.
---

# Yeti Story Writer

Turns a YouTube Short and its storyboard into a publishable post. The video is
the source of truth for *what happened*; the story is the Yeti family telling you
what it *meant*.

The job has two phases and is not done after the first one.

1. **Write the English story** in `src/content/posts/en/`.
2. **Ship the nine translations** in the other locale folders, so the story
   exists in every language the site serves.

Every story in `src/content/posts/` exists in all ten locales. A story published
in English alone leaves nine locales with a language picker that drops the reader
onto a different page. Do phase 2 unless the user says English only.

## Inputs

1. **A YouTube URL** in watch, `youtu.be`, or `/shorts/` form. Any of these is
   accepted verbatim in frontmatter; `extractYouTubeId` (`src/lib/youtube.ts`)
   normalises it at load time.
2. **A storyboard**, usually a markdown table of `Timestamp | Shot Type |
   Visual Description | Audio / Sound FX`. Treat each row as one beat.

If the user gives only one of the two, ask for the other before writing.

# Phase 1: the English story

1. **Fetch the video title.** `WebFetch` the URL and ask for the title. Use it as
   the post title when it reads like a headline (drop `#shorts`, emoji, and
   channel boilerplate). Otherwise write a title in the same voice and keep the
   video's phrasing in the description. Never invent facts the video and
   storyboard don't contain.
2. **Extract the beats.** Reduce the storyboard to 3 to 6 plot beats. The visual
   columns repeat the same character description in every row. That is model
   prompt text, not story material. Ignore the repeated boilerplate (fur texture,
   "3D CGI rendering", "cinematic lighting") and keep only what *changes* between
   rows: actions, expressions, sounds, and the setting.
3. **Pick the author** from who the story belongs to:
   - **pink She-Yeti** central → `mama-yeti` (relationships, warmth, the emotional read on a moment)
   - **blue male Yeti** central → `papa-yeti` (slow lessons, patience, admitting he got it wrong)
   - **kid Yeti** central → `babu-yeti` (first times, friendship, growing up)
   - Both grown-ups equally central and the beat is *about* the couple → still pick
     the one whose point of view makes the joke land, and mention the other. Use
     two authors only when the story genuinely alternates perspectives.
4. **Pick the category**. Exactly one of `CATEGORIES` in `src/lib/site.ts`:
   Family, Relationships, Parenting, Growing Up, Life Lessons.
5. **Write the file** at `src/content/posts/en/<kebab-slug-of-title>.md`. The
   `en/` directory is not optional. `postLocale` in `src/lib/posts.ts` reads the
   locale out of the entry id, so a file sitting at the root of `posts/` is a
   story with a broken locale.
6. **Check it**: `node .claude/skills/yeti-story/scripts/check-story.mjs <path>`.
   It enforces the length budget, the structure, the punctuation rule, and the
   name rule described below, so run it before you show the story to anyone.

The Open Graph image needs no step of its own. `src/pages/og/[...slug].png.ts`
renders one card per post during `astro build`, reading the title, description,
category, and author straight from the frontmatter you just wrote. Adding the
post is all it takes; the card lands at `/og/en/<slug>.png` and `PostLayout.astro`
points `og:image` at it. Retitle the story later and the card follows.

## Frontmatter

Must satisfy the `posts` schema in `src/content.config.ts`. Example:

```yaml
---
translationKey: "the-sweetest-way-to-stop-snoring"
youtube: "https://youtube.com/shorts/VIDEOID"
title: "The Sweetest Way to Stop Snoring"
description: "One sentence with a hook and a hint of the lesson. 120 to 180 chars."
pubDate: "2026-08-30T19:15:00+05:45"
authors:
  - mama-yeti
category: "Relationships"
tags:
  - marriage
  - laughter
featured: false
---
```

- `translationKey`: **the English slug, always**, and identical in all ten files.
  This is the only thing that links the ten versions of a story together.
  `getTranslations` groups by it for `hreflang` and the language picker, and it
  never changes once published, even if the English slug is renamed later.
- `pubDate`: a quoted timestamp, **not** a bare date. Now, in Nepal time
  (`+05:45`), unless the user says otherwise. The time is what makes the ordering
  deterministic: `getPublishedPosts` sorts newest first, and two posts sharing a
  bare date sort by whatever order the glob loader happened to return. Every
  translation copies this timestamp character for character, so the ten locales
  order their front pages the same way.
- `featured`: leave it `false`. The homepage hero is automatic. `getFeaturedPost`
  returns the newest post when nothing is flagged, so a new story takes the hero
  on its timestamp alone. Set `featured: true` only when the user asks to pin an
  *older* story to the hero, clear it from the previous one when you do, and make
  the change in all ten locales at once.
- `draft: true`: when the user wants it staged but not live.
- `cover:` is the story's **card art** on the homepage and in grids, not the
  social image. It goes through Astro's `image()` helper, so it has to be a real
  file under `src/` referenced relative to the post (`../../../assets/foo.jpg`
  from inside a locale folder). A `/public` path like `/og/slug.png` fails the
  build with `[ImageNotFound]`. Leave it out unless such a file exists; the cards
  then fall back to the YouTube thumbnail, and the social image is generated
  either way.
- The video embed is rendered by `PostLayout.astro` from the `youtube` field.
  **Do not** put an embed, iframe, link, or thumbnail in the body. It would
  double up.

## Length: short, like the video

**Hard budget for English: 2,400 to 3,100 characters of markdown body, 450 to
600 words.** Aim for 2,700. Frontmatter does not count. These stories sit under a
15-second Short. A reader who just watched a 15-second joke will not read a
900-word essay, and a long post reads as padding no matter how good the sentences
are. If you're over, cut; don't shrink the font of the idea.

Every locale has its own budget, because the same story is a different number of
characters in Japanese than in German. `check-story.mjs` knows all ten and
`references/locales.md` lists them.

What to cut first, in order:

1. Any section that restates a point already made. Three sections is plenty:
   scene, turn, lesson.
2. Wind-up before the cold open. Start inside the moment.
3. Repeated framing of the lesson. Say it once, at the end.
4. Adjective pairs and hedges. One good image beats two decent ones.

## Body structure

Markdown only, no H1 (the layout renders the title). **Exactly three `##`
sections**, and every published story on the site has exactly three.

1. **Cold open** (no heading). Drop straight into the scene from beat one.
   Setting, sound, temperature. Two short paragraphs.
2. **The turn** (`##`). The thing that happens. Let the sound effects from the
   storyboard's audio column do the comedy; they're half the joke.
3. **The middle** (`##`). What the moment revealed, plus the resolution beat from
   the last storyboard row. Include **exactly one** `>` blockquote, carrying the
   sharpest line in the piece.
4. **`## The Yeti Way`** is the required closing section, always this heading and
   always the third one. Open with the lesson in a single **bold** sentence, then
   two or three short paragraphs unpacking it. Close with a one-line sign-off
   that fits the family's motto (`❄️❤️` is fair game, sparingly).

There is no separate "landing" section. The lesson section *is* the landing.

Wrap body lines at about 80 columns, the way the existing posts do.

## Punctuation: no em dashes

**Never use an em dash (`—`) or an en dash (`–`) in an English story.** Not in
the body, not in the title, not in the `description` frontmatter. This is a hard
rule, and it is the easiest thing to get wrong, because the em dash is the
natural reach for exactly the asides this voice likes.

Rewrite instead of substituting. An em dash is almost always one of four things,
and each has a better fix:

| Don't write this | Write this |
|---|---|
| `The snoring — I want this recorded — stopped.` | `The snoring, and I want this recorded, stopped.` |
| `Four seconds — maybe five.` | `Four seconds. Maybe five.` |
| `He smiled back — no shame in it.` | `He smiled back. No shame in it.` |
| `Not a low standard — it's the highest.` | `That is not a low standard. It is the highest one there is.` |

The period is the workhorse. Short declarative sentences suit the family voice
better than a dash anyway, so this rule usually improves the paragraph.

Also avoid: hyphens standing in for dashes (`--`, ` - `), and the semicolon,
which reads too formal for these stories. Commas, periods, and the occasional
colon carry everything.

The rule is about English typography, not about the shape of the character.
Russian and Chinese use their own dash as ordinary grammar, so the ban lifts for
those two locales only. `references/locales.md` says which, and the checker
applies it per locale.

## Character names

**Always write the full name: Papa Yeti, Mama Yeti, Babu Yeti.** Every mention,
every time, in the body, the title, the description, and the `coverAlt`. Never
the bare first word (`Papa`, `Mama`, `Babu`), and never a third-person
relationship word standing in for a name (`his father`, `her mother`,
`the little one`).

These are names, not roles. `src/content/authors/*.json` stores them as
`Papa Yeti`, `Mama Yeti`, and `Babu Yeti`, and the author card under every post
prints them that way. A story that shortens them reads like a different family
than the one in the byline.

| Don't write this | Write this |
|---|---|
| `Mama asleep on the pink side.` | `Mama Yeti asleep on the pink side.` |
| `Then his father hugged me.` | `Then Papa Yeti hugged me.` |
| `The kid giggled into my fur.` | `Babu Yeti giggled into my fur.` |
| `Her mother wiped the yolk off.` | `Mama Yeti wiped the yolk off.` |

The repetition is handled by pronouns, not by clipping the name. Once
`Papa Yeti walked in`, the next three sentences can say *he* freely. When a
sentence needs the name again, it gets the whole name.

The narrator is exempt only where a first-person pronoun already does the job.
Mama Yeti writes *I*, not *Mama Yeti*, about herself. She writes
`Papa Yeti` and `Babu Yeti` in full about the other two.

**One exception: the spouse, once.** A narrator may introduce the one they are
married to as `my wife` or `my husband`, and then let pronouns carry the rest of
the story. Naming your own spouse in your own head reads stiff, and the
possessive is often the point of the sentence: *"I had been dragging the warm off
my wife while thinking of myself as a Yeti who takes care of his family."* Use it
once per story at most, for the entrance, never for Babu Yeti, and never in a
scene where a third character makes *he* or *she* ambiguous. The moment a story
needs the word twice, it needed the name the first time.

A genuinely generic child is not a clipped name. `You can explain a habit to a
kid for a year` is about kids, not about Babu Yeti, and it stays.

Each locale has its own three names, and the rule is the same in all of them:
the full name or a pronoun, never the bare role word. The table is in
`references/locales.md`. The lowercase Nepali word *babu* is a different thing
and passes cleanly.

## Voice

- First person, the chosen author's voice. Papa Yeti worries and plans; Mama Yeti
  runs the warm and names the feeling; Babu Yeti is dry, observant, and slightly
  over it.
- Funny first, wise second. The lesson lands because the story was entertaining,
  not because it was solemn. Never moralize before the last section.
- Keep the Yeti furniture in the language: fur, blanket, cave, den, mountain,
  snow, monsoon rain, yak, the cold outside vs. the warm inside. Use it for
  texture. Don't let it become a costume the story trips over.
- Short paragraphs of three or four lines, never more. Vary sentence length hard.
  Let a one-line paragraph carry a beat on its own.
- Nepali touches (dal, momo, a *namaste* at the cave mouth) are welcome when they
  fit; the family is Nepali-Yeti and the site says so.
- Family-safe throughout. Bathroom humor is fine when the video is about it.
  Handle it the way a fond grown-up would, with a wink and no crudeness.

## Anti-patterns

- **Stopping after English.** The story is half published. See phase 2.
- **Em dashes.** See the punctuation rule above.
- **Clipped names.** `Papa`, `Mama`, `Babu`, `his father`, `her mother`.
- **Going long.** The most common writing failure. A story over its budget is
  wrong even when every paragraph is good.
- Re-describing the video shot by shot. The reader just watched it. Write around
  it, not over it.
- Copying storyboard prompt language ("ultra-realistic soft fur texture") into
  prose.
- Stating the lesson in the opening paragraph, then repeating it four times.
- A description field that's a summary instead of a hook.
- Generic advice that could have come from any blog. If the paragraph would
  survive with the Yetis deleted, rewrite it.

# Phase 2: the nine translations

Nine more files, one per locale: `es`, `fr`, `de`, `pt`, `it`, `ru`, `ja`, `ko`,
`zh`. **Read `references/locales.md` before writing any of them.** It carries the
per-locale name table, closing heading, slug rule, length budget, and voice
notes. Get one of those wrong and nothing fails loudly. It surfaces later as a
wrong URL or a language picker that lands on the wrong page.

## What carries across unchanged

`translationKey`, `youtube`, `pubDate`, `authors`, `category`, `featured`, and
`draft` are identical in all ten files. Frontmatter stores the category as the
English key in every locale, and `src/lib/i18n.ts` looks up the label the reader
sees. Never translate the value.

## What gets translated

- `title` and `description`, in the locale's own capitalisation convention.
  English is the only locale with Title Case.
- `tags`, into the locale's language, lowercase.
- The filename slug, which comes from the *translated* title and must still be
  ASCII kebab-case: strip accents (`durmió` → `durmio`), write German umlauts out
  (`süßeste` → `suesseste`), and romanise the non-Latin scripts the way the
  existing files do (Hepburn for Japanese, Revised Romanisation for Korean,
  pinyin without tones for Chinese, a plain transliteration for Russian).
- Every `##` heading, including the closing one, which has a fixed translation
  per locale. Never leave `## The Yeti Way` in a translated file.

## How to translate

Translate the story, don't transcode the sentences. These are jokes and beats.
A literal rendering that loses the timing is a worse translation than one that
moves a clause to keep the punchline last.

1. Read the finished English story once as a whole before starting.
2. Keep the structure exactly: cold open, three `##` sections, one blockquote in
   the third, bold lesson sentence opening the closing section, one-line sign-off
   with the same emoji.
3. Keep the Yeti furniture concrete. Cave, fur, blanket, lantern, snow, and the
   Nepali touches stay. They are the setting, not English idiom.
4. Replace idioms that don't travel with a local one of the same register. Aim
   at the same laugh, not the same words.
5. Land inside the locale's character budget. French runs about 350 characters
   longer than the English and Chinese about a third its length, so the budget
   is per locale rather than a translation of the English word count.
6. Keep the names in the locale's own forms, in full, every time.

## Verify

Run the checker on the whole story group, by translation key. It compares the
ten files against each other and against the rules:

```
node .claude/skills/yeti-story/scripts/check-story.mjs <translation-key>
```

Then build once at the end:

```
pnpm build
```

A schema mistake in frontmatter fails the build with the offending field named,
and the build is also what proves the ten OG cards and the `hreflang` pairs came
out right.
