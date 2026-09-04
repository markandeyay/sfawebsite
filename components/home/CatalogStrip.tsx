import type { Film } from "@/content/types";
import { FilmCard } from "@/components/FilmCard";
import { SectionHeading } from "@/components/SectionHeading";

/** Every film on the slate, three across, stills as shot. */
export function CatalogStrip({ films }: { films: Film[] }) {
  const year = films[0]?.year;
  return (
    <section id="films" aria-labelledby="films-title" className="wrap py-20 sm:py-28 border-t border-rule">
      <SectionHeading id="films-title" title={`${year} films`} />
      <ul className="mt-12 sm:mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {films.map((film) => (
          <li key={film.slug}>
            <FilmCard film={film} headingLevel="h3" />
          </li>
        ))}
      </ul>
    </section>
  );
}

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"];
export function numberWord(n: number, capitalize = false): string {
  const w = WORDS[n] ?? String(n);
  return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}
