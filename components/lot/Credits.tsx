/* eslint-disable @next/next/no-img-element */
import { SITE } from "@/lib/site";
import { SectionHead } from "./SectionHead";

/* The exec board as an end-credit crawl: role above, name below,
   centred, on the ink. No names have been supplied, and none are
   invented. */
const ROLES = [
  "President",
  "Vice president",
  "Treasurer",
  "Executive producers",
  "Screenwriting guild lead",
  "Editing guild lead",
  "Acting guild lead",
];

export function Credits() {
  return (
    <section className="sec t-ink" id="credits" data-scene data-name="End credits" data-idx="05">
      <SectionHead
        n="05"
        slug="INT. End credits — crawl"
        title="End"
        em="Credits"
        meta={["The people who run it", "Names to be supplied"]}
      />

      <div className="credits__grid">
        <div className="credits__roll" data-roll>
          <dl className="roll roll--crawl">
            {ROLES.map((role) => (
              <div className="roll__row" data-roll-row key={role}>
                <dt className="roll__role">{role}</dt>
                <dd className="roll__name -missing">Name to be supplied</dd>
              </div>
            ))}
          </dl>
          <p className="roll__aside">
            Names go here when the club sends them: the current officers, the executive producers, and a lead for each guild.
          </p>
        </div>

        <div className="credits__cols">
          <div className="credits-col" data-store>
            <h3>Meet</h3>
            <p>Chapel Hill, NC<br />UNC campus<br />Pitches open in the fall<br /><s>Dates to be posted</s></p>
          </div>
          <div className="credits-col" data-store>
            <h3>Festival</h3>
            <p>SFA Film Festival<br />Every May<br />Fifteen awards<br />Voted by the members</p>
          </div>
          <div className="credits-col" data-store>
            <h3>Contact</h3>
            <p>
              <a href={SITE.instagram} rel="noreferrer" className="u-line">@uncstudentfilmassociation</a><br />
              <a href={SITE.youtube} rel="noreferrer" className="u-line">YouTube</a><br />
              <a href={SITE.linkedin} rel="noreferrer" className="u-line">LinkedIn</a>
            </p>
          </div>
          <div className="credits__mark" data-store>
            <img src="/assets/marks/strip-v.svg" alt="" width="220" height="520" data-spin loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
