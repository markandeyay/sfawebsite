/* eslint-disable @next/next/no-img-element */
import type { Film } from "@/content/types";
import { SITE } from "@/lib/site";

const CARDS = [
  { href: "/#credits", slug: "Officers", ttl: ["The", "Officers"], txt: "An officer board runs the club: president, vice president, treasurer." },
  { href: "/#credits", slug: "Producers", ttl: ["The", "Producers"], txt: "A board of executive producers runs the slate and gives every greenlit film a producer." },
  { href: "/#story", slug: "Guilds", ttl: ["The", "Guilds"], txt: "Screenwriting, editing, acting and more: the departments that teach the craft." },
  { href: SITE.instagram, slug: "Members", ttl: ["The", "Members"], txt: "Over a hundred undergraduates from every major. Most arrive with no experience." },
];

/* Four department slates on the ink stage, each a clapperboard with a
   hinged arm that claps on arrival and on hover, a real frame blooming
   behind it. */
export function CrewSlates({ stills }: { stills: Film[] }) {
  return (
    <div className="crew__grid">
      {CARDS.map((c, i) => {
        const still = stills[i % stills.length];
        return (
          <a
            className="crew-card"
            href={c.href}
            key={c.slug}
            data-nav={c.href.startsWith("/") ? "" : undefined}
            rel={c.href.startsWith("/") ? undefined : "noreferrer"}
            data-slate-card
            data-cursor="Go"
          >
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
              <span className="crew-card__take">Take <b>{String(i + 1).padStart(2, "0")}</b> →</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
