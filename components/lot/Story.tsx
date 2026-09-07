import type { Film } from "@/content/types";
import { SectionHead } from "./SectionHead";
import { Media } from "./Media";
import { Badge } from "./Badge";
import { CatNo } from "./CatNo";

/* How a film gets made here: the manifesto assembles as you pass it. */
export function Story({ film }: { film: Film }) {
  return (
    <section className="sec t-paper" id="story" data-scene data-name="How it's made" data-idx="03">
      <SectionHead
        n="03"
        slug="INT. How it's made — fall to May"
        title="How it's"
        em="Made"
        no="03"
        meta={["Pitch in the fall", "Screen in May"]}
      />

      <div className="story__pin" id="story-pin">
        <div className="story__ghost" aria-hidden="true">Action</div>
        <div className="story__grid">
          <div className="story__copy">
            <p className="story__lede">
              <span className="lnw"><span className="ln" data-ln>Any UNC student can pitch.</span></span>
              <span className="lnw"><span className="ln ln--mark" data-ln>No experience needed.</span></span>
            </p>
            <p className="story__body" data-body="l">
              Bring a script or an idea in the fall. A script review board reads every pitch and
              greenlights the ones the club can make well that year. Each greenlit film gets a
              producer and builds a crew of actors, editors, cinematographers and set crew from
              the membership.
            </p>
            <p className="story__body" data-body="r">
              Spring is production. Crews shoot and cut with the club&rsquo;s equipment and the guilds
              behind them. Every film premieres at the SFA Film Festival in May, and the awards follow,
              voted on by the members.
            </p>
            <dl className="facts">
              <div data-fact="l"><dt>Pitch</dt><dd>Fall semester</dd></div>
              <div data-fact="r"><dt>Review</dt><dd>Script review board</dd></div>
              <div data-fact="l"><dt>Crew up</dt><dd>Producer, then a crew from the guilds</dd></div>
              <div data-fact="r"><dt>Shoot</dt><dd>Spring semester</dd></div>
              <div data-fact="l"><dt>Screen</dt><dd>SFA Film Festival, May</dd></div>
              <div data-fact="r"><dt>Runtime</dt><dd>Up to about twenty minutes</dd></div>
            </dl>
          </div>

          <div className="story__media" data-story-media>
            <Media
              film={film}
              shape="arch"
              plate="gold"
              rot={-1.2}
              plateX={-18}
              plateY={16}
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
