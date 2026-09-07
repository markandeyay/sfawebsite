/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import type { Film } from "@/content/types";
import { formatCatalogNumber } from "@/content";

export type Shape = "arch" | "oval" | "leaf" | "pill" | "stub" | "round";
export type Plate = "flare" | "caro" | "navy" | "gold" | "paper";

/* A still in a die-cut frame on an offset colour plate. The stills are
   the club's real frames, shown as shot; the shape and the plate are the
   only treatment. A film with no frame gets the slate leader instead. */
export function Media({
  film,
  shape = "round",
  plate,
  rot = 0,
  plateX = 14,
  plateY = 14,
  cursor,
  size = "card",
  priority = false,
  drift,
  cap,
  className = "",
  children,
}: {
  film: Film;
  shape?: Shape;
  plate?: Plate;
  rot?: number;
  plateX?: number;
  plateY?: number;
  cursor?: string;
  size?: "card" | "full";
  priority?: boolean;
  drift?: number;
  cap?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const src = film.still ? (size === "card" ? film.still.original.replace(/\.webp$/, "-sm.webp") : film.still.original) : null;
  const [w, h] = size === "card" ? [640, 360] : [1280, 720];
  return (
    <figure
      className={`media ${className}`}
      data-media={src ? "" : undefined}
      data-cursor={cursor}
      data-shape={shape === "round" ? undefined : shape}
      data-plate={plate}
      data-drift={drift}
      style={{ "--frame-rot": `${rot}deg`, "--plate-x": `${plateX}px`, "--plate-y": `${plateY}px` } as CSSProperties}
    >
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
            <span className="k">No frame — festival only</span>
            <span className="big">{film.title}</span>
            <span className="k">No. {formatCatalogNumber(film.no)} — {film.director}</span>
          </div>
        )}
        {children}
      </div>
      {cap !== undefined ? <figcaption className="media__cap">{cap}</figcaption> : null}
    </figure>
  );
}
