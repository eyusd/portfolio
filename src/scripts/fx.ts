// The home page's text effects. Loaded lazily, once the page is idle, and never under reduced motion.
//   · the name, drawn with every character of the CV, which pours into the About paragraph on scroll
//   · the window: each entry's logo (or my portrait) rendered on a character grid made of the entry's own words
const scramble = (el: Element, o?: { dur?: number }) => (window as unknown as { ccScramble?: (el: Element, o?: { dur?: number }) => void }).ccScramble?.(el, o);

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (k: number) => k * k * (3 - 2 * k);
const hash = (a: number, b: number) => { const h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return h - Math.floor(h); };
const NOISE = 'abcdefghijklmnopqrstuvwxyz0123456789#%&*+=/<>?';
const rnd = (s: string) => s[(Math.random() * s.length) | 0]!;
const segmenter = new Intl.Segmenter();
const graphemes = (s: string) => Array.from(segmenter.segment(s), (g) => g.segment);
const isWide = (ch: string) => /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(ch);

const css = getComputedStyle(document.documentElement);
const FG = css.getPropertyValue('--fg').trim(), MUTED = css.getPropertyValue('--muted').trim(), PRIMARY = css.getPropertyValue('--primary').trim();
const MONO = css.getPropertyValue('--mono').trim();

let W = 0, H = 0, DPR = 1, t = 0, sy = 0;
const mouse = { x: -1e4, y: -1e4 };

// ─── glyph atlas: every character is rasterised once, then blitted ─────────
const mctx = document.createElement('canvas').getContext('2d')!;
type Glyph = { c: HTMLCanvasElement; w: number; h: number; adv: number; asc: number; pad: number };
const gcache = new Map<string, Glyph>();
const font = (size: number, weight = 400) => `${weight} ${size}px ${MONO}`;
function glyph(ch: string, size: number, color: string, weight = 400): Glyph {
  const k = `${ch}|${size}|${color}|${weight}`;
  let g = gcache.get(k);
  if (g) return g;
  mctx.font = font(size, weight);
  const m = mctx.measureText(ch), pad = 3, asc = m.fontBoundingBoxAscent || size * 0.9, desc = m.fontBoundingBoxDescent || size * 0.25;
  const w = Math.ceil(m.width + pad * 2), h = Math.ceil(asc + desc + pad * 2), c = document.createElement('canvas');
  c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
  const x = c.getContext('2d')!;
  x.scale(DPR, DPR); x.font = font(size, weight); x.fillStyle = color; x.fillText(ch, pad, pad + asc);
  g = { c, w, h, adv: m.width, asc, pad };
  gcache.set(k, g);
  return g;
}
/** Draws a glyph whose baseline-centre sits at (x, y), in CSS pixels. */
function blit(ctx: CanvasRenderingContext2D, g: Glyph, x: number, y: number, sc = 1, rot = 0) {
  const c = Math.cos(rot) * sc * DPR, s = Math.sin(rot) * sc * DPR;
  ctx.setTransform(c, s, -s, c, x * DPR, y * DPR);
  ctx.drawImage(g.c, -g.adv / 2 - g.pad, -g.asc - g.pad, g.w, g.h);
}

// ─── text geometry, straight from the DOM ─────────────────────────────────
type CharBox = { ch: string; link: boolean; x: number; y: number; w: number; base: number };
/** Every grapheme under `el`, with its box in document coordinates and whether it sits in a link. */
function charBoxes(el: Element): CharBox[] {
  const out: CharBox[] = [], range = document.createRange(), walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let asc = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text, link = !!node.parentElement?.closest('a');
    if (!asc) { const cs = getComputedStyle(node.parentElement!); mctx.font = `${cs.fontWeight} ${cs.fontSize} ${MONO}`; asc = mctx.measureText('M').fontBoundingBoxAscent; }
    let off = 0;
    for (const ch of graphemes(node.data)) {
      range.setStart(node, off); range.setEnd(node, off + ch.length); off += ch.length;
      if (!ch.trim()) continue;
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      out.push({ ch, link, x: r.left + r.width / 2, y: r.top + scrollY + r.height / 2, w: r.width, base: r.top + scrollY + asc });
    }
    out.push({ ch: '\n', link: false, x: 0, y: 0, w: 0, base: 0 }); // paragraph boundary
  }
  return out;
}

// ─── the name: every character of the CV, as particles ────────────────────
const fx = document.getElementById('fx') as HTMLCanvasElement;
const fctx = fx.getContext('2d')!;
const nameEl = document.getElementById('name')!;
// optional: the Lab page has a name but no paragraph to pour into, and no window
const aboutEl = document.querySelector<HTMLElement>('.about');
const aboutSection = document.getElementById('about');
type P = { ch: string; link: boolean; extra: boolean; x: number; y: number; vx: number; vy: number; rnd: number; alpha: number; hx: number; hy: number };
let nameBox = '';
let P: P[] = [], slots: CharBox[] = [], aboutN = 0, heroScale = 0.6, aboutSize = 15, pourDist = 1, poured = false, nameReady = false;

function initParticles() {
  const about = aboutEl ? charBoxes(aboutEl).filter((c) => c.ch !== '\n') : [];
  slots = about;
  aboutN = about.length;
  const extra = [...document.querySelectorAll('.entry > div')].map((d) => d.textContent ?? '').join(' ').replace(/\s+/g, ' ');
  const cap = W < 640 ? 2200 : 3200;
  const chars: { ch: string; link: boolean; extra: boolean }[] = about.map((c) => ({ ch: c.ch, link: c.link, extra: false }));
  for (const ch of graphemes(extra)) { if (chars.length >= cap) break; if (ch.trim()) chars.push({ ch, link: false, extra: true }); }
  P = chars.map((c) => ({ ...c, x: 0, y: 0, vx: 0, vy: 0, rnd: Math.random(), alpha: 0, hx: 0, hy: 0 }));
}
/** Samples the rendered name as a mask, one point per particle. */
function layoutName() {
  const box = nameEl.getBoundingClientRect(), top = box.top + scrollY, bw = Math.ceil(box.width), bh = Math.ceil(box.height);
  const c = document.createElement('canvas'); c.width = bw; c.height = bh;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  const cs = getComputedStyle(nameEl), size = parseFloat(cs.fontSize);
  x.font = `${cs.fontWeight} ${size}px ${MONO}`; x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
  for (const b of charBoxes(nameEl)) if (b.ch !== '\n') x.fillText(b.ch, b.x - box.left - x.measureText(b.ch).width / 2, b.base - top);
  nameBox = `${box.left}|${top}|${bw}|${bh}`;
  const img = x.getImageData(0, 0, bw, bh).data, inside = (px: number, py: number) => img[((py | 0) * bw + (px | 0)) * 4 + 3]! > 128;
  let area = 0;
  for (let py = 0; py < bh; py += 2) for (let px = 0; px < bw; px += 2) if (inside(px, py)) area += 4;
  // one particle per ~10px² of ink, but never fewer than the paragraph needs
  if (!nameReady) P = P.slice(0, clamp(Math.round(area / (W < 640 ? 6 : 10)), aboutN, P.length));
  const N = P.length;
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
  for (let i = 0; i < aboutN; i++) { const j = Math.floor((i * N) / aboutN); taken[j] = 1; P[i]!.hx = box.left + pts[j]![0]; P[i]!.hy = top + pts[j]![1]; }
  for (let i = aboutN, j = 0; i < N; i++) { while (taken[j]) j++; taken[j] = 1; P[i]!.hx = box.left + pts[j]![0]; P[i]!.hy = top + pts[j]![1]; }
  aboutSize = aboutEl ? parseFloat(getComputedStyle(aboutEl.querySelector('p')!).fontSize) : 15;
  heroScale = clamp((sp * (W < 640 ? 1.3 : 1.75)) / aboutSize, 0.3, 1.3);
  if (!nameReady) { // first time: particles appear exactly where the real name is, then the real name steps aside
    for (const p of P) { p.x = p.hx + (Math.random() - 0.5) * 24; p.y = p.hy + (Math.random() - 0.5) * 24; }
    nameReady = true;
  }
  if (aboutSection) pourDist = Math.max(320, aboutSection.getBoundingClientRect().top + scrollY - H * 0.4);
}

function drawParticles() {
  fctx.setTransform(1, 0, 0, 1, 0, 0);
  fctx.clearRect(0, 0, fx.width, fx.height);
  const prog = clamp(sy / pourDist, 0, 1), heroP = clamp(sy / 420, 0, 1), my = mouse.y + sy;
  let landedAll = true;
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
    const k = mix(0.12, 0.22, q);
    p.x += (tx - p.x) * k + p.vx; p.y += (ty - p.y) * k + p.vy;
    const landed = !!slot && q >= 1 && Math.abs(p.x - tx) < 0.5 && Math.abs(p.y - ty) < 0.5;
    if (slot && !landed) landedAll = false;
    p.alpha = mix(p.alpha, 1 - ev, 0.08);
    if (poured && slot) continue; // the real paragraph is showing
    const vy = (landed ? slot!.y : p.y) - sy;
    if (p.alpha < 0.01 || vy < -40 || vy > H + 40) continue;
    fctx.globalAlpha = landed ? 1 : p.alpha * (p.extra ? 0.7 : 1);
    const col = p.link && q > 0.5 ? PRIMARY : FG;
    if (landed) blit(fctx, glyph(p.ch, aboutSize, col), slot!.x, slot!.base - sy);
    else blit(fctx, glyph(p.ch, aboutSize, col), p.x, vy + aboutSize * 0.35 * mix(heroScale, 1, q), mix(heroScale, 1, q), clamp((tx - p.x) * 0.004, -0.6, 0.6));
  }
  // until it is complete, the paragraph is drawn here: faint placeholders for the letters still on their way
  if (!poured && aboutN) {
    fctx.globalAlpha = 0.09;
    for (let i = 0; i < aboutN; i++) {
      const s = slots[i]!, p = P[i]!;
      if (Math.abs(p.x - s.x) < 0.5 && Math.abs(p.y - s.y) < 0.5) continue;
      const vy = s.base - sy;
      if (vy < -20 || vy > H + 20) continue;
      blit(fctx, glyph(s.ch, aboutSize, s.link ? PRIMARY : FG), s.x, vy);
    }
  }
  fctx.globalAlpha = 1;
  if (landedAll !== poured) { poured = landedAll; aboutEl?.classList.toggle('pouring', !poured); }
}

// ─── logos → masks → signed distance fields → extruded solids ─────────────
const LOGO_ORDER = ['eledone', 'sniive', 'cede', 'wandercraft', 'centralesupelec', 'kaist', 'sorbonne', 'prepa'];
const LN = 112;
type Logo = { a: Float32Array; b: Float32Array | null; img?: { w: number; h: number; d: Uint8ClampedArray } };
const logos: Record<string, Logo> = {};
function edt(mask: Uint8Array, n: number) { // exact Euclidean distance transform (Felzenszwalb & Huttenlocher)
  const INF = 1e12, f = new Float64Array(n * n), v = new Int32Array(n), z = new Float64Array(n + 1), tmp = new Float64Array(n);
  for (let i = 0; i < n * n; i++) f[i] = mask[i] ? 0 : INF;
  const pass = (get: (q: number) => number, set: (q: number, val: number) => void) => {
    for (let q = 0; q < n; q++) tmp[q] = get(q);
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s: number;
      while ((s = (tmp[q]! + q * q - (tmp[v[k]!]! + v[k]! * v[k]!)) / (2 * q - 2 * v[k]!)) <= z[k]!) k--;
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1]! < q) k++; set(q, (q - v[k]!) ** 2 + tmp[v[k]!]!); }
  };
  for (let x = 0; x < n; x++) pass((q) => f[q * n + x]!, (q, val) => { f[q * n + x] = val; });
  for (let y = 0; y < n; y++) pass((q) => f[y * n + q]!, (q, val) => { f[y * n + q] = val; });
  return f.map(Math.sqrt);
}
function sdf2(mask: Uint8Array, n: number) {
  const dOut = edt(mask, n), dIn = edt(mask.map((m) => 1 - m), n), out = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) out[i] = (dOut[i]! - dIn[i]! + (mask[i] ? 0.5 : -0.5)) / (n / 2);
  return out;
}
async function pixels(url: string) {
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext('2d', { willReadFrequently: true })!; x.drawImage(img, 0, 0);
  return { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data };
}
let sprite: Awaited<ReturnType<typeof pixels>> | null = null;
async function loadLogo(key: string) {
  if (logos[key]) return;
  const main = document.getElementById('content')!;
  if (key === 'me') { const img = await pixels(main.dataset.portrait!); logos.me = { a: new Float32Array(LN * LN).fill(1), b: null, img }; return; }
  sprite ??= await pixels(main.dataset.logos!);
  const k = LOGO_ORDER.indexOf(key), A = new Uint8Array(LN * LN), B = new Uint8Array(LN * LN);
  let plate = false;
  for (let y = 0; y < LN; y++) for (let x = 0; x < LN; x++) {
    const i = (y * sprite.w + k * LN + x) * 4;
    A[y * LN + x] = sprite.d[i]! > 127 ? 1 : 0; B[y * LN + x] = sprite.d[i + 1]! > 127 ? 1 : 0;
    if (B[y * LN + x] && !A[y * LN + x]) plate = true;
  }
  logos[key] = { a: sdf2(A, LN), b: plate ? sdf2(B, LN) : null };
}
function sample(f: Float32Array, x: number, y: number) {
  const n = LN, u = ((x + 1) / 2) * (n - 1), v = (1 - (y + 1) / 2) * (n - 1);
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

// ─── the window ───────────────────────────────────────────────────────────
const pc = document.getElementById('pane') as HTMLCanvasElement | null;
const pctx = pc?.getContext('2d') ?? null;
const pane = { key: 'me', prev: 'me', morph: 1, yaw: 0, pitch: 0, drag: null as null | { x: number; y: number; yaw: number; pitch: number }, born: 0, lens: 0, cells: [] as string[] };
type Grid = { size: number; cw: number; ch: number; cols: number; rows: number; ox: number; oy: number; mask: Uint8Array; lum: Float32Array };
let grid: Grid | null = null;
const winTexts: Record<string, [string, string, string]> = {};
const paneTexts: Record<string, string> = {};

/** The entry's own words, laid out cell by cell; wide (CJK) characters take two cells. */
function cellsOf(text: string) {
  const cells: string[] = [];
  for (const ch of graphemes(text.replace(/\s+/g, ' ') + ' ')) { if (isWide(ch)) cells.push(ch, ''); else cells.push(ch); }
  return cells;
}
function sizePane() {
  if (!pc) return;
  const r = pc.getBoundingClientRect();
  if (!r.width) { grid = null; return; }
  pc.width = Math.round(r.width * DPR); pc.height = Math.round(r.height * DPR);
  const size = 8.5; mctx.font = font(size);
  const cw = mctx.measureText('M').width, ch = 10;
  const cols = Math.floor((r.width - 16) / cw), rows = Math.floor((r.height - 12) / ch);
  grid = { size, cw, ch, cols, rows, ox: (r.width - cols * cw) / 2, oy: (r.height - rows * ch) / 2 + 2, mask: new Uint8Array(cols * rows), lum: new Float32Array(cols * rows) };
}
async function setFocus(key: string) {
  if (!key || key === pane.key) return;
  await loadLogo(key);
  if (key === pane.key) return;
  pane.prev = pane.morph < 0.5 ? pane.prev : pane.key; pane.key = key; pane.morph = 0;
  pane.cells = cellsOf(paneTexts[key] ?? ''); pane.born = t;
  const [a, b, c] = winTexts[key] ?? ['', '', ''];
  for (const [id, s] of [['win-title', a], ['win-meta', b], ['win-foot', c]] as const) {
    const el = document.getElementById(id); if (!el) continue;
    const node = el.firstChild as (Text & { _o?: string }) | null;
    if (node) { node.data = s; node._o = s; } else el.textContent = s;
    scramble(el, { dur: 400 });
  }
  const hint = document.getElementById('win-hint'), foot = hint?.parentElement;
  if (hint && foot) hint.textContent = key === 'me' ? foot.dataset.hintHover! : foot.dataset.hintRotate!;
  if (pc) pc.style.cursor = key === 'me' ? 'crosshair' : 'grab';
  document.querySelectorAll('.entry.focus').forEach((x) => x.classList.remove('focus'));
  document.querySelector(`.entry[data-logo="${key}"]`)?.classList.add('focus');
}

function renderPane() {
  if (!pc || !pctx || !grid) return;
  const r = pc.getBoundingClientRect();
  if (r.bottom < 0 || r.top > H) return;
  const { cols, rows, cw, ch, mask, lum } = grid;
  pane.morph = Math.min(1, pane.morph + 1 / 50);
  const m = smooth(pane.morph), isPhoto = (k: string) => !!logos[k]?.img;
  if (!logos[pane.key] || !logos[pane.prev]) return;
  // the portrait and the logos are different kinds of thing: rather than morph, the frame refreshes
  const swap = isPhoto(pane.prev) !== isPhoto(pane.key) && pane.morph < 1;
  const src = swap ? (m < 0.5 ? pane.prev : pane.key) : pane.key;
  const A = logoSDF(logos[pane.prev]!), B = logoSDF(logos[pane.key]!);
  const sdf: SDF = swap ? logoSDF(logos[src]!) : m >= 1 ? B : (x, y, z) => { const a = A(x, y, z), b = B(x, y, z); return [mix(a[0], b[0], m), m < 0.5 ? a[1] : b[1]]; };
  const photo = isPhoto(src);
  const yaw = photo ? 0 : (pane.drag ? 0 : Math.sin(t * 0.45) * 0.75) + pane.yaw, pitch = photo ? 0 : 0.12 + Math.sin(t * 0.3) * 0.08 + pane.pitch;
  const cy = Math.cos(yaw), sny = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const inv = (x: number, y: number, z: number): [number, number, number] => { const y1 = cp * y + sp * z, z1 = -sp * y + cp * z; return [cy * x - sny * z1, y1, sny * x + cy * z1]; };
  const [dx, dy, dz] = inv(0, 0, -1), L = inv(-0.5, 0.6, 0.62), ll = Math.hypot(...L);
  L[0] /= ll; L[1] /= ll; L[2] /= ll;
  const scale = Math.min(cols * cw, rows * ch) / 2 / 1.08;
  if (photo) { // the portrait covers the whole frame, framed on the face
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
      lum[i] = mask[i] ? clamp(Math.pow(l / (al || 1), 1.2), 0, 1) : 0;
    }
  } else for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) {
    const i = rr * cols + c, vx = ((c + 0.5 - cols / 2) * cw) / scale, vy = (-(rr + 0.5 - rows / 2) * ch) / scale;
    mask[i] = 0; lum[i] = 0;
    if (vx * vx + vy * vy > 2.3) continue;
    const [ox, oy, oz] = inv(vx, vy, 2);
    for (let k = 0, tt = 0.5; k < 64 && tt < 3.5; k++) {
      const px = ox + dx * tt, py = oy + dy * tt, pz = oz + dz * tt, [d, ly] = sdf(px, py, pz);
      if (d < 0.006) {
        const e = 0.012, f = (a: number, b: number, cc: number) => sdf(a, b, cc)[0];
        const a = f(px + e, py - e, pz - e), b = f(px - e, py - e, pz + e), q = f(px - e, py + e, pz - e), w = f(px + e, py + e, pz + e);
        let nx = a - b - q + w, ny = -a - b + q + w, nz = -a + b - q + w;
        const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
        const diff = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), rim = Math.pow(1 - Math.abs(nx * dx + ny * dy + nz * dz), 3);
        mask[i] = 1 + ly; lum[i] = clamp(0.25 + diff * 0.75 + rim * 0.2, 0, 1);
        break;
      }
      tt += d * 0.8;
    }
  }
  // outlines where the mark meets the plate, and where the plate meets the void
  let own = 0;
  const at = (x: number, y: number) => { const v = x < 0 || y < 0 || x >= cols || y >= rows ? 0 : mask[y * cols + x]!; return own === 1 ? +(v === 1) : +(v > 0); };
  const edge = (c: number, rr: number) => {
    own = mask[rr * cols + c]!;
    if (at(c - 1, rr) && at(c + 1, rr) && at(c, rr - 1) && at(c, rr + 1)) return null;
    const gx = at(c + 1, rr) - at(c - 1, rr) + 0.5 * (at(c + 1, rr + 1) - at(c - 1, rr + 1) + at(c + 1, rr - 1) - at(c - 1, rr - 1));
    const gy = at(c, rr + 1) - at(c, rr - 1) + 0.5 * (at(c + 1, rr + 1) - at(c + 1, rr - 1) + at(c - 1, rr + 1) - at(c - 1, rr - 1));
    if (!gx && !gy) return '·';
    let an = Math.atan2(gy, gx); if (an < 0) an += Math.PI;
    return ['|', '/', '_', '\\', '|'][Math.round(an / (Math.PI / 4))]!;
  };
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
    if (mask[i]) {
      const e = photo ? null : edge(c, rr);
      if (e) { chr = e; color = PRIMARY; a = 0.95; }
      else if (photo) { // a portrait needs real darks: shadows thin out to dots, then to nothing
        const l = lum[i]!;
        if (lk > 0.08) { chr = RAMP[Math.round(l * (RAMP.length - 1))]!; color = lk > 0.3 ? PRIMARY : FG; a = 0.35 + 0.65 * Math.max(l, lk); }
        else { if (l < 0.16) chr = ' '; else if (l < 0.3 || chr === ' ') chr = '·'; color = FG; a = 0.15 + Math.pow(l, 1.15) * 0.85; }
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
    pctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    pctx.drawImage(g.c, x - g.pad, y + grid.size - g.asc - g.pad, g.w, g.h);
  }
  pctx.globalAlpha = 1;
}

// ─── which entry is being read ────────────────────────────────────────────
let hovered: Element | null = null;
const focusables = [...document.querySelectorAll<HTMLElement>('[data-logo]')];
function focusFromScroll() {
  if (hovered || !grid) return;
  const left = document.documentElement.scrollHeight - H - scrollY;
  const line = mix(H * 0.42, H * 0.9, clamp(1 - left / (H * 0.5), 0, 1));
  let key = 'me';
  for (const el of focusables) if (el.getBoundingClientRect().top < line) key = el.dataset.logo!;
  void setFocus(key);
}

// ─── wiring ───────────────────────────────────────────────────────────────
function measure() {
  DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  fx.width = Math.round(W * DPR); fx.height = Math.round(H * DPR);
}
let lastW = 0, relayout = 0;
function layout() {
  gcache.clear();
  measure();
  initParticles();
  layoutName();
  sizePane();
  lastW = W;
}

let still = false;
export async function start(reduced = false) {
  still = reduced;
  await document.fonts.load(font(15)).catch(() => {});
  for (const el of focusables) {
    winTexts[el.dataset.logo!] = JSON.parse(el.dataset.win || '[]');
    paneTexts[el.dataset.logo!] = el.dataset.logo === 'me' ? aboutEl?.textContent ?? '' : (el.querySelector(':scope > div')?.textContent ?? '');
  }
  if (still) { measure(); sizePane(); lastW = W; } else layout();
  if (pc) { await loadLogo('me'); pane.cells = cellsOf(paneTexts.me ?? ''); pane.born = -1e3; }
  if (!still) { document.documentElement.classList.add('fx'); aboutEl?.classList.add('pouring'); }

  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (pane.drag) { pane.yaw = pane.drag.yaw + (e.clientX - pane.drag.x) * 0.01; pane.pitch = clamp(pane.drag.pitch + (e.clientY - pane.drag.y) * 0.01, -1, 1); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
  pc?.addEventListener('pointerdown', (e) => { if (!logos[pane.key]?.img) { pane.drag = { x: e.clientX, y: e.clientY, yaw: pane.yaw, pitch: pane.pitch }; pc.setPointerCapture(e.pointerId); pc.style.cursor = 'grabbing'; } });
  addEventListener('pointerup', () => { if (pane.drag) { pane.drag = null; if (pc) pc.style.cursor = 'grab'; } });
  for (const el of document.querySelectorAll<HTMLElement>('.entry[data-logo]')) {
    el.addEventListener('pointerenter', () => { hovered = el; void setFocus(el.dataset.logo!); });
    el.addEventListener('pointerleave', () => { hovered = null; focusFromScroll(); });
    el.addEventListener('focusin', () => void setFocus(el.dataset.logo!));
  }
  addEventListener('scroll', focusFromScroll, { passive: true });
  addEventListener('resize', () => {
    if (still) { measure(); sizePane(); return; }
    const w = W;
    measure();
    if (Math.abs(w - W) < 2) { // height-only (mobile URL bar): keep everything, just re-read the paragraph
      if (aboutEl) slots = charBoxes(aboutEl).filter((c) => c.ch !== '\n'); return;
    }
    clearTimeout(relayout); relayout = window.setTimeout(layout, 120);
  });
  // a keyboard user tabbing into the paragraph gets it immediately
  aboutEl?.addEventListener('focusin', () => { if (!poured) scrollTo({ top: Math.max(scrollY, pourDist), behavior: 'instant' }); });
  // content above can move (fonts, an opened entry): re-read the geometry, re-sample the name only if it moved
  if (!still) new ResizeObserver(() => {
    if (W !== lastW) return;
    if (aboutEl) slots = charBoxes(aboutEl).filter((c) => c.ch !== '\n');
    const b = nameEl.getBoundingClientRect();
    if (`${b.left}|${b.top + scrollY}|${Math.ceil(b.width)}|${Math.ceil(b.height)}` !== nameBox) layoutName();
    if (aboutSection) pourDist = Math.max(320, aboutSection.getBoundingClientRect().top + scrollY - H * 0.4);
  }).observe(document.body);

  let last = performance.now();
  const frame = (now: number) => {
    const dt = clamp((now - last) / 1000, 0, 0.05); last = now;
    if (!still) t += dt;
    if (!pane.drag && Math.abs(pane.yaw) > 0.001) pane.yaw *= 0.97;
    sy = scrollY;
    if (!still) drawParticles();
    if (still) { pane.morph = 1; pane.born = t - 10; }
    renderPane();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  focusFromScroll();
}
