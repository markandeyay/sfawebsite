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
  /** card = the 640x360 renditions (treated and original); full = 1280x720. */
  size?: StillSize;
  /** Load eagerly for the hero and the film page facade. */
  priority?: boolean;
  /** Force the untreated frame (route agents toggle this, e.g. a touch tap). */
  revealed?: boolean;
  className?: string;
  /** For --reveal-dur / --reveal-delay from the caller. */
  style?: CSSProperties;
}

/** The card renditions follow a fixed naming rule (scripts/process-stills.ts). */
export function cardRendition(treated: string): string {
  return treated.replace(/-treated\.webp$/, "-treated-sm.webp");
}
export function cardOriginalRendition(original: string): string {
  return original.replace(/\.webp$/, "-sm.webp");
}

/** Only a fine pointer that can hover ever sees the untreated frame at rest. */
const CAN_HOVER = "(hover: hover) and (pointer: fine)";

/**
 * The two-layer dither reveal. The halftone-treated still (base + carolina)
 * is the resting state; the untreated frame sits above it at opacity 0 and
 * crossfades in on hover, focus, focus-within, or .is-revealed. The CSS
 * lives in app/globals.css under .frame; under reduced motion the swap is
 * instant. Both layers share dimensions, so the reveal cannot shift layout.
 *
 * The original is requested only where it can be hovered: on a touch device
 * the second layer's <picture> falls back to the treated file the browser
 * already has, so the bytes for a frame nobody can resolve are never sent.
 * `revealed` bypasses the gate, since it exists for touch.
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
  const card = size === "card";
  const treated = card ? cardRendition(still.treated) : still.treated;
  const original = card ? cardOriginalRendition(still.original) : still.original;
  const [w, h] = card ? [640, 360] : [1280, 720];
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
      <picture>
        {revealed ? null : <source media={CAN_HOVER} srcSet={original} />}
        <img
          className="frame__original"
          src={revealed ? original : treated}
          alt=""
          aria-hidden="true"
          width={w}
          height={h}
          loading={loading}
          decoding="async"
        />
      </picture>
    </div>
  );
}
