// The rendering half of the home page effects. No DOM here: it draws on two canvases (usually
// OffscreenCanvases inside a worker) from geometry measured on the main thread, and reacts to messages.
//   · the name, drawn with every character of the CV, which pours into the About paragraph on scroll
//   · the window: each entry's logo (or my portrait) on a character grid made of the entry's own words

export type CharBox = { ch: string; link: boolean; x: number; y: number; base: number };
export type Layout = {
  W: number; H: number; dpr: number;
  name: { left: number; top: number; w: number; h: number; font: string; chars: { ch: string; x: number; base: number }[] } | null;
  slots: CharBox[]; aboutSize: number; pourDist: number; extra: string; cap: number;
};
export type Init = Layout & {
  type: 'init'; fx: HTMLCanvasElement | OffscreenCanvas; pane: HTMLCanvasElement | OffscreenCanvas | null;
  colors: { fg: string; muted: string; primary: string }; mono: string; fontUrl: string;
  logosUrl: string; portraitUrl: string; still: boolean; sy: number;
};
export type Msg =
  | ({ type: 'layout' } & Layout)
  | { type: 'scroll'; sy: number }
  | { type: 'mouse'; x: number; y: number }
  | { type: 'paneRect'; left: number; top: number; width: number; height: number }
  | { type: 'focus'; key: string; text: string }
  | { type: 'drag'; active: boolean; dx?: number; dy?: number };
export type Out = { type: 'poured'; value: boolean };

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (k: number) => k * k * (3 - 2 * k);
const hash = (a: number, b: number) => { const h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return h - Math.floor(h); };
const NOISE = 'abcdefghijklmnopqrstuvwxyz0123456789#%&*+=/<>?';
const rnd = (s: string) => s[(Math.random() * s.length) | 0]!;
const segmenter = new Intl.Segmenter();
const graphemes = (s: string) => Array.from(segmenter.segment(s), (g) => g.segment);
const isWide = (ch: string) => /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(ch);

type Canvas = HTMLCanvasElement | OffscreenCanvas;
type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
const makeCanvas = (w: number, h: number): Canvas =>
  typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
const ctx2d = (c: Canvas, read = false) => c.getContext('2d', read ? { willReadFrequently: true } : undefined) as Ctx;
import { createMarcher, SX, SY, type MarchParams } from './fx-gpu';

const raf: (cb: (t: number) => void) => void =
  typeof requestAnimationFrame !== 'undefined' ? (cb) => requestAnimationFrame(cb) : (cb) => setTimeout(() => cb(performance.now()), 16);

async function pixels(url: string) {
  const bmp = await createImageBitmap(await (await fetch(url)).blob(), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const c = makeCanvas(bmp.width, bmp.height), x = ctx2d(c, true);
  x.drawImage(bmp, 0, 0);
  return { w: bmp.width, h: bmp.height, d: x.getImageData(0, 0, bmp.width, bmp.height).data };
}

// ─── logos: signed distance fields, precomputed from large masks, extruded into solids ────────────
const LOGO_ORDER = ['eledone', 'sniive', 'cede', 'wandercraft', 'centralesupelec', 'kaist', 'sorbonne', 'prepa'];
const RANGE = 0.2; // the sprite stores distances within ±RANGE logo half-widths (scripts/build-assets.mjs)
type Field = { n: number; f: Float32Array };
type Logo = { k: number; a: Field; b: Field | null; img?: { w: number; h: number; d: Uint8ClampedArray } };
function sample({ n, f }: Field, x: number, y: number) {
  const u = ((x + 1) / 2) * (n - 1), v = (1 - (y + 1) / 2) * (n - 1);
  const cu = clamp(u, 0, n - 1.001), cv = clamp(v, 0, n - 1.001), i = cu | 0, j = cv | 0, fu = cu - i, fv = cv - j;
  const s = mix(mix(f[j * n + i]!, f[j * n + i + 1]!, fu), mix(f[(j + 1) * n + i]!, f[(j + 1) * n + i + 1]!, fu), fv);
  return s + Math.hypot(u - cu, v - cv) / (n / 2);
}
const extrude = (d: number, z: number, h: number) => { const w = Math.abs(z) - h; return Math.min(Math.max(d, w), 0) + Math.hypot(Math.max(d, 0), Math.max(w, 0)); };
type SDF = (x: number, y: number, z: number) => [number, number];
const logoSDF = (L: Logo): SDF => (x, y, z) => {
  const a = extrude(sample(L.a, x, y), z, 0.15) - 0.01;
  if (!L.b) return [a, 0];
  const b = extrude(sample(L.b, x, y), z, 0.07) - 0.01;
  return a < b ? [a, 0] : [b, 1];
};

// outlines are drawn with whichever of these has its ink where the edge runs through the cell
const OUTLINE = '|/\\_-¯';
const FULL = (1 << (SX * SY)) - 1;
const popcount = (v: number) => { let n = 0; while (v) { v &= v - 1; n++; } return n; };
/** Spreads each sample into its neighbours, so that "one sample to the left" still counts as close. */
function soften(v: Float32Array) {
  const o = new Float32Array(v.length);
  for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) {
    let s = v[j * SX + i]!;
    if (i > 0) s += v[j * SX + i - 1]! * 0.5; if (i < SX - 1) s += v[j * SX + i + 1]! * 0.5;
    if (j > 0) s += v[(j - 1) * SX + i]! * 0.5; if (j < SY - 1) s += v[(j + 1) * SX + i]! * 0.5;
    o[j * SX + i] = s;
  }
  const len = Math.hypot(...o) || 1;
  return o.map((x) => x / len);
}

export function createEngine(init: Init, post: (m: Out) => void) {
  const { colors: { fg: FG, muted: MUTED, primary: PRIMARY }, mono: MONO, still } = init;
  let L: Layout = init, t = 0, sy = init.sy, awake = true;
  const mouse = { x: -1e4, y: -1e4 };
  const fx = init.fx, fctx = ctx2d(fx), pc = init.pane, pctx = pc ? ctx2d(pc) : null;

  // ─── glyph atlas: every character is rasterised once, then blitted ───────
  const mctx = ctx2d(makeCanvas(8, 8));
  type Glyph = { c: Canvas; w: number; h: number; adv: number; asc: number; pad: number };
  const gcache = new Map<string, Glyph>();
  const font = (size: number) => `400 ${size}px ${MONO}`;
  function glyph(ch: string, size: number, color: string): Glyph {
    const k = `${ch}|${size}|${color}`;
    let g = gcache.get(k);
    if (g) return g;
    mctx.font = font(size);
    const m = mctx.measureText(ch), pad = 3, asc = m.fontBoundingBoxAscent || size * 0.9, desc = m.fontBoundingBoxDescent || size * 0.25;
    const w = Math.ceil(m.width + pad * 2), h = Math.ceil(asc + desc + pad * 2), c = makeCanvas(Math.ceil(w * L.dpr), Math.ceil(h * L.dpr));
    const x = ctx2d(c);
    x.scale(L.dpr, L.dpr); x.font = font(size); x.fillStyle = color; x.fillText(ch, pad, pad + asc);
    g = { c, w, h, adv: m.width, asc, pad };
    gcache.set(k, g);
    return g;
  }
  function blit(ctx: Ctx, g: Glyph, x: number, y: number, sc = 1, rot = 0) { // baseline-centre at (x, y)
    const c = Math.cos(rot) * sc * L.dpr, s = Math.sin(rot) * sc * L.dpr;
    ctx.setTransform(c, s, -s, c, x * L.dpr, y * L.dpr);
    ctx.drawImage(g.c, -g.adv / 2 - g.pad, -g.asc - g.pad, g.w, g.h);
  }

  // ─── the name, as particles ─────────────────────────────────────────────
  type P = { ch: string; link: boolean; extra: boolean; x: number; y: number; vx: number; vy: number; rnd: number; alpha: number; hx: number; hy: number };
  let P: P[] = [], aboutN = 0, heroScale = 0.6, poured = false, nameReady = false;

  function initParticles() {
    aboutN = L.slots.length;
    const chars: { ch: string; link: boolean; extra: boolean }[] = L.slots.map((c) => ({ ch: c.ch, link: c.link, extra: false }));
    for (const ch of graphemes(L.extra)) { if (chars.length >= L.cap) break; if (ch.trim()) chars.push({ ch, link: false, extra: true }); }
    P = chars.map((c) => ({ ...c, x: 0, y: 0, vx: 0, vy: 0, rnd: Math.random(), alpha: 0, hx: 0, hy: 0 }));
  }
  /** Samples the name as a mask, one point per particle. */
  function layoutName() {
    const n = L.name;
    if (!n) return;
    const bw = Math.ceil(n.w), bh = Math.ceil(n.h), c = makeCanvas(bw, bh), x = ctx2d(c, true);
    x.font = n.font; x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
    for (const b of n.chars) x.fillText(b.ch, b.x - n.left - x.measureText(b.ch).width / 2, b.base - n.top);
    const img = x.getImageData(0, 0, bw, bh).data, inside = (px: number, py: number) => img[((py | 0) * bw + (px | 0)) * 4 + 3]! > 128;
    let area = 0;
    for (let py = 0; py < bh; py += 2) for (let px = 0; px < bw; px += 2) if (inside(px, py)) area += 4;
    // one particle per few px² of ink, but never fewer than the paragraph needs
    if (!nameReady) P = P.slice(0, clamp(Math.round(area / (L.W < 640 ? 6 : 10)), aboutN, P.length));
    const N = P.length;
    if (!N || !area) return;
    let sp = Math.sqrt(area / N), pts: [number, number][] = [];
    for (let it = 0; it < 14; it++) {
      pts = [];
      for (let py = sp / 2; py < bh; py += sp) for (let px = sp / 2; px < bw; px += sp) {
        const jx = px + (Math.random() - 0.5) * sp * 0.5, jy = py + (Math.random() - 0.5) * sp * 0.5;
        if (jx > 0 && jy > 0 && jx < bw && jy < bh && inside(jx, jy)) pts.push([jx, jy]);
      }
      if (pts.length >= N && pts.length < N * 1.08) break;
      sp *= Math.sqrt(pts.length / N) * (pts.length < N ? 0.98 : 1);
    }
    if (!pts.length) return;
    while (pts.length > N) pts.splice((Math.random() * pts.length) | 0, 1);
    while (pts.length < N) pts.push(pts[(Math.random() * pts.length) | 0]!);
    pts.sort((a, b) => a[0] + a[1] * 0.2 - (b[0] + b[1] * 0.2));
    // About characters spread evenly through the name; the rest fill the gaps
    const taken = new Uint8Array(N);
    for (let i = 0; i < aboutN; i++) { const j = Math.floor((i * N) / aboutN); taken[j] = 1; P[i]!.hx = n.left + pts[j]![0]; P[i]!.hy = n.top + pts[j]![1]; }
    for (let i = aboutN, j = 0; i < N; i++) { while (taken[j]) j++; taken[j] = 1; P[i]!.hx = n.left + pts[j]![0]; P[i]!.hy = n.top + pts[j]![1]; }
    heroScale = clamp((sp * (L.W < 640 ? 1.3 : 1.75)) / L.aboutSize, 0.3, 1.3);
    if (!nameReady) { // first time: particles appear right where the real name is, then the real name steps aside
      for (const p of P) { p.x = p.hx + (Math.random() - 0.5) * 24; p.y = p.hy + (Math.random() - 0.5) * 24; }
      nameReady = true;
    }
  }

  function drawParticles() {
    const slots = L.slots, prog = clamp(sy / L.pourDist, 0, 1), heroP = clamp(sy / 420, 0, 1), my = mouse.y + sy;
    let landedAll = true, moving = false;
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.clearRect(0, 0, fx.width, fx.height);
    for (let i = 0; i < P.length; i++) {
      const p = P[i]!, slot = i < aboutN ? slots[i] : undefined;
      // each About character leaves the name in reading order and settles into its place in the paragraph
      const q = slot ? smooth(clamp(prog * 1.7 - (i / aboutN) * 0.7, 0, 1)) : 0;
      const ev = slot ? 0 : clamp(heroP * 1.7 - p.rnd * 0.6, 0, 1);
      let tx = p.hx, ty = p.hy + sy * 0.22 * (1 - q);
      if (slot) { tx = mix(tx, slot.x, q); ty = mix(ty, slot.y, q); }
      tx += Math.sin(t * 0.8 + p.rnd * 30) * 50 * ev;
      ty -= ev * ev * 220;
      if (q < 0.3) { // the pointer pushes the letters of the name aside
        const mx = p.x - mouse.x, mY = p.y - my, d2 = mx * mx + mY * mY;
        if (d2 < 4900 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / 70) ** 2 * 9; p.vx += (mx / d) * f; p.vy += (mY / d) * f; }
      }
      p.vx *= 0.84; p.vy *= 0.84;
      const k = mix(0.12, 0.22, q), ox = p.x, oy = p.y, oa = p.alpha, target = 1 - ev;
      p.x += (tx - p.x) * k + p.vx; p.y += (ty - p.y) * k + p.vy;
      p.alpha = mix(p.alpha, target, 0.08);
      // a particle still counts as moving if it's visible and not yet at rest
      if ((p.alpha > 0.01 || target > 0.01) && (Math.abs(p.x - ox) + Math.abs(p.y - oy) > 0.02 || Math.abs(p.alpha - oa) > 0.002)) moving = true;
      const landed = !!slot && q >= 1 && Math.abs(p.x - tx) < 0.5 && Math.abs(p.y - ty) < 0.5;
      if (slot && !landed) landedAll = false;
      if (poured && slot) continue; // the real paragraph is showing
      const vy = (landed ? slot!.y : p.y) - sy;
      if (p.alpha < 0.01 || vy < -40 || vy > L.H + 40) continue;
      fctx.globalAlpha = landed ? 1 : p.alpha * (p.extra ? 0.7 : 1);
      const col = p.link && q > 0.5 ? PRIMARY : FG;
      if (landed) blit(fctx, glyph(p.ch, L.aboutSize, col), slot!.x, slot!.base - sy);
      else blit(fctx, glyph(p.ch, L.aboutSize, col), p.x, vy + L.aboutSize * 0.35 * mix(heroScale, 1, q), mix(heroScale, 1, q), clamp((tx - p.x) * 0.004, -0.6, 0.6));
    }
    // until it is complete, the paragraph is drawn here: faint placeholders for the letters still on their way
    if (!poured && aboutN) {
      fctx.globalAlpha = 0.09;
      for (let i = 0; i < aboutN; i++) {
        const s = slots[i]!, p = P[i]!;
        if (Math.abs(p.x - s.x) < 0.5 && Math.abs(p.y - s.y) < 0.5) continue;
        const vy = s.base - sy;
        if (vy < -20 || vy > L.H + 20) continue;
        blit(fctx, glyph(s.ch, L.aboutSize, s.link ? PRIMARY : FG), s.x, vy);
      }
    }
    fctx.globalAlpha = 1;
    if (aboutN && landedAll !== poured) { poured = landedAll; post({ type: 'poured', value: poured }); }
    return moving;
  }

  // ─── the window ─────────────────────────────────────────────────────────
  const logos: Record<string, Logo> = {};
  let sprite: Awaited<ReturnType<typeof pixels>> | null = null, marcher: ReturnType<typeof createMarcher> = null;
  async function loadLogo(key: string) {
    if (logos[key]) return;
    if (key === 'me') { logos.me = { k: -1, a: { n: 2, f: new Float32Array(4).fill(1) }, b: null, img: await pixels(init.portraitUrl) }; return; }
    if (!sprite) {
      sprite = await pixels(init.logosUrl);
      try { marcher = createMarcher(sprite, LOGO_ORDER.length, RANGE); } catch { marcher = null; }
    }
    const k = LOGO_ORDER.indexOf(key), n = sprite.h, A = new Float32Array(n * n), B = new Float32Array(n * n);
    let plate = false;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const i = (y * sprite.w + k * n + x) * 4;
      A[y * n + x] = (sprite.d[i]! / 255 - 0.5) * 2 * RANGE; B[y * n + x] = (sprite.d[i + 1]! / 255 - 0.5) * 2 * RANGE;
      if (sprite.d[i + 1]! < 128) plate = true; // a logo without a plate stores its G channel as "outside" everywhere
    }
    logos[key] = { k, a: { n, f: A }, b: plate ? { n, f: B } : null };
  }
  const pane = { key: 'me', prev: 'me', morph: 1, yaw: 0, pitch: 0, dragging: false, born: -1e3, lens: 0, cells: [] as string[], rect: { left: 0, top: 0, width: 0, height: 0 } };
  type Grid = { size: number; cw: number; ch: number; cols: number; rows: number; ox: number; oy: number; mask: Uint8Array; lum: Float32Array; hits: Uint32Array; ink: [string, Float32Array][] };
  let grid: Grid | null = null, photoKey = '';

  const cellsOf = (text: string) => { // the entry's own words, cell by cell; wide (CJK) characters take two cells
    const cells: string[] = [];
    for (const ch of graphemes(text.replace(/\s+/g, ' ') + ' ')) { if (isWide(ch)) cells.push(ch, ''); else cells.push(ch); }
    return cells;
  };
  /** Where each outline character puts its ink within a cell, on the same SX×SY samples the marcher takes. */
  function inkOf(size: number, cw: number, ch: number) {
    const K = 4, w = Math.ceil(cw * K), h = Math.ceil(ch * K), x = ctx2d(makeCanvas(w, h), true);
    x.font = font(size * K); x.fillStyle = '#fff';
    return [...OUTLINE].map((c): [string, Float32Array] => {
      x.clearRect(0, 0, w, h); x.fillText(c, 0, size * K);
      const d = x.getImageData(0, 0, w, h).data, v = new Float32Array(SX * SY);
      for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) v[Math.min(SY - 1, ((py / h) * SY) | 0) * SX + Math.min(SX - 1, ((px / w) * SX) | 0)]! += d[(py * w + px) * 4 + 3]!;
      return [c, soften(v)];
    });
  }
  function sizePane() {
    const r = pane.rect;
    if (!pc || !r.width) { grid = null; return; }
    pc.width = Math.round(r.width * L.dpr); pc.height = Math.round(r.height * L.dpr);
    const size = 8.5; mctx.font = font(size);
    const cw = mctx.measureText('M').width, ch = 10;
    const cols = Math.floor((r.width - 16) / cw), rows = Math.floor((r.height - 12) / ch);
    grid = { size, cw, ch, cols, rows, ox: (r.width - cols * cw) / 2, oy: (r.height - rows * ch) / 2 + 2, mask: new Uint8Array(cols * rows), lum: new Float32Array(cols * rows),
      hits: new Uint32Array(cols * rows * 4), ink: inkOf(size, cw, ch) };
    photoKey = ''; shapes.clear();
  }
  async function focus(key: string, text: string) {
    if (!pc) return; // no window on this page
    await loadLogo(key);
    if (key === pane.key) { pane.cells = cellsOf(text); return; }
    pane.prev = pane.morph < 0.5 ? pane.prev : pane.key; pane.key = key; pane.morph = 0;
    pane.cells = cellsOf(text); pane.born = t;
  }

  /** The same march as the GPU's, on the CPU: one ray per cell, and the full SX×SY only where neighbours disagree. */
  function marchCPU(p: MarchParams, sdf: SDF, out: Uint32Array) {
    const { cols, rows, cw, ch, scale, rot: M, dir: [dx, dy, dz], light: Lg } = p;
    let lum = 0;
    const hit = (px: number, py: number) => { // -1: nothing, 0: the mark, 1: the plate
      const vx = (px - (cols * cw) / 2) / scale, vy = -(py - (rows * ch) / 2) / scale;
      if (vx * vx + vy * vy > 2.3) return -1;
      const ox = M[0]! * vx + M[3]! * vy + M[6]! * 2, oy = M[1]! * vx + M[4]! * vy + M[7]! * 2, oz = M[2]! * vx + M[5]! * vy + M[8]! * 2;
      for (let k = 0, tt = 0.5; k < 64 && tt < 3.5; k++) {
        const x = ox + dx! * tt, y = oy + dy! * tt, z = oz + dz! * tt, [d, ly] = sdf(x, y, z);
        if (d < 0.006) {
          const e = 0.012, f = (a: number, b: number, c: number) => sdf(a, b, c)[0];
          const a = f(x + e, y - e, z - e), b = f(x - e, y - e, z + e), q = f(x - e, y + e, z - e), w = f(x + e, y + e, z + e);
          let nx = a - b - q + w, ny = -a - b + q + w, nz = -a + b - q + w;
          const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
          const diff = Math.max(0, nx * Lg[0]! + ny * Lg[1]! + nz * Lg[2]!), rim = Math.pow(1 - Math.abs(nx * dx! + ny * dy! + nz * dz!), 3);
          lum = clamp(0.25 + diff * 0.75 + rim * 0.2, 0, 1);
          return ly;
        }
        tt += d * 0.8;
      }
      return -1;
    };
    const centre = new Int8Array(cols * rows), cl = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { centre[r * cols + c] = hit((c + 0.5) * cw, (r + 0.5) * ch); cl[r * cols + c] = lum; }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c, h = centre[i]!;
      let edge = false;
      for (let y = Math.max(0, r - 1); y <= Math.min(rows - 1, r + 1) && !edge; y++) for (let x = Math.max(0, c - 1); x <= Math.min(cols - 1, c + 1); x++) if (centre[y * cols + x] !== h) { edge = true; break; }
      if (!edge) { out[i * 4] = h === 0 ? FULL : 0; out[i * 4 + 1] = h >= 0 ? FULL : 0; out[i * 4 + 2] = (cl[i]! * 65535) | 0; continue; }
      let mark = 0, solid = 0, sum = 0, n = 0;
      for (let j = 0; j < SY; j++) for (let s = 0; s < SX; s++) {
        const ly = hit((c + (s + 0.5) / SX) * cw, (r + (j + 0.5) / SY) * ch);
        if (ly < 0) continue;
        const bit = 1 << (j * SX + s); solid |= bit; if (ly === 0) mark |= bit; sum += lum; n++;
      }
      out[i * 4] = mark; out[i * 4 + 1] = solid; out[i * 4 + 2] = ((n ? sum / n : 0) * 65535) | 0;
    }
  }

  // outlines: the samples of a layer that touch an empty one trace its edge; the glyph whose ink lies closest wins
  const shapes = new Map<number, string>();
  function outline(g: Grid, c: number, r: number) {
    const { cols, rows, hits } = g;
    const at = (layer: number, cc: number, rr: number, i: number, j: number) => {
      if (i < 0) { cc--; i += SX; } else if (i >= SX) { cc++; i -= SX; }
      if (j < 0) { rr--; j += SY; } else if (j >= SY) { rr++; j -= SY; }
      if (cc < 0 || rr < 0 || cc >= cols || rr >= rows) return 0;
      return (hits[(rr * cols + cc) * 4 + layer]! >> (j * SX + i)) & 1;
    };
    for (let layer = 0; layer < 2; layer++) {
      const own = hits[(r * cols + c) * 4 + layer]!;
      if (!own) continue;
      const full = (cc: number, rr: number) => cc >= 0 && rr >= 0 && cc < cols && rr < rows && hits[(rr * cols + cc) * 4 + layer] === FULL;
      if (own === FULL && full(c - 1, r) && full(c + 1, r) && full(c, r - 1) && full(c, r + 1)) continue; // deep inside
      let edge = 0;
      for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) {
        if (!((own >> (j * SX + i)) & 1)) continue;
        if (!at(layer, c, r, i - 1, j) || !at(layer, c, r, i + 1, j) || !at(layer, c, r, i, j - 1) || !at(layer, c, r, i, j + 1)) edge |= 1 << (j * SX + i);
      }
      if (popcount(edge) < 3) continue; // a corner clipped by a sample or two is not an edge yet
      let best = shapes.get(edge);
      if (best === undefined) {
        const v = new Float32Array(SX * SY);
        for (let k = 0; k < SX * SY; k++) v[k] = (edge >> k) & 1;
        const tv = soften(v);
        let score = -1;
        for (const [ch, ink] of g.ink) { let s = 0; for (let k = 0; k < SX * SY; k++) s += tv[k]! * ink[k]!; if (s > score) { score = s; best = ch; } }
        shapes.set(edge, best!);
      }
      return best!;
    }
    return null;
  }

  function renderPane(dt: number) {
    if (!pc || !pctx || !grid) return;
    const r = pane.rect;
    if (r.top + r.height < 0 || r.top > L.H) return;
    if (!logos[pane.key] || !logos[pane.prev]) return;
    const { cols, rows, cw, ch, mask, lum, hits } = grid;
    pane.morph = still ? 1 : Math.min(1, pane.morph + dt * 1.2);
    const m = smooth(pane.morph), isPhoto = (k: string) => !!logos[k]?.img;
    // the portrait and the logos are different kinds of thing: rather than morph, the frame refreshes
    const swap = isPhoto(pane.prev) !== isPhoto(pane.key) && pane.morph < 1;
    const src = swap ? (m < 0.5 ? pane.prev : pane.key) : pane.key;
    const photo = isPhoto(src);
    if (!pane.dragging && Math.abs(pane.yaw) > 0.001) pane.yaw *= 0.97;
    if (photo) { // the portrait covers the whole frame, framed on the face; it never moves, so it is sampled once
      const key = `${src}|${cols}x${rows}`;
      if (photoKey !== key) {
        photoKey = key;
        const { w: iw, h: ih, d } = logos[src]!.img!, gw = cols * cw, gh = rows * ch, s = Math.max(gw / iw, gh / ih) * 1.15;
        const ox0 = clamp(gw / 2 - 0.4 * iw * s, gw - iw * s, 0), oy0 = clamp(gh / 2 - 0.42 * ih * s, gh - ih * s, 0);
        for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) {
          const i = rr * cols + c, u0 = (c * cw - ox0) / s, v0 = (rr * ch - oy0) / s, u1 = u0 + cw / s, v1 = v0 + ch / s;
          let al = 0, l = 0, n = 0;
          for (let v = Math.floor(v0); v < v1; v++) for (let u = Math.floor(u0); u < u1; u++) {
            n++;
            if (u < 0 || v < 0 || u >= iw || v >= ih) continue;
            const k = (v * iw + u) * 4; al += d[k + 3]!; l += (d[k]! * d[k + 3]!) / 255;
          }
          mask[i] = n && al / n / 255 > 0.5 ? 1 : 0;
          lum[i] = mask[i] ? l / (al || 1) : 0;
        }
        // stretch the tones to the picture's own range, so the face doesn't sit in a flat band of midtones
        const tones = lum.filter((_, i) => mask[i]).sort(), lo = tones[(tones.length * 0.05) | 0] ?? 0, hi = tones[(tones.length * 0.95) | 0] ?? 1;
        for (let i = 0; i < cols * rows; i++) if (mask[i]) lum[i] = smooth(smooth(clamp((lum[i]! - lo) / (hi - lo || 1), 0, 1))); // and push them apart, like an engraving
      }
    } else {
      photoKey = '';
      const yaw = (pane.dragging ? 0 : Math.sin(t * 0.45) * 0.75) + pane.yaw, pitch = 0.12 + Math.sin(t * 0.3) * 0.08 + pane.pitch;
      const cy = Math.cos(yaw), sny = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const rot = new Float32Array([cy, 0, sny, sny * sp, cp, -cy * sp, -sny * cp, sp, cy * cp]); // view → object
      const tr = (x: number, y: number, z: number) => [rot[0]! * x + rot[3]! * y + rot[6]! * z, rot[1]! * x + rot[4]! * y + rot[7]! * z, rot[2]! * x + rot[5]! * y + rot[8]! * z];
      const light = tr(-0.5, 0.6, 0.62), ll = Math.hypot(...light);
      const A = logos[swap ? src : pane.prev]!, B = logos[swap ? src : pane.key]!, mm = swap ? 1 : m;
      const params: MarchParams = { cols, rows, cw, ch, scale: Math.min(cols * cw, rows * ch) / 2 / 1.08, rot, dir: tr(0, 0, -1), light: light.map((x) => x / ll),
        a: A.k, b: B.k, m: mm, plate: [!!A.b, !!B.b] };
      if (marcher?.ok) marcher.march(params, hits);
      else {
        const sa = logoSDF(A), sb = logoSDF(B);
        marchCPU(params, mm >= 1 ? sb : (x, y, z) => { const a = sa(x, y, z), b = sb(x, y, z); return [mix(a[0], b[0], mm), mm < 0.5 ? a[1] : b[1]]; }, hits);
      }
      for (let i = 0; i < cols * rows; i++) {
        mask[i] = popcount(hits[i * 4]!) * 2 > SX * SY ? 1 : popcount(hits[i * 4 + 1]!) * 2 > SX * SY ? 2 : 0;
        lum[i] = hits[i * 4 + 2]! / 65535;
      }
    }
    pctx.setTransform(1, 0, 0, 1, 0, 0); pctx.clearRect(0, 0, pc.width, pc.height);
    const cells = pane.cells.length ? pane.cells : [' '], mx = mouse.x - r.left, my = mouse.y - r.top, el = (t - pane.born) * 1000;
    pane.lens = mix(pane.lens, photo && mx > 0 && my > 0 && mx < r.width && my < r.height ? 1 : 0, 0.15);
    const LR = 62, RAMP = ' .:-=+*#%@';
    for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) {
      const i = rr * cols + c, hs = hash(c, rr);
      let chr = cells[i % cells.length]!, color = MUTED, a = 0.13;
      if (chr === '') continue; // right half of a wide character
      let x = grid.ox + c * cw, y = grid.oy + rr * ch;
      if (hs * 500 + rr * 8 > el) { chr = rnd(NOISE); a = 0.12; } // the new text types itself in
      const d2 = (x - mx) ** 2 + (y - my) ** 2;
      let lk = 0;
      if (photo) { // a loupe: under the pointer, the words give way to the picture they draw, magnified
        if (d2 < LR * LR) { lk = (1 - Math.sqrt(d2) / LR) * pane.lens; x += (x - mx) * lk * 0.45; y += (y - my) * lk * 0.45; }
      } else if (d2 < 8100) a += (1 - Math.sqrt(d2) / 90) * 0.35; // hovering reads the words underneath
      const e = photo ? null : outline(grid, c, rr);
      if (e) { chr = e; color = PRIMARY; a = 0.95; }
      else if (mask[i]) {
        if (photo) { // a portrait needs real darks: shadows thin out to dots, then to nothing
          const l = lum[i]!;
          if (lk > 0.08) { chr = RAMP[Math.round(l * (RAMP.length - 1))]!; color = lk > 0.3 ? PRIMARY : FG; a = 0.35 + 0.65 * Math.max(l, lk); }
          else { if (l < 0.22) chr = ' '; else if (l < 0.42 || chr === ' ') chr = '·'; color = FG; a = 0.12 + Math.pow(l, 1.4) * 0.88; }
        } else { if (chr === ' ') chr = '·'; color = FG; a = (mask[i] === 1 ? 0.95 : 0.3) * (0.35 + 0.65 * lum[i]!); }
      }
      if (swap) { // a refresh: the old picture breaks into noise behind a scanline, the new one resolves out of it
        const hold = Math.abs(m - 0.5) * 2, scan = Math.abs(rr - (pane.morph * 1.3 - 0.15) * rows);
        if (hs > hold) { chr = rnd(NOISE); color = hs > 0.85 ? PRIMARY : FG; a = 0.15 + 0.45 * (1 - hold); }
        if (scan < 1) { chr = chr === ' ' ? '─' : chr; color = PRIMARY; a = 0.9; }
      }
      if (chr === ' ') continue;
      pctx.globalAlpha = a;
      const g = glyph(chr, grid.size, color);
      pctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
      pctx.drawImage(g.c, x - g.pad, y + grid.size - g.asc - g.pad, g.w, g.h);
    }
    pctx.globalAlpha = 1;
  }

  // ─── lifecycle ─────────────────────────────────────────────────────────
  const nameSig = (l: Layout) => (l.name ? `${Math.round(l.name.left)}|${Math.round(l.name.top)}|${Math.round(l.name.w)}|${Math.round(l.name.h)}` : '');
  let first = true;
  function applyLayout(next: Layout) {
    const widthChanged = next.W !== L.W || next.dpr !== L.dpr, nameMoved = first || nameSig(next) !== nameSig(L);
    L = next; first = false;
    fx.width = Math.round(L.W * L.dpr); fx.height = Math.round(L.H * L.dpr);
    if (widthChanged) gcache.clear();
    if (!still) {
      if (!P.length || widthChanged) { nameReady = false; initParticles(); layoutName(); }
      else if (nameMoved) layoutName();
    }
    awake = true;
  }
  let last = 0, loop = false;
  function frame(now: number) {
    const dt = last ? clamp((now - last) / 1000, 0, 0.05) : 0.016; last = now;
    t += still ? 0 : dt;
    // the particles rest once they've settled; any input wakes them
    if (!still && awake) awake = drawParticles();
    renderPane(dt);
    raf(frame);
  }
  const ready = (async () => {
    // the worker has no fonts of its own: bring Geist Mono in before drawing anything
    const scope = globalThis as unknown as { fonts?: FontFaceSet; document?: Document };
    if (!scope.document && scope.fonts && init.fontUrl) {
      const face = new FontFace('Geist Mono', `url(${init.fontUrl})`, { weight: '100 900', display: 'swap' });
      scope.fonts.add(face);
      await face.load().catch(() => {});
    }
    applyLayout(init);
    if (pc) await loadLogo('me');
    if (!loop) { loop = true; raf(frame); }
  })();

  return {
    ready,
    handle(m: Msg) {
      switch (m.type) {
        case 'layout': void ready.then(() => { applyLayout(m); sizePane(); }); break;
        case 'scroll': sy = m.sy; awake = true; break;
        case 'mouse': mouse.x = m.x; mouse.y = m.y; awake = true; break;
        case 'paneRect': {
          const sized = pane.rect.width === m.width && pane.rect.height === m.height;
          pane.rect = { left: m.left, top: m.top, width: m.width, height: m.height };
          if (!sized) sizePane();
          break;
        }
        case 'focus': void focus(m.key, m.text); break;
        case 'drag':
          if (m.active && m.dx !== undefined && m.dy !== undefined) { pane.yaw += m.dx * 0.01; pane.pitch = clamp(pane.pitch + m.dy * 0.01, -1, 1); }
          pane.dragging = m.active;
          break;
      }
    },
  };
}
