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
    <section aria-labelledby="tally-title" className="mt-16 sm:mt-24 border-t border-rule py-section sm:py-section">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center">
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
          <h2 id="tally-title" className="display text-6 text-fg">
            Wins by film
          </h2>
          <dl className="mt-8 sm:mt-8">
            {rows.map(({ film, count }) => (
              <div
                key={film.slug}
                className="flex items-baseline justify-between gap-6 py-4 border-t border-rule"
              >
                <dt className="display text-5 text-fg min-w-0">
                  <Link
                    href={`/films/${film.slug}`}
                    className="no-underline transition-[color] hover:text-accent"
                  >
                    {film.title}
                  </Link>
                </dt>
                <dd className="display text-6 text-fg tabular-nums">{count}</dd>
              </div>
            ))}
          </dl>
          {sweep ? (
            <p className="mt-6 text-fg-muted text-2">
              {sweep.film.title} took {numberWord(sweep.count)} of {numberWord(total)} categories.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
