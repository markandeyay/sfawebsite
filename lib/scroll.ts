// The ONE scroll broadcast (brief 4.4). Nothing else in the codebase adds a 'scroll' listener.
//
// Source, in priority order:
//   1. Lenis, while components/motion/SmoothScroll is mounted: it pushes through driveScroll().
//      (Lenis owns the only native 'scroll' listener in that case and re-emits native scrolls too.)
//   2. Otherwise ONE passive native 'scroll' listener on window, coalesced to one publish per frame.
//
// Subscribers receive { y, dy, progress, direction } and are called once immediately with the current state.
// Safe to import on the server: nothing touches window until a subscriber or driver exists in the browser.

export type ScrollState = {
  /** window.scrollY (or Lenis's animated scroll) in px */
  y: number;
  /** change since the previous broadcast */
  dy: number;
  /** 0 at the top, 1 at the bottom */
  progress: number;
  direction: 1 | -1 | 0;
};
export type ScrollListener = (s: ScrollState) => void;
export type ScrollDriver = {
  push(y: number, progress?: number, direction?: 1 | -1 | 0): void;
  release(): void;
};

const listeners = new Set<ScrollListener>();
let state: ScrollState = { y: 0, dy: 0, progress: 0, direction: 0 };
let driver: ScrollDriver | null = null;
let detachNative: (() => void) | null = null;

const inBrowser = () => typeof window !== 'undefined';

function limit(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function compute(y: number, progress?: number, direction?: 1 | -1 | 0): ScrollState {
  const dy = y - state.y;
  let p = progress;
  if (p === undefined) {
    const l = limit();
    p = l > 0 ? Math.min(1, Math.max(0, y / l)) : 0;
  }
  return { y, dy, progress: p, direction: direction ?? (dy > 0 ? 1 : dy < 0 ? -1 : 0) };
}

function publish(y: number, progress?: number, direction?: 1 | -1 | 0): void {
  state = compute(y, progress, direction);
  listeners.forEach((fn) => fn(state));
}

function attachNative(): void {
  if (detachNative || driver || !inBrowser()) return;
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      publish(window.scrollY);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  detachNative = () => {
    window.removeEventListener('scroll', onScroll);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    detachNative = null;
  };
}

function reconcile(): void {
  if (driver || listeners.size === 0) detachNative?.();
  else attachNative();
}

/** Subscribe to scroll state. Called once immediately. Returns the unsubscribe function. */
export function subscribeScroll(fn: ScrollListener): () => void {
  listeners.add(fn);
  reconcile();
  if (inBrowser() && !driver) state = compute(window.scrollY);
  fn(state);
  return () => {
    listeners.delete(fn);
    reconcile();
  };
}

/** Current scroll state without subscribing. */
export function getScroll(): ScrollState {
  return state;
}

/**
 * Take over as the scroll source (used by SmoothScroll for Lenis). While a driver is held the
 * native listener is detached; release() hands the broadcast back to native scroll.
 * Only one driver exists at a time; taking a new one releases the previous.
 */
export function driveScroll(): ScrollDriver {
  driver?.release();
  const d: ScrollDriver = {
    push(y, progress, direction) {
      if (driver === d) publish(y, progress, direction);
    },
    release() {
      if (driver !== d) return;
      driver = null;
      reconcile();
    },
  };
  driver = d;
  reconcile();
  return d;
}
