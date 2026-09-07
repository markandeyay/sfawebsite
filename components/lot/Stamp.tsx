import type { CSSProperties, ReactNode } from "react";

/* Die-cut, double-ruled, tilted. The award seal. */
export function Stamp({
  children,
  tone,
  rot = -11,
  inline = false,
  stamp = false,
  seal = false,
  className = "",
}: {
  children: ReactNode;
  tone?: "ink" | "navy" | "caro" | "paper";
  rot?: number;
  inline?: boolean;
  /** marks it for the rack scene's landing choreography */
  stamp?: boolean;
  /** marks it for the film page's seals choreography */
  seal?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`stamp ${tone ? `stamp--${tone}` : ""} ${inline ? "stamp--inline" : ""} ${className}`}
      style={{ "--stamp-rot": `${rot}deg` } as CSSProperties}
      data-stamp={stamp ? "" : undefined}
      data-seal={seal ? "" : undefined}
    >
      {children}
    </span>
  );
}
