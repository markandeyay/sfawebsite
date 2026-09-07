import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentFilms, getCeremony, getFilm, getFilms, formatCatalogNumber } from "@/content";
import { numberWord } from "@/lib/home";
import { jitter } from "@/lib/hash";
import { CatNo } from "@/components/lot/CatNo";
import { sealLines } from "@/components/lot/seals";
import { Media } from "@/components/lot/Media";
import { Stamp } from "@/components/lot/Stamp";
import { Band } from "@/components/lot/Band";
import { Footer } from "@/components/lot/Footer";
import { FilmScreen } from "@/components/film/FilmScreen";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getFilms().map((film) => ({ slug: film.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) return {};
  return {
    title: `${film.title} — No. ${formatCatalogNumber(film.no)}`,
    description: film.logline,
    openGraph: {
      title: film.title,
      description: film.logline,
      images: film.still ? [{ url: film.still.original, width: 1280, height: 720 }] : [],
    },
  };
}

const TONES = [undefined, "navy", "ink", undefined, "navy", "ink", undefined] as const;

/* The film page: the catalog number as the scale moment, the title, the
   screen, the laurels, the end credits, the films either side of it on
   the slate. Same chrome, same atmosphere, same iris as the lot. */
export default async function FilmPage({ params }: PageProps) {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) notFound();
  const ceremony = getCeremony(film.year);
  const { prev, next } = getAdjacentFilms(film.slug);
  const slateSize = getFilms().filter((f) => f.year === film.year).length;
  const wins = film.awards.length;
  const src = film.still ? film.still.original : null;
  const no = formatCatalogNumber(film.no);

  return (
    <>
      <article className="film t-paper" id="film" data-scene data-name={film.title} data-idx={no}>
        <div className="film__eyebrow" data-hero-fade>
          <span>INT. {film.title}</span><i className="ln" />
          <span>Roll {film.year}</span><i className="ln" />
          <span>{numberWord(slateSize, true)} on the slate</span><i className="ln" />
          <span className="hot">{wins ? `${numberWord(wins, true)} ${wins === 1 ? "award" : "awards"}` : "Official selection"}</span>
        </div>

        <header className="film__head" data-reveal-head>
          <span data-film-hero className="film__no"><CatNo no={film.no} big /></span>
          <h1 className="film__ttl" data-split>{film.title}</h1>
          <span className="film__by" data-film-hero>Directed by <b>{film.director}</b></span>
        </header>

        <div className="film__grid">
          <p className="film__log" data-film-hero>{film.logline}</p>
          <div className="film__meta" data-film-hero>
            <span><b>Roll</b> {film.year} slate</span>
            <span><b>Track</b> {film.track === "studio" ? "Studio process" : "Independent"}</span>
            {film.runtime ? <span><b>Runtime</b> {film.runtime} min</span> : null}
            <span><b>Screened</b> SFA Film Festival, {ceremony?.held ?? `May ${film.year}`}</span>
            {!film.viewable ? <span><b>Streaming</b> Festival only</span> : null}
          </div>
        </div>

        <div className="film__screen" data-film-hero>
          <FilmScreen
            youtubeId={film.youtubeId}
            title={film.title}
            src={src}
            viewable={film.viewable}
            edge={[`SFA ▸ ${film.year} ▸ ${String(film.no).padStart(2, "0")}A ▸ ${film.runtime ? `${film.runtime} min` : "Print"}`, `No. ${no}`]}
          />
        </div>

        <div className="film__body">
          <section aria-labelledby="film-awards">
            <h2 className="film__sub" id="film-awards">Awards <em>night</em></h2>
            {wins && ceremony ? (
              <>
                <p className="ty-body">
                  {numberWord(wins, true)} of the {numberWord(ceremony.categories.length)} categories at the {ceremony.year} ceremony, voted on by the members.
                </p>
                <div className="seals" data-seals>
                  {film.awards.map((a, i) => {
                    const [l1, l2] = sealLines(a.category);
                    return (
                      <Stamp key={a.category} tone={TONES[i % TONES.length]} rot={jitter(`seal:${film.slug}:${i}`, -7, 6)} seal>
                        {l1}<br />{l2}
                        {a.person ? <small>{a.person}</small> : null}
                      </Stamp>
                    );
                  })}
                </div>
                <p className="ty-label" style={{ marginBlockStart: "var(--s5)" }}>
                  <Link href={`/awards/${ceremony.year}`} className="u-line" data-cursor="Go">The whole {ceremony.year} ceremony</Link>
                </p>
              </>
            ) : (
              <p className="ty-body">
                {film.title} screened at the {film.year} festival. {ceremony ? <>The night&rsquo;s {numberWord(ceremony.categories.length)} awards went elsewhere; </> : null}
                {ceremony ? <Link href={`/awards/${ceremony.year}`} className="u-line" data-cursor="Go">see the ceremony</Link> : null}.
              </p>
            )}
          </section>

          <section aria-labelledby="film-credits">
            <h2 className="film__sub" id="film-credits">End <em>credits</em></h2>
            <dl className="roll" data-roll>
              {film.credits.map((c, i) => (
                <div className="roll__row" data-roll-row key={`${c.role}-${i}`}>
                  <dt className="roll__role">{c.role}</dt>
                  <dd className="roll__name">{c.name}</dd>
                </div>
              ))}
            </dl>
            {film.credits.length < 2 ? (
              <p className="roll__aside" style={{ textAlign: "left", marginInline: 0 }}>
                Only the director is credited so far.
                {wins ? " The awards prove there was a crew behind it." : ""} Send the full credits and they roll here.
              </p>
            ) : null}
          </section>
        </div>

        <section className="film__adj" aria-labelledby="film-adj">
          <h2 className="film__sub" id="film-adj">Also on the <em>slate</em></h2>
          <div className="film__adj-grid">
            {[prev, next].map((f, i) =>
              f ? (
                <Link key={f.slug} href={`/films/${f.slug}`} className="shot" data-cursor="Watch">
                  <Media
                    film={f}
                    rot={i ? 1 : -1.2}
                    cap={<><CatNo no={f.no} />{i ? "Next" : "Previous"}<span className="x">{f.director}</span></>}
                  />
                  <h3 className="shot__ttl">{f.title}</h3>
                </Link>
              ) : null,
            )}
          </div>
        </section>
      </article>

      <Band
        tone="caro"
        rot={-1.4}
        rows={[{ speed: 0.9, items: [{ b: "Roll Sound" }, { em: "Speed" }, { b: "Mark It" }, { em: "Action" }, { b: "Cut" }, { em: "Check the gate" }] }]}
      />

      <Footer year={film.year} />
    </>
  );
}
