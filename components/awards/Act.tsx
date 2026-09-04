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
    <section aria-labelledby={id} className="border-t border-rule py-16 sm:py-24">
      <h2 id={id} className="display text-display-md text-ink scroll-mt-24">
        {title}
      </h2>
      <dl className="mt-8 sm:mt-10">
        {categories.map((c) => (
          <AwardRow key={c.category} category={c} films={films} />
        ))}
      </dl>
    </section>
  );
}
