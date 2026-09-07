import Link from "next/link";
import { CatalogNumber } from "@/components/CatalogNumber";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { DUR } from "@/lib/motion";
import type { TallyRow } from "./ceremony";

/**
 * The night's headline as data: one row per winning film, most wins first,
 * the numeral in the condensed voice at step 8 on the left of the seam and
 * the catalog number and linked title on the right. The lede above has
 * already said "fifteen awards to five films", so the numerals need no
 * unit in sight; assistive tech hears "wins". The numerals arrive after
 * the title, one beat apart; nothing is hidden before hydration. Layout in
 * ./ceremony.css.
 */
export function Tally({ rows }: { rows: TallyRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="tally" className="mt-block">
      <h2 id="tally" className="sr-only">
        Wins by film
      </h2>
      <ol className="tally">
        {rows.map(({ film, count }, i) => (
          <li key={film.slug} className="seam">
            <span className="seam__lead tally__count condensed text-8 text-fg">
              <Reveal as="span" variant="none" delay={DUR[3] + i * DUR[2]}>
                <SplitText text={String(count)} seed={`tally:${film.slug}`} />
              </Reveal>
              <span className="sr-only"> {count === 1 ? "win" : "wins"}</span>
            </span>
            <span className="seam__film">
              <CatalogNumber no={film.no} size="row" />
              <Link href={`/films/${film.slug}`} className="link display text-5">
                {film.title}
              </Link>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
