import Link from "next/link";
import type { AwardCategory, Film } from "@/content/types";
import { AwardBadge } from "@/components/AwardBadge";
import { ButtonLink } from "@/components/Button";
import { Frame } from "@/components/Frame";

interface BestPictureProps {
  category: AwardCategory;
  film: Film;
}

/**
 * The finale. Best Picture is not a row: it gets the only still on the page,
 * full width, then the category laurel, the title at display size, the
 * director credit and one button. Nothing is set over the still.
 */
export function BestPicture({ category, film }: BestPictureProps) {
  const href = `/films/${film.slug}`;
  return (
    <section aria-label="Best Picture" className="mt-12 sm:mt-16">
      <Link
        href={href}
        className="reveal block no-underline max-sm:-mx-[clamp(1rem,4vw,2.5rem)]"
        aria-label={`${film.title}, the film page`}
      >
        <Frame film={film} priority />
      </Link>
      <div className="mt-8 sm:mt-12">
        <p>
          <AwardBadge kind="category" size="lg" category={category.category} />
        </p>
        <h2 id="best-picture" className="display text-display-lg text-cream mt-3">
          {film.title}
        </h2>
        <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
          <p className="credit text-cream">Directed by {film.director}</p>
          <ButtonLink href={href}>
            {film.viewable ? "Watch" : "See"} {film.title}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
