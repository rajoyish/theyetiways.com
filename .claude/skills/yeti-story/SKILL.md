---
name: yeti-story
description: Write a new The Yeti Ways blog story from a YouTube Shorts link plus a storyboard table. Trigger when the user provides a YouTube video/short URL and a storyboard (shot list) and asks for a story, post, or blog entry, or runs /yeti-story.
---

# Yeti Story Writer

Turns a YouTube Short + its storyboard into a publishable post in
`src/content/posts/`. The video is the source of truth for *what happened*; the
story is the Yeti family telling you what it *meant*.

## Inputs

1. **A YouTube URL** in watch, `youtu.be`, or `/shorts/` form. Any of these is
   accepted verbatim in frontmatter; `extractYouTubeId` (`src/lib/youtube.ts`)
   normalises it at load time.
2. **A storyboard**, usually a markdown table of `Timestamp | Shot Type |
   Visual Description | Audio / Sound FX`. Treat each row as one beat.

If the user gives only one of the two, ask for the other before writing.

## Workflow

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
5. **Write the file** at `src/content/posts/<kebab-slug-of-title>.md`.
6. **Verify**: run `pnpm build` (or `pnpm astro check`). A schema mistake in
   frontmatter fails the build with the offending field named.

The Open Graph image needs no step of its own. `src/pages/og/[...slug].png.ts`
renders one card per post during `astro build`, reading the title, description,
category, and author straight from the frontmatter you just wrote. Adding the
post is all it takes; the card lands at `/og/<slug>.png` and `PostLayout.astro`
points `og:image` at it. Retitle the story later and the card follows.

## Frontmatter

Must satisfy the `posts` schema in `src/content.config.ts`. Example:

```yaml
---
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

- `pubDate`: a quoted timestamp, **not** a bare date. Now, in Nepal time
  (`+05:45`), unless the user says otherwise. The time is what makes the ordering
  deterministic: `getPublishedPosts` sorts newest first, and two posts sharing a
  bare date sort by whatever order the glob loader happened to return.
- `featured`: leave it `false`. The homepage hero is automatic. `getFeaturedPost`
  returns the newest post when nothing is flagged, so a new story takes the hero
  on its timestamp alone. Set `featured: true` only when the user asks to pin an
  *older* story to the hero, and clear it from the previous one when you do.
- `draft: true`: when the user wants it staged but not live.
- `cover:` is the story's **card art** on the homepage and in grids, not the
  social image. It goes through Astro's `image()` helper, so it has to be a real
  file under `src/` referenced relative to the post (`../../assets/foo.jpg`). A
  `/public` path like `/og/slug.png` fails the build with `[ImageNotFound]`.
  Leave it out unless such a file exists; the cards then fall back to the
  YouTube thumbnail, and the social image is generated either way.
- The video embed is rendered by `PostLayout.astro` from the `youtube` field.
  **Do not** put an embed, iframe, link, or thumbnail in the body. It would
  double up.

## Length: short, like the video

**Hard budget: 3,000 to 3,800 characters of markdown body, 450 to 600 words.**
`wc -c` the finished file (frontmatter included, ~600 chars of it) and land near
3,700. These stories sit under a 15-second Short. A reader who just watched a
15-second joke will not read a 900-word essay, and a long post reads as padding
no matter how good the sentences are. If you're over, cut; don't shrink the font
of the idea.

What to cut first, in order:

1. Any section that restates a point already made. Three sections is plenty:
   scene, turn, lesson.
2. Wind-up before the cold open. Start inside the moment.
3. Repeated framing of the lesson. Say it once, at the end.
4. Adjective pairs and hedges. One good image beats two decent ones.

## Body structure

Markdown only, no H1 (the layout renders the title). Three or four `##` sections
total, no more.

1. **Cold open** (no heading). Drop straight into the scene from beat one.
   Setting, sound, temperature. Two short paragraphs.
2. **The turn** (`##`). The thing that happens. Let the sound effects from the
   storyboard's audio column do the comedy; they're half the joke.
3. **The middle** (`##`, exactly one section). What the moment revealed, plus
   the resolution beat from the last storyboard row. Include exactly one `>`
   blockquote carrying the sharpest line in the piece.
4. **`## The Yeti Way`** is the required closing section, always this heading. Open
   with the lesson in a single **bold** sentence, then two or three short
   paragraphs unpacking it. Close with a one-line sign-off that fits the family's
   motto (`❄️❤️` is fair game, sparingly).

There is no separate "landing" section. The lesson section *is* the landing.

## Punctuation: no em dashes

**Never use an em dash (`—`) or an en dash (`–`) in a story.** Not in the body,
not in the title, not in the `description` frontmatter. This is a hard rule with
no exceptions, and it is the easiest thing to get wrong, because the em dash is
the natural reach for exactly the asides this voice likes.

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

Before finishing, grep the file and fix any hit:

```
grep -n '—\|–\|--' src/content/posts/<slug>.md
```

## Voice

- First person, the chosen author's voice. Papa worries and plans; Mama runs the
  warm and names the feeling; Babu is dry, observant, and slightly over it.
- Funny first, wise second. The lesson lands because the story was entertaining,
  not because it was solemn. Never moralize before the last section.
- Keep the Yeti furniture in the language: fur, blanket, cave, den, mountain,
  snow, monsoon rain, yak, the cold outside vs. the warm inside. Use it for
  texture. Don't let it become a costume the story trips over.
- Short paragraphs of three or four lines, never more. Vary sentence length hard.
  Let a one-line paragraph carry a beat on its own.
- Nepali touches (Babu, dal, momo) are welcome when they fit; the family is
  Nepali-Yeti and the site says so.
- Family-safe throughout. Bathroom humor is fine when the video is about it.
  Handle it the way a fond grown-up would, with a wink and no crudeness.

## Anti-patterns

- **Em dashes.** See the punctuation rule above. Grep before you finish.
- **Going long.** The most common failure. A story over 3,800 characters is
  wrong even when every paragraph is good. Check with `wc -c` before you call
  it done.
- Re-describing the video shot by shot. The reader just watched it. Write around
  it, not over it.
- Copying storyboard prompt language ("ultra-realistic soft fur texture") into
  prose.
- Stating the lesson in the opening paragraph, then repeating it four times.
- A description field that's a summary instead of a hook.
- Generic advice that could have come from any blog. If the paragraph would
  survive with the Yetis deleted, rewrite it.
