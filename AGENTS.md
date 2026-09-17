## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Story images

`scripts/thumbs.mjs` builds one 1200x630 (1.91:1) picture per video into `src/assets/thumbs/`
(gitignored) from the YouTube Shorts thumbnail. It runs before `pnpm dev` and
`pnpm build` and skips ids that already have a file. Run `pnpm thumbs` after
adding a post if the dev server was started with `astro dev` directly. The
post hero, story cards, home hero and OG cards all read from that folder via
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
