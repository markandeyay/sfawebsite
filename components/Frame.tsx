import type { Film } from "@/content/types";
import { Still } from "./Still";

interface FrameProps {
  film: Film;
  priority?: boolean;
  className?: string;
  /** Kept for call-site compatibility; there is one rendition now. */
  size?: "large" | "card";
}

/**
 * A film's frame. When `film.still` is null (no frame exists, e.g. the
 * upload is private) it renders a type-only 16:9 leader on the panel grey
 * instead. Nothing is generated in place of a missing frame.
 */
export function Frame({ film, priority = false, className = "" }: FrameProps) {
  if (film.still) {
    return (
      <Still
        still={film.still}
        alt={`Frame from ${film.title}`}
        priority={priority}
        className={className}
      />
    );
  }
  return (
    <div
      className={`relative aspect-video bg-panel flex flex-col justify-between p-5 sm:p-6 ${className}`}
      role="img"
      aria-label={`${film.title}: no frame available`}
    >
      <span className="eyebrow">No frame available</span>
      <span className="display text-display-sm text-ink">{film.title}</span>
    </div>
  );
}
