import Link from "next/link";
import type { ReactNode } from "react";

interface ArrowLinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}

/** A long thin arrow and an uppercase label: the site's action link. */
export function ArrowLink({ href, children, external = false, className = "" }: ArrowLinkProps) {
  const inner = (
    <>
      <svg viewBox="0 0 52 12" aria-hidden="true" className="arrow-link__arrow">
        <path d="M0 6h50M45 1l5 5-5 5" />
      </svg>
      <span className="label">{children}</span>
    </>
  );
  const cls = `arrow-link ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
