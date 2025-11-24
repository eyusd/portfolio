import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/locale';
import fs from 'fs';
import path from 'path';

const baseUrl = 'https://chardine.fr';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Generate locale-specific homepage entries
  const homepages = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${baseUrl}/${l}`])
      ),
    },
  }));

  // Generate locale-specific lab page entries
  const labPages = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/lab`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${baseUrl}/${l}/lab`])
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

  // Generate article entries with all locales
  const articlePages = articles.flatMap((slug) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/lab/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}/lab/${slug}`])
        ),
      },
    }))
  );

  return [...homepages, ...labPages, ...articlePages];
}
