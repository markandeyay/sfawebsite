import Link from "next/link";
import type { Film } from "@/content/types";
import { Still } from "@/components/Still";
import { Wordmark } from "@/components/Wordmark";
import { ButtonLink } from "@/components/Button";
import { SITE } from "@/lib/site";
import { ScreenAutoReveal } from "./ScreenAutoReveal";

/**
 * Hero concept B: a dark room with a lit screen. A 16:9 screen carrying the
 * dithered still sits in the room; Carolina light spills off it onto the
 * walls. On load the lamp comes up (the site's one orchestrated motion
 * moment). The wordmark sits beneath the screen like a title card, not over
 * the image, so no scrim is needed. Hover or focus on the screen reveals the
 * real frame.
 */
export function HeroScreen({ film }: { film: Film }) {
  return (
    <section aria-labelledby="hero-title" className="pt-6 sm:pt-10 pb-16 sm:pb-24 overflow-x-clip">
      <div className="wrap">
        <div className="screen-room mx-auto max-w-3xl">
          <div className="screen-room__glow" aria-hidden="true" />
          <ScreenAutoReveal
            className="screen-room__screen letterbox block"
            href={`/films/${film.slug}`}
            label={`Frame from ${film.title}. See the film.`}
          >
            {film.still ? (
              <Still still={film.still} alt={`Frame from ${film.title}`} priority />
            ) : null}
          </ScreenAutoReveal>
          <p className="credit muted mt-3 text-center">
            A frame from{" "}
            <Link href={`/films/${film.slug}`} className="link">
              <span className="display-italic text-[1.05em]">{film.title}</span>
            </Link>
            , {film.year}. Directed by {film.director}.
          </p>
        </div>

        <div className="mt-12 sm:mt-16">
          <div id="hero-title">
            <Wordmark size="title" />
          </div>
          <div className="mt-6 sm:mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-body-lg prose-block max-w-xl">{SITE.description}</p>
            <div className="shrink-0">
              <ButtonLink href="/#films">See the 2025 films</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
