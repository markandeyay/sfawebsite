import Link from "next/link";
import { Frame } from "@/components/Frame";
import type { Film } from "@/content/types";

interface AdjacentFilmsProps {
  prev: Film | undefined;
  next: Film | undefined;
  year: number;
}

/** The grid card shape with the relation as its eyebrow. */
function AdjacentCard({ film, relation }: { film: Film; relation: "Previous film" | "Next film" }) {
  return (
    <Link
      href={`/films/${film.slug}`}
      className="group block no-underline text-ink"
      aria-label={`${relation}: ${film.title}`}
    >
      <div className="overflow-hidden">
        <div className="transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          <Frame film={film} />
        </div>
      </div>
      <p className="eyebrow mt-4">{relation}</p>
      <h3 className="display text-display-sm mt-1 transition-[color] group-hover:text-carolina">
        {film.title}
      </h3>
    </Link>
  );
}

/** Previous and next film on the slate, two cards side by side. */
export function AdjacentFilms({ prev, next, year }: AdjacentFilmsProps) {
  if (!prev && !next) return null;
  return (
    <section aria-labelledby="more">
      <h2 id="more" className="display text-display-md text-ink scroll-mt-24">
        More from the {year} slate
      </h2>
      <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {prev ? (
          <li>
            <AdjacentCard film={prev} relation="Previous film" />
          </li>
        ) : null}
        {next ? (
          <li>
            <AdjacentCard film={next} relation="Next film" />
          </li>
        ) : null}
      </ul>
    </section>
  );
}
