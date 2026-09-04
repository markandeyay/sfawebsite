import Link from "next/link";
import type { Film } from "@/content/types";
import { Frame } from "@/components/Frame";
import type { TallyRow } from "./ceremony";
import { numberWord } from "./ceremony";

interface TallyProps {
  rows: TallyRow[];
  total: number;
  /** The film that swept the night, when one did. */
  sweep: TallyRow | null;
  /** The still for the block: the Best Picture winner. The only still on the page. */
  feature: Film | undefined;
}

/**
 * The night's result as a feature block: the Best Picture still in a grey
 * panel on one side, the wins by film on thin rules on the other.
 */
export function Tally({ rows, total, sweep, feature }: TallyProps) {
  return (
    <section aria-labelledby="tally-title" className="mt-16 sm:mt-24 border-t border-rule py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
        {feature ? (
          <Link
            href={`/films/${feature.slug}`}
            className="panel block no-underline"
            aria-label={`${feature.title}, the film page`}
          >
            <Frame film={feature} priority />
          </Link>
        ) : null}
        <div>
          <h2 id="tally-title" className="display text-display-md text-ink">
            Wins by film
          </h2>
          <dl className="mt-8 sm:mt-10">
            {rows.map(({ film, count }) => (
              <div
                key={film.slug}
                className="flex items-baseline justify-between gap-6 py-4 border-t border-rule"
              >
                <dt className="display text-display-sm text-ink min-w-0">
                  <Link
                    href={`/films/${film.slug}`}
                    className="no-underline transition-[color] hover:text-carolina"
                  >
                    {film.title}
                  </Link>
                </dt>
                <dd className="display text-display-md text-ink tabular-nums">{count}</dd>
              </div>
            ))}
          </dl>
          {sweep ? (
            <p className="mt-6 muted text-[0.9375rem]">
              {sweep.film.title} took {numberWord(sweep.count)} of {numberWord(total)} categories.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
