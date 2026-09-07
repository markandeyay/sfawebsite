"use client";

import { useEffect, useRef, useState } from "react";
import type { Still as StillPaths } from "@/content/types";
import { Still } from "./Still";

interface VideoEmbedProps {
  youtubeId: string;
  /** Film title, used for the accessible name and the iframe title. */
  title: string;
  still: StillPaths;
}

/**
 * Lazy YouTube facade. At rest it is the still with a solid play label at
 * the bottom left; the iframe is created only after a click, so no page
 * ships a live player.
 * When the button unmounts, focus moves to the player that replaced it, so
 * a keyboard user's Tab sequence continues from the screen.
 */
export function VideoEmbed({ youtubeId, title, still }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const player = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (playing) player.current?.focus();
  }, [playing]);

  if (playing) {
    return (
      <div className="player">
        <iframe
          ref={player}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={`${title} (YouTube)`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} className="facade" aria-label={`Play ${title}`}>
      <Still still={still} alt="" size="full" priority />
      <span aria-hidden="true" className="facade__play btn btn--primary">
        Play the film
      </span>
    </button>
  );
}
