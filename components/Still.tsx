/* eslint-disable @next/next/no-img-element */
// Plain <img>: the stills are already 1280x720 webp written by
// scripts/process-stills.ts, so there is nothing for next/image to optimize.
import type { Still as StillPaths } from "@/content/types";

export interface StillProps {
  still: StillPaths;
  /** Describes the frame for assistive tech, e.g. "Frame from FDOC". Empty when decorative. */
  alt: string;
  /** Load eagerly for the hero and the film page facade. */
  priority?: boolean;
  className?: string;
}

/** A 16:9 frame from the film, shown as shot. */
export function Still({ still, alt, priority = false, className = "" }: StillProps) {
  return (
    <div className={`still ${className}`}>
      <img
        src={still.original}
        alt={alt}
        width={1280}
        height={720}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}
