/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Film } from "@/content/types";
import { formatCatalogNumber } from "@/content";
import { SITE } from "@/lib/site";
import { Badge } from "./Badge";

/* The title card. One frame of widescreen: ink bars top and bottom, a
   viewfinder inside them, REC and the aspect ratio in the top bar, the
   club's name set as a main title with the projector beam crossing it,
   and the slate for the cycle's key film right of frame. */
export function Hero({ keyFilm, films, awards, year }: { keyFilm: Film; films: number; awards: number; year: number }) {
  return (
    <section className="hero t-paper" id="hero" data-scene data-name="Title card" data-idx="00">
      <div className="hero__eyebrow" data-hero-fade>
        <span>UNC Chapel Hill</span><i className="ln" />
        <span>Student-run</span><i className="ln" />
        <span>Roll {year}</span><i className="ln" />
        <span className="hot">Festival in May</span>
      </div>

      <div className="hero__stage" data-reveal-head="manual">
        <span className="hero__bar -top" aria-hidden="true" />
        <span className="hero__bar -bottom" aria-hidden="true" />
        <span className="hero__hud" aria-hidden="true">
          <span className="rec">Rec</span>
          <span className="u-hide-sp">Roll {year} · Sc 01 · Tk 01 · 24 fps</span>
          <span>1.85 : 1</span>
        </span>
        <span className="hero__vf" aria-hidden="true"><i /><i /><i /><i /></span>

        <h1 className="hero__lockup">
          <span className="u-sr">{SITE.name}</span>
          <span className="hero__title" data-split aria-hidden="true">
            Student<br />Film<br />Association
          </span>
          <span className="hero__line" data-hero>
            <b>A student-run studio.</b> {films} films a year <span className="hot">★</span> {awards} awards <span className="hot">★</span> one festival
          </span>
        </h1>

        <div className="hero__mascot" data-hero>
          <Link href={`/films/${keyFilm.slug}`} className="slate-card hero__slate" data-cursor="Watch" aria-label={`${keyFilm.title}, the film page`}>
            <span className="slate-card__arm" aria-hidden="true" />
            <span className="slate-card__board">
              <span className="slate-card__frame">
                {keyFilm.still ? (
                  <img src={keyFilm.still.original} alt={`Frame from ${keyFilm.title}`} width="1280" height="720" fetchPriority="high" />
                ) : null}
              </span>
              <span className="slate-card__fields" aria-hidden="true">
                <span>Roll<b>{year}</b></span>
                <span className="hot">Scene<b>No. {formatCatalogNumber(keyFilm.no)}</b></span>
                <span>Take<b>{keyFilm.title}</b></span>
              </span>
            </span>
          </Link>
          <Badge text="Southern Part of Heaven ★ Festival in May ★ Student Film Association ★ " core="clapper.svg" />
        </div>
      </div>

      <div className="hero__foot" data-hero-fade>
        <span className="hero__scroll"><i />Scroll</span>
        <span className="u-hide-sp">Roll {year} — {films} films — {awards} awards — festival in May — no experience needed</span>
      </div>

      <span className="hero__side u-hide-sp" aria-hidden="true">Southern Part of Heaven — Student Film Association</span>
    </section>
  );
}
