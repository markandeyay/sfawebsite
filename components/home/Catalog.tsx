import type { Film } from "@/content/types";
import { FilmCard } from "@/components/FilmCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { numberWord } from "@/lib/home";

/**
 * The catalog: every film on the slate in catalog order, one contact sheet
 * of halftoned frames with their numbers. The numbers are the story: the
 * club has a body of work and it is counted. Cards arrive on seeded, ragged
 * timing (brief 4.6), never on one beat.
 */
export function Catalog({ films }: { films: Film[] }) {
  const year = films[0]?.year;
  const count = numberWord(films.length, true);
  return (
    <section id="films" aria-labelledby="films-title" className="wrap pt-stage pb-section scroll-mt-16">
      <SectionHeading
        id="films-title"
        step={7}
        title={`The ${year} slate`}
        lede={`${count} films, pitched in the fall and shot in the spring by UNC students, most of them on their first set. Every film the club makes gets a number.`}
      />
      <ol className="mt-block grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {films.map((film) => (
          <Reveal as="li" key={film.slug} seed={`catalog:${film.slug}`} variant="rise">
            <FilmCard film={film} headingLevel="h3" />
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
