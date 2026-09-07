import type { AwardCategory, Film } from "@/content/types";
import { AwardRow } from "./AwardRow";

interface ActProps {
  id: string;
  title: string;
  categories: AwardCategory[];
  films: Map<string, Film>;
}

/**
 * One act of the ceremony: a heading and its categories in ceremony order,
 * each on a thin rule. No number on the act; the order carries itself.
 */
export function Act({ id, title, categories, films }: ActProps) {
  return (
    <section aria-labelledby={id} className="border-t border-rule py-section sm:py-section">
      <h2 id={id} className="display text-6 text-fg scroll-mt-24">
        {title}
      </h2>
      <dl className="mt-8 sm:mt-8">
        {categories.map((c) => (
          <AwardRow key={c.category} category={c} films={films} />
        ))}
      </dl>
    </section>
  );
}
