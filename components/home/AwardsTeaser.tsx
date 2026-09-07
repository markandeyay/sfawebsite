import Link from "next/link";
import { AwardBadge } from "@/components/AwardBadge";
import { ButtonLink } from "@/components/Button";
import { CatalogNumber } from "@/components/CatalogNumber";
import { Reveal } from "@/components/motion/Reveal";
import { numberWord, type CeremonySummary } from "@/lib/home";

/**
 * The awards teaser: the first award colour on the page. One sentence says the
 * night's result, derived from awards.json; one row per winning film shows
 * its top category as a badge beside its catalog number; one link goes to
 * the ceremony. The ceremony page has the full fifteen; this does not.
 */
export function AwardsTeaser({ summary }: { summary: CeremonySummary }) {
  const { ceremony, total, filmCount, lead, sweep, highlights } = summary;
  const result = `${numberWord(total, true)} awards, voted on by the members, went to ${numberWord(filmCount)} films in ${ceremony.held}.`;
  const sweepLine = sweep && lead ? ` ${lead.film.title} took ${numberWord(lead.wins)} of them.` : "";

  return (
    <section aria-labelledby="awards-title" className="wrap py-section">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="awards-title" className="display text-6">
            The {ceremony.year} awards
          </h2>
          <p className="mt-4 text-4 measure">
            {result}
            {sweepLine}
          </p>
          <ButtonLink href={`/awards/${ceremony.year}`} variant="secondary" className="mt-8">
            See the ceremony
          </ButtonLink>
        </div>
        <ol className="lg:col-span-7" aria-label="Top award by film">
          {highlights.map(({ film, category }) => (
            <Reveal
              as="li"
              key={film.slug}
              seed={`teaser:${film.slug}`}
              variant="fade"
              className="hairline-t py-4 grid gap-x-8 gap-y-2 sm:grid-cols-2"
            >
              <AwardBadge mode="row" category={category} />
              <span className="card__caption" style={{ paddingTop: 0 }}>
                <CatalogNumber no={film.no} size="row" />
                <Link href={`/films/${film.slug}`} className="display text-5 card__title no-underline">
                  {film.title}
                </Link>
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
