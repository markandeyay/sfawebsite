import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "link";

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  /** primary: cream fill, base text. secondary: hairline outline. link: underlined, accent decoration. */
  variant?: Variant;
  /** Compact height, for the nav action. */
  small?: boolean;
  /** An off-site href: a plain anchor, no prefetch. Opens in the same tab; there is no page state to keep. */
  external?: boolean;
  className?: string;
}

const CLASS: Record<Variant, string> = {
  primary: "btn btn--primary",
  secondary: "btn btn--secondary",
  link: "link",
};

/**
 * The site's one action shape. Sentence case, no arrows, no icons. The
 * label names what happens ("Watch FDOC", "Message the club on Instagram").
 */
export function ButtonLink({ href, children, variant = "primary", small = false, external = false, className = "" }: ButtonLinkProps) {
  const cls = `${CLASS[variant]} ${small && variant !== "link" ? "btn--small" : ""} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
