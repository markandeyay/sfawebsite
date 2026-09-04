import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCeremonies, getCeremony, getFilmsForCeremony } from "@/content";
import { Tally } from "@/components/awards/Tally";
import { Act } from "@/components/awards/Act";
import { BestPicture } from "@/components/awards/BestPicture";
import { acts, capitalize, numberWord, sweep, tally } from "@/components/awards/ceremony";

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
    title: `The ${ceremony.year} ceremony`,
    description: `Winners in all ${numberWord(n)} categories at the Student Film Association's ${ceremony.year} awards ceremony.`,
  };
}

export default async function CeremonyPage({ params }: PageProps) {
  const { year } = await params;
  const y = parseYear(year);
  const ceremony = y === null ? undefined : getCeremony(y);
  if (!ceremony) notFound();

  const films = getFilmsForCeremony(ceremony);
  const total = ceremony.categories.length;
  const rows = tally(ceremony, films);
  const swept = sweep(rows, total);
  const { acts: actList, finale } = acts(ceremony);
  const finaleFilm = finale ? films.get(finale.winner.filmSlug) : undefined;

  const filmsClause = `${numberWord(rows.length)} ${rows.length === 1 ? "film" : "films"}`;
  const lede = `May ${ceremony.year}. ${capitalize(numberWord(total))} categories, ${filmsClause}${
    swept ? ", one sweep." : "."
  }`;

  return (
    <div className="wrap pt-16 sm:pt-24">
      <header>
        <h1 className="display text-display-lg text-cream">The {ceremony.year} ceremony</h1>
        <p className="mt-4 text-body-lg muted prose-block">{lede}</p>
      </header>

      <div className="mt-12 sm:mt-16">
        <Tally rows={rows} total={total} sweep={swept} />
      </div>

      <div className="mt-16 flex flex-col gap-12 sm:mt-24 sm:gap-16">
        {actList.map((act) => (
          <Act
            key={act.department}
            id={act.department}
            title={act.title}
            categories={act.categories}
            films={films}
          />
        ))}
      </div>

      {finale && finaleFilm ? <BestPicture category={finale} film={finaleFilm} /> : null}
    </div>
  );
}
