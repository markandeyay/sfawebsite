import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

const base =
  "label inline-flex items-center justify-center min-h-11 px-5 py-3 no-underline transition-[color,background-color,border-color]";

const variants: Record<Variant, string> = {
  primary: "bg-cream text-base hover:bg-carolina",
  secondary: "border border-cream text-cream hover:border-carolina hover:text-carolina",
};

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}

/** Buttons are verbs that say what happens. No arrows appended. */
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
