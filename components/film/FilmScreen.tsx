"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { prefersReduced } from "@/lib/fx/motion";

/* The screen. At rest, the film's own frame in the 35 mm chrome with a
   ticket stub on it; the click is a picture-start flash, then the
   YouTube iframe mounts, so no page ships a live player. Focus moves to
   the player when the button unmounts. */
export function FilmScreen({
  youtubeId,
  title,
  src,
  viewable,
  edge,
  year,
  no,
}: {
  youtubeId: string;
  title: string;
  src: string | null;
  viewable: boolean;
  edge: [string, string];
  year: number;
  no: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const player = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (playing) player.current?.focus();
  }, [playing]);

  const start = () => {
    if (prefersReduced()) {
      setPlaying(true);
      return;
    }
    setStarting(true);
    window.setTimeout(() => setPlaying(true), 170);
  };

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

  const streaming = viewable && !!src;
  const ticket = streaming ? (
    <span className="ticket" aria-hidden="true">
      <i>Admit one</i>
      <b><svg aria-hidden="true"><use href="#i-play" /></svg>Play the film</b>
      <small>SFA Film Festival · {year} · No. {no}</small>
    </span>
  ) : (
    <span className="ticket" aria-hidden="true">
      <i>Admit one</i>
      <b>Festival only</b>
      <small>Screened at the SFA Film Festival · {year}</small>
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
          {ticket}
        </div>
        <div className="media__edge" aria-hidden="true">
          <span>{edge[0]}</span>
          <span className="n">{edge[1]}</span>
        </div>
      </div>
    </figure>
  );

  if (!streaming) {
    return (
      <div className="facade" aria-label={`${title} is not streaming`}>
        {frame}
      </div>
    );
  }

  return (
    <button type="button" onClick={start} className={`facade ${starting ? "-start" : ""}`} aria-label={`Play ${title}`} data-cursor="Play">
      {frame}
    </button>
  );
}
