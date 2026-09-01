// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://theyetiways.com',
  integrations: [
    sitemap({
      // Both pages are noindex: /404 is an error, /search has no crawlable results.
      filter: (page) => !page.includes('/404') && !page.includes('/search'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
