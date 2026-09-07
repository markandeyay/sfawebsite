import Link from "next/link";
import { AwardBadge } from "@/components/AwardBadge";
import { CatalogNumber } from "@/components/CatalogNumber";
import { Reveal } from "@/components/motion/Reveal";
import type { AwardCategory, Film } from "@/content/types";

interface AwardRowProps {
  category: AwardCategory;
  films: Map<string, Film>;
}

/**
 * One winner on the seam: the seal (the category, and the person when the
 * club has published one) right-aligned, the catalog number and the linked
 * title left-aligned. Each row settles on its own seeded timing. Nominees
 * render only when there are any; there is never an empty heading.
 */
export function AwardRow({ category, films }: AwardRowProps) {
  const winner = films.get(category.winner.filmSlug);
  if (!winner) return null;
  const nominees = category.nominees
    .map((n) => films.get(n.filmSlug))
    .filter((f): f is Film => Boolean(f));

  return (
    <Reveal as="div" seed={`row:${category.category}`} variant="rise" className="seam">
      <dt className="seam__lead">
        <AwardBadge mode="row" category={category.category} person={category.winner.person} />
      </dt>
      <dd className="seam__film">
        <CatalogNumber no={winner.no} size="row" />
        <Link href={`/films/${winner.slug}`} className="link display text-5">
          {winner.title}
        </Link>
        {nominees.length > 0 ? (
          <span className="seam__nominees text-2 text-fg-muted">
            Also nominated: {nominees.map((f) => f.title).join(", ")}
          </span>
        ) : null}
      </dd>
    </Reveal>
  );
}
