import Link from "next/link";
import { SITE } from "@/lib/site";

/* THE END, the way a print ends: the end card bracketed by tail leader,
   a strip of perforations with its edge print above and below. */
export function Footer({ year }: { year: number }) {
  return (
    <footer className="footer t-ink" id="end" data-scene data-name="The end" data-idx="05">
      <div className="footer__bar" aria-hidden="true"><span>Tail ▸ SFA ▸ Roll {year}</span><span>Head</span></div>
      <div className="footer__inner">
        <div className="footer__word" data-reveal-head>
          <p className="big" data-split>The End</p>
          <p className="sub">A Student Film Association production — UNC Chapel Hill</p>
        </div>

        <nav className="footer__links" aria-label="Sections">
          <Link href="/#slate" data-nav className="u-line">The slate</Link>
          <Link href="/#awards" data-nav className="u-line">Awards night</Link>
          <Link href="/#story" data-nav className="u-line">Call sheet</Link>
          <Link href="/#credits" data-nav className="u-line">Credits</Link>
          <a href={SITE.instagram} rel="noreferrer" className="u-line">Join</a>
        </nav>
        <p className="footer__links">
          <a href={SITE.instagram} rel="noreferrer" className="u-line">Instagram</a>
          <a href={SITE.youtube} rel="noreferrer" className="u-line">YouTube</a>
          <a href={SITE.linkedin} rel="noreferrer" className="u-line">LinkedIn</a>
          <a href={SITE.bylaws} rel="noreferrer" className="u-line">Bylaws</a>
        </p>

        <p className="footer__meta">© {year} Student Film Association · Twelve films a year · Fifteen awards · One festival</p>
      </div>
      <div className="footer__bar" aria-hidden="true"><span>Tail ▸ SFA ▸ Roll {year}</span><span>End of reel</span></div>
    </footer>
  );
}
