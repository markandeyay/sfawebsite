import Link from "next/link";
import type { CeremonySummary } from "@/lib/home";
import { numberWord } from "@/lib/home";
import { formatCatalogNumber } from "@/content";
import { SectionHead } from "./SectionHead";
import { Media } from "./Media";
import { Stamp } from "./Stamp";
import { CatNo } from "./CatNo";
import { sealLines } from "./seals";

/* Awards night as a ceremony: Best Picture is the biggest frame in the
   room, the other winners sit beside and beneath it, each with its
   laurel printed on the still and its categories listed; the night
   ends on a title card with a ticket to the full ceremony. */
export function Awards({ summary }: { summary: CeremonySummary }) {
  const { ceremony, highlights, total, filmCount, lead, sweep } = summary;
  const catsFor = (slug: string) => ceremony.categories.filter((c) => c.winner.filmSlug === slug).map((c) => c.category);
  return (
    <section className="sec t-paper" id="awards" data-scene data-name="Awards night" data-idx="02">
      <SectionHead
        n="02"
        slug={`INT. Awards night — ${ceremony.held}`}
        title="Awards"
        em="Night"
        meta={[`${numberWord(total, true)} categories`, "Voted by the members"]}
      />

      <div className="awards__grid">
        {highlights.map((h, i) => {
          const [l1, l2] = sealLines(h.category);
          const no = formatCatalogNumber(h.film.no);
          const cats = catsFor(h.film.slug);
          return (
            <article className="pic" data-pic key={h.film.slug}>
              <Link
                href={`/films/${h.film.slug}`}
                data-cursor="Winner"
                data-slate={h.film.title}
                data-scene-no={`No. ${no}`}
                aria-label={`${h.film.title}, ${h.wins} ${h.wins === 1 ? "win" : "wins"}`}
              >
                <Media film={h.film} size={i === 0 ? "full" : "card"} edge={[`Awards ${ceremony.year}`, `${h.wins} of ${total}`]}>
                  <Stamp plate stamp rot={-4}>
                    {l1}<br />{l2}
                  </Stamp>
                </Media>
              </Link>
              <div className="pic__info">
                <h3 className="pic__name">{h.film.title}</h3>
                <p className="pic__spec"><CatNo no={h.film.no} /> — Directed by {h.film.director}</p>
                <p className="pic__cats"><em>{h.wins} {h.wins === 1 ? "win" : "wins"}</em> · {cats.join(" · ")}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="awards__card" data-reveal>
        <p>{numberWord(total, true)} categories</p>
        <p>{numberWord(filmCount, true)} films</p>
        {lead && sweep ? <p><span>{lead.film.title}</span> took {numberWord(lead.wins)}</p> : null}
        <Link className="pill" href={`/awards/${ceremony.year}`} data-cursor="Go" data-slate="Awards night" data-scene-no={String(ceremony.year)}>
          See the whole ceremony
        </Link>
      </div>
    </section>
  );
}
