/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import type { Film } from "@/content/types";
import { SITE } from "@/lib/site";
import { SectionHead } from "./SectionHead";
import { CrewSlates } from "./Crew";

/* The crew, then the crawl. The department slates on the ink stage,
   and under them the end credits: the exec board's roles (no names have
   been supplied, and none are invented) and the club's facts and links
   as credit rows, crawling as you scroll. */
const ROLES = [
  "President",
  "Vice president",
  "Treasurer",
  "Executive producers",
  "Screenwriting guild lead",
  "Editing guild lead",
  "Acting guild lead",
];

const FACTS: Array<[string, ReactNode]> = [
  ["Shot on location", "Chapel Hill, NC"],
  ["Presented at", "The SFA Film Festival, every May"],
  ["Awards", "Fifteen categories, voted by the members"],
  ["Pitches open", "Every fall"],
  ["Follow", <a key="ig" href={SITE.instagram} rel="noreferrer">@uncstudentfilmassociation</a>],
  ["Watch", <a key="yt" href={SITE.youtube} rel="noreferrer">YouTube</a>],
  ["Connect", <a key="li" href={SITE.linkedin} rel="noreferrer">LinkedIn</a>],
];

export function Credits({ stills }: { stills: Film[] }) {
  return (
    <section className="sec t-ink" id="credits" data-scene data-name="End credits" data-idx="04">
      <SectionHead
        n="04"
        slug="INT. The crew — end credits"
        title="The"
        em="Crew"
        meta={["Officers, producers, guilds and a hundred members", "Names to be supplied"]}
      />

      <CrewSlates stills={stills} />

      <div className="credits__stage">
        <div className="credits__roll" data-roll>
          <div className="roll--crawl">
            <dl className="roll">
              {ROLES.map((role) => (
                <div className="roll__row" data-roll-row key={role}>
                  <dt className="roll__role">{role}</dt>
                  <dd className="roll__name -missing">Name to be supplied</dd>
                </div>
              ))}
              {FACTS.map(([role, name]) => (
                <div className="roll__row" data-roll-row key={role}>
                  <dt className="roll__role">{role}</dt>
                  <dd className="roll__name">{name}</dd>
                </div>
              ))}
            </dl>
            <p className="roll__aside">
              Names go here when the club sends them: the current officers, the executive producers, and a lead for each guild.
            </p>
          </div>
        </div>
        <div className="credits__mark" aria-hidden="true">
          <img src="/assets/marks/strip-v.svg" alt="" width="220" height="520" data-spin loading="lazy" />
        </div>
      </div>
    </section>
  );
}
