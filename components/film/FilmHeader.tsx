import type { Film } from "@/content/types";

/**
 * Above the fold on a film page: one condensed text-2 text-fg-muted carrying the slate and the
 * director, the title at the largest display size, then the logline. No
 * dot-joined string. Runtime is a line only when the club has supplied it.
 */
export function FilmHeader({ film }: { film: Film }) {
  return (
    <header>
      <p className="condensed text-2 text-fg-muted">
        {film.year} slate, directed by {film.director}
      </p>
      <h1 className="display text-8 text-fg mt-4 max-w-title">{film.title}</h1>
      <p className="text-4 measure mt-6">{film.logline}</p>
      {film.runtime !== null ? <p className="text-fg-muted mt-3">{film.runtime} minutes</p> : null}
    </header>
  );
}
