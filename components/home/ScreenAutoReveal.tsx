"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * On devices with no hover, the still reveal would never be seen. After the
 * lamp-up, this runs the reveal once (treated → real frame → treated) so a
 * phone visitor sees the site's signature interaction explain itself.
 * Skipped entirely when the visitor prefers reduced motion; they get the
 * static treated frame, and a tap still reveals through focus-within.
 */
export function ScreenAutoReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const noHover = window.matchMedia("(hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!noHover || reduced) return;
    const on = window.setTimeout(() => el.classList.add("is-revealed"), 2400);
    const off = window.setTimeout(() => el.classList.remove("is-revealed"), 5200);
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} tabIndex={0}>
      {children}
    </div>
  );
}
