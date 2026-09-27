# chardine.fr

Personal site of Clément Chardine: portfolio and Lab, in six languages (en, fr, de, es, zh, ko).

Built with [Astro](https://astro.build), fully static, deployed on Netlify. Everything is set in Geist Mono;
the effects (the particle name, the logo window, the text dino) are progressive enhancement, loaded when the
page is idle and skipped or frozen under `prefers-reduced-motion`.

## Commands

| | |
|---|---|
| `pnpm dev` | local dev server |
| `pnpm build` | type-check, then build to `dist/` |
| `pnpm preview` | serve `dist/` |
| `pnpm assets` | rebuild logos, portrait, pixel emojis and icons from `assets-src/` |
| `python3 scripts/build-fonts.py` | re-subset Geist Mono (needs `fonttools` and `brotli`) |

## Where things live

- `src/i18n/messages/*.json`: the CV, per language. `src/i18n/index.ts`: interface strings.
- `src/content/lab/<locale>/<slug>.mdx`: Lab articles. A missing translation falls back to English, with a canonical to the original.
- `src/data/profile.ts`: links, stacks, logos. `src/data/schema.ts`: structured data.
- `src/scripts/fx.ts`: the particle name and the logo window. `src/scripts/dino.ts`: the easter egg.
- Machine-readable: `/sitemap-index.xml`, `/rss.xml` (per locale), `/llms.txt`, `/llms-full.txt`, `/lab/<slug>.md`.
