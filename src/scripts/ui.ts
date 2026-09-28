// Shared, tiny, runs on every page: reveals, the scramble, the nav pill, the language menu.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js');

// ─── scramble: text settles out of noise. Noise is drawn from the character's own script,
// so a CJK line never changes width while it resolves (no layout shift).
const POOLS = {
  latin: 'abcdefghijklmnopqrstuvwxyz0123456789#%&*+=/<>?',
  han: '的一是不了人我在有这中大来上国到说们为子和你地出道也时年',
  hangul: '가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허',
};
const pool = (ch: string) => (/[가-힯]/.test(ch) ? POOLS.hangul : /[぀-ヿ㐀-鿿豈-﫿]/.test(ch) ? POOLS.han : POOLS.latin);
const rnd = (s: string) => s[(Math.random() * s.length) | 0]!;
const skip = (ch: string) => /[\s\p{P}\p{S}]/u.test(ch) && !/[#%&*+=/<>?]/.test(ch);

type Scrambled = Text & { _o?: string };
const running = new WeakMap<Element, number>();
function scramble(el: Element, { dur = 650, delay = 0 } = {}) {
  if (reduced) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Scrambled[] = [];
  while (walker.nextNode()) if ((walker.currentNode as Text).data.trim()) nodes.push(walker.currentNode as Scrambled);
  for (const n of nodes) n._o ??= n.data;
  const chars = nodes.map((n) => Array.from(n._o!));
  const total = chars.reduce((s, c) => s + c.length, 0) || 1;
  const t0 = performance.now() + delay;
  running.set(el, t0);
  const tick = (now: number) => {
    if (running.get(el) !== t0) return;
    const e = now - t0;
    let idx = 0, busy = false;
    nodes.forEach((n, j) => {
      let s = '';
      for (const ch of chars[j]!) {
        const k = (e - (idx++ / total) * dur * 0.7) / 260;
        if (k >= 1 || skip(ch)) s += ch;
        else { busy = true; s += rnd(pool(ch)); }
      }
      if (n.data !== s) n.data = s;
    });
    if (busy) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// other bundles (the lazy effects) reach it here, which keeps this file free of shared chunks
(window as unknown as { ccScramble: typeof scramble }).ccScramble = scramble;

// ─── reveal subsections as they come into view
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target as HTMLElement, d = Number(el.dataset.delay) || 0;
    io.unobserve(el);
    setTimeout(() => el.classList.add('in'), d);
    if (!el.classList.contains('label') && !el.classList.contains('dino')) scramble(el.matches('.entry') ? el.querySelector('.title') ?? el : el, { delay: d }); // titles only: rewriting whole entries would re-lay them out every frame
  }
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
document.querySelectorAll('[data-scramble]').forEach((el) => scramble(el, { dur: 900 }));
document.querySelectorAll('.pill').forEach((p) => p.addEventListener('pointerenter', () => scramble(p, { dur: 180 })));
// opening highlights scrambles them in
document.querySelectorAll<HTMLDetailsElement>('details.hl').forEach((d) =>
  d.addEventListener('toggle', () => { if (d.open) scramble(d.querySelector('div')!, { dur: 700 }); }));

// ─── header: a hairline once scrolled; the nav pill follows the pointer
const header = document.getElementById('top')!;
const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const tabs = document.querySelector<HTMLElement>('.tabs')!;
const slider = tabs.querySelector<HTMLElement>('.slider')!;
const current = tabs.querySelector<HTMLElement>('a[aria-current]');
const moveSlider = (a: HTMLElement | null) => {
  if (!a) { slider.style.width = '0'; return; }
  slider.style.left = `${a.offsetLeft}px`;
  slider.style.width = `${a.offsetWidth}px`;
};
moveSlider(current);
requestAnimationFrame(() => tabs.classList.add('ready'));
tabs.querySelectorAll<HTMLElement>('a').forEach((a) => {
  a.addEventListener('pointerenter', () => { moveSlider(a); scramble(a, { dur: 200 }); });
  a.addEventListener('focus', () => moveSlider(a));
});
tabs.addEventListener('pointerleave', () => moveSlider(current));
tabs.addEventListener('focusout', () => moveSlider(current));
document.fonts?.ready.then(() => moveSlider(current));

// ─── language menu: closes on outside click and on Escape
const lang = document.querySelector<HTMLDetailsElement>('details.lang');
if (lang) {
  document.addEventListener('click', (e) => { if (lang.open && !lang.contains(e.target as Node)) lang.open = false; });
  lang.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lang.open) { lang.open = false; lang.querySelector('summary')!.focus(); } });
}
export {};
