import type { CSSProperties } from "react";
import type { Film } from "@/content/types";
import { Still, type StillSize } from "./Still";

interface FrameProps {
  film: Film;
  size?: StillSize;
  priority?: boolean;
  revealed?: boolean;
  /**
   * True when a caption beside the frame already names the film (the card),
   * so assistive tech is not told the title twice: the treated img gets an
   * empty alt and the type-only leader is hidden. Leave false where the
   * frame stands alone (the finale, the film-page leader).
   */
  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * A film's frame: the dither reveal when a still exists, otherwise the
 * type-only leader (a surface rectangle carrying the title and "No frame
 * available" in the credits voice). Nothing is generated in place of a
 * missing frame.
 */
export function Frame({
  film,
  size = "card",
  priority = false,
  revealed = false,
  decorative = false,
  className = "",
  style,
}: FrameProps) {
  if (film.still) {
    return (
      <Still
        still={film.still}
        alt={decorative ? "" : `Frame from ${film.title}`}
        size={size}
        priority={priority}
        revealed={revealed}
        className={className}
        style={style}
      />
    );
  }
  const name = decorative ? { "aria-hidden": true as const } : { role: "img", "aria-label": `${film.title}: no frame available` };
  return (
    <div className={`leader ${className}`} {...name}>
      <span className="condensed text-2 text-fg-muted">No frame available</span>
      <span className="display text-5">{film.title}</span>
    </div>
  );
}
