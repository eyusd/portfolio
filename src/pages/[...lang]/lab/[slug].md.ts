import type { APIRoute } from 'astro';
import { defaultLocale, formatDate, localePath, locales } from '../../../i18n';
import { SITE, PERSON } from '../../../data/profile';
import { article, slugs, translationsOf } from '../../../data/lab';
import { toMarkdown } from '../../../data/markdown';

/** Every article as plain Markdown, for readers and language models that prefer it. */
export function getStaticPaths() {
  return locales.flatMap((l) => slugs.filter((s) => translationsOf(s).includes(l))
    .map((slug) => ({ params: { lang: l === defaultLocale ? undefined : l, slug }, props: { locale: l, slug } })));
}

export const GET: APIRoute = ({ props }) => {
  const { locale, slug } = props as { locale: (typeof locales)[number]; slug: string };
  const a = article(locale, slug)!;
  const d = a.entry.data;
  const md = `# ${d.title}\n\n> ${d.description}\n\n` +
    `By [${PERSON.name}](${SITE}) · ${formatDate(locale, d.date)} · ${new URL(localePath(locale, `/lab/${slug}`), SITE).href}\n\n` +
    toMarkdown(a.entry.body ?? '') + '\n';
  return new Response(md, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
