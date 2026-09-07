import Link from "next/link";
import { NAV, JOIN_NAV } from "@/lib/site";
import { ButtonLink } from "./Button";
import { Wordmark } from "./Wordmark";

/**
 * Chrome reduced to almost nothing: the mark at the left, two links and one
 * action at the right, on the page's own ground. No rule until the page has
 * scrolled; components/motion/ScrollFlag sets data-scrolled on <html> and
 * app/globals.css draws the hairline.
 */
export function SiteNav() {
  return (
    <header className="site-nav">
      <nav className="wrap site-nav__bar" aria-label="Site">
        <Wordmark size="nav" />
        <ul className="site-nav__links">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="site-nav__link">
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <ButtonLink href={JOIN_NAV.href} variant="secondary" small>
              {JOIN_NAV.label}
            </ButtonLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
