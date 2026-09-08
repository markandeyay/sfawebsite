import type { Film } from "@/content/types";
import { formatCatalogNumber } from "@/content";
import { SectionHead } from "./SectionHead";
import { Media } from "./Media";
import { CanLabel } from "./Badge";
import { CatNo } from "./CatNo";

/* How a film gets made here, as a call sheet: the manifesto lines rise,
   then the sheet fills row by row as you pass it. Every fact on the
   sheet is one the club has stated. */
const SHEET: Array<{ day: string; call: string; what: string; who: string }> = [
  { day: "Fall", call: "Pitch", what: "Bring a script or an idea. The script review board reads every pitch.", who: "Any UNC student" },
  { day: "Fall", call: "Greenlight", what: "The board greenlights the films the club can make well that year.", who: "Script review board" },
  { day: "Fall", call: "Crew up", what: "Each greenlit film gets a producer and builds a crew of actors, editors, cinematographers and set crew from the membership.", who: "The guilds" },
  { day: "Spring", call: "Shoot", what: "Crews shoot and cut with the club’s equipment and the guilds behind them.", who: "The crew" },
  { day: "May", call: "Screen", what: "Every film premieres at the SFA Film Festival. Up to about twenty minutes each.", who: "Everyone" },
  { day: "May", call: "Wrap", what: "Awards night follows the festival, voted on by the members.", who: "The members" },
];

export function Story({ film, year }: { film: Film; year: number }) {
  return (
    <section className="sec t-paper" id="story" data-scene data-name="Call sheet" data-idx="03">
      <SectionHead
        n="03"
        slug="INT. Call sheet — fall to May"
        title="How it's"
        em="Made"
        meta={["Pitch in the fall", "Screen in May"]}
      />

      <div className="story__pin" id="story-pin">
        <div className="story__ghost" aria-hidden="true">Fade in:</div>
        <div className="story__grid">
          <div className="story__copy">
            <p className="story__lede">
              <span className="lnw"><span className="ln" data-ln>Any UNC student can pitch.</span></span>
              <span className="lnw"><span className="ln ln--mark" data-ln>No experience needed.<i className="mk" aria-hidden="true" /></span></span>
            </p>
            <p className="story__body" data-body="l">
              Bring a script or an idea in the fall. A script review board greenlights the ones the club can make well.
            </p>
            <p className="story__body" data-body="r">
              Spring is production. May is the festival, and awards night follows.
            </p>
            <div className="callsheet-wrap">
              <div className="callsheet__mast" aria-hidden="true">
                <span><i>Production</i>Student Film Association — Roll {year}</span>
                <span><i>Location</i>Chapel Hill, NC</span>
                <span><i>Days</i>Fall to May</span>
                <span><i>Crew call</i>Any UNC student</span>
              </div>
              <table className="callsheet">
                <caption className="u-sr">Call sheet: one film, fall to May</caption>
                <thead>
                  <tr><th scope="col">Day</th><th scope="col">Call</th><th scope="col">Notes</th><th scope="col">Cast</th></tr>
                </thead>
                <tbody>
                  {SHEET.map((r, i) => (
                    <tr key={r.call} data-fact={i % 2 ? "r" : "l"}>
                      <th scope="row">{r.day}</th>
                      <td className="when">{r.call}</td>
                      <td className="what">{r.what}</td>
                      <td className="who">{r.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="callsheet__foot">All calls subject to change · Check the gate</p>
            </div>
          </div>

          <div className="story__media">
            <div className="story__frame" data-story-media>
              <Media
                film={film}
                rot={-1.2}
                size="full"
                cursor="Watch"
                cap={<><CatNo no={film.no} />{film.title}, {film.year}<span className="x">{film.director}</span></>}
              />
            </div>
            <CanLabel rows={[["Prod", "SFA"], ["Roll", String(film.year)], ["Sc", formatCatalogNumber(film.no)], ["Title", film.title]]} rot={-4} />
          </div>
        </div>
      </div>
    </section>
  );
}
