import type { CSSProperties } from "react";

export type BandItem = { b: string } | { em: string };

/* A strip of 35 mm lying across the seam between two sections:
   perforations top and bottom, the words in the frames, frame lines
   between them. Two rows running opposite ways read as two strips. */
export function Band({
  tone,
  rot,
  rows,
}: {
  tone: "ink" | "rec" | "paper" | "caro" | "navy" | "flare";
  rot: number;
  rows: Array<{ speed: number; items: BandItem[] }>;
}) {
  return (
    <div className={`band band--${tone}`} data-band style={{ "--rot": `${rot}deg` } as CSSProperties} aria-hidden="true">
      {rows.map((row, i) => (
        <div className="band__row" data-band-row data-speed={row.speed} key={i}>
          <div className="band__set" data-band-set>
            {row.items.map((it, j) =>
              "b" in it ? (
                <span key={j} style={{ display: "contents" }}>
                  <b>{it.b}</b><span className="dot" />
                </span>
              ) : (
                <span key={j} style={{ display: "contents" }}>
                  <em>{it.em}</em><span className="dot" />
                </span>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
