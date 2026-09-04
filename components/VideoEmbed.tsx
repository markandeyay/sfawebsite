"use client";

import { useState } from "react";
import type { Still as StillPaths } from "@/content/types";
import { Still } from "./Still";

interface VideoEmbedProps {
  youtubeId: string;
  /** Film title, used for the accessible name and the iframe title. */
  title: string;
  still: StillPaths;
}

/**
 * Lazy YouTube facade. Renders the still with a play affordance; the iframe
 * is created only after a click, so no page ships a live player.
 */
export function VideoEmbed({ youtubeId, title, still }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video bg-ink">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={`${title} (YouTube)`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block w-full text-left cursor-pointer bg-panel"
      aria-label={`Play the film: ${title}`}
    >
      <Still still={still} alt="" priority />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 inline-flex items-center gap-3 bg-white text-ink px-5 py-4 transition-[background-color,color] group-hover:bg-carolina group-hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
          <path d="M6 4l14 8-14 8z" />
        </svg>
        <span className="label">Play the film</span>
      </span>
    </button>
  );
}
