import { getCeremonies, getFilms, getFilmsForCeremony } from "@/content";
import type { Film } from "@/content/types";
import { FEATURED_SLUGS } from "@/lib/featured";
import { Hero, type HeroFilm } from "@/components/home/Hero";
import { NowShowing } from "@/components/home/NowShowing";
import { CatalogStrip } from "@/components/home/CatalogStrip";
import { AwardsTeaser } from "@/components/home/AwardsTeaser";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Crew } from "@/components/home/Crew";
import { Join } from "@/components/home/Join";

/**
 * Homepage: hero, now showing, the awards, the films, how it works, the
 * crew, join. Everything renders from content/*.json.
 */
export default function Home() {
  const films = getFilms();
  const bySlug = new Map(films.map((f) => [f.slug, f]));
  const ceremony = getCeremonies().sort((a, b) => b.year - a.year)[0];
  const ceremonyFilms = ceremony ? getFilmsForCeremony(ceremony) : new Map<string, Film>();

  const heroFilms: HeroFilm[] = FEATURED_SLUGS.map((s) => bySlug.get(s))
    .filter((f): f is Film => Boolean(f && f.still))
    .map((f) => ({
      slug: f.slug,
      title: f.title,
      year: f.year,
      director: f.director,
      image: f.still!.original,
    }));

  const joinFilm = bySlug.get("senior-assassin") ?? films.find((f) => f.still);

  return (
    <>
      <Hero films={heroFilms} />
      <NowShowing />
      {ceremony ? <AwardsTeaser ceremony={ceremony} films={ceremonyFilms} /> : null}
      <CatalogStrip films={films} />
      <HowItWorks />
      <Crew />
      <Join film={joinFilm} />
    </>
  );
}
