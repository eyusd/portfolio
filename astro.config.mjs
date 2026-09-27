// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// last-modified dates for the sitemap: an article's own date, the build for everything else
const articleDates = Object.fromEntries(fs.readdirSync('./src/content/lab/en').map((f) => {
  const fm = fs.readFileSync(`./src/content/lab/en/${f}`, 'utf8');
  return [f.replace(/\.mdx$/, ''), (/^updated: (.+)$/m.exec(fm) ?? /^date: (.+)$/m.exec(fm))?.[1]];
}));
const built = new Date().toISOString();

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
      serialize(item) {
        const slug = /\/lab\/([^/]+)$/.exec(item.url)?.[1];
        item.lastmod = slug && articleDates[slug] ? new Date(articleDates[slug]).toISOString() : built;
        return item;
      },
    }),
  ],
  vite: { build: { assetsInlineLimit: 0 } },
});
