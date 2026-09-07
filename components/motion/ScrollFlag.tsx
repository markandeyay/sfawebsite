'use client';

// Sets data-scrolled="" on <html> once the page has scrolled past `threshold` px, and removes it above.
// Style the nav with html[data-scrolled] .site-nav { ... }. Reads the one scroll broadcast; adds no listener.

import { useEffect } from 'react';
import { subscribeScroll } from '@/lib/scroll';

export default function ScrollFlag({ threshold = 24 }: { threshold?: number }): null {
  useEffect(() => {
    const root = document.documentElement;
    let on: boolean | null = null;
    const unsubscribe = subscribeScroll(({ y }) => {
      const next = y > threshold;
      if (next === on) return;
      on = next;
      if (next) root.setAttribute('data-scrolled', '');
      else root.removeAttribute('data-scrolled');
    });
    return () => {
      unsubscribe();
      root.removeAttribute('data-scrolled');
    };
  }, [threshold]);
  return null;
}
