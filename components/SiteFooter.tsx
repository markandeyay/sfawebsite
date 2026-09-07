import Link from "next/link";
import { SITE, NAV, JOIN_NAV, COLOPHON } from "@/lib/site";
import { Wordmark } from "./Wordmark";

const SOCIAL = [
  { label: "Instagram", href: SITE.instagram },
  { label: "YouTube", href: SITE.youtube },
  { label: "LinkedIn", href: SITE.linkedin },
] as const;

const MORE = [
  { label: "Club bylaws", href: SITE.bylaws },
  { label: "Older club reel", href: `https://www.youtube.com/watch?v=${SITE.reelYoutubeId}` },
] as const;

/**
 * An on-surface block: the name, one sentence, the site's links, where to
 * follow, and the colophon that explains the catalog numbers.
 */
export function SiteFooter() {
  return (
    <footer className="on-surface mt-section">
      <div className="wrap py-block grid gap-8 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <Wordmark size="footer" />
          <p className="mt-4 text-fg-muted measure">{SITE.description}</p>
        </div>
        <div>
          <h2 className="condensed text-2 text-fg-muted">Site</h2>
          <ul className="mt-3 flex flex-col gap-1">
            {[...NAV, JOIN_NAV].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link link--quiet">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="condensed text-2 text-fg-muted">Club</h2>
          <ul className="mt-3 flex flex-col gap-1">
            {MORE.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link link--quiet">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="condensed text-2 text-fg-muted">Follow</h2>
          <ul className="mt-3 flex flex-col gap-1">
            {SOCIAL.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link link--quiet">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="sm:col-span-3 hairline-t pt-4 condensed text-2 text-fg-muted">{COLOPHON}</p>
      </div>
    </footer>
  );
}
