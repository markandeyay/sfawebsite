import Link from "next/link";
import type { CSSProperties } from "react";
import type { Film } from "@/content/types";
import { jitter } from "@/lib/hash";
import { numberWord } from "@/lib/home";
import { SectionHead } from "./SectionHead";
import { Media } from "./Media";
import { CatNo } from "./CatNo";

/* The screening room. Every film on the slate, in the order it was made,
   as frames on one pinned reel with a frame counter. Each frame links to
   its film page through the iris. Reduced motion or a narrow screen: a
   vertical reel. */
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
            const rot = jitter(`shot:${film.slug}`, -1.4, 1.4);
            const drift = Math.round(jitter(`drift:${film.slug}`, -12, 12));
            const wins = film.awards.length;
            return (
              <Link
                key={film.slug}
                href={`/films/${film.slug}`}
                className="shot"
                data-drift={drift}
                data-cursor="Watch"
                style={{ "--i": i } as CSSProperties}
              >
                <Media
                  film={film}
                  rot={rot}
                  cap={
                    <>
                      <CatNo no={film.no} />
                      <span>{film.director}</span>
                      <span className="x">{wins ? `${wins} ${wins === 1 ? "win" : "wins"}` : film.year}</span>
                    </>
                  }
                />
                <h3 className="shot__ttl">{film.title}</h3>
              </Link>
            );
          })}
          <div className="slate__end">
            <p className="big">End of<br />Reel<em>Roll {year} · tail leader</em></p>
            <p className="sub">{numberWord(films.length, true)} films<br />Festival in May</p>
          </div>
        </div>

        <div className="slate__hud" aria-hidden="true">
          <span className="k">Frame</span>
          <span className="cur" id="sl-cur">01</span>
          <span className="tot">/ {String(films.length).padStart(2, "0")}</span>
          <span className="slate__bar"><i id="sl-fill" /></span>
          <span className="slate__hint">Scroll to advance the reel →</span>
        </div>
      </div>
    </section>
  );
}
