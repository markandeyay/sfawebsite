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
  /** `sizes` hint is unused by plain img but kept for parity if migrated. */
  sizes?: string;
}

/**
 * Two stacked frames. The treated (two-tone dithered) frame is the identity
 * and sits on top; the untreated frame underneath is revealed when an
 * ancestor with the `reveal` class is hovered, focused, or given
 * `is-revealed`. See app/globals.css.
 */
export function Still({ still, alt, priority = false, className = "" }: StillProps) {
  const loading = priority ? "eager" : "lazy";
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
        src={still.treated}
        alt={alt}
        width={1280}
        height={720}
        loading={loading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="still__treated"
      />
    </div>
  );
}
