import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCeremonies, getCeremony, getFilmsForCeremony, getKeyFilm, CANONICAL_CATEGORIES } from "@/content";
import type { AwardCategory, Department } from "@/content/types";
import { numberWord, summarizeCeremony } from "@/lib/home";
import { jitter } from "@/lib/hash";
import { SectionHead } from "@/components/lot/SectionHead";
import { CatNo } from "@/components/lot/CatNo";
import { Media } from "@/components/lot/Media";
import { Badge } from "@/components/lot/Badge";
import { Stamp } from "@/components/lot/Stamp";
import { Band } from "@/components/lot/Band";
import { Footer } from "@/components/lot/Footer";
import { sealLines } from "@/components/lot/seals";

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
    title: `Awards night ${ceremony.year}`,
    description: `Winners in all ${numberWord(n)} categories at the Student Film Association's ${ceremony.year} awards, presented ${ceremony.held}.`,
  };
}

const ACTS: Array<{ dept: Department; title: string; k: string }> = [
  { dept: "craft", title: "Craft", k: "Act I" },
  { dept: "performance", title: "Performance", k: "Act II" },
  { dept: "picture", title: "Picture", k: "Act III" },
];

/* Awards night as its own show: the tally as a scoreboard, three acts
   in ceremony order with a laurel on every winner, and Best Picture as
   the finale on the ink with the only still. */
export default async function CeremonyPage({ params }: PageProps) {
  const { year } = await params;
  const y = parseYear(year);
  const ceremony = y === null ? undefined : getCeremony(y);
  if (!ceremony) notFound();

  const films = getFilmsForCeremony(ceremony);
  const summary = summarizeCeremony(ceremony);
  const byWins = [...summary.highlights].sort((a, b) => b.wins - a.wins || CANONICAL_CATEGORIES.indexOf(b.category) - CANONICAL_CATEGORIES.indexOf(a.category));
  const finale = ceremony.categories.find((c) => c.category === "Best Picture");
  const finaleFilm = getKeyFilm(ceremony);
  const rank = (c: AwardCategory) => CANONICAL_CATEGORIES.indexOf(c.category);
  const total = ceremony.categories.length;

  return (
    <>
      <div className="night" style={{ paddingBlockStart: "calc(var(--s9) + 2vw)" }}>
        <section className="sec t-paper" id="night" data-scene data-name="Awards night" data-idx="02" style={{ paddingBlockStart: 0 }}>
          <SectionHead
            n={String(ceremony.year).slice(2)}
            slug={`INT. Awards night — ${ceremony.held}`}
            title="Awards"
            em="Night"
            meta={[`${numberWord(total, true)} categories`, "Voted by the members"]}
          />
          <p className="night__lede" data-reveal>
            {numberWord(total, true)} awards to {numberWord(summary.filmCount)} films.
            {summary.lead && summary.sweep ? <> <span>{summary.lead.film.title} took {numberWord(summary.lead.wins)}.</span></> : null}
          </p>

          <div className="tally" data-reveal>
            {byWins.map((h) => (
              <div className="tally__row" key={h.film.slug}>
                <span className="tally__n" aria-label={`${h.wins} ${h.wins === 1 ? "win" : "wins"}`}>{h.wins}</span>
                <div className="tally__film">
                  <CatNo no={h.film.no} />
                  <Link href={`/films/${h.film.slug}`} className="tally__ttl u-line" data-cursor="Watch">{h.film.title}</Link>
                  <span className="ty-label">Directed by {h.film.director}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Band
          tone="rec"
          rot={1.6}
          rows={[{ speed: -0.9, items: [{ b: "And the winner is" }, { em: ceremony.held }, { b: `${total} categories` }, { em: "Voted by the members" }] }]}
        />

        <section className="sec t-paper" id="acts" aria-label="Winners by act">
          {ACTS.map((act) => {
            const cats = ceremony.categories.filter((c) => c.department === act.dept && c.category !== "Best Picture").sort((a, b) => rank(a) - rank(b));
            if (!cats.length) return null;
            return (
              <div className="act" key={act.dept}>
                <h2 className="act__ttl" data-reveal><span className="k">{act.k}</span>{act.title}</h2>
                {cats.map((c, i) => {
                  const film = films.get(c.winner.filmSlug);
                  if (!film) return null;
                  const [l1, l2] = sealLines(c.category);
                  return (
                    <div className="win" data-win key={c.category}>
                      <span className="win__cat">{c.category}</span>
                      <span className="win__seal" style={{ "--stamp-rot": `${jitter(`win:${c.category}`, -5, 5).toFixed(1)}deg` } as React.CSSProperties} aria-hidden="true">
                        <Stamp inline winner={false} rot={0}>{l1}<br />{l2}</Stamp>
                      </span>
                      <div className="win__film">
                        <CatNo no={film.no} />
                        <Link href={`/films/${film.slug}`} className="win__ttl u-line" data-cursor="Watch">{film.title}</Link>
                        {c.winner.person ? <span className="win__person">{c.winner.person}</span> : null}
                        {c.nominees.length ? (
                          <span className="win__person">Also nominated: {c.nominees.map((n) => films.get(n.filmSlug)?.title ?? n.filmSlug).join(", ")}</span>
                        ) : null}
                      </div>
                      <span className="u-sr">{`${act.title} ${i + 1}`}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>

        {finale ? (
          <section className="sec t-ink" id="finale" data-scene data-name="Best Picture" data-idx="BP" aria-labelledby="finale-ttl">
            <SectionHead n="★" slug="INT. The finale — last envelope" title="Best" em="Picture" meta={[ceremony.held, "The last envelope"]} />
            <div className="finale" data-reveal-head>
              <div className="finale__frame" data-finale>
                <Media
                  film={finaleFilm}
                  rot={-0.8}
                  size="full"
                  cursor="Watch"
                  edge={[`Best Picture ▸ ${ceremony.year}`, `No. ${String(finaleFilm.no).padStart(3, "0")}`]}
                  cap={<><CatNo no={finaleFilm.no} />Directed by {finaleFilm.director}<span className="x">{ceremony.year}</span></>}
                />
                <Badge text={`Best Picture ★ ${ceremony.year} ★ Student Film Association ★ `} core="star.svg" />
              </div>
              <div className="finale__laurel">
                <Stamp inline rot={-3}>Best<br />Picture</Stamp>
              </div>
              <h2 className="finale__ttl" id="finale-ttl" data-split>
                <Link href={`/films/${finaleFilm.slug}`} data-cursor="Watch">{finaleFilm.title}</Link>
              </h2>
              <p className="finale__by">
                {numberWord(summary.lead?.wins ?? 1, true)} {(summary.lead?.wins ?? 1) === 1 ? "award" : "awards"} on the night — directed by {finaleFilm.director}
              </p>
            </div>
          </section>
        ) : null}
      </div>

      <Footer year={ceremony.year} />
    </>
  );
}
