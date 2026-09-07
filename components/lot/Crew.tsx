/* eslint-disable @next/next/no-img-element */
import type { Film } from "@/content/types";
import { SectionHead } from "./SectionHead";

const CARDS = [
  { href: "/#credits", slug: "Officers", ttl: ["The", "Officers"], txt: "An officer board runs the club: president, vice president, treasurer." },
  { href: "/#credits", slug: "Producers", ttl: ["The", "Producers"], txt: "A board of executive producers runs the slate and gives every greenlit film a producer." },
  { href: "/#pitch", slug: "Guilds", ttl: ["The", "Guilds"], txt: "Screenwriting, editing, acting and more: the departments that teach the craft." },
  { href: "/#pitch", slug: "Members", ttl: ["The", "Members"], txt: "Over a hundred undergraduates from every major. Most arrive with no experience." },
];

/* Four department slates on the Carolina field: a striped clapper arm
   on each, a real frame blooming behind on hover. */
export function Crew({ stills }: { stills: Film[] }) {
  return (
    <section className="sec t-carolina" id="crew" data-scene data-name="Crew" data-idx="04">
      <SectionHead
        n="04"
        slug="EXT. The crew — day"
        title="The"
        em="Crew"
        meta={["Officers, producers, guilds", "And a hundred members"]}
      />

      <div className="crew__grid">
        {CARDS.map((c, i) => {
          const still = stills[i % stills.length];
          return (
            <a className="crew-card" href={c.href} key={c.slug} data-nav data-tribe data-cursor="Go">
              <span className="crew-card__arm" aria-hidden="true" />
              {still?.still ? (
                <img className="crew-card__bg" src={still.still.original.replace(/\.webp$/, "-sm.webp")} alt="" aria-hidden="true" loading="lazy" width="640" height="360" />
              ) : null}
              <span className="crew-card__veil" aria-hidden="true" />
              <span className="crew-card__in">
                <span className="crew-card__idx">Dept. {String(i + 1).padStart(2, "0")}</span>
                <span className="crew-card__slug" aria-hidden="true">{c.slug}</span>
                <h3 className="crew-card__ttl">{c.ttl[0]}<br />{c.ttl[1]}</h3>
                <p className="crew-card__txt">{c.txt}</p>
                <span className="arrow" aria-hidden="true"><svg><use href="#i-arrow" /></svg></span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
