import type { Film } from "@/content/types";

/**
 * Above the fold on a film page: one eyebrow carrying the slate and the
 * director, the title at the largest display size, then the logline. No
 * dot-joined string. Runtime is a line only when the club has supplied it.
 */
export function FilmHeader({ film }: { film: Film }) {
  return (
    <header>
      <p className="eyebrow">
        {film.year} slate, directed by {film.director}
      </p>
      <h1 className="display text-display-xl text-ink mt-4 max-w-[14ch]">{film.title}</h1>
      <p className="text-body-lg prose-block mt-6">{film.logline}</p>
      {film.runtime !== null ? <p className="muted mt-3">{film.runtime} minutes</p> : null}
    </header>
  );
}
