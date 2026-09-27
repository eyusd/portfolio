import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, isLocale, locales, type Locale } from '../i18n';

export type Article = {
  slug: string;
  /** The language this copy is written in (English when no translation exists). */
  lang: Locale;
  translated: boolean;
  entry: CollectionEntry<'lab'>;
  minutes: number;
};

const all = await getCollection('lab');
const split = (id: string) => { const [lang, ...rest] = id.split('/'); return { lang: lang as Locale, slug: rest.join('/') }; };
export const slugs = [...new Set(all.map((e) => split(e.id).slug))];

/** Words per minute, or characters per minute for scripts without spaces. */
function readingMinutes(body: string, lang: Locale) {
  const text = body.replace(/<[^>]+>|[#*_`>\[\]()!-]/g, ' ');
  const n = lang === 'zh' || lang === 'ko' ? text.replace(/\s/g, '').length / (lang === 'zh' ? 400 : 500) : text.split(/\s+/).filter(Boolean).length / 230;
  return Math.max(1, Math.round(n));
}

export function article(locale: Locale, slug: string): Article | undefined {
  const own = all.find((e) => e.id === `${locale}/${slug}`);
  const entry = own ?? all.find((e) => e.id === `${defaultLocale}/${slug}`);
  if (!entry) return undefined;
  const lang = split(entry.id).lang;
  return { slug, lang, translated: !!own, entry, minutes: readingMinutes(entry.body ?? '', lang) };
}

export const articles = (locale: Locale) =>
  slugs.map((s) => article(locale, s)!).filter(Boolean).sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf());

/** Locales in which an article exists in its own language (for hreflang). */
export const translationsOf = (slug: string) => locales.filter((l) => all.some((e) => e.id === `${l}/${slug}`));

export const localeFromPath = (path: string): Locale => { const seg = path.split('/')[1]; return isLocale(seg) ? seg : defaultLocale; };
