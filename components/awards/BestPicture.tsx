import Link from "next/link";
import { AwardBadge } from "@/components/AwardBadge";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/motion/Reveal";
import type { AwardCategory, Film } from "@/content/types";

interface BestPictureProps {
  category: AwardCategory;
  film: Film;
}

/**
 * The finale. The seal, then the only still on the page (the cycle's key
 * image, halftoned at rest, resolving on hover anywhere in the block and on
 * focus of the title link), then the title as the one link, and the
 * director. The step-2 catalog number that sat between the still and the
 * step-8 title was removed in the final pass (DESIGN_NOTES.md 11): at a
 * seventh of the title's size it read as a stray meta line, and the number
 * is already on the film's tally row and every one of its winner rows. Full width, the most air on the page above it;
 * the footer's own margin closes the page. The title link carries no
 * underline at this size (a hairline under a step-8 title reads as a rule);
 * the still resolving is its hover state and the ring is its focus state.
 */
export function BestPicture({ category, film }: BestPictureProps) {
  return (
    <section aria-labelledby="best-picture" className="pt-stage text-center">
      <div className="flex justify-center">
        <AwardBadge mode="row" category={category.category} person={category.winner.person} />
      </div>
      <div className="frame-trigger mt-8">
        <Reveal variant="fade" seed="finale">
          <Frame film={film} size="full" />
        </Reveal>
        <h2 id="best-picture" className="display text-8 text-fg mt-8">
          <Link href={`/films/${film.slug}`} className="finale__title">
            {film.title}
          </Link>
        </h2>
        <p className="condensed text-3 text-fg-muted mt-2">Directed by {film.director}</p>
      </div>
    </section>
  );
}
