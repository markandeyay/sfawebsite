import { Frame } from "@/components/Frame";
import { VideoEmbed } from "@/components/VideoEmbed";
import type { Film } from "@/content/types";

/**
 * The screen, at the full width of the wrap. A lazy YouTube facade when the
 * film can be embedded and a frame exists (accessible name "Play <title>",
 * iframe only on click). Otherwise the type-only leader from Frame at half
 * width, with one sentence beside it saying why nothing plays.
 */
export function FilmFacade({ film }: { film: Film }) {
  if (film.viewable && film.still) {
    return <VideoEmbed youtubeId={film.youtubeId} title={film.title} still={film.still} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-12 lg:items-end">
      <Frame film={film} size="full" priority />
      <p className="text-fg-muted max-w-short">
        {film.viewable ? (
          <>
            No frame from this film is available.{" "}
            <a href={`https://www.youtube.com/watch?v=${film.youtubeId}`} className="link">
              Watch {film.title} on YouTube
            </a>
            .
          </>
        ) : (
          <>{film.title} is not streaming. It screened at the festival only.</>
        )}
      </p>
    </div>
  );
}
