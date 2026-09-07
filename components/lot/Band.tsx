import type { CSSProperties } from "react";

export type BandItem = { b: string } | { em: string };

/* The tilted marquee tape between sections. Two rows running opposite
   ways reads as printed tape rather than a scrolling div. */
export function Band({
  tone,
  rot,
  rows,
}: {
  tone: "flare" | "paper" | "caro" | "navy";
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
