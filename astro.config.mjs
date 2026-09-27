// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const locales = { en: 'en', fr: 'fr', de: 'de', es: 'es', zh: 'zh-Hans', ko: 'ko' };

export default defineConfig({
  site: 'https://chardine.fr',
  // `/fr/lab`, never `/fr/lab/`: the URLs the site has always had
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  security: { csp: true },
  image: { responsiveStyles: false },
  markdown: {
    syntaxHighlight: 'prism',
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'en', locales },
      filter: (page) => !page.endsWith('/404') && !page.includes('/og/'),
    }),
  ],
  vite: { build: { assetsInlineLimit: 0 } },
});
