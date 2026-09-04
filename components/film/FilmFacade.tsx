import type { Film } from "@/content/types";
import { Frame } from "@/components/Frame";
import { VideoEmbed } from "@/components/VideoEmbed";

/**
 * The screen, at the full width of the wrap. A lazy YouTube facade when the
 * film can be embedded and a frame exists; otherwise the type-only leader
 * from Frame with one sentence saying why.
 */
export function FilmFacade({ film }: { film: Film }) {
  if (film.viewable && film.still) {
    return <VideoEmbed youtubeId={film.youtubeId} title={film.title} still={film.still} />;
  }

  return (
    <div className="max-w-3xl">
      <Frame film={film} priority />
      <p className="muted mt-4">
        {film.viewable ? (
          <>
            No frame from this film is available yet.{" "}
            <a
              href={`https://www.youtube.com/watch?v=${film.youtubeId}`}
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              Watch it on YouTube
            </a>
          </>
        ) : (
          "This film is not streaming right now."
        )}
      </p>
    </div>
  );
}
