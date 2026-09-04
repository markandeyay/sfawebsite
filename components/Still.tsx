/* eslint-disable @next/next/no-img-element */
// Plain <img> on purpose: next/image would resample the treated still, which
// smears the dither pattern into grey. The files are already 1280x720 webp
// written by scripts/process-stills.ts, so there is nothing to optimize.
import type { Still as StillPaths } from "@/content/types";

export interface StillProps {
  still: StillPaths;
  /** Describes the frame for assistive tech, e.g. "Frame from FDOC". */
  alt: string;
  /** Load eagerly for the hero and the film page facade. */
  priority?: boolean;
  className?: string;
  /**
   * "large" (default) serves the 1280x720 treated still: hero, facade,
   * awards finale. "card" serves the native-resolution rendition
   * (`-treated-sm.webp`, one pixel per dither cell) and lets the browser
   * upscale it; downscaling the 1280px dither to card width produces moiré.
   */
  size?: "large" | "card";
}

/** Convention from scripts/process-stills.ts: the native-resolution twin of a treated still. */
export function smallTreated(treatedPath: string): string {
  return treatedPath.replace(/-treated.webp$/, "-treated-sm.webp");
}

/**
 * Two stacked frames. The treated (two-tone dithered) frame is the identity
 * and sits on top; the untreated frame underneath is revealed when an
 * ancestor with the `reveal` class is hovered, focused, or given
 * `is-revealed`. See app/globals.css.
 */
export function Still({ still, alt, priority = false, className = "", size = "large" }: StillProps) {
  const loading = priority ? "eager" : "lazy";
  const treatedSrc = size === "card" ? smallTreated(still.treated) : still.treated;
  const treatedW = size === "card" ? 320 : 1280;
  const treatedH = size === "card" ? 180 : 720;
  return (
    <div className={`still ${className}`}>
      <img
        src={still.original}
        alt=""
        aria-hidden="true"
        width={1280}
        height={720}
        loading={loading}
        decoding="async"
        className="still__original"
      />
      <img
        src={treatedSrc}
        alt={alt}
        width={treatedW}
        height={treatedH}
        loading={loading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={size === "card" ? "still__treated still__treated--card" : "still__treated"}
      />
    </div>
  );
}
