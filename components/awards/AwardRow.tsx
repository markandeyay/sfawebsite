import Link from "next/link";
import type { AwardCategory, Film } from "@/content/types";
import { AwardBadge } from "@/components/AwardBadge";

interface AwardRowProps {
  category: AwardCategory;
  films: Map<string, Film>;
}

/**
 * One envelope. Category on the left in the credit setting, right-aligned to
 * a center gutter like the credit block; the winner on the right in the award color.
 * The person line is an enhancement that appears only when the club has
 * published a name (SFA_SYSTEM_DESIGN.md 7.4). Nominees render only when
 * there are any; there is never an empty "Nominees" heading.
 */
export function AwardRow({ category, films }: AwardRowProps) {
  const winner = films.get(category.winner.filmSlug);
  if (!winner) return null;
  const nominees = category.nominees
    .map((n) => films.get(n.filmSlug))
    .filter((f): f is Film => Boolean(f));

  return (
    <div className="grid gap-y-2 py-4 sm:grid-cols-[2fr_3fr] sm:gap-x-8 sm:py-6 sm:items-start">
      <dt className="credit credit-role muted sm:text-right sm:pt-1">{category.category}</dt>
      <dd className="min-w-0">
        <Link
          href={`/films/${winner.slug}`}
          className="group block w-fit no-underline"
        >
          <AwardBadge
            kind="winner"
            person={category.winner.person}
            className="group-hover:underline decoration-1 underline-offset-4"
          >
            {winner.title}
          </AwardBadge>
        </Link>
      </dd>
      {nominees.length > 0 ? (
        <dd className="credit muted sm:col-start-2">
          Also nominated: {nominees.map((f) => f.title).join(", ")}
        </dd>
      ) : null}
    </div>
  );
}
