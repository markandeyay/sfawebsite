/* eslint-disable @next/next/no-img-element */
// Plain <img>, not next/image: the treated files are lossless two-colour
// webp written by scripts/process-stills.ts and next/image would recompress
// them; the originals are already 1280x720 webp. See scripts/DITHER_REPORT.md.
import type { CSSProperties } from "react";
import type { Still as StillPaths } from "@/content/types";

export type StillSize = "card" | "full";

export interface StillProps {
  still: StillPaths;
  /** Describes the frame for assistive tech, e.g. "Frame from FDOC". Empty when decorative. */
  alt: string;
  /** card = the 640x360 treated rendition; full = 1280x720. Originals are always 1280x720. */
  size?: StillSize;
  /** Load eagerly for the hero and the film page facade. */
  priority?: boolean;
  /** Force the untreated frame (route agents toggle this, e.g. a touch tap). */
  revealed?: boolean;
  className?: string;
  /** For --reveal-dur / --reveal-delay from the caller. */
  style?: CSSProperties;
}

/** The card rendition of a treated still follows a fixed naming rule. */
export function cardRendition(treated: string): string {
  return treated.replace(/-treated\.webp$/, "-treated-sm.webp");
}

/**
 * The two-layer dither reveal. The halftone-treated still (base + carolina)
 * is the resting state; the untreated frame sits above it at opacity 0 and
 * crossfades in on hover, focus, focus-within, or .is-revealed. The CSS
 * lives in app/globals.css under .frame; under reduced motion the swap is
 * instant. Both layers share dimensions, so the reveal cannot shift layout.
 */
export function Still({
  still,
  alt,
  size = "card",
  priority = false,
  revealed = false,
  className = "",
  style,
}: StillProps) {
  const treated = size === "card" ? cardRendition(still.treated) : still.treated;
  const [w, h] = size === "card" ? [640, 360] : [1280, 720];
  const loading = priority ? "eager" : "lazy";
  return (
    <div className={`frame ${revealed ? "is-revealed" : ""} ${className}`} style={style}>
      <img
        className="frame__treated"
        src={treated}
        alt={alt}
        width={w}
        height={h}
        loading={loading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
      <img
        className="frame__original"
        src={still.original}
        alt=""
        aria-hidden="true"
        width={1280}
        height={720}
        loading={loading}
        decoding="async"
      />
    </div>
  );
}
