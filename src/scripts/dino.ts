// The easter egg at the bottom: an offline dino, typed out in the page's own font.
const DINO = ['   __ ', '  /o_>', '_/ /  '];
const LEGS = [' /  \\ ', ' |  | ', ' \\  \\ '];
const CACTI = [['\\|/', ' | '], [' |_ ', '_|  ', ' |  '], ['| |', '|_|', ' | '], [' | |', '\\|/|', ' | |']];
const DS = 11, DL = 12; // font size, line height
const rnd = <T,>(a: T[]) => a[(Math.random() * a.length) | 0]!;

export function start() {
  const wrap = document.querySelector<HTMLElement>('.dino')!, btn = document.getElementById('dino-btn')!;
  const cv = document.getElementById('dino') as HTMLCanvasElement, ctx = cv.getContext('2d')!, hint = document.getElementById('dino-hint')!;
  const css = getComputedStyle(document.documentElement);
  const FG = css.getPropertyValue('--fg').trim(), MUTED = css.getPropertyValue('--muted').trim(), PRIMARY = css.getPropertyValue('--primary').trim();
  const BORDER = css.getPropertyValue('--border').trim(), MONO = css.getPropertyValue('--mono').trim();
  const d = { state: 'idle' as 'idle' | 'run' | 'over', y: 0, vy: 0, obs: [] as { x: number; s: string[] }[], speed: 0, dist: 0, next: 0,
    best: Number(localStorage.getItem('dino-best')) || 0, ground: [] as [number, string][], w: 0, h: 0 };
  let dpr = 1, visible = false, raf = 0, last = 0;

  const size = () => {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); d.w = r.width; d.h = r.height;
    d.ground = Array.from({ length: Math.round(r.width / 30) }, () => [Math.random() * r.width, rnd([...".,'`-"])]);
    draw();
  };
  const say = (key: 'idle' | 'run' | 'over') => { hint.innerHTML = wrap.dataset[key]!; };
  const press = () => {
    if (d.state !== 'run') { Object.assign(d, { state: 'run', y: 0, vy: 0, obs: [], speed: 300, dist: 0, next: 260 }); say('run'); loop(); return; }
    if (d.y === 0) d.vy = 330;
  };
  btn.addEventListener('click', press);
  addEventListener('keydown', (e) => {
    if (!visible || !['Space', 'ArrowUp'].includes(e.code) || e.repeat) return;
    const t = e.target as HTMLElement;
    if (t !== btn && t !== document.body && t.closest('input, textarea, select, summary, a, button')) return;
    e.preventDefault(); press();
  });

  function step(dt: number) {
    const cw = measure(), gy = d.h - 12, X = 24;
    d.speed += dt * 5; d.dist += d.speed * dt;
    d.vy -= 1150 * dt; d.y = Math.max(0, d.y + d.vy * dt); if (d.y === 0) d.vy = Math.max(0, d.vy);
    for (const o of d.obs) o.x -= d.speed * dt;
    d.obs = d.obs.filter((o) => o.x > -40);
    d.next -= d.speed * dt;
    if (d.next <= 0) { d.obs.push({ x: d.w + 10, s: rnd(CACTI) }); d.next = 220 + Math.random() * 360 + d.speed * 0.35; }
    // hit test on the characters' boxes, a little forgiving
    const dx0 = X + cw * 1.5, dx1 = X + cw * 4.5, dyb = gy - d.y;
    for (const o of d.obs) {
      const ox0 = o.x + cw * 0.5, ox1 = o.x + (o.s[0]!.length - 0.5) * cw, oyt = gy - o.s.length * DL + 4;
      if (dx1 > ox0 && dx0 < ox1 && dyb > oyt) {
        d.state = 'over';
        const sc = Math.floor(d.dist / 40);
        if (sc > d.best) { d.best = sc; localStorage.setItem('dino-best', String(sc)); }
        say('over');
      }
    }
  }
  let cwCache = 0;
  const measure = () => { if (!cwCache) { ctx.font = `${DS}px ${MONO}`; cwCache = ctx.measureText('M').width; } return cwCache; };
  function draw() {
    const gy = d.h - 12, X = 24;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, d.w, d.h);
    ctx.font = `${DS}px ${MONO}`; ctx.textBaseline = 'alphabetic';
    const type = (rows: string[], x: number, bottom: number, col: string, alpha = 1) => {
      ctx.fillStyle = col; ctx.globalAlpha = alpha;
      rows.forEach((row, j) => ctx.fillText(row, Math.round(x), Math.round(bottom - (rows.length - 1 - j) * DL)));
    };
    ctx.globalAlpha = 1; ctx.fillStyle = BORDER; ctx.fillRect(0, gy + 3, d.w, 1);
    for (const [gx, ch] of d.ground) type([ch], ((gx - d.dist) % d.w + d.w) % d.w, gy + 11, MUTED, 0.6);
    for (const o of d.obs) type(o.s, o.x, gy, PRIMARY);
    const legs = d.state !== 'run' || d.y > 0 ? LEGS[2]! : LEGS[Math.floor(d.dist / 26) % 2]!;
    const body = d.state === 'over' ? [DINO[0]!, DINO[1]!.replace('o', 'x'), DINO[2]!] : DINO;
    type([...body, legs], X, gy - d.y, FG);
    const pad = (n: number) => String(n).padStart(5, '0');
    ctx.textAlign = 'right'; type([`HI ${pad(d.best)}  ${pad(Math.floor(d.dist / 40))}`], d.w, gy - 48, MUTED); ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
  function loop() {
    cancelAnimationFrame(raf); last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (d.state === 'run') step(dt);
      draw();
      if (d.state === 'run' && visible) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; if (visible && d.state === 'run') loop(); }).observe(wrap);
  new ResizeObserver(size).observe(cv);
}
