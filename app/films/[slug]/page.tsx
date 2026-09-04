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
 * The film page (SFA_SYSTEM_DESIGN.md 11.2). Sections are separated by 1px
 * deep rules, like acts, not by surface bands.
 */
export default async function FilmPage({ params }: PageProps) {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) notFound();
  const { prev, next } = getAdjacentFilms(film.slug);
  const rule = "border-t border-deep mt-8 pt-8 md:mt-12 md:pt-12";

  return (
    <article className="wrap pt-12 md:pt-16">
      <FilmHeader film={film} />
      <div className="mt-8 md:mt-10">
        <FilmFacade film={film} />
      </div>
      {film.awards.length > 0 ? (
        <div className={rule}>
          <AwardStack film={film} />
        </div>
      ) : null}
      <div className={rule}>
        <FilmCredits film={film} />
      </div>
      <div className={rule}>
        <AdjacentFilms prev={prev} next={next} year={film.year} />
      </div>
    </article>
  );
}
