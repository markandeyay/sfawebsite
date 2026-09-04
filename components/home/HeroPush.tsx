import type { Film } from "@/content/types";
import { Still } from "@/components/Still";
import { Wordmark } from "@/components/Wordmark";
import { ButtonLink } from "@/components/Button";
import { SITE } from "@/lib/site";

/**
 * Hero concept A: a slow push on a single letterboxed dithered still with the
 * wordmark over a scrim. The recommended default from SFA_SYSTEM_DESIGN.md
 * 11.1. Built to compare against concept B (HeroScreen).
 */
export function HeroPush({ film }: { film: Film }) {
  return (
    <section aria-labelledby="hero-title" className="letterbox">
      <div className="hero-push reveal">
        {film.still ? (
          <Still still={film.still} alt={`Frame from ${film.title}`} priority />
        ) : null}
        <div className="hero-push__scrim" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="wrap pb-10 sm:pb-14">
            <div id="hero-title">
              <Wordmark size="hero" />
            </div>
            <p className="text-body-lg mt-6 max-w-xl">{SITE.description}</p>
            <div className="mt-8">
              <ButtonLink href="/#films">See the 2025 films</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
