import type { Film } from "@/content/types";
import { SectionHead } from "./SectionHead";
import { Media } from "./Media";
import { Badge } from "./Badge";
import { CatNo } from "./CatNo";

/* How a film gets made here, as a call sheet: the manifesto lines rise,
   then the sheet fills row by row as you pass it. */
const SHEET: Array<{ day: string; call: string; what: string; who: string }> = [
  { day: "Fall", call: "Pitch", what: "Bring a script or an idea. The script review board reads every pitch.", who: "Any UNC student" },
  { day: "Fall", call: "Greenlight", what: "The board greenlights the films the club can make well that year.", who: "Script review board" },
  { day: "Fall", call: "Crew up", what: "Each greenlit film gets a producer and builds a crew of actors, editors, cinematographers and set crew from the membership.", who: "The guilds" },
  { day: "Spring", call: "Shoot", what: "Crews shoot and cut with the club’s equipment and the guilds behind them.", who: "The crew" },
  { day: "May", call: "Screen", what: "Every film premieres at the SFA Film Festival. Up to about twenty minutes each.", who: "Everyone" },
  { day: "May", call: "Wrap", what: "Awards night follows the festival, voted on by the members.", who: "The members" },
];

export function Story({ film }: { film: Film }) {
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
              <span className="lnw"><span className="ln ln--mark" data-ln>No experience needed.</span></span>
            </p>
            <p className="story__body" data-body="l">
              Bring a script or an idea in the fall. A script review board reads every pitch and
              greenlights the ones the club can make well that year. Each greenlit film gets a
              producer and builds a crew from the membership.
            </p>
            <p className="story__body" data-body="r">
              Spring is production. Every film premieres at the SFA Film Festival in May, and the
              awards follow, voted on by the members.
            </p>
            <div className="callsheet-wrap">
              <table className="callsheet">
                <caption>Call sheet — one film, fall to May</caption>
                <thead>
                  <tr><th scope="col">Day</th><th scope="col">Call</th><th scope="col">Scene</th><th scope="col">Who</th></tr>
                </thead>
                <tbody>
                  {SHEET.map((r, i) => (
                    <tr key={r.call} data-fact={i % 2 ? "r" : "l"}>
                      <th scope="row">{r.day}</th>
                      <td className="when">{r.call}</td>
                      <td className="what">{r.what}</td>
                      <td>{r.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="story__media" data-story-media>
            <Media
              film={film}
              rot={-1.2}
              size="full"
              cursor="Watch"
              cap={<><CatNo no={film.no} />{film.title}, {film.year}<span className="x">{film.director}</span></>}
            />
            <Badge text="Student Film Association ★ Festival in May ★ Chapel Hill ★ " core="reel.svg" badge />
          </div>
        </div>
      </div>
    </section>
  );
}
