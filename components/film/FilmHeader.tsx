import { CatalogNumber } from "@/components/CatalogNumber";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import type { Film } from "@/content/types";

/**
 * Above the fold. The catalog number is the page's scale moment (step 9,
 * simply there, like a stamp); the title beneath it is the one orchestrated
 * heading on the route (glyphs arrive, nothing is hidden before hydration).
 * Meta is short prose lines in the credits voice; runtime only when known.
 * At the wide breakpoint the meta and logline sit as a billing block at the
 * foot of the title.
 */
export function FilmHeader({ film }: { film: Film }) {
  return (
    <header className="grid gap-y-8 lg:grid-cols-3 lg:gap-x-12 lg:items-end">
      <div className="lg:col-span-2">
        <CatalogNumber no={film.no} size="page" />
        <Reveal as="h1" variant="none" className="display text-8 text-fg mt-4 max-w-title">
          <SplitText text={film.title} seed={`title:${film.slug}`} />
        </Reveal>
      </div>
      <div className="lg:pb-3">
        <p className="condensed text-3 text-fg-muted">
          {film.year} slate
          <br />
          Directed by {film.director}
          {film.runtime !== null ? (
            <>
              <br />
              {film.runtime} minutes
            </>
          ) : null}
        </p>
        <p className="text-4 mt-6 max-w-short">{film.logline}</p>
      </div>
    </header>
  );
}
