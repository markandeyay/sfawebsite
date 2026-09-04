import Link from "next/link";
import type { Film } from "@/content/types";
import { Frame } from "./Frame";

interface FilmCardProps {
  film: Film;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

/**
 * A still with an eyebrow and a title beneath it: the grid card. The eyebrow
 * carries the director, then the award count for winners.
 */
export function FilmCard({ film, headingLevel = "h3", priority = false }: FilmCardProps) {
  const Heading = headingLevel;
  const n = film.awards.length;
  const notes = [
    film.director,
    n > 0 ? (n === 1 ? "1 award" : `${n} awards`) : null,
    !film.viewable ? "Not streaming" : null,
  ].filter(Boolean);
  return (
    <Link
      href={`/films/${film.slug}`}
      className="group block no-underline text-ink"
      aria-label={`${film.title}, directed by ${film.director}`}
    >
      <div className="overflow-hidden">
        <div className="transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          <Frame film={film} priority={priority} />
        </div>
      </div>
      <p className="eyebrow mt-4">{notes.join(", ")}</p>
      <Heading className="display text-display-sm mt-1 transition-[color] group-hover:text-carolina">
        {film.title}
      </Heading>
    </Link>
  );
}
