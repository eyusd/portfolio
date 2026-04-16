import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/locale';
import fs from 'fs';
import path from 'path';

const baseUrl = 'https://chardine.fr';
const defaultLocale = 'en';

// With localePrefix: 'as-needed', the default locale has no prefix
function localeUrl(locale: string, suffix = '') {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return `${baseUrl}${prefix}${suffix}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Homepage entries — English is at /, others at /fr, /zh, etc.
  const homepages = locales.map((locale) => ({
    url: localeUrl(locale),
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: locale === defaultLocale ? 1 : 0.9,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, localeUrl(l)])
      ),
    },
  }));

  // Lab page entries
  const labPages = locales.map((locale) => ({
    url: localeUrl(locale, '/lab'),
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, localeUrl(l, '/lab')])
      ),
    },
  }));

  // Dynamically get all articles from the articles directory
  const articlesDir = path.join(process.cwd(), 'src/app/[locale]/lab/articles');
  let articles: string[] = [];

  if (fs.existsSync(articlesDir)) {
    const files = fs.readdirSync(articlesDir);
    articles = files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''));
  }

  // Article entries per locale
  const articlePages = articles.flatMap((slug) =>
    locales.map((locale) => ({
      url: localeUrl(locale, `/lab/${slug}`),
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, localeUrl(l, `/lab/${slug}`)])
        ),
      },
    }))
  );

  return [...homepages, ...labPages, ...articlePages];
}
