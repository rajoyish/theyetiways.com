## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Story images

`scripts/thumbs.mjs` cuts the 9:16 frame out of each video's YouTube Shorts
thumbnail and writes two pictures into `src/assets/thumbs/` (gitignored): a
1200x630 (1.91:1) crop at the top level for the post hero, story cards and
home hero, and the whole 540x960 frame under `portrait/` for the OG card. It
runs before `pnpm dev` and `pnpm build` and skips ids that already have both
files. Run `pnpm thumbs` after adding a post if the dev server was started
with `astro dev` directly. Everything reads from that folder via
`src/lib/thumbs.ts`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
