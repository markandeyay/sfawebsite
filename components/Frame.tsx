import type { Film } from "@/content/types";
import { Still } from "./Still";

interface FrameProps {
  film: Film;
  priority?: boolean;
  className?: string;
}

/**
 * A film's frame. Renders the dithered Still when one exists. When
 * `film.still` is null (no frame available, e.g. the upload is private) it
 * renders a type-only 16:9 leader instead: the title in the display face on
 * a surface rectangle, with the reason in a credit line. Nothing is
 * generated in place of the missing frame (SFA_SYSTEM_DESIGN.md 9.4).
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
      className={`relative aspect-video bg-surface border border-deep flex flex-col justify-between p-4 sm:p-5 ${className}`}
      role="img"
      aria-label={`${film.title}: no frame available`}
    >
      <span className="credit credit-role muted">No frame available</span>
      <span className="display-italic text-display-md text-cream">
        {film.title}
      </span>
    </div>
  );
}
