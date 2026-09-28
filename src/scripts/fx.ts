// The main-thread half of the home page effects: measures the text once, forwards input, and hands the
// drawing to a worker (OffscreenCanvas). Without worker canvases, the same engine runs here instead.
import type { CharBox, Init, Layout, Msg, Out } from './fx-engine';

const scramble = (el: Element, o?: { dur?: number }) => (window as unknown as { ccScramble?: (el: Element, o?: { dur?: number }) => void }).ccScramble?.(el, o);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const segmenter = new Intl.Segmenter();
const graphemes = (s: string) => Array.from(segmenter.segment(s), (g) => g.segment);
const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

const root = getComputedStyle(document.documentElement);
const MONO = root.getPropertyValue('--mono').trim();
const fx = document.getElementById('fx') as HTMLCanvasElement;
const nameEl = document.getElementById('name')!;
const aboutEl = document.querySelector<HTMLElement>('.about'); // the Lab page has a name but no paragraph and no window
const aboutSection = document.getElementById('about');
const pc = document.getElementById('pane') as HTMLCanvasElement | null;
const main = document.getElementById('content')!;
const mctx = document.createElement('canvas').getContext('2d')!;

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
      out.push({ ch, link, x: r.left + r.width / 2, y: r.top + scrollY + r.height / 2, base: r.top + scrollY + asc });
    }
  }
  return out;
}

// The canvas must be exactly the size it is drawn at. CSS units can't promise that on phones:
// 100vh/100lvh is the viewport with the URL bar hidden, innerHeight the one we measure with.
function sizeFx() { fx.style.width = `${innerWidth}px`; fx.style.height = `${innerHeight}px`; }

async function measure(): Promise<Layout> {
  sizeFx();
  const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
  const box = nameEl.getBoundingClientRect(), cs = getComputedStyle(nameEl);
  const name = { left: box.left, top: box.top + scrollY, w: box.width, h: box.height, font: `${cs.fontWeight} ${cs.fontSize} ${MONO}`,
    chars: charBoxes(nameEl).map((c) => ({ ch: c.ch, x: c.x, base: c.base })) };
  await yieldToMain(); // keep each measuring step a short task
  const slots = aboutEl ? charBoxes(aboutEl) : [];
  const extra = [...document.querySelectorAll('.entry > div')].map((d) => d.textContent ?? '').join(' ').replace(/\s+/g, ' ');
  const aboutSize = aboutEl ? parseFloat(getComputedStyle(aboutEl.querySelector('p')!).fontSize) : 15;
  const pourDist = aboutSection ? Math.max(320, aboutSection.getBoundingClientRect().top + scrollY - H * 0.4) : 1;
  return { W, H, dpr, name, slots, aboutSize, pourDist, extra, cap: W < 640 ? 2200 : 3200 };
}

let send: (m: Msg) => void = () => {};
function onOut(m: Out) {
  if (m.type === 'poured') { poured = m.value; aboutEl?.classList.toggle('pouring', !m.value); }
}
let poured = false;

// ─── the window's chrome, which stays in the page ────────────────────────
const winTexts: Record<string, [string, string, string]> = {};
const paneTexts: Record<string, string> = {};
const focusables = [...document.querySelectorAll<HTMLElement>('[data-logo]')];
let current = 'me', hovered: Element | null = null;
function setFocus(key: string) {
  if (!pc || key === current) return;
  current = key;
  send({ type: 'focus', key, text: paneTexts[key] ?? '' });
  const [a, b, c] = winTexts[key] ?? ['', '', ''];
  for (const [id, s] of [['win-title', a], ['win-meta', b], ['win-foot', c]] as const) {
    const el = document.getElementById(id); if (!el) continue;
    const node = el.firstChild as (Text & { _o?: string }) | null;
    if (node) { node.data = s; node._o = s; } else el.textContent = s;
    scramble(el, { dur: 400 });
  }
  const hint = document.getElementById('win-hint'), foot = hint?.parentElement;
  if (hint && foot) hint.textContent = key === 'me' ? foot.dataset.hintHover! : foot.dataset.hintRotate!;
  pc.style.cursor = key === 'me' ? 'crosshair' : 'grab';
  document.querySelectorAll('.entry.focus').forEach((x) => x.classList.remove('focus'));
  document.querySelector(`.entry[data-logo="${key}"]`)?.classList.add('focus');
}
function focusFromScroll() {
  if (hovered || !pc) return;
  const H = innerHeight, left = document.documentElement.scrollHeight - H - scrollY;
  const line = mix(H * 0.42, H * 0.9, clamp(1 - left / (H * 0.5), 0, 1));
  let key = 'me';
  for (const el of focusables) if (el.getBoundingClientRect().top < line) key = el.dataset.logo!;
  setFocus(key);
}
const paneRect = () => { if (!pc) return; const r = pc.getBoundingClientRect(); send({ type: 'paneRect', left: r.left, top: r.top, width: r.width, height: r.height }); };

export async function start(still = false) {
  await document.fonts.load(`400 15px ${MONO}`).catch(() => {});
  for (const el of focusables) {
    winTexts[el.dataset.logo!] = JSON.parse(el.dataset.win || '[]');
    paneTexts[el.dataset.logo!] = el.dataset.logo === 'me' ? aboutEl?.textContent ?? '' : (el.querySelector(':scope > div')?.textContent ?? '');
  }
  const layout = await measure();
  const fontUrl = new URL(document.querySelector<HTMLLinkElement>('link[rel=preload][as=font]')?.href ?? '', location.href).href;
  const base = {
    type: 'init' as const, ...layout, colors: { fg: root.getPropertyValue('--fg').trim(), muted: root.getPropertyValue('--muted').trim(), primary: root.getPropertyValue('--primary').trim() },
    mono: MONO, fontUrl, logosUrl: new URL(main.dataset.logos ?? '', location.href).href, portraitUrl: new URL(main.dataset.portrait ?? '', location.href).href,
    still, sy: scrollY,
  };
  const paneVisible = !!pc && pc.getBoundingClientRect().width > 0;
  const workers = 'transferControlToOffscreen' in HTMLCanvasElement.prototype && typeof Worker !== 'undefined';
  if (workers) {
    const worker = new Worker(new URL('./fx-worker.ts', import.meta.url), { type: 'module' });
    const fxOff = fx.transferControlToOffscreen(), paneOff = paneVisible ? pc!.transferControlToOffscreen() : null;
    const init: Init = { ...base, fx: fxOff, pane: paneOff };
    worker.postMessage(init, paneOff ? [fxOff, paneOff] : [fxOff]);
    worker.onmessage = (e: MessageEvent<Out>) => onOut(e.data);
    send = (m) => worker.postMessage(m);
  } else {
    const { createEngine } = await import('./fx-engine');
    const engine = createEngine({ ...base, fx, pane: paneVisible ? pc : null }, onOut);
    send = (m) => engine.handle(m);
  }
  paneRect();
  if (paneVisible) send({ type: 'focus', key: 'me', text: paneTexts.me ?? '' });
  if (!still) { document.documentElement.classList.add('fx'); aboutEl?.classList.add('pouring'); }

  // ─── input ─────────────────────────────────────────────────────────────
  let drag: { x: number; y: number } | null = null;
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    send({ type: 'mouse', x: e.clientX, y: e.clientY });
    if (drag) { send({ type: 'drag', active: true, dx: e.clientX - drag.x, dy: e.clientY - drag.y }); drag = { x: e.clientX, y: e.clientY }; }
  }, { passive: true });
  document.addEventListener('pointerleave', () => send({ type: 'mouse', x: -1e4, y: -1e4 }));
  pc?.addEventListener('pointerdown', (e) => {
    if (current === 'me') return;
    drag = { x: e.clientX, y: e.clientY }; pc.setPointerCapture(e.pointerId); pc.style.cursor = 'grabbing';
    send({ type: 'drag', active: true, dx: 0, dy: 0 });
  });
  addEventListener('pointerup', () => { if (drag) { drag = null; if (pc) pc.style.cursor = 'grab'; send({ type: 'drag', active: false }); } });
  for (const el of document.querySelectorAll<HTMLElement>('.entry[data-logo]')) {
    el.addEventListener('pointerenter', () => { hovered = el; setFocus(el.dataset.logo!); });
    el.addEventListener('pointerleave', () => { hovered = null; focusFromScroll(); });
    el.addEventListener('focusin', () => setFocus(el.dataset.logo!));
  }
  let ticking = false;
  addEventListener('scroll', () => {
    send({ type: 'scroll', sy: scrollY });
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; focusFromScroll(); paneRect(); });
  }, { passive: true });

  // geometry changes (resize, fonts, an opened entry): measure again, in the background
  let relayout = 0, lastW = innerWidth;
  const remeasure = () => { clearTimeout(relayout); relayout = window.setTimeout(async () => { send({ type: 'layout', ...(await measure()) }); paneRect(); }, 150); };
  addEventListener('resize', () => {
    sizeFx(); // immediately, so a URL bar sliding in never stretches the drawing
    if (Math.abs(innerWidth - lastW) >= 2 || !still) { lastW = innerWidth; remeasure(); }
  });
  new ResizeObserver(remeasure).observe(main);
  // a keyboard user tabbing into the paragraph gets it immediately
  aboutEl?.addEventListener('focusin', () => { if (!poured && !still) scrollTo({ top: Math.max(scrollY, layout.pourDist), behavior: 'instant' }); });
  focusFromScroll();
}
