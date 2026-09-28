// Pre-computes every raster asset the site needs, so the browser only ever downloads
// tiny, final files. Run after changing a source in assets-src/: `pnpm assets`.
//
//   logos     → src/assets/logos.webp       one sprite of signed distance fields (R: raised mark, G: whole solid)
//   portrait  → src/assets/portrait.webp    greyscale + alpha, drawn onto the character grid
//   emojis    → src/data/pixel-emoji.json   10×10 pixel-art data URIs, from Noto Emoji (Apache-2.0)
//   icons     → public/favicon.svg, public/*.png, src/assets/lab/anchor-icon.png
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const root = path.resolve(import.meta.dirname, '..');
const src = (...p) => path.join(root, 'assets-src', ...p);
const out = (...p) => path.join(root, ...p);
const lum = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

// ─── logos ────────────────────────────────────────────────────────────────
export const LOGO_ORDER = ['eledone', 'sniive', 'cede', 'wandercraft', 'centralesupelec', 'kaist', 'sorbonne', 'prepa'];
const N = 96, S = 512, R = 0.2, M = S / 16; // N² distance samples per logo, measured on S² masks, ±R logo half-widths of range

/** Exact Euclidean distance transform (Felzenszwalb & Huttenlocher): distance from each pixel to the nearest set one. */
function edt(mask, n) {
  const INF = 1e12, f = new Float64Array(n * n), v = new Int32Array(n), z = new Float64Array(n + 1), tmp = new Float64Array(n);
  for (let i = 0; i < n * n; i++) f[i] = mask[i] ? 0 : INF;
  const pass = (get, set) => {
    for (let q = 0; q < n; q++) tmp[q] = get(q);
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s;
      while ((s = (tmp[q] + q * q - (tmp[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])) <= z[k]) k--;
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; set(q, (q - v[k]) ** 2 + tmp[v[k]]); }
  };
  for (let x = 0; x < n; x++) pass((q) => f[q * n + x], (q, val) => { f[q * n + x] = val; });
  for (let y = 0; y < n; y++) pass((q) => f[y * n + q], (q, val) => { f[y * n + q] = val; });
  return f.map(Math.sqrt);
}
/** Signed distance in pixels, positive outside. */
function sdf(mask, n) {
  const dOut = edt(mask, n), dIn = edt(mask.map((m) => 1 - m), n), out = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) out[i] = dOut[i] - dIn[i] + (mask[i] ? 0.5 : -0.5);
  return out;
}
/** Bilinear read, extended past the edges by the distance to them (always outside there). */
function bilinear(f, n, x, y) {
  const cx = Math.min(Math.max(x, 0), n - 1.001), cy = Math.min(Math.max(y, 0), n - 1.001), i = cx | 0, j = cy | 0, fx = cx - i, fy = cy - j;
  const top = f[j * n + i] * (1 - fx) + f[j * n + i + 1] * fx, bot = f[(j + 1) * n + i] * (1 - fx) + f[(j + 1) * n + i + 1] * fx;
  return top * (1 - fy) + bot * fy + Math.hypot(x - cx, y - cy);
}

// Per logo: which pixels are raised (a) and which form the base plate (b).
// `e` is true when the pixel sits between two plate pixels on its row, `u`/`v` are its position in the source, in [0, 1].
const LOGOS = {
  eledone: { a: (r, g, b, al) => al > 128 && lum(r, g, b) < 0.4, b: (r, g, b, al) => al > 128 },
  sniive: { a: (r, g, b, al, e) => e && (al < 128 || lum(r, g, b) > 0.85), b: (r, g, b, al) => al > 128 && b > r + 60 },
  // the panda and its frame, without the dark tile behind them
  cede: { a: (r, g, b, al, e) => al > 128 && lum(r, g, b) > 0.6 && e, enc: (r, g, b) => lum(r, g, b) < 0.3 },
  wandercraft: { a: (r, g, b, al) => al > 128 && lum(r, g, b) < 0.6 },
  // both halves of the "S": the mauve C and the crimson hook, not the wordmark
  centralesupelec: { svg: true, a: (r, g, b, al) => al > 128 && Math.max(r, g, b) - Math.min(r, g, b) > 22 && lum(r, g, b) < 0.9 },
  // just the wordmark, without the seal
  kaist: { a: (r, g, b, al, e, u, v) => al > 128 && b > r + 40 && lum(r, g, b) < 0.85 && u > 0.17 && u < 0.83 && v > 0.3 && v < 0.515, pad: 1.02 },
  sorbonne: { text: 'S', a: (r, g, b, al) => al > 128 },
  // the white chapel at the foot of the Lycée Corneille tablet
  prepa: { a: (r, g, b, al, e, u, v) => e && lum(r, g, b) > 0.55 && u > 0.25 && u < 0.75 && v > 0.56 && v < 0.925, enc: (r, g, b) => r > 120 && r > g + 40, pad: 1.05 },
};

async function logoPixels(key, spec) {
  let input;
  if (spec.text) {
    input = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="230" font-weight="700"
        font-family="Iowan Old Style, Palatino, Georgia, serif" fill="#fff">${spec.text}</text></svg>`);
  } else input = await fs.readFile(src('logos', `${key}.${spec.svg ? 'svg' : 'png'}`));
  // an empty margin of M all round: a logo that runs to the edge of its file must still end there, not beyond
  const clear = { r: 0, g: 0, b: 0, alpha: 0 };
  const { data } = await sharp(input, { density: 300 })
    .resize(S - 2 * M, S - 2 * M, { fit: 'contain', background: clear }).extend({ top: M, bottom: M, left: M, right: M, background: clear })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return data;
}

async function logoMask(key) {
  const spec = LOGOS[key], px = await logoPixels(key, spec);
  const A = new Uint8Array(S * S), B = new Uint8Array(S * S);
  const enc = spec.enc || spec.b, rowMin = new Int32Array(S).fill(S), rowMax = new Int32Array(S).fill(-1);
  if (enc) for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4;
    if (px[i + 3] > 128 && enc(px[i], px[i + 1], px[i + 2], px[i + 3], false)) { rowMin[y] = Math.min(rowMin[y], x); rowMax[y] = Math.max(rowMax[y], x); }
  }
  let x0 = S, y0 = S, x1 = 0, y1 = 0;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4, e = x > rowMin[y] && x < rowMax[y], args = [px[i], px[i + 1], px[i + 2], px[i + 3], e, (x - M) / (S - 2 * M), (y - M) / (S - 2 * M)];
    const a = !!spec.a(...args), b = spec.b ? !!spec.b(...args) : false;
    A[y * S + x] = a; B[y * S + x] = b || a;
    if (a || b) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  }
  // crop to the mark and square it up; distances are measured at full resolution, then sampled in logo units
  // (the square spans -1..1), so edges keep their sub-pixel position however small the stored field is
  const side = Math.max(x1 - x0, y1 - y0) * (spec.pad || 1.12), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let plate = false;
  for (let k = 0; k < S * S; k++) if (B[k] && !A[k]) { plate = true; break; }
  const dA = sdf(A, S), dB = plate ? sdf(B, S) : null, res = Buffer.alloc(N * N * 3);
  const byte = (d) => Math.round(Math.min(Math.max(0.5 + d / (side / 2) / (2 * R), 0), 1) * 255);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const sx = cx + (i / (N - 1) - 0.5) * side, sy = cy + (j / (N - 1) - 0.5) * side;
    res[(j * N + i) * 3] = byte(bilinear(dA, S, sx, sy));
    res[(j * N + i) * 3 + 1] = dB ? byte(bilinear(dB, S, sx, sy)) : 255; // no plate: G is outside everywhere
  }
  return res;
}

async function logos() {
  const sprite = Buffer.alloc(N * LOGO_ORDER.length * N * 3);
  for (const [k, key] of LOGO_ORDER.entries()) {
    const m = await logoMask(key);
    for (let y = 0; y < N; y++) m.copy(sprite, (y * N * LOGO_ORDER.length + k * N) * 3, y * N * 3, (y + 1) * N * 3);
  }
  await sharp(sprite, { raw: { width: N * LOGO_ORDER.length, height: N, channels: 3 } })
    .webp({ lossless: true, effort: 6 }).toFile(out('src/assets/logos.webp'));
}

async function portrait() {
  // the window samples it at about one pixel per screen pixel: 320 wide is plenty
  const W = 320, img = () => sharp(src('portrait.png')).resize(W);
  const { data: grey, info } = await img().greyscale().normalise().raw().toBuffer({ resolveWithObject: true }); // one channel: the alpha is dropped
  const { data: alpha } = await img().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
  const data = Buffer.alloc(W * info.height * 2);
  for (let k = 0; k < W * info.height; k++) { data[k * 2] = grey[k]; data[k * 2 + 1] = alpha[k]; }
  // the face alone gets its own tone curve: its skin is lit to near-white, which a grid of characters draws as one
  // flat block. Highlights come down and the midtones spread, inside a soft oval (centre and radii in 0..1 of the width)
  const [fx, fy, rx, ry] = [0.285, 0.29, 0.2, 0.27].map((v) => v * W);
  for (let y = 0; y < info.height; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 2, r = Math.hypot((x - fx) / rx, (y - fy) / ry), w = Math.min(1, Math.max(0, (1.25 - r) / 0.35));
    if (!w) continue;
    const v = data[i] / 255, t = 0.8 * v ** 1.5;
    data[i] = Math.round((v + (t - v) * w) * 255);
  }
  await sharp(data, { raw: { width: W, height: info.height, channels: 2 } }).webp({ quality: 75, alphaQuality: 80, effort: 6 }).toFile(out('src/assets/portrait.webp'));
}

// ─── pixel emojis ─────────────────────────────────────────────────────────
const EMOJIS = ['🐍', '🎸', '📘', '☁️', '🐳', '☸️', '🤖', '🤗', '🦀', '⚛️', '🎨', '🔴', '🟢', '🧩', '📱', '🔌', '⚙️', '💻',
  '🎓', '🇰🇷', '📚', '🏫', '😾', '⏳', '🔢'];
const notoUrl = e => {
  const cps = [...e].map(c => c.codePointAt(0)).filter(c => c !== 0xfe0f);
  if (cps.every(c => c >= 0x1f1e6 && c <= 0x1f1ff))
    return `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/region-flags/svg/${cps.map(c => String.fromCharCode(c - 0x1f1e6 + 65)).join('')}.svg`;
  return `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/2D/svg/emoji_u${cps.map(c => c.toString(16)).join('_')}.svg`;
};
async function pixelate(svg, flag) {
  // draw large, box-filter down to 10×10, then crunch to a small palette with hard alpha
  const big = await sharp(svg, { density: 400 }).resize(80, flag ? 54 : 80, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend(flag ? { top: 13, bottom: 13, background: { r: 0, g: 0, b: 0, alpha: 0 } } : {}).png().toBuffer();
  const { data } = await sharp(big).resize(20, 20, { kernel: 'cubic' }).resize(10, 10, { kernel: 'cubic' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const q = v => Math.round(v / 255 * 4) / 4 * 255;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 100) { data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0; continue; }
    const a = data[i + 3] / 255;
    data[i] = q(Math.min(255, data[i] / a)); data[i + 1] = q(Math.min(255, data[i + 1] / a)); data[i + 2] = q(Math.min(255, data[i + 2] / a)); data[i + 3] = 255;
  }
  return sharp(data, { raw: { width: 10, height: 10, channels: 4 } }).png({ palette: true, compressionLevel: 9 }).toBuffer();
}
function triangle() { // ▲ has no colour emoji; the Vercel/Next mark is a plain triangle anyway
  const d = Buffer.alloc(400);
  for (let y = 1; y < 9; y++) for (let x = 0; x < 10; x++) if (Math.abs(x - 4.5) <= (y - 0.5) / 1.6) d.fill(255, (y * 10 + x) * 4, (y * 10 + x) * 4 + 4);
  return sharp(d, { raw: { width: 10, height: 10, channels: 4 } }).png({ palette: true }).toBuffer();
}
async function emojis() {
  const map = { '▲': 'data:image/png;base64,' + (await triangle()).toString('base64') };
  for (const e of EMOJIS) {
    const res = await fetch(notoUrl(e));
    if (!res.ok) throw new Error(`${e}: ${res.status} ${notoUrl(e)}`);
    const png = await pixelate(Buffer.from(await res.arrayBuffer()), notoUrl(e).includes('region-flags'));
    map[e.replace(/️/g, '')] = 'data:image/png;base64,' + png.toString('base64');
  }
  await fs.mkdir(out('src/data'), { recursive: true });
  // data URIs for build-time images (OG cards)…
  await fs.writeFile(out('src/data/pixel-emoji.json'), JSON.stringify(map, null, 1) + '\n');
  // …and one sprite + generated CSS for the site, so each page ships a class, not a data URI
  const keys = Object.keys(map), sprite = sharp({ create: { width: keys.length * 10, height: 10, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(keys.map((k, i) => ({ input: Buffer.from(map[k].split(',')[1], 'base64'), left: i * 10, top: 0 })));
  await fs.writeFile(out('src/assets/emoji.png'), await sprite.png({ palette: true, compressionLevel: 9 }).toBuffer());
  await fs.writeFile(out('src/data/emoji-index.json'), JSON.stringify(Object.fromEntries(keys.map((k, i) => [k, i]))) + '\n');
  await fs.writeFile(out('src/styles/emoji.css'), `/* generated by scripts/build-assets.mjs */\n.px { background-image: url('../assets/emoji.png'); background-size: ${keys.length * 100}% 100% }\n` +
    keys.map((k, i) => `.px.e${i} { background-position-x: ${(i / (keys.length - 1) * 100).toFixed(4)}% }`).join('\n') + '\n');
}

// ─── icons ────────────────────────────────────────────────────────────────
const BG = '#040f11', FG = '#f7f8f8', PRIMARY = '#0cb9e8';
async function icons() {
  const font = await fs.readFile(src('fonts', 'GeistMono-700.ttf'));
  const mark = (size, radius) => satori({
    type: 'div', props: {
      style: { width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, borderRadius: radius,
        color: FG, fontFamily: 'Geist Mono', fontWeight: 700, fontSize: size * 0.42, letterSpacing: -size * 0.02 },
      children: [{ type: 'span', props: { children: 'C' } }, { type: 'span', props: { style: { color: PRIMARY }, children: 'C' } }],
    },
  }, { width: size, height: size, fonts: [{ name: 'Geist Mono', data: font, weight: 700 }] });
  const svg = await mark(64, 14);
  await fs.writeFile(out('public/favicon.svg'), svg);
  for (const [name, size, radius] of [['apple-touch-icon.png', 180, 0], ['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['favicon-32.png', 32, 7]]) {
    const png = new Resvg(await mark(size, radius), { fitTo: { mode: 'width', value: size } }).render().asPng();
    await fs.writeFile(out('public', name), await sharp(png).png({ palette: true, compressionLevel: 9 }).toBuffer());
  }
  await sharp(await fs.readFile(out('public/favicon-32.png'))).toFile(out('public/favicon.ico')).catch(() => {});
  await fs.mkdir(out('src/assets/lab'), { recursive: true });
  await fs.copyFile(src('anchor-icon.png'), out('src/assets/lab/anchor-icon.png'));
}

await fs.mkdir(out('src/assets'), { recursive: true });
// `pnpm assets logos` rebuilds just the named steps
const steps = { logos, portrait, emojis, icons }, only = process.argv.slice(2);
await Promise.all(Object.entries(steps).filter(([k]) => !only.length || only.includes(k)).map(([, f]) => f()));
console.log('assets built');
