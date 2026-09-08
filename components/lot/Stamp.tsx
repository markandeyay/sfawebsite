import type { CSSProperties, ReactNode } from "react";

/* The laurel: the festival's own mark of a win, two branches around the
   category, and the festival's name under it where there is room. Kept
   under the old name so every caller stays the same. */
export function Stamp({
  children,
  tone,
  rot = -4,
  inline = false,
  stamp = false,
  seal = false,
  plate = false,
  winner = true,
  fest,
  className = "",
}: {
  children: ReactNode;
  tone?: "ink" | "navy" | "rec" | "paper";
  rot?: number;
  inline?: boolean;
  /** marks it for the awards scene's landing choreography */
  stamp?: boolean;
  /** marks it for the film page's laurel choreography */
  seal?: boolean;
  /** printed direct on a still, in paper */
  plate?: boolean;
  /** show the WINNER line above the category */
  winner?: boolean;
  /** the festival line under the category */
  fest?: string;
  className?: string;
}) {
  return (
    <span
      className={`laurel ${tone ? `laurel--${tone}` : ""} ${inline ? "laurel--inline" : ""} ${plate ? "laurel--plate" : ""} ${className}`}
      style={{ "--stamp-rot": `${rot}deg` } as CSSProperties}
      data-stamp={stamp ? "" : undefined}
      data-seal={seal ? "" : undefined}
    >
      <span className="laurel__l" aria-hidden="true"><svg viewBox="0 0 60 120"><use href="#i-laurel" /></svg></span>
      <span className="laurel__t">
        {winner ? <b>Winner</b> : null}
        {children}
        {fest ? <span className="laurel__fest">{fest}</span> : null}
      </span>
      <span className="laurel__r" aria-hidden="true"><svg viewBox="0 0 60 120"><use href="#i-laurel" /></svg></span>
    </span>
  );
}
