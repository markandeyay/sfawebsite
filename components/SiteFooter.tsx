import { SITE, NAV } from "@/lib/site";
import { Wordmark } from "./Wordmark";
import Link from "next/link";

const SOCIAL = [
  { label: "Instagram", href: SITE.instagram },
  { label: "YouTube", href: SITE.youtube },
  { label: "LinkedIn", href: SITE.linkedin },
] as const;

const MORE = [
  { label: "Club bylaws", href: SITE.bylaws },
  { label: "Older club reel", href: `https://www.youtube.com/watch?v=${SITE.reelYoutubeId}` },
] as const;

/** Solid navy band, three columns of uppercase links, the A24 footer shape. */
export function SiteFooter() {
  return (
    <footer className="bg-navy text-white mt-24 sm:mt-32">
      <div className="wrap py-12 sm:py-16 grid gap-10 sm:grid-cols-3">
        <div>
          <Wordmark size="footer" />
          <p className="mt-4 text-white/70 max-w-xs">
            Student Film Association at the University of North Carolina at Chapel Hill.
            Formerly the Carolina Film Association.
          </p>
        </div>
        <div className="border-t border-white/30 pt-3">
          <p className="label text-white/60">Site</p>
          <ul className="mt-6 flex flex-col gap-2">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="label text-white no-underline hover:text-carolina transition-[color]">
                  {l.label}
                </Link>
              </li>
            ))}
            {MORE.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="label text-white no-underline hover:text-carolina transition-[color]" target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-white/30 pt-3">
          <p className="label text-white/60">Follow</p>
          <ul className="mt-6 flex flex-col gap-2">
            {SOCIAL.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="label text-white no-underline hover:text-carolina transition-[color]" target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
