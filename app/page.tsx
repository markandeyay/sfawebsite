import { getFilmsInCatalogOrder, getFilm } from "@/content";
import { getLatestCeremony, getSiteKeyFilm, summarizeCeremony } from "@/lib/home";
import { Hero } from "@/components/lot/Hero";
import { Band } from "@/components/lot/Band";
import { Slate } from "@/components/lot/Slate";
import { Awards } from "@/components/lot/Awards";
import { Story } from "@/components/lot/Story";
import { Credits } from "@/components/lot/Credits";
import { Pitch } from "@/components/lot/Pitch";
import { Footer } from "@/components/lot/Footer";

/* The screening room: one long scroll, paper and ink by turns, every
   section a reel. Everything renders from content/*.json. */
export default function Home() {
  const films = getFilmsInCatalogOrder();
  const ceremony = getLatestCeremony();
  if (!ceremony) throw new Error("No ceremony in content/awards.json");
  const summary = summarizeCeremony(ceremony);
  const keyFilm = getSiteKeyFilm();
  const year = ceremony.year;

  const storyFilm = getFilm("senior-assassin") ?? films.find((f) => f.still && f.slug !== keyFilm.slug) ?? keyFilm;
  const crewStills = ["how-does-it-feel", "the-tulips", "hard-pills-to-swallow", "omnes-unum"]
    .map((s) => getFilm(s))
    .filter((f): f is NonNullable<typeof f> => Boolean(f && f.still));

  return (
    <>
      <Hero keyFilm={keyFilm} films={films.length} awards={summary.total} year={year} />

      {/* a strip of the year's own frames, and a strip of head leader */}
      <Band
        tone="ink"
        rot={-2.4}
        rows={[
          { speed: 1, items: films.map((f) => ({ frame: f })) },
          { speed: -0.68, items: [{ b: "Picture start" }, { em: "Head" }, { b: `SFA Roll ${year}` }, { em: "24 fps" }, { b: "8" }, { em: "Sync" }, { b: "7" }, { em: "Print" }, { b: "6" }, { em: "Keep" }] },
        ]}
      />

      <Slate films={films} year={year} />

      <Band
        tone="paper"
        rot={1.8}
        rows={[{ speed: -1, items: [{ b: "Awards Night" }, { em: ceremony.held }, { b: "Best Picture" }, { em: summary.lead ? `${summary.lead.film.title} took ${summary.lead.wins}` : "Voted by the members" }] }]}
      />

      <Awards summary={summary} />

      <Story film={storyFilm} year={year} />

      <Credits stills={crewStills} />

      <Pitch />

      <Footer year={year} />
    </>
  );
}
