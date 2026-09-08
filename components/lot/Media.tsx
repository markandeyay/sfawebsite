/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import type { Film } from "@/content/types";
import { formatCatalogNumber } from "@/content";

/* A still as a frame of 35 mm: perforated rails either side, the edge
   print in the margin. The stills are the club's real frames, shown as
   shot. A film with no frame gets black leader with the slate fields
   written on it. */
export function Media({
  film,
  rot = 0,
  cursor,
  size = "card",
  priority = false,
  drift,
  cap,
  edge,
  className = "",
  children,
}: {
  film: Film;
  rot?: number;
  cursor?: string;
  size?: "card" | "full";
  priority?: boolean;
  drift?: number;
  cap?: ReactNode;
  /** the edge print; defaults to the film's own codes */
  edge?: [string, string];
  className?: string;
  children?: ReactNode;
}) {
  const src = film.still ? (size === "card" ? film.still.original.replace(/\.webp$/, "-sm.webp") : film.still.original) : null;
  const [w, h] = size === "card" ? [640, 360] : [1280, 720];
  const no = formatCatalogNumber(film.no);
  const [e1, e2] = edge ?? [`SFA ▸ ${film.year} ▸ ${String(film.no).padStart(2, "0")}A`, `No. ${no}`];
  return (
    <figure
      className={`media ${className}`}
      data-media={src ? "" : undefined}
      data-cursor={cursor}
      data-drift={drift}
      data-tilt={rot ? "" : undefined}
      style={{ "--frame-rot": `${rot}deg` } as CSSProperties}
    >
      <div className="media__film">
        <div className="media__frame">
          {src ? (
            <img
              className="media__img"
              src={src}
              alt={`Frame from ${film.title}`}
              width={w}
              height={h}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
            />
          ) : (
            <div className="media__leader" role="img" aria-label={`${film.title}: no frame available`}>
              <span className="k">Leader — festival only</span>
              <span className="big">{film.title}</span>
              <span className="k">No. {no} — {film.director}</span>
            </div>
          )}
          {children}
        </div>
        <div className="media__edge" aria-hidden="true">
          <span>{e1}</span>
          <span className="n">{e2}</span>
        </div>
      </div>
      {cap !== undefined ? <figcaption className="media__cap">{cap}</figcaption> : null}
    </figure>
  );
}
