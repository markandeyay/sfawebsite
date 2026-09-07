import Link from "next/link";
import type { CSSProperties } from "react";
import type { Film } from "@/content/types";
import { jitter } from "@/lib/hash";
import { DUR } from "@/lib/motion";
import { AwardBadge } from "./AwardBadge";
import { CatalogNumber } from "./CatalogNumber";
import { Frame } from "./Frame";

interface FilmCardProps {
  film: Film;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

/**
 * Engineered irregularity, hook 2: each card's reveal runs between 0.85x
 * and 1.15x of --dur-4 and starts 0-90ms late, from the slug, so a row of
 * cards hovered in turn never resolves on one identical beat.
 */
export function cardRevealTiming(slug: string): CSSProperties {
  const dur = Math.round(DUR[4] * jitter(`card:${slug}`, 0.85, 1.15));
  const delay = Math.round(jitter(`card:${slug}:delay`, 0, 90));
  return { "--reveal-dur": `${dur}ms`, "--reveal-delay": `${delay}ms` } as CSSProperties;
}

/**
 * The film card. A 16:9 frame (treated at rest, the real frame on hover and
 * focus), then a caption row OUTSIDE the frame: the catalog number first,
 * the title, the director beneath in the credits voice, and, only if the
 * film won, its wins in the award colour. The whole card is one link; no scale on hover.
 */
export function FilmCard({ film, headingLevel = "h3", priority = false }: FilmCardProps) {
  const Heading = headingLevel;
  const wins = film.awards.length;
  return (
    <Link href={`/films/${film.slug}`} className="card frame-trigger" style={cardRevealTiming(film.slug)}>
      <Frame film={film} size="card" priority={priority} />
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
