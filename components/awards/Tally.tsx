import Link from "next/link";
import type { TallyRow } from "./ceremony";
import { numberWord } from "./ceremony";

interface TallyProps {
  rows: TallyRow[];
  total: number;
  /** The film that swept the night, when one did. */
  sweep: TallyRow | null;
}

/**
 * The night's headline as data: one row per winning film, wins as a Bodoni
 * numeral. Cream throughout. The award color belongs to the winner rows and the finale,
 * where a specific vote is being named.
 */
export function Tally({ rows, total, sweep }: TallyProps) {
  return (
    <section aria-labelledby="tally-heading">
      <h2 id="tally-heading" className="sr-only">
        Wins by film
      </h2>
      <dl className="max-w-xl">
        {rows.map(({ film, count }) => (
          <div
            key={film.slug}
            className="flex items-baseline justify-between gap-6 border-t border-deep py-3"
          >
            <dt className="display-italic text-display-sm text-cream">
              <Link
                href={`/films/${film.slug}`}
                className="underline decoration-1 underline-offset-4 decoration-cream/50 hover:decoration-cream"
              >
                {film.title}
              </Link>
            </dt>
            <dd className="display text-display-md text-cream">{count}</dd>
          </div>
        ))}
      </dl>
      {sweep ? (
        <p className="mt-6 text-body-lg muted prose-block">
          {sweep.film.title} took {numberWord(sweep.count)} of {numberWord(total)} categories.
        </p>
      ) : null}
    </section>
  );
}
