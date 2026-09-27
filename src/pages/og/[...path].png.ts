import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { locales, localePath, messages, t, type Locale } from '../../i18n';
import { PERSON, profile } from '../../data/profile';
import { article, slugs, translationsOf } from '../../data/lab';
import emoji from '../../data/pixel-emoji.json';

type Card = { locale: Locale; kicker: string; title: string; text: string; url: string; emoji?: string; big?: boolean; fallback?: Card };

export function getStaticPaths() {
  return locales.flatMap((locale) => {
    const p = profile(locale), lab = messages[locale].Lab;
    const cards: { params: { path: string }; props: Card }[] = [
      { params: { path: `${locale}/index` }, props: { locale, kicker: `${p.title} · ${p.location}`, title: PERSON.name, text: p.subtitle, url: 'chardine.fr' + (locale === 'en' ? '' : `/${locale}`), big: true } },
      { params: { path: `${locale}/lab` }, props: { locale, kicker: PERSON.name, title: lab.title, text: lab.description, url: 'chardine.fr' + localePath(locale, '/lab'), big: true } },
    ];
    for (const slug of slugs.filter((s) => translationsOf(s).includes(locale))) {
      const a = article(locale, slug)!;
      cards.push({ params: { path: `${locale}/lab/${slug}` }, props: { locale, kicker: `${t(locale, 'lab')} · ${a.entry.data.date.toISOString().slice(0, 10)}`, title: a.entry.data.title, text: a.entry.data.description, url: 'chardine.fr' + localePath(locale, `/lab/${slug}`), emoji: a.entry.data.emoji } });
    }
    return cards;
  }).map((c, _i, all) => {
    // Chinese and Korean cards need a web font fetched at build time; if that ever fails, fall back to English
    if (c.props.locale !== 'zh' && c.props.locale !== 'ko') return c;
    const en = all.find((x) => x.params.path === c.params.path.replace(/^\w+/, 'en'));
    return { ...c, props: { ...c.props, fallback: en?.props } };
  });
}

const root = process.cwd();
const geist = Promise.all([400, 700].map((w) => fs.readFile(path.join(root, 'assets-src/fonts', `GeistMono-${w}.ttf`))));

/** A subset of Noto Sans with just the characters a card needs, cached between builds. */
async function cjkFont(family: string, text: string, weight: 400 | 700) {
  const chars = [...new Set(text)].filter((c) => c.charCodeAt(0) > 0x2e80).join('');
  if (!chars) return null;
  const dir = path.join(root, 'node_modules/.cache/og-fonts');
  const file = path.join(dir, `${family.replace(/\W/g, '')}-${weight}-${Buffer.from(chars).toString('base64url').slice(0, 40)}-${chars.length}.ttf`);
  try { return await fs.readFile(file); } catch {}
  try {
    const cssText = await (await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(chars)}`)).text();
    const url = /src: url\((.+?)\)/.exec(cssText)?.[1];
    if (!url) return null;
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    await fs.mkdir(dir, { recursive: true }); await fs.writeFile(file, buf);
    return buf;
  } catch { return null; }
}

const C = { bg: '#040f11', card: '#071618', fg: '#f7f8f8', muted: '#8a9da1', border: '#14353b', primary: '#0cb9e8' };
const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  let c = props as Card;
  const [g400, g700] = await geist;
  const fonts: { name: string; data: Buffer; weight: 400 | 700 }[] = [{ name: 'Geist Mono', data: g400!, weight: 400 }, { name: 'Geist Mono', data: g700!, weight: 700 }];
  const all = c.kicker + c.title + c.text + c.url;
  const fam = c.locale === 'ko' ? 'Noto Sans KR' : c.locale === 'zh' ? 'Noto Sans SC' : null;
  if (fam) {
    const [bold, regular] = await Promise.all([cjkFont(fam, all, 700), cjkFont(fam, all, 400)]);
    if (bold && regular) fonts.push({ name: fam, data: bold, weight: 700 }, { name: fam, data: regular, weight: 400 });
    else if (c.fallback) c = c.fallback;
  }
  const family = `Geist Mono, ${fonts.filter((f) => f.name !== 'Geist Mono').map((f) => f.name).join(', ')}`;
  const titleSize = c.big ? 92 : c.title.length > 48 ? 50 : 60;
  const px = c.emoji ? (emoji as Record<string, string>)[c.emoji.replace(/️/g, '')] : undefined;

  const node = h('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: C.bg, fontFamily: family, color: C.fg, padding: 44 }, [
    h('div', { display: 'flex', flex: 1, flexDirection: 'column', border: `2px solid ${C.border}`, borderRadius: 20, background: C.card, overflow: 'hidden' }, [
      h('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 30px', borderBottom: `2px solid ${C.border}`, fontSize: 22, color: C.muted }, [
        h('div', { display: 'flex', fontWeight: 700, color: C.fg }, [h('span', {}, 'C'), h('span', { color: C.primary }, 'C')]),
        h('div', { display: 'flex' }, c.url),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', padding: '0 60px' }, [
        h('div', { display: 'flex', alignItems: 'center', gap: 16, fontSize: 24, color: C.primary, marginBottom: 22 }, [
          ...(px ? [{ type: 'img', props: { src: px, width: 40, height: 40, style: { imageRendering: 'pixelated' } } }] : []),
          h('span', {}, c.kicker),
        ]),
        h('div', { display: 'flex', fontSize: titleSize, fontWeight: 700, lineHeight: 1.12, letterSpacing: c.big ? 3 : -1 }, c.title),
        h('div', { display: 'flex', fontSize: 26, color: C.muted, marginTop: 26, lineHeight: 1.45, maxWidth: 1000 }, c.text.length > 150 ? c.text.slice(0, 147) + '…' : c.text),
      ]),
      h('div', { display: 'flex', height: 8, background: `linear-gradient(90deg, ${C.primary}, #0cebeb 60%, transparent)` }),
    ]),
  ]);
  const svg = await satori(node as never, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
