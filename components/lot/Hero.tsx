/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Film } from "@/content/types";
import { formatCatalogNumber } from "@/content";
import { SITE } from "@/lib/site";
import { Badge } from "./Badge";

/* Magazine cover: masthead rule, the handstyle mark with a colour sheen
   travelling through it, the slate card carrying the cycle's key frame
   where a mascot would sit, dense corner meta. */
export function Hero({ keyFilm, films, awards }: { keyFilm: Film; films: number; awards: number }) {
  return (
    <section className="hero t-paper" id="hero" data-scene data-name="Cover" data-idx="00">
      <div className="hero__eyebrow" data-hero-fade>
        <span>UNC Chapel Hill</span><i className="ln" />
        <span>Student-run</span><i className="ln" />
        <span>Roll 2025</span><i className="ln" />
        <span className="hot">Festival in May</span>
      </div>

      <div className="hero__stage">
        <h1 className="hero__lockup">
          <span className="u-sr">{SITE.name}</span>
          <span className="hero__mark sheen" id="hero-mark" aria-hidden="true"><i /></span>
          <span className="hero__sub" data-hero aria-hidden="true">
            Student Film <em>Association</em>
          </span>
          <span className="hero__tag" data-hero>
            <span>Studio</span><span className="hot">★</span><span>Roll camera</span>
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
                <span><div>Roll<b>2025</b></div></span>
                <span><div className="hot">Scene<b>No. {formatCatalogNumber(keyFilm.no)}</b></div></span>
                <span><div>Take<b>{keyFilm.title}</b></div></span>
              </span>
            </span>
          </Link>
          <Badge text="Southern Part of Heaven ★ Festival in May ★ Student Film Association ★ " core="clapper.svg" />
        </div>
      </div>

      <div className="hero__foot" data-hero-fade>
        <span className="hero__scroll"><i />Scroll</span>
        <span className="u-hide-sp">Roll 2025 — {films} films — {awards} awards — festival in May — no experience needed</span>
      </div>

      <span className="hero__side u-hide-sp" aria-hidden="true">Southern Part of Heaven — Student Film Association</span>
    </section>
  );
}
