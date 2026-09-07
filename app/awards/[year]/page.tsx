import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCeremonies, getCeremony, getFilmsForCeremony } from "@/content";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Tally } from "@/components/awards/Tally";
import { Act } from "@/components/awards/Act";
import { BestPicture } from "@/components/awards/BestPicture";
import { acts, capitalize, numberWord, tally } from "@/components/awards/ceremony";
import "@/components/awards/ceremony.css";

interface PageProps {
  params: Promise<{ year: string }>;
}

function parseYear(raw: string): number | null {
  return /^\d{4}$/.test(raw) ? Number(raw) : null;
}

export function generateStaticParams() {
  return getCeremonies().map((c) => ({ year: String(c.year) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const y = parseYear(year);
  const ceremony = y === null ? undefined : getCeremony(y);
  if (!ceremony) return { title: "Ceremony not found" };
  const n = ceremony.categories.length;
  return {
    title: `The ${ceremony.year} awards`,
    description: `Winners in all ${numberWord(n)} categories at the Student Film Association's ${ceremony.year} awards, presented ${ceremony.held}.`,
  };
}

/**
 * The ceremony page: the one room on the site with the Academy register.
 * Centred, heavy negative space, the largest type on the site. The title,
 * when it was held, the tally as the night's headline, the three acts in
 * ceremony order, and Best Picture as the finale with the only still.
 */
export default async function CeremonyPage({ params }: PageProps) {
  const { year } = await params;
  const y = parseYear(year);
  const ceremony = y === null ? undefined : getCeremony(y);
  if (!ceremony) notFound();

  const films = getFilmsForCeremony(ceremony);
  const total = ceremony.categories.length;
  const rows = tally(ceremony, films);
  const { acts: actList, finale } = acts(ceremony);
  const finaleFilm = finale ? films.get(finale.winner.filmSlug) : undefined;
  const lede = `${capitalize(numberWord(total))} awards to ${numberWord(rows.length)} ${
    rows.length === 1 ? "film" : "films"
  }, presented ${ceremony.held}.`;

  return (
    <div className="wrap">
      <header className="pt-stage text-center">
        <Reveal as="h1" variant="none" className="display text-7 text-fg">
          <SplitText text={`The ${ceremony.year} awards`} seed={`ceremony:${ceremony.year}`} />
        </Reveal>
        <p className="text-4 text-fg-muted mt-6 text-balance">{lede}</p>
      </header>

      <Tally rows={rows} />

      {actList.map((act) => (
        <Act
          key={act.department}
          id={`act-${act.department}`}
          title={act.title}
          categories={act.categories}
          films={films}
        />
      ))}

      {finale && finaleFilm ? <BestPicture category={finale} film={finaleFilm} /> : null}
    </div>
  );
}
