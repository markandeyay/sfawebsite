'use client';

// Momentum scrolling (brief 4.3): Lenis, duration 1.05 s, expo-out (the same curve as --ease-out).
// One rAF loop, paused while the tab is hidden. Feeds lib/scroll.ts so nothing else listens to scroll.
// Under reduced motion (the -no-motion root class, or the media query flipping while mounted) Lenis is
// destroyed and the broadcast falls back to lib/scroll.ts's single native listener.
// Anchor links stay native: the browser jumps and moves focus, Lenis re-syncs from the native scroll event.
// Mount once, in app/layout.tsx. A second mount is a no-op.

import { useEffect } from 'react';
import Lenis from 'lenis';
import { EASE_FN } from '@/lib/motion';
import { driveScroll, type ScrollDriver } from '@/lib/scroll';

const NO_MOTION = '-no-motion';
let mounted = false;

export default function SmoothScroll(): null {
  useEffect(() => {
    if (mounted) return;
    mounted = true;

    const root = document.documentElement;
    root.setAttribute('data-motion-ready', '');
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    let lenis: Lenis | null = null;
    let driver: ScrollDriver | null = null;
    let frame = 0;

    const loop = (time: number) => {
      lenis?.raf(time);
      frame = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (!frame && lenis && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        duration: 1.05,
        easing: EASE_FN.out,
        autoRaf: false,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
      });
      const d = driveScroll();
      driver = d;
      lenis.on('scroll', (l) => d.push(l.scroll, l.progress, l.direction));
      startLoop();
    };
    const stop = () => {
      stopLoop();
      driver?.release();
      driver = null;
      lenis?.destroy();
      lenis = null;
    };
    const sync = () => {
      if (mq.matches || root.classList.contains(NO_MOTION)) stop();
      else start();
    };
    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    sync();
    mq.addEventListener('change', sync);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mq.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
      mounted = false;
    };
  }, []);
  return null;
}
