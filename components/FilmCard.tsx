import Link from "next/link";
import type { Film } from "@/content/types";
import { AwardBadge } from "./AwardBadge";
import { CatalogNumber } from "./CatalogNumber";
import { Frame } from "./Frame";

interface FilmCardProps {
  film: Film;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

/**
 * The film card. A 16:9 frame (the still as shot), then a caption row
 * OUTSIDE the frame: the catalog number first,
 * the title, the director beneath in the credits voice, and, only if the
 * film won, its wins in the award colour. The whole card is one link; no scale on hover.
 */
export function FilmCard({ film, headingLevel = "h3", priority = false }: FilmCardProps) {
  const Heading = headingLevel;
  const wins = film.awards.length;
  return (
    <Link href={`/films/${film.slug}`} className="card">
      <Frame film={film} size="card" priority={priority} decorative />
      <span className="card__caption">
        <CatalogNumber no={film.no} size="card" />
        <Heading className="card__title display text-5">{film.title}</Heading>
        <span className="card__meta condensed text-2">
          <span>{film.director}</span>
          {!film.viewable ? <span>Festival only</span> : null}
          {wins > 0 ? <AwardBadge mode="count" count={wins} /> : null}
        </span>
      </span>
    </Link>
  );
}
