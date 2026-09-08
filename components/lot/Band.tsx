/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { Film } from "@/content/types";

export type BandItem = { b: string } | { em: string } | { frame: Film; code?: string };

/* A strip of 35 mm lying across the seam between two sections:
   perforations top and bottom, the club's own frames or leader words
   in the frames, frame lines between. Two rows running opposite ways
   read as two strips. */
export function Band({
  tone,
  rot,
  rows,
}: {
  tone: "ink" | "rec" | "paper" | "caro" | "navy";
  rot: number;
  rows: Array<{ speed: number; items: BandItem[] }>;
}) {
  return (
    <div className={`band band--${tone}`} data-band style={{ "--rot": `${rot}deg` } as CSSProperties} aria-hidden="true">
      {rows.map((row, i) => (
        <div className="band__row" data-band-row data-speed={row.speed} key={i}>
          <div className="band__set" data-band-set>
            {row.items.map((it, j) => {
              if ("frame" in it) {
                const f = it.frame;
                return (
                  <span key={j} style={{ display: "contents" }}>
                    <span className="band__frame">
                      {f.still ? (
                        <img src={f.still.original.replace(/\.webp$/, "-sm.webp")} alt="" width="640" height="360" loading="lazy" decoding="async" />
                      ) : (
                        <span className="ldr">{f.title}</span>
                      )}
                    </span>
                    <span className="band__code">{it.code ?? `SFA ▸ ${f.year} ▸ ${String(f.no).padStart(2, "0")}A`}</span>
                  </span>
                );
              }
              return "b" in it ? (
                <span key={j} style={{ display: "contents" }}>
                  <b>{it.b}</b><span className="dot" />
                </span>
              ) : (
                <span key={j} style={{ display: "contents" }}>
                  <em>{it.em}</em><span className="dot" />
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
