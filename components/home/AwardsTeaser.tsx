import type { Ceremony, Film } from "@/content/types";
import { Frame } from "@/components/Frame";
import { ArrowLink } from "@/components/ArrowLink";
import { numberWord } from "./CatalogStrip";

/**
 * Feature block: still in a grey panel on one side, eyebrow, headline, and
 * an arrow link on the other. The headline is the night's result.
 */
export function AwardsTeaser({ ceremony, films }: { ceremony: Ceremony; films: Map<string, Film> }) {
  const counts = new Map<string, number>();
  for (const c of ceremony.categories) {
    counts.set(c.winner.filmSlug, (counts.get(c.winner.filmSlug) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [leadSlug, leadCount] = ranked[0] ?? [];
  const lead = leadSlug ? films.get(leadSlug) : undefined;
  const total = ceremony.categories.length;
  const bestPicture = ceremony.categories.find((c) => c.category === "Best Picture");
  const bpFilm = bestPicture ? films.get(bestPicture.winner.filmSlug) : undefined;
  const feature = bpFilm ?? lead;

  const headline =
    lead && leadCount
      ? `${lead.title} took ${numberWord(leadCount)} of ${numberWord(total)} awards.`
      : `${numberWord(total, true)} awards, voted by members.`;

  return (
    <section id="awards" aria-labelledby="awards-title" className="wrap py-20 sm:py-28 border-t border-rule">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
        {feature ? (
          <div className="panel">
            <Frame film={feature} />
          </div>
        ) : null}
        <div>
          <p className="eyebrow mb-4">The {ceremony.year} awards</p>
          <h2 id="awards-title" className="display text-display-lg text-ink max-w-[12ch]">
            {headline}
          </h2>
          <p className="text-body-lg mt-6 prose-block">
            {numberWord(total, true)} categories, decided by member vote and presented after the
            festival in May {ceremony.year}.
          </p>
          <div className="mt-10">
            <ArrowLink href={`/awards/${ceremony.year}`}>See the ceremony</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
