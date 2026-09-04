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
 * Lazy YouTube facade (SFA_SYSTEM_DESIGN.md 10). Renders the treated still with
 * a play affordance; the iframe is created only after a click, so no page
 * ships a live YouTube player. Hover and focus reveal the untreated frame
 * through the shared `reveal` mechanism.
 */
export function VideoEmbed({ youtubeId, title, still }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video bg-surface">
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
      className="reveal group relative block w-full text-left cursor-pointer bg-surface"
      aria-label={`Play ${title}`}
    >
      <Still still={still} alt="" priority />
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center"
      >
        <span className="grid place-items-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-cream text-base transition-transform group-hover:scale-105 group-focus-visible:scale-105">
          <svg viewBox="0 0 24 24" className="h-7 w-7 translate-x-[2px] fill-current">
            <path d="M6 4l14 8-14 8z" />
          </svg>
        </span>
      </span>
      <span className="absolute bottom-0 left-0 credit credit-role bg-base/80 text-cream px-3 py-2">
        Play the film
      </span>
    </button>
  );
}
