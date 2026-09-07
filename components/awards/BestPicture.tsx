import type { AwardCategory, Film } from "@/content/types";
import { ButtonLink } from "@/components/Button";

interface BestPictureProps {
  category: AwardCategory;
  film: Film;
}

/**
 * The finale: type only, on white. The still is already in the tally, so
 * the category, the title at display size, the director, and one arrow
 * link carry the ending.
 */
export function BestPicture({ category, film }: BestPictureProps) {
  const href = `/films/${film.slug}`;
  return (
    <section aria-labelledby="best-picture" className="border-t border-rule pt-section pb-section sm:pt-section sm:pb-section">
      <p className="condensed text-2 text-fg-muted mb-4">{category.category}</p>
      <h2 id="best-picture" className="display text-7 text-fg scroll-mt-24">
        {film.title}
      </h2>
      <p className="text-4 mt-6 text-fg-muted">Directed by {film.director}</p>
      <div className="mt-8">
        <ButtonLink variant="link" href={href}>
          {film.viewable ? "Watch" : "See"} {film.title}
        </ButtonLink>
      </div>
    </section>
  );
}
