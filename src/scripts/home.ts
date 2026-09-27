const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// The effects are pure enhancement: they load after the page is idle, and not at all under reduced motion.
const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 300));
const whenLoaded = (fn: () => void) => (document.readyState === 'complete' ? fn() : addEventListener('load', fn, { once: true }));

if (!reduced && document.getElementById('fx')) whenLoaded(() => idle(() => void import('./fx').then((m) => m.start())));

const egg = document.querySelector('.dino');
if (egg) {
  const io = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return;
    io.disconnect();
    void import('./dino').then((m) => m.start());
  }, { rootMargin: '400px' });
  io.observe(egg);
}
export {};
