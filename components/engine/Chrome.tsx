/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SITE } from "@/lib/site";

/* ═══════════════════════════════════════════════════════════════════
   CHROME — the persistent frame around every route: loader, curtain,
   atmosphere root, grain, header, chapter rail, cursor, page-top.
   The markup is static; lib/fx/* brings it to life per route.
   ═══════════════════════════════════════════════════════════════════ */

const NAV = [
  { href: "/#slate", key: "slate", n: "01", label: "The slate" },
  { href: "/#rack", key: "rack", n: "02", label: "Awards" },
  { href: "/#story", key: "story", n: "03", label: "How" },
  { href: "/#crew", key: "crew", n: "04", label: "Crew" },
  { href: "/#credits", key: "credits", n: "05", label: "Credits" },
  { href: "/#pitch", key: "pitch", n: "06", label: "Pitch" },
];

export function ChromeTop() {
  return (
    <>
      <a className="u-skip" href="#main">Skip to content</a>

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <symbol id="i-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M2.5 8h10.2M9 4l4 4-4 4" />
          </symbol>
          <symbol id="i-up" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M8 13.5V3.2M4 7.2l4-4 4 4" />
          </symbol>
          <symbol id="i-play" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 2.5v11l10-5.5z" />
          </symbol>
        </defs>
      </svg>

      {/* ══ LOADER ══ */}
      <div className="loader" id="loader">
        <div className="loader__field" aria-hidden="true">
          <span style={{ "--x": "11%", "--y": "17%", "--w": "9vw", "--ar": "1", "--r": "-16deg", "--d": "0s" } as React.CSSProperties}><img src="/assets/marks/clapper.svg" alt="" /></span>
          <span style={{ "--x": "81%", "--y": "13%", "--w": "6vw", "--ar": "1.05", "--r": "13deg", "--d": "-2.4s" } as React.CSSProperties}><img src="/assets/marks/reel.svg" alt="" /></span>
          <span style={{ "--x": "7%", "--y": "70%", "--w": "5.6vw", "--ar": "1.2", "--r": "10deg", "--d": "-4.1s" } as React.CSSProperties}><img src="/assets/marks/megaphone.svg" alt="" /></span>
          <span style={{ "--x": "87%", "--y": "66%", "--w": "5.4vw", "--ar": "1", "--r": "-12deg", "--d": "-1.3s" } as React.CSSProperties}><img src="/assets/marks/star.svg" alt="" /></span>
          <span style={{ "--x": "45%", "--y": "6%", "--w": "6vw", "--ar": "1.7", "--r": "20deg", "--d": "-3.2s" } as React.CSSProperties}><img src="/assets/marks/ticket.svg" alt="" /></span>
          <span style={{ "--x": "64%", "--y": "82%", "--w": "5vw", "--ar": "0.82", "--r": "-6deg", "--d": "-5.5s" } as React.CSSProperties}><img src="/assets/marks/chair.svg" alt="" /></span>
          <span style={{ "--x": "25%", "--y": "86%", "--w": "5vw", "--ar": "0.9", "--r": "16deg", "--d": "-0.8s" } as React.CSSProperties}><img src="/assets/marks/spot.svg" alt="" /></span>
        </div>
        <div className="loader__inner">
          <span className="loader__mark sheen" id="loader-mark"><i /></span>
          <div className="loader__bar"><i id="loader-fill" /></div>
          <p className="loader__meta">
            <span>Roll 2025</span>
            <span className="loader__count" id="loader-count">000</span>
          </p>
        </div>
      </div>

      {/* ══ CURTAIN ══ */}
      <div className="curtain" id="curtain" data-tone="flare" aria-hidden="true">
        <svg className="curtain__lines" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="curtain-goo" x="-8%" y="-8%" width="116%" height="116%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
          <g id="curtain-g" filter="url(#curtain-goo)" />
        </svg>
        <img className="curtain__stamp" id="curtain-stamp" src="/assets/marks/sfa-script.png" alt="" width="1377" height="751" />
      </div>

      {/* ══ ATMOSPHERE + GRAIN ══ */}
      <div className="atmos" id="atmos" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {/* ══ HEADER ══ */}
      <header className="header" id="header">
        <Link className="header__mark" href="/">
          <img src="/assets/marks/sfa-script.png" alt="SFA" width="1377" height="751" />
          <span>Student Film<br />Association</span>
        </Link>
        <nav className="header__nav" aria-label="Sections">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} data-nav data-navlink={n.key} className="u-line">
              <i>{n.n}</i>{n.label}
            </Link>
          ))}
        </nav>
        <div className="header__meta">
          <a className="header__badge" href={SITE.instagram} rel="noreferrer">Join</a>
        </div>
      </header>

      {/* ══ CHAPTER RAIL ══ */}
      <aside className="rail" id="rail" aria-hidden="true">
        <span className="rail__idx" id="rail-idx">00</span>
        <span className="rail__track"><i id="rail-fill" /></span>
        <span className="rail__name" id="rail-name">Cover</span>
      </aside>

      {/* ══ CURSOR ══ */}
      <div className="cursor" id="cursor" aria-hidden="true">
        <div className="cursor__ring"><span className="cursor__label" id="cursor-label" /></div>
      </div>
    </>
  );
}

export function ChromeBottom() {
  return (
    <button className="pagetop" id="pagetop" type="button" aria-label="Back to top">
      <svg aria-hidden="true"><use href="#i-up" /></svg>
    </button>
  );
}
