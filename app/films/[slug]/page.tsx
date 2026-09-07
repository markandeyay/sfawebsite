import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdjacentFilms, getCeremony, getFilm, getFilms } from "@/content";
import { FilmHeader } from "@/components/film/FilmHeader";
import { FilmFacade } from "@/components/film/FilmFacade";
import { AwardStack } from "@/components/film/AwardStack";
import { FilmCredits } from "@/components/film/FilmCredits";
import { AdjacentFilms } from "@/components/film/AdjacentFilms";
import { CeremonyLine } from "@/components/film/CeremonyLine";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getFilms().map((film) => ({ slug: film.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) return {};
  return {
    title: film.title,
    description: film.logline,
    openGraph: {
      title: film.title,
      description: film.logline,
      images: film.still ? [{ url: film.still.original, width: 1280, height: 720 }] : [],
    },
  };
}

/**
 * The film page. The catalog number and title, the screen, then (only when
 * the film won) the awards as one object, the end credits, the films either
 * side of it in the catalog, and one line to the ceremony. Unequal air: the
 * header and screen sit close; each later block gets a section of space.
 */
export default async function FilmPage({ params }: PageProps) {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) notFound();
  const ceremony = getCeremony(film.year);
  const { prev, next } = getAdjacentFilms(film.slug);
  const slateSize = getFilms().filter((f) => f.year === film.year).length;
  const hasAwards = film.awards.length > 0 && Boolean(ceremony);

  return (
    <article>
      <div className="wrap pt-block">
        <FilmHeader film={film} />
      </div>
      <div className="wrap mt-block">
        <FilmFacade film={film} />
      </div>
      {hasAwards && ceremony ? (
        <section aria-labelledby="awards" className="wrap mt-section hairline-t pt-block">
          <AwardStack film={film} ceremony={ceremony} />
        </section>
      ) : null}
      <section aria-labelledby="credits" className="wrap mt-section">
        <FilmCredits film={film} />
      </section>
      <section aria-labelledby="more" className="wrap mt-section">
        <AdjacentFilms film={film} prev={prev} next={next} />
      </section>
      <div className="wrap mt-section">
        <CeremonyLine film={film} ceremony={ceremony} slateSize={slateSize} />
      </div>
    </article>
  );
}
