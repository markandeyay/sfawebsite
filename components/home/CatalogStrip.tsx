import Link from "next/link";
import type { Film } from "@/content/types";
import { FilmCard } from "@/components/FilmCard";
import { SectionHeading } from "@/components/SectionHeading";
import { FEATURED_SLUGS } from "@/lib/featured";

/**
 * Six frames from the slate as a contact sheet, then every other film on the
 * slate by name, so all twelve are one click away (a member looking for
 * their own film should find it here).
 */
export function CatalogStrip({ films }: { films: Film[] }) {
  const bySlug = new Map(films.map((f) => [f.slug, f]));
  const featured = FEATURED_SLUGS.map((s) => bySlug.get(s)).filter((f): f is Film => Boolean(f));
  const featuredSet = new Set(featured.map((f) => f.slug));
  const rest = films.filter((f) => !featuredSet.has(f.slug));
  const year = films[0]?.year;

  return (
    <section id="films" aria-labelledby="films-title" className="wrap py-16 sm:py-24 border-t border-deep">
      <SectionHeading
        id="films-title"
        title={`The ${year} slate`}
        lede={`${numberWord(films.length, true)} films, written, shot, and cut by student crews in one school year, and screened at the festival in May ${year}. Hover or focus a frame to see it untreated.`}
      />
      <ul className="mt-10 sm:mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((film, i) => (
          <li key={film.slug}>
            <FilmCard film={film} headingLevel="h3" priority={i < 3} />
          </li>
        ))}
      </ul>
      {rest.length > 0 ? (
        <div className="mt-12 sm:mt-16 max-w-3xl">
          <h3 className="credit credit-role muted">Also on the slate</h3>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {rest.map((film) => (
              <li key={film.slug}>
                <Link href={`/films/${film.slug}`} className="link text-cream">
                  <span className="display-italic text-[1.125rem]">{film.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"];
export function numberWord(n: number, capitalize = false): string {
  const w = WORDS[n] ?? String(n);
  return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}
