import type { AwardCategory, Film } from "@/content/types";
import { AwardRow } from "./AwardRow";

interface ActProps {
  id: string;
  title: string;
  categories: AwardCategory[];
  films: Map<string, Film>;
}

/**
 * One act of the ceremony: a heading and its envelopes in ceremony order,
 * separated by 1px rules. No number on the act; the order carries itself.
 */
export function Act({ id, title, categories, films }: ActProps) {
  return (
    <section aria-labelledby={id} className="border-t border-deep pt-8 sm:pt-12">
      <h2 id={id} className="display text-display-md text-cream">
        {title}
      </h2>
      <dl className="mt-4 max-w-4xl divide-y divide-deep sm:mt-6">
        {categories.map((c) => (
          <AwardRow key={c.category} category={c} films={films} />
        ))}
      </dl>
    </section>
  );
}
