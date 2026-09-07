"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

/* The screen. At rest, the film's own frame in the 35 mm chrome with a
   ticket to play it; the YouTube iframe is created only on click, so no
   page ships a live player. Focus moves to the player when the button
   unmounts. */
export function FilmScreen({ youtubeId, title, src, viewable, edge }: { youtubeId: string; title: string; src: string | null; viewable: boolean; edge: [string, string] }) {
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

  const ticket = !viewable || !src ? (
    <span className="facade__play" aria-hidden="true">Festival only</span>
  ) : (
    <span className="facade__play" aria-hidden="true">
      <svg aria-hidden="true"><use href="#i-play" /></svg>
      Play the film
    </span>
  );

  const frame = (
    <figure className="media" data-media={src ? "" : undefined}>
      <div className="media__film">
        <div className="media__frame">
          {src ? (
            <img className="media__img" src={src} alt={`Frame from ${title}`} width="1280" height="720" fetchPriority="high" />
          ) : (
            <div className="media__leader" role="img" aria-label={`${title}: no frame available`}>
              <span className="k">Leader — festival only</span>
              <span className="big">{title}</span>
              <span className="k">Screened at the festival</span>
            </div>
          )}
          <span className="media__vf" aria-hidden="true" />
          <span className="media__rec" aria-hidden="true">Rec</span>
          {ticket}
        </div>
        <div className="media__edge" aria-hidden="true">
          <span>{edge[0]}</span>
          <span className="n">{edge[1]}</span>
        </div>
      </div>
    </figure>
  );

  if (!viewable || !src) {
    return (
      <div className="facade" aria-label={`${title} is not streaming`}>
        {frame}
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} className="facade" aria-label={`Play ${title}`} data-cursor="Play">
      {frame}
    </button>
  );
}
