/* eslint-disable @next/next/no-img-element */
// Plain <img>, not next/image: scripts/process-stills.ts already writes the
// two renditions the site serves (1280x720 and 640x360 webp), so there is
// nothing for an optimizer to do at request time.
import type { CSSProperties } from "react";
import type { Still as StillPaths } from "@/content/types";

export type StillSize = "card" | "full";

export interface StillProps {
  still: StillPaths;
  /** Describes the frame for assistive tech, e.g. "Frame from FDOC". Empty when decorative. */
  alt: string;
  /** card = the 640x360 rendition; full = 1280x720. */
  size?: StillSize;
  /** Load eagerly for the hero and the film page facade. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** The card rendition follows a fixed naming rule (scripts/process-stills.ts). */
export function cardRendition(original: string): string {
  return original.replace(/\.webp$/, "-sm.webp");
}

/**
 * A film's still, shown as shot. One 16:9 image; the panel grey shows
 * through until it arrives. Cards get the 640x360 file, everything larger
 * the 1280x720 one.
 */
export function Still({ still, alt, size = "card", priority = false, className = "", style }: StillProps) {
  const card = size === "card";
  const src = card ? cardRendition(still.original) : still.original;
  const [w, h] = card ? [640, 360] : [1280, 720];
  return (
    <div className={`frame ${className}`} style={style}>
      <img
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}
