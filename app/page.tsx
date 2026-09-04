import { getCeremonies, getFilms, getFilmsForCeremony } from "@/content";
import { getHeroFilm } from "@/lib/home";
import { HeroScreen } from "@/components/home/HeroScreen";
import { NowShowing } from "@/components/home/NowShowing";
import { CatalogStrip } from "@/components/home/CatalogStrip";
import { AwardsTeaser } from "@/components/home/AwardsTeaser";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Crew } from "@/components/home/Crew";
import { Join } from "@/components/home/Join";

/**
 * Homepage. Section order per SFA_SYSTEM_DESIGN.md 6.2: cold open, now
 * showing, the catalog, the awards, how it works, the crew, join.
 * Everything renders from content/*.json.
 */
export default function Home() {
  const films = getFilms();
  const ceremony = getCeremonies().sort((a, b) => b.year - a.year)[0];
  const ceremonyFilms = ceremony ? getFilmsForCeremony(ceremony) : new Map();

  return (
    <>
      <HeroScreen film={getHeroFilm()} />
      <NowShowing />
      <CatalogStrip films={films} />
      {ceremony ? <AwardsTeaser ceremony={ceremony} films={ceremonyFilms} /> : null}
      <HowItWorks />
      <Crew />
      <Join />
    </>
  );
}
