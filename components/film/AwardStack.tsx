import { AwardBadge } from "@/components/AwardBadge";
import { Reveal } from "@/components/motion/Reveal";
import { ACTS } from "@/components/awards/ceremony";
import type { Ceremony, Department, Film } from "@/content/types";
import { byPrestige } from "./words";

/** On a film page the most prestigious department comes first. */
const ORDER: readonly Department[] = ["picture", "performance", "craft"];

/**
 * The film's awards composed as one object: the seals grouped by department
 * (from the ceremony data) in content-sized columns, most prestigious group
 * and category first. A lone group carries no department label. Each seal
 * settles on its own seeded timing. Renders nothing when the film won
 * nothing, so no heading or rule is orphaned.
 */
export function AwardStack({ film, ceremony }: { film: Film; ceremony: Ceremony }) {
  const department = new Map(ceremony.categories.map((c) => [c.category, c.department]));
  const groups = ORDER.map((d) => ({
    department: d,
    title: ACTS.find((a) => a.department === d)?.title ?? d,
    awards: byPrestige(film.awards.filter((a) => department.get(a.category) === d)),
  })).filter((g) => g.awards.length > 0);
  if (groups.length === 0) return null;

  return (
    <div className="grid gap-y-8 lg:grid-cols-3 lg:gap-x-12">
      <h2 id="awards" className="display text-6 text-fg">
        Awards
      </h2>
      <div className="lg:col-span-2 flex flex-wrap gap-x-24 gap-y-8">
        {groups.map((g) => (
          <div key={g.department}>
            {groups.length > 1 ? <h3 className="condensed text-2 text-fg-muted mb-3">{g.title}</h3> : null}
            <ul className="flex flex-col gap-3">
              {g.awards.map((a) => (
                <Reveal as="li" key={a.category} seed={`award:${film.slug}:${a.category}`} variant="rise">
                  <AwardBadge mode="row" category={a.category} person={a.person} />
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
