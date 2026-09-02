// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://theyetiways.com',
  integrations: [
    sitemap({
      /*
       * /404 is an error page and /search has no crawlable results, in every
       * locale. The regexes match both the bare English path and its prefixed
       * translations (/es/search, /ja/404, ...).
       *
       * The integration's own `i18n` option is deliberately not used: it pairs
       * URLs that are identical apart from the locale prefix, and our story and
       * category slugs are translated, so it would emit wrong pairs. The
       * `hreflang` links in every page's <head> are authoritative instead, and
       * Google treats those as equivalent to the sitemap form.
       */
      filter: (page) => !/\/(404|search)\/?$/.test(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
