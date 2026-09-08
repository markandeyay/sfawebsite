import type { CSSProperties } from "react";

/* A film can label: typed keys, hand-written values, taped on at an
   angle. Every value is existing data. */
export function CanLabel({
  rows,
  rot = -3,
  inline = false,
  className = "",
}: {
  rows: [string, string][];
  rot?: number;
  inline?: boolean;
  className?: string;
}) {
  return (
    <span className={`can ${inline ? "can--inline" : ""} ${className}`} aria-hidden="true" data-can style={{ "--rot": `${rot}deg` } as CSSProperties}>
      {rows.map(([k, v]) => (
        <span key={k}><i>{k}</i><b>{v}</b></span>
      ))}
    </span>
  );
}
