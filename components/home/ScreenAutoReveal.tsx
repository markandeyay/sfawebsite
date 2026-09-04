"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * On devices with no hover, the still reveal would never be seen. After the
 * lamp-up, this runs the reveal once (treated → real frame → treated) so a
 * phone visitor sees the site's signature interaction explain itself.
 * Skipped entirely when the visitor prefers reduced motion; they get the
 * static treated frame, and a tap still reveals through focus-within.
 */
interface Props {
  children: ReactNode;
  className?: string;
  /** The screen is a link to the film, so it has a role and a name. */
  href: string;
  label: string;
}

export function ScreenAutoReveal({ children, className = "", href, label }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

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
    <Link ref={ref} href={href} aria-label={label} className={`reveal ${className}`}>
      {children}
    </Link>
  );
}
