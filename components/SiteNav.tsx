import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { NAV } from "@/lib/site";

export function SiteNav() {
  return (
    <header className="bg-surface border-b border-deep">
      <nav
        className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 sm:py-4"
        aria-label="Site"
      >
        <Wordmark />
        <ul className="flex items-center gap-5 sm:gap-8 ms-auto">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="label text-cream hover:text-carolina transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
