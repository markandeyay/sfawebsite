import { FilmCard } from "@/components/FilmCard";
import { Reveal } from "@/components/motion/Reveal";
import type { Film } from "@/content/types";

interface AdjacentFilmsProps {
  film: Film;
  prev: Film | undefined;
  next: Film | undefined;
}

/**
 * The films either side of this one in the catalog (previous, then next,
 * wrapping at the ends), as the same card the homepage uses, so the number
 * sits in the same place here as everywhere. The cards settle on seeded
 * timing. Nothing renders for a catalog of one.
 */
export function AdjacentFilms({ film, prev, next }: AdjacentFilmsProps) {
  const neighbours: Film[] = [];
  for (const f of [prev, next]) {
    if (f && f.slug !== film.slug && !neighbours.some((n) => n.slug === f.slug)) neighbours.push(f);
  }
  if (neighbours.length === 0) return null;
  const sameSlate = neighbours.every((f) => f.year === film.year);

  return (
    <div className="grid gap-y-8 lg:grid-cols-3 lg:gap-x-12">
      <h2 id="more" className="display text-6 text-fg">
        {sameSlate ? `Also on the ${film.year} slate` : "Next to it in the catalog"}
      </h2>
      <ul className="lg:col-span-2 grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {neighbours.map((f) => (
          <Reveal as="li" key={f.slug} seed={`adjacent:${film.slug}:${f.slug}`} variant="rise">
            <FilmCard film={f} />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
