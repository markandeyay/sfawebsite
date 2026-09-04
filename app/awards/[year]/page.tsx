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
    title: `${ceremony.year} awards`,
    description: `Winners in all ${numberWord(n)} categories at the Student Film Association's ${ceremony.year} awards ceremony.`,
  };
}

/**
 * The ceremony page: a header, the tally as a feature block, the three
 * acts as rows on thin rules, and Best Picture as a type-only finale.
 * White ground throughout; the only still on the page is in the tally.
 */
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
  const lede = `${capitalize(numberWord(total))} categories, ${filmsClause}${
    swept ? ", one sweep" : ""
  }. Presented after the festival in May ${ceremony.year}.`;

  return (
    <div className="wrap">
      <header className="pt-20 sm:pt-28">
        <p className="eyebrow mb-4">The ceremony</p>
        <h1 className="display text-display-xl text-ink">{ceremony.year} awards</h1>
        <p className="text-body-lg mt-6 prose-block">{lede}</p>
      </header>

      <Tally rows={rows} total={total} sweep={swept} feature={finaleFilm ?? rows[0]?.film} />

      {actList.map((act) => (
        <Act
          key={act.department}
          id={act.department}
          title={act.title}
          categories={act.categories}
          films={films}
        />
      ))}

      {finale && finaleFilm ? <BestPicture category={finale} film={finaleFilm} /> : null}
    </div>
  );
}
