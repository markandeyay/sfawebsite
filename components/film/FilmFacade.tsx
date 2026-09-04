import type { Film } from "@/content/types";
import { Frame } from "@/components/Frame";
import { VideoEmbed } from "@/components/VideoEmbed";

/**
 * The screen. A lazy YouTube facade when the film can be embedded and a
 * frame exists; otherwise the type-only leader from Frame with one line
 * saying why. Full-bleed below the small breakpoint.
 */
export function FilmFacade({ film }: { film: Film }) {
  const bleed = "-mx-[clamp(1rem,4vw,2.5rem)] sm:mx-0";

  if (film.viewable && film.still) {
    return (
      <div className={bleed}>
        <VideoEmbed youtubeId={film.youtubeId} title={film.title} still={film.still} />
      </div>
    );
  }

  const reason = !film.viewable
    ? "This film is not streaming right now."
    : "No frame from this film is available yet.";

  return (
    <div className={bleed}>
      <Frame film={film} priority />
      <p className="muted mt-4 px-[clamp(1rem,4vw,2.5rem)] sm:px-0">
        {reason}
        {film.viewable ? (
          <>
            {" "}
            <a
              href={`https://www.youtube.com/watch?v=${film.youtubeId}`}
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              Watch it on YouTube
            </a>
          </>
        ) : null}
      </p>
    </div>
  );
}
