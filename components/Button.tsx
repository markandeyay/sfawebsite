import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

const base =
  "label inline-flex items-center justify-center min-h-12 px-6 py-3 no-underline transition-[color,background-color,border-color]";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-carolina",
  secondary: "border border-ink text-ink hover:border-carolina hover:text-carolina",
};

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}

/** Solid ink button. Used sparingly; most actions are arrow links. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
}: ButtonLinkProps) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
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
