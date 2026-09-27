import type { APIRoute } from 'astro';
import { langParams, localeMeta, localePath, messages, type Locale } from '../../i18n';
import { PERSON, SITE } from '../../data/profile';
import { articles } from '../../data/lab';

export const getStaticPaths = langParams;
const x = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

export const GET: APIRoute = ({ props }) => {
  const locale = (props as { locale: Locale }).locale, lab = messages[locale].Lab;
  const home = new URL(localePath(locale, '/lab'), SITE).href, self = new URL(localePath(locale, '/rss.xml'), SITE).href;
  const items = articles(locale).map((a) => {
    const link = new URL(localePath(locale, `/lab/${a.slug}`), SITE).href;
    return `<item><title>${x(a.entry.data.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid>` +
      `<pubDate>${a.entry.data.date.toUTCString()}</pubDate><description>${x(a.entry.data.description)}</description>` +
      a.entry.data.tags.map((t) => `<category>${x(t)}</category>`).join('') + `<dc:creator>${x(PERSON.name)}</dc:creator></item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel>` +
    `<title>${x(`${lab.title} — ${PERSON.name}`)}</title><link>${home}</link><description>${x(lab.description)}</description>` +
    `<language>${localeMeta[locale].tag}</language><atom:link href="${self}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
