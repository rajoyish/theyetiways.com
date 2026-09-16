# The thirteen locales

Everything that changes between the thirteen versions of one story. Read it before
writing a translation. `check-story.mjs` enforces most of it.

The locale registry lives in `src/lib/i18n.ts` and the reader-facing interface
strings in `src/lib/ui/<locale>.ts`. Adding a story touches neither.

## At a glance

| Locale | Folder | Papa | Mama | Babu | Closing heading | Body chars |
|---|---|---|---|---|---|---|
| en | `posts/en/` | Papa Yeti | Mama Yeti | Babu Yeti | `## The Yeti Way` | 2400 to 3100 |
| es | `posts/es/` | Papá Yeti | Mamá Yeti | Babu Yeti | `## La manera Yeti` | 2500 to 3200 |
| fr | `posts/fr/` | Papa Yeti | Maman Yeti | Babu Yeti | `## La manière Yeti` | 2700 to 3500 |
| de | `posts/de/` | Papa Yeti | Mama Yeti | Babu Yeti | `## Der Yeti-Weg` | 2600 to 3350 |
| pt | `posts/pt/` | Papai Yeti | Mamãe Yeti | Babu Yeti | `## O jeito Yeti` | 2450 to 3200 |
| it | `posts/it/` | Papà Yeti | Mamma Yeti | Babu Yeti | `## Il modo Yeti` | 2550 to 3300 |
| ru | `posts/ru/` | Папа Йети | Мама Йети | Бабу Йети | `## Путь йети` | 2300 to 3000 |
| ja | `posts/ja/` | パパイエティ | ママイエティ | ババイエティ | `## イエティのやり方` | 1100 to 1450 |
| ko | `posts/ko/` | 아빠 예티 | 엄마 예티 | 바부 예티 | `## 예티의 방식` | 1250 to 1650 |
| zh | `posts/zh/` | 雪人爸爸 | 雪人妈妈 | 小巴布 | `## 雪人的走法` | 800 to 1120 |
| hi | `posts/hi/` | पापा येती | ममा येती | बाबू येती | `## येती का तरीका` | 2300 to 3300 |
| ar | `posts/ar/` | بابا يتي | ماما يتي | بابو يتي | `## طريقة اليتي` | 1800 to 2750 |
| bn | `posts/bn/` | পাপা ইয়েতি | মামা ইয়েতি | বাবু ইয়েতি | `## ইয়েতির পথ` | 2300 to 3650 |

Body chars counts the markdown after the frontmatter. Each band comes from the
eighty published stories, so a file outside its band is padded or thin.

Portuguese is Brazilian (`pt-BR`), Chinese is Simplified (`zh-Hans`, served at
the bare `/zh/` prefix). Arabic is the one right-to-left locale: `<html dir>`
flips from `LOCALES.ar.dir`, and the layout uses logical CSS properties so
nothing else has to know.

## Slugs

The filename is the translated title, romanised to ASCII kebab-case. It becomes
the URL, so it is written once and never changed.

| Locale | Rule | Example |
|---|---|---|
| es, pt, it | Strip accents | `Se durmió...` → `se-durmio-antes-de-que-empezara-la-pelicula` |
| fr | Strip accents, keep elisions as separate words | `Il s'est endormi...` → `il-s-est-endormi-avant-le-debut-du-film` |
| de | Write umlauts out, `ß` → `ss` | `süßeste` → `suesseste`, `wütend` → `wuetend` |
| ru | Plain transliteration, no diacritics | `Он уснул до начала фильма` → `on-usnul-do-nachala-filma` |
| ja | Hepburn romaji | `映画が始まる前に寝てしまった` → `eiga-ga-hajimaru-mae-ni-nemutta` |
| ko | Revised Romanisation | `영화 전에 잠든 남편` → `yeonghwa-jeon-e-jamdeun-nampyeon` |
| zh | Pinyin, no tone marks, syllables joined per word | `他在电影开场前就睡着了` → `ta-zai-dianying-kaichang-qian-jiu-shuizhaole` |
| hi | Plain Hunterian transliteration, no diacritics | `मेरी सबसे छोटी माफ़ी` → `meri-sabse-chhoti-maafi` |
| ar | Plain transliteration, `al-` kept as its own word | `الكاميرا تأكل أولاً` → `al-kamera-takul-awwalan` |
| bn | Plain transliteration as spoken, no diacritics | `ক্যামেরা আগে খায়` → `camera-age-khai` |

A romanised slug may shorten a long title as long as it still reads as that
story. The `translationKey` links the files, so the slug only has to be stable
and readable.

## Titles and descriptions

English is the only locale that uses Title Case. Everything else uses its own
normal convention:

- es, fr, pt, it, ru: sentence case. `Se durmió antes de que empezara la película`
- de: sentence case with nouns capitalised. `Die kleinste Entschuldigung meines Lebens`
- ja, ko, zh, hi, ar, bn: no casing to apply. Keep the title short, and prefer
  the natural phrasing over a word-for-word rendering of the English.

Descriptions stay a hook, not a summary. Latin-script locales land around 130 to
180 characters, like the English, and so do Hindi, Arabic, and Bengali. Japanese
and Chinese say the same thing in roughly half that, so aim for 50 to 90
characters there rather than padding to hit an English length.

## Names

The three names are the same rule everywhere: **the full name or a pronoun,
never the bare role word**. `아빠` alone, `パパ` alone, or `爸爸` alone is the
same mistake as writing `Papa` in English.

Two locale-specific notes:

- **Russian** declines the names. `Папа Йети` becomes `Папы Йети`, `Папе Йети`,
  `Папу Йети` as the case requires. That is correct and expected. Dropping
  `Йети` is not.
- **Chinese** builds the names differently. Papa and Mama are `雪人爸爸` and
  `雪人妈妈`, with `雪人` carrying the "Yeti" part, and the child is `小巴布`.
  A bare `爸爸`, `妈妈`, or `巴布` is the clipped form.
- **Hindi** spells the family name `येती`, never `यति`, and Mama Yeti is
  `ममा येती` (the way the author bio has it), because `मामा` on its own is the
  maternal uncle. Bengali keeps `মামা ইয়েতি`, since that is how the author bio
  and every published story already spell her.
- **Arabic** attaches conjunctions and prepositions to the name (`وبابا يتي`,
  `لماما يتي`). That is still the full name; the checker allows the clitic.

Never translate the author ids in frontmatter (`papa-yeti`, `mama-yeti`,
`babu-yeti`). `src/content/authors/*.json` holds the translated bios under
`i18n`, and the byline prints the names in Latin script in every locale.

## No stopwatch time

The ban on measured durations holds in all thirteen locales, and the checker
looks for each one's unit words:

| Locale | Words it flags after a number |
|---|---|
| en | second, seconds, minute, minutes |
| es | segundo(s), minuto(s) |
| fr | seconde(s), minute(s) |
| de | Sekunde(n), Minute(n) |
| pt | segundo(s), minuto(s) |
| it | secondo/secondi, minuto/minuti |
| ru | секунда, минута and their declensions |
| ja | 秒, 分間 |
| ko | 초, 분 |
| zh | 秒, 分钟 |
| hi | सेकंड, मिनट |
| ar | ثانية, ثوان, دقيقة, دقائق and their duals |
| bn | সেকেন্ড, মিনিট and their case endings |

Clock time is fine everywhere. `a las dos de la madrugada` sets a scene; `cuatro
segundos` counts one.

## Voice per locale

The family is the same family in every language. Warm, funny first, wise last,
and never formal.

- **es**: `tú`, never `usted`. Peninsular register is what the existing stories
  use (`el móvil`, `las palomitas`).
- **fr**: `tu`. Keep the contractions and the spoken rhythm; a story that reads
  like written French reads like a different family.
- **de**: `du`. Resist the long compound sentence. The short-paragraph rule
  matters more in German than anywhere else.
- **pt**: `você`, Brazilian vocabulary (`celular`, `pipoca`).
- **it**: `tu`, colloquial.
- **ru**: `ты`. The dash (`—`) is ordinary Russian grammar and is expected where
  a copula is dropped. The em-dash ban does not apply here.
- **ja**: plain form (だ/である endings), not polite `です・ます`. First person by
  narrator: Mama Yeti `わたし`, Papa Yeti `ぼく`, Babu Yeti `ぼく`. Dialogue, when
  there is any, takes `「」`.
- **ko**: plain narrative endings (`했다`, `이다`), first person `나`/`내`.
- **zh**: Simplified. First person `我`. The dash (`——`) and `「」` for dialogue
  are normal typography here, so the em-dash ban does not apply.
- **hi**: `तुम`/`आप` as the family would say it, never bookish Sanskritised
  vocabulary where an everyday Hindustani word exists (`कंबल`, `गुफा`, `फर`).
  The danda `।` ends sentences. First person by narrator gender: Mama Yeti
  writes `मैं ... करती हूँ`, Papa Yeti and Babu Yeti `करता हूँ`.
- **ar**: Modern Standard Arabic with a light, spoken rhythm, not newspaper
  register. Verb agreement follows the narrator. Short sentences; the comma
  and the full stop carry the rhythm, never the em dash.
- **bn**: Standard colloquial Bengali (চলিত), first person `আমি`. The reader is
  addressed as `আপনি` in the lesson section, the way the published stories do.

Leave the Nepali touches (dal, momo, *namaste*) untranslated and unglossed. No
footnote, no parenthetical.

## What never changes

`translationKey`, `youtube`, `pubDate`, `authors`, `category`, `featured`, and
`draft` are byte-identical across the thirteen files. `category` in particular is the
English key even in Japanese, because `src/lib/i18n.ts` looks the reader-facing
label up from it.

`tags` do get translated, lowercase, in the locale's own language. They are
free-form, and the search index matches them inside one locale only, so they
never have to line up across locales.
