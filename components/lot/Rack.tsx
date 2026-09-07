import Link from "next/link";
import type { CategoryName } from "@/content/types";
import type { CeremonySummary } from "@/lib/home";
import { numberWord } from "@/lib/home";
import { jitter } from "@/lib/hash";
import { SectionHead } from "./SectionHead";
import { Media } from "./Media";
import { Stamp } from "./Stamp";
import { CatNo } from "./CatNo";

const SHORT: Partial<Record<CategoryName, string>> = {
  "Best Picture": "Best\nPicture",
  "Best Director": "Best\nDirector",
  "Best Screenplay": "Best\nScreenplay",
  "Best Lead Actor": "Lead\nActor",
  "Best Lead Actress": "Lead\nActress",
  "Best Supporting Actor": "Supp.\nActor",
  "Best Supporting Actress": "Supp.\nActress",
  "Audience Choice": "Audience\nChoice",
};

/* Awards night: every winning film as a frame with its laurel landing
   on the picture as you scroll. The full ceremony is one link away. */
export function Rack({ summary }: { summary: CeremonySummary }) {
  const { ceremony, highlights, total, filmCount, lead, sweep } = summary;
  return (
    <section className="sec t-paper" id="rack" data-scene data-name="Awards" data-idx="02">
      <SectionHead
        n="02"
        slug={`INT. Awards night — ${ceremony.held}`}
        title="Awards"
        em="Night"
        meta={[`${numberWord(total, true)} categories`, "Voted by the members"]}
      />

      <div className="rack__grid">
        {highlights.map((h, i) => {
          const label = (SHORT[h.category] ?? h.category.replace(/^Best /, "Best\n")).split("\n");
          const rot = jitter(`rack:${h.film.slug}`, -1.6, 1.6);
          return (
            <article className="product" data-product key={h.film.slug}>
              <Link href={`/films/${h.film.slug}`} data-cursor="Winner" aria-label={`${h.film.title}, ${h.wins} ${h.wins === 1 ? "win" : "wins"}`}>
                <Media film={h.film} rot={rot} edge={[`Awards ${ceremony.year}`, `${h.wins} of ${total}`]}>
                  <Stamp plate stamp rot={-4}>
                    {label[0]}<br />{label[1]}
                    {h.wins > 1 ? <small>and {h.wins - 1} more</small> : null}
                  </Stamp>
                </Media>
              </Link>
              <div className="product__info">
                <span className="product__sku">Env. {String(i + 1).padStart(2, "0")}</span>
                <h3 className="product__name">{h.film.title}</h3>
                <p className="product__spec"><CatNo no={h.film.no} /> — Directed by {h.film.director}</p>
                <p className="product__wins"><em>{h.wins} {h.wins === 1 ? "win" : "wins"}</em><span>of {total}</span></p>
              </div>
            </article>
          );
        })}
      </div>

      <p className="rack__note" data-reveal>
        {numberWord(total, true)} categories <span>★</span> {numberWord(filmCount)} films
        {lead && sweep ? <> <span>★</span> {lead.film.title} took {numberWord(lead.wins)}</> : null}
        {" "}<span>★</span> <Link href={`/awards/${ceremony.year}`} data-cursor="Go">See the whole ceremony</Link>
      </p>
    </section>
  );
}
