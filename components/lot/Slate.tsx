import Link from "next/link";
import type { CSSProperties } from "react";
import type { Film } from "@/content/types";
import { jitter } from "@/lib/hash";
import { numberWord } from "@/lib/home";
import { SectionHead } from "./SectionHead";
import { Media, type Plate, type Shape } from "./Media";
import { CatNo } from "./CatNo";

const SHAPES: Shape[] = ["leaf", "round", "stub", "arch", "round", "pill", "leaf", "stub", "round", "arch", "leaf", "round"];
const PLATES: Plate[] = ["caro", "flare", "gold", "paper", "caro", "flare", "gold", "caro", "paper", "flare", "gold", "caro"];

/* The dark room. Every film on the slate, in the order it was made, on a
   pinned horizontal track. Each frame links to its film page through
   the curtain. Reduced motion or a narrow screen: a grid. */
export function Slate({ films, year }: { films: Film[]; year: number }) {
  return (
    <section className="sec slate t-navy" id="slate" data-scene data-name="The slate" data-idx="01">
      <SectionHead
        n="01"
        slug={`INT. The slate — ${year}`}
        title="The"
        em="Slate"
        no="01"
        meta={[`Roll ${year} — ${numberWord(films.length)} films`, "Numbered in the order they were made"]}
      />

      <div className="slate__pin" id="slate-pin">
        <div className="slate__track" id="slate-track">
          {films.map((film, i) => {
            const rot = jitter(`shot:${film.slug}`, -1.8, 1.8);
            const px = Math.round(jitter(`px:${film.slug}`, -18, 18));
            const py = Math.round(jitter(`py:${film.slug}`, 12, 20));
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
                  shape={SHAPES[i % SHAPES.length]}
                  plate={PLATES[i % PLATES.length]}
                  rot={rot}
                  plateX={px}
                  plateY={py}
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
            <p className="big">End of<br />Roll</p>
            <p className="sub">Roll {year}<br />{numberWord(films.length, true)} films<br />Festival in May</p>
          </div>
        </div>

        <div className="slate__hud" aria-hidden="true">
          <span className="cur" id="sl-cur">01</span>
          <span className="tot">/ {String(films.length).padStart(2, "0")}</span>
          <span className="slate__bar"><i id="sl-fill" /></span>
          <span className="slate__hint">Keep scrolling →</span>
        </div>
      </div>
    </section>
  );
}
