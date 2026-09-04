import Link from "next/link";
import type { AwardCategory, Film } from "@/content/types";
import { AwardBadge } from "@/components/AwardBadge";

interface AwardRowProps {
  category: AwardCategory;
  films: Map<string, Film>;
}

/**
 * One category. The category name as an eyebrow in the left column, the
 * winner in the display face on the right, linked to the film page. The
 * person line appears only when the club has published a name. Nominees
 * render only when there are any; there is never an empty heading.
 */
export function AwardRow({ category, films }: AwardRowProps) {
  const winner = films.get(category.winner.filmSlug);
  if (!winner) return null;
  const nominees = category.nominees
    .map((n) => films.get(n.filmSlug))
    .filter((f): f is Film => Boolean(f));

  return (
    <div className="grid gap-y-2 py-5 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-x-8 border-t border-rule">
      <dt className="eyebrow sm:pt-2">{category.category}</dt>
      <dd className="min-w-0">
        <Link href={`/films/${winner.slug}`} className="group block w-fit no-underline">
          <AwardBadge kind="winner" person={category.winner.person} linked>
            {winner.title}
          </AwardBadge>
        </Link>
      </dd>
      {nominees.length > 0 ? (
        <dd className="muted text-[0.9375rem] sm:col-start-2">
          Also nominated: {nominees.map((f) => f.title).join(", ")}
        </dd>
      ) : null}
    </div>
  );
}
