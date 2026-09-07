import Link from "next/link";
import type { Film } from "@/content/types";
import { ButtonLink } from "@/components/Button";
import { CatalogNumber } from "@/components/CatalogNumber";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { DUR } from "@/lib/motion";
import { SITE } from "@/lib/site";

/**
 * The hero: a title card. The club's name in the display voice, on base,
 * with nothing competing; beneath it the cycle's key image (the Best
 * Picture winner, halftoned, resolving on hover and focus) as a framed
 * 16:9 with its catalog number and title as a caption outside the frame,
 * in the same place the card puts them.
 *
 * The site's one orchestrated arrival: the frame is simply there from the
 * first paint (it is the page's largest contentful element, so it is not
 * gated on hydration), then the number, then the name, on Reveal delays.
 * All CSS once the observer flips one class. The rejected concept (key
 * art, full-bleed) is in DESIGN_NOTES.md 9.1.
 *
 * DOM order is the stacked (375) visual order: frame, caption, sentence and
 * action; at lg the grid places the sentence column to the left by explicit
 * placement, so Tab never jumps back up the page.
 */
export function HeroTitleCard({ film }: { film: Film }) {
  return (
    <section aria-labelledby="hero-title" className="wrap pt-block pb-section">
      <Reveal as="h1" id="hero-title" variant="none" delay={DUR[3]} className="display text-8 max-w-title">
        <SplitText text={SITE.wordmark} seed="hero" />
      </Reveal>

      <div className="mt-block grid gap-x-8 gap-y-6 lg:grid-cols-12 lg:items-start">
        <Link
          href={`/films/${film.slug}`}
          className="card frame-trigger lg:col-span-8 lg:col-start-5 lg:row-start-1"
          aria-label={`${film.title}, the film page`}
        >
          <Frame film={film} size="full" priority />
        </Link>
        <Reveal
          as="p"
          variant="fade"
          delay={DUR[2]}
          className="lg:col-span-8 lg:col-start-5 lg:row-start-2 card__caption"
          style={{ paddingTop: 0 }}
        >
          <CatalogNumber no={film.no} size="row" />
          <span className="display text-5">{film.title}</span>
          <span className="condensed text-2 text-fg-muted">Directed by {film.director}</span>
        </Reveal>
        <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1">
          <p className="text-4 text-fg-muted max-w-short">UNC&rsquo;s student-run production club.</p>
          <ButtonLink href={`/films/${film.slug}`} className="mt-6">
            Watch {film.title}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
