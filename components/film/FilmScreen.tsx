"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties } from "react";

/* The screen. At rest, the film's own frame in a leaf-cut frame on a
   Carolina plate with a play pill; the YouTube iframe is created only on
   click, so no page ships a live player. Focus moves to the player when
   the button unmounts. */
export function FilmScreen({ youtubeId, title, src, viewable }: { youtubeId: string; title: string; src: string | null; viewable: boolean }) {
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

  const frame = (
    <figure
      className="media"
      data-media={src ? "" : undefined}
      data-shape="leaf"
      data-plate="caro"
      style={{ "--frame-rot": "-0.8deg", "--plate-x": "18px", "--plate-y": "18px" } as CSSProperties}
    >
      <div className="media__frame">
        {src ? (
          <img className="media__img" src={src} alt={`Frame from ${title}`} width="1280" height="720" fetchPriority="high" />
        ) : (
          <div className="media__leader" role="img" aria-label={`${title}: no frame available`}>
            <span className="k">No frame — festival only</span>
            <span className="big">{title}</span>
            <span className="k">Screened at the festival</span>
          </div>
        )}
      </div>
    </figure>
  );

  if (!viewable || !src) {
    return (
      <div className="facade" aria-label={`${title} is not streaming`}>
        {frame}
        <span className="facade__play" aria-hidden="true">Festival only</span>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} className="facade" aria-label={`Play ${title}`} data-cursor="Play">
      {frame}
      <span className="facade__play" aria-hidden="true">
        <svg aria-hidden="true" width="14" height="14"><use href="#i-play" /></svg>
        Play the film
      </span>
    </button>
  );
}
