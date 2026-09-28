// Runs the effects engine off the main thread, on canvases transferred from the page.
import { createEngine, type Init, type Msg } from './fx-engine';

let engine: ReturnType<typeof createEngine> | null = null;
const queue: Msg[] = [];
self.onmessage = (e: MessageEvent<Init | Msg>) => {
  const m = e.data;
  if (m.type === 'init') {
    engine = createEngine(m, (out) => self.postMessage(out));
    for (const q of queue.splice(0)) engine.handle(q);
  } else if (engine) engine.handle(m);
  else queue.push(m);
};
