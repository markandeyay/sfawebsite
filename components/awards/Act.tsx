import type { AwardCategory, Film } from "@/content/types";
import { AwardRow } from "./AwardRow";

interface ActProps {
  id: string;
  title: string;
  categories: AwardCategory[];
  films: Map<string, Film>;
}

/**
 * One act of the ceremony: a heading over the seam (centred once the seam
 * exists, at 40rem; left with the stacked rows below it) and its categories
 * in ceremony order, each a winner row. No rules between rows; the negative
 * space is the register. No number on the act.
 */
export function Act({ id, title, categories, films }: ActProps) {
  return (
    <section aria-labelledby={id} className="pt-stage">
      <h2 id={id} className="display text-6 text-fg sm:text-center">
        {title}
      </h2>
      <dl className="mt-8 sm:mt-12 flex flex-col gap-y-8">
        {categories.map((c) => (
          <AwardRow key={c.category} category={c} films={films} />
        ))}
      </dl>
    </section>
  );
}
