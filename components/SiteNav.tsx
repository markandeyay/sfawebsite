import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { NAV } from "@/lib/site";

export function SiteNav() {
  return (
    <header className="bg-surface border-b border-deep">
      <nav
        className="wrap flex items-center justify-between gap-6 py-4"
        aria-label="Site"
      >
        <Wordmark />
        <ul className="flex items-center gap-5 sm:gap-8">
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
