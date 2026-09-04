import { SITE } from "@/lib/site";

const LINKS = [
  { label: "Instagram", href: SITE.instagram },
  { label: "YouTube", href: SITE.youtube },
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "Club bylaws", href: SITE.bylaws },
  {
    label: "Older club reel",
    href: `https://www.youtube.com/watch?v=${SITE.reelYoutubeId}`,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-deep mt-24">
      <div className="wrap py-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="display text-display-sm">Student Film Association</p>
          <p className="muted mt-2">
            A student-run production club at the University of North Carolina
            at Chapel Hill. Formerly the Carolina Film Association.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="label link"
                target="_blank"
                rel="noreferrer"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
