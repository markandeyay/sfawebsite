import Link from "next/link";
import type { Ceremony, Film } from "@/content/types";
import { AwardBadge } from "@/components/AwardBadge";
import { SectionHeading } from "@/components/SectionHeading";
import { ButtonLink } from "@/components/Button";
import { numberWord } from "./CatalogStrip";

/**
 * The first award color on the page (SFA_SYSTEM_DESIGN.md 6.2). The top of the
 * ceremony, in reverse ceremony order so Best Picture leads, then a link to
 * the whole night.
 */
export function AwardsTeaser({ ceremony, films }: { ceremony: Ceremony; films: Map<string, Film> }) {
  const top = ceremony.categories.slice(-4).reverse();
  const counts = new Map<string, number>();
  for (const c of ceremony.categories) {
    counts.set(c.winner.filmSlug, (counts.get(c.winner.filmSlug) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [leadSlug, leadCount] = ranked[0] ?? [];
  const runnerUp = ranked[1]?.[1] ?? 0;
  const lead = leadSlug ? films.get(leadSlug) : undefined;
  const total = ceremony.categories.length;
  // A sweep worth a headline: at least twice the runner-up and five or more wins.
  const sweep = lead && leadCount && leadCount >= 5 && leadCount >= runnerUp * 2;

  return (
    <section id="awards" aria-labelledby="awards-title" className="wrap py-16 sm:py-24 border-t border-deep">
      <SectionHeading
        id="awards-title"
        title={`The ${ceremony.year} awards`}
        lede={
          <>
            {numberWord(total, true)} categories, voted on by members and presented after the festival.
            {sweep ? (
              <>
                {" "}
                <span className="display-italic text-cream">{lead.title}</span> took{" "}
                {numberWord(leadCount)} of them.
              </>
            ) : null}
          </>
        }
      />
      <dl className="mt-10 sm:mt-14 grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {top.map((cat) => {
          const film = films.get(cat.winner.filmSlug);
          if (!film) return null;
          return (
            <div key={cat.category} className="border-t border-deep pt-4">
              <dt className="credit credit-role muted">{cat.category}</dt>
              <dd className="mt-2">
                <Link href={`/films/${film.slug}`} className="no-underline">
                  <AwardBadge kind="winner" size="md" person={cat.winner.person}>
                    {film.title}
                  </AwardBadge>
                </Link>
              </dd>
            </div>
          );
        })}
      </dl>
      <div className="mt-10">
        <ButtonLink href={`/awards/${ceremony.year}`} variant="secondary">
          See the whole ceremony
        </ButtonLink>
      </div>
    </section>
  );
}
