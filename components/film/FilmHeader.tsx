import type { Film } from "@/content/types";

/**
 * Above the fold on a film page: the title in the display italic, then the
 * meta as two short prose lines in the credit setting. No dot-joined string
 * (SFA_SYSTEM_DESIGN.md 5.6). Runtime is a third line only when it exists.
 */
export function FilmHeader({ film }: { film: Film }) {
  return (
    <header>
      <div className="md:flex md:items-end md:justify-between md:gap-12">
        <h1 className="display text-display-lg text-cream">
          <span className="display-italic">{film.title}</span>
        </h1>
        <div className="mt-6 md:mt-0 md:text-right md:shrink-0 md:pb-1">
          <p className="credit muted">{film.year} slate</p>
          <p className="credit text-cream mt-1">Directed by {film.director}</p>
          {film.runtime !== null ? (
            <p className="credit muted mt-1">{film.runtime} minutes</p>
          ) : null}
        </div>
      </div>
      <p className="text-body-lg prose-block mt-6">{film.logline}</p>
    </header>
  );
}
