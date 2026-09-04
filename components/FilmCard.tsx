import Link from "next/link";
import type { Film } from "@/content/types";
import { Frame } from "./Frame";

interface FilmCardProps {
  film: Film;
  /** Heading level for the title so the outline stays in order. */
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

/**
 * A frame on the contact sheet. 16:9, dithered still with the reveal on
 * hover and focus, caption set like a credit line: title left, director
 * right. Award count is cream, not the award color: the first award color on the homepage
 * belongs to the awards section (SFA_SYSTEM_DESIGN.md 6.2).
 */
export function FilmCard({ film, headingLevel = "h3", priority = false }: FilmCardProps) {
  const Heading = headingLevel;
  const awardCount = film.awards.length;
  return (
    <Link
      href={`/films/${film.slug}`}
      className="reveal group block no-underline text-cream"
      aria-label={`${film.title}, directed by ${film.director}`}
    >
      <div className="relative border border-transparent group-focus-visible:border-carolina group-hover:border-deep transition-colors">
        <Frame film={film} priority={priority} size="card" />
        {!film.viewable && film.still ? (
          <span className="credit credit-role absolute bottom-0 left-0 bg-surface text-cream px-2 py-1">
            Not streaming
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <Heading className="display text-display-sm leading-tight">
          <span className="display-italic">{film.title}</span>
        </Heading>
        <p className="credit text-right shrink-0 muted">
          {film.director}
        </p>
      </div>
      {awardCount > 0 ? (
        <p className="credit mt-1 muted">
          {awardCount === 1 ? "1 award" : `${awardCount} awards`}, 2025
        </p>
      ) : null}
    </Link>
  );
}
