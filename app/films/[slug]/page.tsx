import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdjacentFilms, getFilm, getFilms } from "@/content";
import { FilmHeader } from "@/components/film/FilmHeader";
import { FilmFacade } from "@/components/film/FilmFacade";
import { AwardStack } from "@/components/film/AwardStack";
import { FilmCredits } from "@/components/film/FilmCredits";
import { AdjacentFilms } from "@/components/film/AdjacentFilms";

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
 * The film page. Header and screen, then awards beside credits, then the
 * neighbouring films. Sections sit on thin rules with the homepage rhythm.
 */
export default async function FilmPage({ params }: PageProps) {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) notFound();
  const { prev, next } = getAdjacentFilms(film.slug);
  const hasAwards = film.awards.length > 0;

  return (
    <article>
      <div className="wrap pt-12 sm:pt-20 pb-16 sm:pb-24">
        <FilmHeader film={film} />
        <div className="mt-12 sm:mt-16">
          <FilmFacade film={film} />
        </div>
      </div>
      <div className="wrap py-16 sm:py-24 border-t border-rule">
        <div className="grid gap-16 lg:grid-cols-2">
          {hasAwards ? <AwardStack film={film} /> : null}
          <FilmCredits film={film} />
        </div>
      </div>
      {prev || next ? (
        <div className="wrap py-16 sm:py-24 border-t border-rule">
          <AdjacentFilms prev={prev} next={next} year={film.year} />
        </div>
      ) : null}
    </article>
  );
}
