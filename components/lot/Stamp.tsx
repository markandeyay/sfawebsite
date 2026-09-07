import type { CSSProperties, ReactNode } from "react";

/* The laurel: the festival's own mark of a win, two branches around the
   category. Kept under the old name so every caller stays the same. */
export function Stamp({
  children,
  tone,
  rot = -6,
  inline = false,
  stamp = false,
  seal = false,
  plate = false,
  winner = true,
  className = "",
}: {
  children: ReactNode;
  tone?: "ink" | "navy" | "rec" | "paper";
  rot?: number;
  inline?: boolean;
  /** marks it for the rack scene's landing choreography */
  stamp?: boolean;
  /** marks it for the film page's laurel choreography */
  seal?: boolean;
  /** on a paper plate, for sitting on a photograph */
  plate?: boolean;
  /** show the WINNER line above the category */
  winner?: boolean;
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
      </span>
      <span className="laurel__r" aria-hidden="true"><svg viewBox="0 0 60 120"><use href="#i-laurel" /></svg></span>
    </span>
  );
}
