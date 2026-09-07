'use client';

// Entrance reveal as a CSS transition (brief 4.5). Renders `as` with class "reveal reveal--<variant>";
// one shared IntersectionObserver flips "is-in" once, and "is-settled" follows when the transition is
// done so will-change layers are released. The hidden state lives in app/motion.css under the .js root
// class only, so server markup is never hidden.
//
// Irregularity (brief 4.6): with `seed`, the delay gets +0..150 ms and the ease is picked from
// --ease-out / --ease-in-out, both deterministic from the seed, so a grid's leading edge is ragged.
// A Reveal that contains SplitText glyphs does not fade as a whole; its glyphs stagger instead.

import { useEffect, useRef, type CSSProperties, type JSX, type ReactNode } from 'react';
import { jitter, pick } from '@/lib/hash';
import { DUR, STAGGER, STAGGER_CAP } from '@/lib/motion';

export type RevealVariant = 'fade' | 'rise' | 'none';

export type RevealProps = {
  as?: keyof JSX.IntrinsicElements;
  children?: ReactNode;
  /** base delay in ms */
  delay?: number;
  variant?: RevealVariant;
  /** deterministic per-instance jitter of delay and ease */
  seed?: string;
  className?: string;
  style?: CSSProperties;
  [attr: string]: unknown;
};

const THRESHOLD = 0.15;
const TALL = 0.6; // an element taller than 60% of the viewport reveals as soon as it intersects
const EASES = ['var(--ease-out)', 'var(--ease-in-out)'] as const;

// One observer for every Reveal on the page, created on first use.
let observer: IntersectionObserver | null = null;
const onEnter = new Map<Element, () => void>();

function observe(el: Element, cb: () => void): () => void {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const rootH = e.rootBounds?.height ?? window.innerHeight;
          const tall = e.boundingClientRect.height > rootH * TALL;
          if (e.intersectionRatio >= THRESHOLD || (e.isIntersecting && tall)) {
            const fn = onEnter.get(e.target);
            if (!fn) continue;
            onEnter.delete(e.target);
            observer?.unobserve(e.target);
            fn();
          }
        }
      },
      // Start slightly before the element enters from below.
      { threshold: [0, THRESHOLD], rootMargin: '0px 0px 10% 0px' },
    );
  }
  onEnter.set(el, cb);
  observer.observe(el);
  return () => {
    onEnter.delete(el);
    observer?.unobserve(el);
  };
}

export function Reveal({ as = 'div', children, delay = 0, variant = 'fade', seed, className, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const delayMs = Math.round(delay + (seed ? jitter(seed, 0, 150) : 0));
  const ease = seed ? pick(`${seed}/ease`, EASES) : undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    document.documentElement.setAttribute('data-motion-ready', '');
    const settle = () => el.classList.add('is-settled');
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      settle();
      return;
    }
    let timer = 0;
    const onEnd = (ev: TransitionEvent) => {
      if (ev.target === el) settle();
    };
    const unobserve = observe(el, () => {
      el.classList.add('is-in');
      const glyphs = el.querySelectorAll('.split-glyph').length;
      if (glyphs === 0) el.addEventListener('transitionend', onEnd);
      // Guard: settle by clock too, in case transitionend never fires (display:none, no transition, tab hidden).
      timer = window.setTimeout(settle, DUR[3] + delayMs + Math.min(glyphs, STAGGER_CAP) * STAGGER + DUR[2]);
    });
    return () => {
      unobserve();
      window.clearTimeout(timer);
      el.removeEventListener('transitionend', onEnd);
    };
  }, [delayMs]);

  const vars: Record<string, string> = {};
  if (delayMs > 0) vars['--enter-delay'] = `${delayMs}ms`;
  if (ease) vars['--enter-ease'] = ease;
  // JSX with a capitalised tag so the ref is a ref prop (react-hooks/refs cannot see through createElement).
  const Tag = as as 'div';
  return (
    <Tag
      {...(rest as object)}
      ref={ref}
      className={['reveal', `reveal--${variant}`, className].filter(Boolean).join(' ')}
      style={{ ...style, ...vars } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
