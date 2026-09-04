import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { NAV } from "@/lib/site";

/**
 * Three-part bar: section links left, the mark centered, the one action
 * right. White ground, ink type. It is not overlaid on the hero, so it
 * stays legible over any still.
 */
export function SiteNav() {
  return (
    <header className="bg-paper">
      <nav
        className="wrap grid grid-cols-[1fr_auto_1fr] items-center py-5 sm:py-6"
        aria-label="Site"
      >
        <ul className="flex items-center gap-5 sm:gap-8">
          {NAV.filter((i) => i.label !== "Join").map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="label text-ink no-underline transition-[color] hover:text-carolina">
                {item.label.replace(/ \d{4}$/, "")}
                {/\d{4}$/.test(item.label) ? (
                  <span className="hidden sm:inline"> {item.label.slice(-4)}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        <Wordmark />
        <div className="justify-self-end">
          <Link href="/#join" className="label text-ink no-underline transition-[color] hover:text-carolina">
            Join
          </Link>
        </div>
      </nav>
    </header>
  );
}
