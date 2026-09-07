import { getFilmsInCatalogOrder } from "@/content";
import { getLatestCeremony, getSiteKeyFilm, summarizeCeremony } from "@/lib/home";
import { HeroTitleCard } from "@/components/home/HeroTitleCard";
import { NowShowing } from "@/components/home/NowShowing";
import { Catalog } from "@/components/home/Catalog";
import { AwardsTeaser } from "@/components/home/AwardsTeaser";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Crew } from "@/components/home/Crew";
import { Join } from "@/components/home/Join";

/**
 * Homepage: the cold open, now showing, the catalog, the awards teaser, how
 * it works, the crew, join. Everything renders from content/*.json.
 */
export default function Home() {
  const films = getFilmsInCatalogOrder();
  const keyFilm = getSiteKeyFilm();
  const ceremony = getLatestCeremony();
  const summary = ceremony ? summarizeCeremony(ceremony) : null;

  return (
    <>
      <HeroTitleCard film={keyFilm} />
      <NowShowing />
      <Catalog films={films} />
      {summary ? <AwardsTeaser summary={summary} /> : null}
      <HowItWorks />
      <Crew />
      <Join />
    </>
  );
}
