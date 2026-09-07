import { getFilmsInCatalogOrder, getFilm } from "@/content";
import { getLatestCeremony, getSiteKeyFilm, summarizeCeremony } from "@/lib/home";
import { Hero } from "@/components/lot/Hero";
import { Band } from "@/components/lot/Band";
import { Slate } from "@/components/lot/Slate";
import { Rack } from "@/components/lot/Rack";
import { Story } from "@/components/lot/Story";
import { Crew } from "@/components/lot/Crew";
import { Credits } from "@/components/lot/Credits";
import { Pitch } from "@/components/lot/Pitch";
import { Footer } from "@/components/lot/Footer";

/* The screening room: one long scroll, every section a reel. Everything
   renders from content/*.json. */
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

      <Band
        tone="rec"
        rot={-2.4}
        rows={[
          { speed: 1, items: [{ b: "Student Film Association" }, { em: "Roll sound" }, { b: `${films.length} Films` }, { em: "Speed" }] },
          { speed: -0.68, items: [{ em: "Festival in May" }, { b: `${summary.total} Awards` }, { em: "Mark it" }, { b: "Action" }] },
        ]}
      />

      <Slate films={films} year={year} />

      <Band
        tone="paper"
        rot={1.8}
        rows={[{ speed: -1, items: [{ b: "Awards Night" }, { em: ceremony.held }, { b: "Best Picture" }, { em: summary.lead ? `${summary.lead.film.title} took ${summary.lead.wins}` : "Voted by the members" }] }]}
      />

      <Rack summary={summary} />

      <Story film={storyFilm} />

      <Crew stills={crewStills} />

      <Band
        tone="navy"
        rot={-1.6}
        rows={[{ speed: 0.86, items: [{ b: "Go Heels" }, { em: "Quiet on set" }, { b: "Roll Sound" }, { em: "Speed" }, { b: "Mark It" }, { em: "Action" }] }]}
      />

      <Credits />

      <Pitch />

      <Footer year={year} />
    </>
  );
}
