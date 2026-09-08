import Link from "next/link";
import type { CSSProperties } from "react";
import type { Film } from "@/content/types";
import { formatCatalogNumber } from "@/content";
import { jitter } from "@/lib/hash";
import { numberWord } from "@/lib/home";
import { SectionHead } from "./SectionHead";
import { Media } from "./Media";
import { CatNo } from "./CatNo";

/* The reel. Every film on the slate, in the order it was made, as one
   continuous strip of frames on ink with a magazine counter in the
   corner; the titles are grease-pencil notes under the strip, circled
   where the film won. Each frame links to its page through the iris.
   Reduced motion or a narrow screen: a vertical reel. */
export function Slate({ films, year }: { films: Film[]; year: number }) {
  return (
    <section className="sec slate t-ink" id="slate" data-scene data-name="The slate" data-idx="01">
      <SectionHead
        n="01"
        slug="INT. The slate — night"
        title="The"
        em="Slate"
        meta={[`Roll ${year} — ${numberWord(films.length)} films`, "Numbered in the order they were made"]}
      />

      <div className="slate__pin" id="slate-pin">
        <div className="slate__track" id="slate-track">
          {films.map((film, i) => {
            const drift = Math.round(jitter(`drift:${film.slug}`, -12, 12));
            const wins = film.awards.length;
            const no = formatCatalogNumber(film.no);
            return (
              <Link
                key={film.slug}
                href={`/films/${film.slug}`}
                className="shot"
                data-drift={drift}
                data-cursor="Watch"
                data-slate={film.title}
                data-scene-no={`No. ${no}`}
                style={{ "--i": i } as CSSProperties}
              >
                <Media film={film} rot={0} edge={[`SFA ▸ ${film.year} ▸ ${String(film.no).padStart(2, "0")}A`, `No. ${no}`]} />
                <h3 className="shot__ttl">
                  {film.title}
                  {wins ? (
                    <svg className="shot__pick" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                      <ellipse cx="50" cy="20" rx="48" ry="17" />
                    </svg>
                  ) : null}
                </h3>
                <p className="shot__meta">
                  <CatNo no={film.no} />
                  <span>{film.director}</span>
                  {wins ? <span className="n">{wins} {wins === 1 ? "win" : "wins"}</span> : null}
                </p>
              </Link>
            );
          })}
          <div className="slate__end">
            <p className="big">End of<br />Reel<em>Roll {year} · tail leader</em></p>
            <p className="sub">{numberWord(films.length, true)} films<br />Festival in May</p>
          </div>
        </div>

        <div className="slate__hud" aria-hidden="true">
          <span className="k">Reel 01</span>
          <span>FR <b id="sl-fr">0000</b></span>
          <span><span className="cur" id="sl-cur">01</span><span className="k"> / {String(films.length).padStart(2, "0")}</span></span>
        </div>
        <span className="slate__lamp" id="sl-lamp" aria-hidden="true" />
      </div>
    </section>
  );
}
