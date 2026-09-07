/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer({ year }: { year: number }) {
  return (
    <footer className="footer t-ink">
      <div className="footer__bar" aria-hidden="true" />
      <div className="footer__inner">
        <div className="footer__word" data-reveal-head>
          <img src="/assets/marks/sfa-script.png" alt="SFA" width="1377" height="751" loading="lazy" />
          <p className="big" data-split>Roll {year}</p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4>The lot</h4>
            <Link href="/#slate" data-nav className="u-line">The slate</Link>
            <Link href="/#rack" data-nav className="u-line">Awards night</Link>
            <Link href="/#story" data-nav className="u-line">How it&rsquo;s made</Link>
          </div>
          <div className="footer__col">
            <h4>The crew</h4>
            <Link href="/#crew" data-nav className="u-line">Crew</Link>
            <Link href="/#credits" data-nav className="u-line">End credits</Link>
            <Link href="/#pitch" data-nav className="u-line">Send your pitch</Link>
            <Link href="/#hero" data-nav className="u-line">Back to top</Link>
          </div>
          <div className="footer__col">
            <h4>Elsewhere</h4>
            <a href={SITE.instagram} rel="noreferrer" className="u-line">Instagram — @uncstudentfilmassociation</a>
            <a href={SITE.youtube} rel="noreferrer" className="u-line">YouTube — @studentfilmassociationunc</a>
            <a href={SITE.linkedin} rel="noreferrer" className="u-line">LinkedIn</a>
            <a href={SITE.bylaws} rel="noreferrer" className="u-line">Club bylaws</a>
          </div>
        </div>

        <div className="footer__meta">
          <p>© {year} <img className="mark-inline" src="/assets/marks/sfa-script.png" alt="SFA" loading="lazy" /></p>
          <p>Student Film Association — UNC Chapel Hill<br />Twelve films a year. Fifteen awards. One festival.</p>
          <p>Made in Chapel Hill</p>
        </div>
      </div>
    </footer>
  );
}
