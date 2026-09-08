/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Film } from "@/content/types";
import { formatCatalogNumber } from "@/content";
import { SITE } from "@/lib/site";

/* The screen. One real widescreen frame, ink, full bleed, on the paper
   page: REC and the ratio in its top bar, viewfinder brackets in its
   corners, the club's name inside it as a main title with a Carolina
   light passing through the letters, and the slate for the cycle's key
   film held into the lens, breaking the bottom edge of the frame. */
export function Hero({ keyFilm, films, awards, year }: { keyFilm: Film; films: number; awards: number; year: number }) {
  const no = formatCatalogNumber(keyFilm.no);
  return (
    <section className="hero t-paper" id="hero" data-scene data-name="Title card" data-idx="00">
      <div className="hero__stage" data-reveal-head="manual" id="hero-stage">
        <span className="hero__hud" aria-hidden="true">
          <span className="rec">Rec</span>
          <span className="u-hide-sp">UNC Chapel Hill · Roll {year} · Sc 01 · Tk 01 · 24 fps</span>
          <span>2.39 : 1</span>
        </span>
        <span className="hero__vf" aria-hidden="true"><i /><i /><i /><i /></span>

        <h1 className="hero__lockup">
          <span className="u-sr">{SITE.name}</span>
          <span className="hero__title" data-split aria-hidden="true">
            Student<br />Film<br />Association
          </span>
        </h1>

        <div className="hero__mascot" data-hero>
          <Link
            href={`/films/${keyFilm.slug}`}
            className="slate-card hero__slate"
            data-cursor="Watch"
            data-slate={keyFilm.title}
            data-scene-no={`No. ${no}`}
            aria-label={`${keyFilm.title}, the film page`}
          >
            <span className="slate-card__arm" aria-hidden="true" />
            <span className="slate-card__board">
              <span className="slate-card__frame">
                {keyFilm.still ? (
                  <img src={keyFilm.still.original} alt={`Frame from ${keyFilm.title}`} width="1280" height="720" fetchPriority="high" />
                ) : null}
              </span>
              <span className="slate-card__fields" aria-hidden="true">
                <span>Roll<b>{year}</b></span>
                <span className="hot">Scene<b>No. {no}</b></span>
                <span>Take<b>{keyFilm.title}</b></span>
              </span>
            </span>
          </Link>
        </div>
      </div>

      <p className="hero__line" data-hero>
        <b>A student-run studio at UNC.</b> {films} films a year <span className="hot">▸</span> {awards} awards <span className="hot">▸</span> one festival, every May
      </p>

      <div className="hero__foot" data-hero-fade>
        <span className="hero__scroll"><i />Scroll</span>
        <span className="u-hide-sp">No experience needed</span>
        <span className="hot">Festival in May</span>
      </div>
    </section>
  );
}
