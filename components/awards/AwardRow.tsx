import Link from "next/link";
import type { AwardCategory, Film } from "@/content/types";
import { AwardBadge } from "@/components/AwardBadge";

interface AwardRowProps {
  category: AwardCategory;
  films: Map<string, Film>;
}

/**
 * One category. The category name as an condensed text-2 text-fg-muted in the left column, the
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
    <div className="grid gap-y-2 py-4 sm:grid-cols-2 sm:gap-x-8 border-t border-rule">
      <dt className="condensed text-2 text-fg-muted sm:pt-2">{category.category}</dt>
      <dd className="min-w-0">
        <Link href={`/films/${winner.slug}`} className="group block w-fit no-underline">
          <span className="display text-5 block">{winner.title}</span>
          <AwardBadge mode="row" category={category.category} person={category.winner.person} linked />
        </Link>
      </dd>
      {nominees.length > 0 ? (
        <dd className="text-fg-muted text-2 sm:col-start-2">
          Also nominated: {nominees.map((f) => f.title).join(", ")}
        </dd>
      ) : null}
    </div>
  );
}
