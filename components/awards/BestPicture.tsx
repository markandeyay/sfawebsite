import type { AwardCategory, Film } from "@/content/types";
import { ArrowLink } from "@/components/ArrowLink";

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
    <section aria-labelledby="best-picture" className="border-t border-rule pt-24 pb-20 sm:pt-40 sm:pb-28">
      <p className="eyebrow mb-4">{category.category}</p>
      <h2 id="best-picture" className="display text-display-lg text-ink scroll-mt-24">
        {film.title}
      </h2>
      <p className="text-body-lg mt-6 muted">Directed by {film.director}</p>
      <div className="mt-10">
        <ArrowLink href={href}>
          {film.viewable ? "Watch" : "See"} {film.title}
        </ArrowLink>
      </div>
    </section>
  );
}
