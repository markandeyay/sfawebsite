// Server component. Splits `text` into words (span.split-word, never broken across lines) and glyphs
// (span.split-glyph, aria-hidden) so app/motion.css can stagger the glyphs when the enclosing Reveal
// gets "is-in". The outer element carries aria-label={text}, so assistive tech reads the whole string.
//
// Engineered irregularity (brief 4.6): every glyph rests at rotate(--rot) translateY(--dy), about a
// degree and a couple of hundredths of an em, deterministic from `seed` + glyph index. That resting
// tilt is the point; the animation is only how it arrives.
//
// Pair with Reveal: <Reveal as="h1" seed="hero"><SplitText text="FDOC" seed="fdoc" /></Reveal>

import { createElement, type CSSProperties, type JSX, type ReactNode } from 'react';
import { jitter } from '@/lib/hash';

export type SplitTextProps = {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  /** defaults to the text itself */
  seed?: string;
  [attr: string]: unknown;
};

export function SplitText({ text, as = 'span', className, seed, ...rest }: SplitTextProps) {
  const s = seed ?? text;
  const words = text.split(/\s+/).filter(Boolean);
  const nodes: ReactNode[] = [];
  let i = 0;
  words.forEach((word, w) => {
    if (w > 0) nodes.push(' ');
    const glyphs = Array.from(word).map((ch) => {
      const k = i++;
      const style = {
        '--i': k,
        '--rot': `${jitter(`${s}:${k}:rot`, -1, 1).toFixed(2)}deg`,
        '--dy': `${jitter(`${s}:${k}:dy`, -0.02, 0.02).toFixed(3)}em`,
      } as CSSProperties;
      return (
        <span key={k} className="split-glyph" aria-hidden="true" style={style}>
          {ch}
        </span>
      );
    });
    nodes.push(
      <span key={`w${w}`} className="split-word">
        {glyphs}
      </span>,
    );
  });
  return createElement(
    as,
    { ...rest, className: ['split', className].filter(Boolean).join(' '), 'aria-label': text },
    ...nodes,
  );
}
