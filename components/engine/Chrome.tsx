import Link from "next/link";
import { SITE } from "@/lib/site";

/* ═══════════════════════════════════════════════════════════════════
   CHROME — the persistent frame around every route: the leader, the
   iris, atmosphere root, grain, the cue mark, the HUD header, the frame
   counter rail, the reticle cursor, page-top. lib/fx/* animates it.
   ═══════════════════════════════════════════════════════════════════ */

const NAV = [
  { href: "/#slate", key: "slate", label: "Slate" },
  { href: "/#awards", key: "awards", label: "Awards" },
  { href: "/#story", key: "story", label: "Call sheet" },
  { href: "/#credits", key: "credits", label: "Credits" },
  { href: "/#pitch", key: "pitch", label: "Pitch" },
];

/* the slate that claps in the dark between pages; lib/fx/curtain.ts
   writes where you are going into the fields */
function ClapSlate() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <g className="arm">
        <rect x="4" y="6" width="112" height="18" rx="2" fill="currentColor" />
        <path d="M14 6l10 18M34 6l10 18M54 6l10 18M74 6l10 18M94 6l10 18" stroke="#0E0D0C" strokeWidth="7" />
      </g>
      <rect x="4" y="28" width="112" height="66" rx="3" fill="currentColor" />
      <path d="M12 46h96M12 62h96M12 78h56" stroke="#0E0D0C" strokeWidth="1.2" />
      <text className="-k" x="12" y="36">Scene</text>
      <text className="-k" x="76" y="36">Roll</text>
      <text x="12" y="44.5" data-f="scene">—</text>
      <text x="76" y="44.5" data-f="roll">SFA</text>
      <text className="-big" x="12" y="60.5" data-f="title" />
      <text className="-k" x="12" y="70">Take</text>
      <text x="12" y="77" data-f="take">1</text>
      <text className="-k" x="76" y="77">Sync</text>
    </svg>
  );
}

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
          {/* a laurel branch; mirrored with scale(-1,1) for the right side */}
          <symbol id="i-laurel" viewBox="0 0 60 120">
            <path d="M50 116 C18 92, 12 50, 30 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <g fill="currentColor">
              <ellipse cx="41.2" cy="108.3" rx="13" ry="5.2" transform="rotate(-82.3 41.2 108.3) translate(11 0)" />
              <ellipse cx="41.2" cy="108.3" rx="13" ry="5.2" transform="rotate(-186.3 41.2 108.3) translate(11 0)" />
              <ellipse cx="32" cy="96.8" rx="12.1" ry="4.9" transform="rotate(-70.6 32 96.8) translate(10.3 0)" />
              <ellipse cx="32" cy="96.8" rx="12.1" ry="4.9" transform="rotate(-174.6 32 96.8) translate(10.3 0)" />
              <ellipse cx="25.5" cy="83.7" rx="11.2" ry="4.5" transform="rotate(-59.1 25.5 83.7) translate(9.5 0)" />
              <ellipse cx="25.5" cy="83.7" rx="11.2" ry="4.5" transform="rotate(-163.1 25.5 83.7) translate(9.5 0)" />
              <ellipse cx="21.5" cy="69.4" rx="10.3" ry="4.2" transform="rotate(-48.4 21.5 69.4) translate(8.8 0)" />
              <ellipse cx="21.5" cy="69.4" rx="10.3" ry="4.2" transform="rotate(-152.4 21.5 69.4) translate(8.8 0)" />
              <ellipse cx="20" cy="53.9" rx="9.4" ry="3.8" transform="rotate(-38.7 20 53.9) translate(8 0)" />
              <ellipse cx="20" cy="53.9" rx="9.4" ry="3.8" transform="rotate(-142.7 20 53.9) translate(8 0)" />
              <ellipse cx="21" cy="37.5" rx="8.5" ry="3.5" transform="rotate(-30.2 21 37.5) translate(7.2 0)" />
              <ellipse cx="21" cy="37.5" rx="8.5" ry="3.5" transform="rotate(-134.2 21 37.5) translate(7.2 0)" />
              <ellipse cx="24.6" cy="20.4" rx="7.6" ry="3.1" transform="rotate(-22.8 24.6 20.4) translate(6.5 0)" />
              <ellipse cx="24.6" cy="20.4" rx="7.6" ry="3.1" transform="rotate(-126.8 24.6 20.4) translate(6.5 0)" />
            </g>
          </symbol>
        </defs>
      </svg>

      {/* ══ THE LEADER ══ */}
      <div className="loader" id="loader">
        <span className="loader__corner -tl" aria-hidden="true" /><span className="loader__corner -tr" aria-hidden="true" />
        <span className="loader__corner -bl" aria-hidden="true" /><span className="loader__corner -br" aria-hidden="true" />
        <span className="loader__tc" id="leader-tc" aria-hidden="true">TC 00:00:00:00</span>
        <div className="leader" role="status" aria-label="Loading">
          <svg className="leader__marks" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="41" />
            <circle cx="50" cy="50" r="34" />
            <path d="M50 0v100M0 50h100" />
          </svg>
          <span className="leader__sweep" id="leader-sweep" aria-hidden="true" />
          <span className="leader__num" id="leader-num">8</span>
          <p className="leader__meta"><span>SFA</span><b>Roll 2025 · Reel 01</b><span>Head · 24 fps</span></p>
        </div>
      </div>

      {/* ══ THE IRIS ══ */}
      <div className="curtain" id="curtain" aria-hidden="true">
        <div className="curtain__iris" />
        <div className="curtain__flash" />
        <div className="curtain__slate"><ClapSlate /></div>
      </div>

      {/* ══ ATMOSPHERE + GRAIN + CUE ══ */}
      <div className="atmos" id="atmos" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <span className="cue" id="cue" aria-hidden="true" />

      {/* ══ HEADER: the HUD ══ */}
      <header className="header" id="header">
        <Link className="header__mark" href="/" aria-label={SITE.name} data-slate="Title card" data-scene-no="00">
          <span className="header__rec" aria-hidden="true" />
          <strong aria-hidden="true">SFA</strong>
          <span aria-hidden="true">Student Film<br />Association</span>
        </Link>
        <nav className="header__nav" aria-label="Sections">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href} data-nav data-navlink={n.key} className="u-line">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header__meta">
          <span className="header__tc u-hide-sp" id="header-tc" aria-hidden="true">TC 00:00:00:00</span>
          <a className="header__badge" href={SITE.instagram} rel="noreferrer">Join</a>
        </div>
      </header>

      {/* ══ THE FRAME COUNTER ══ */}
      <aside className="rail" id="rail" aria-hidden="true">
        <span className="rail__idx" id="rail-idx">Reel 00</span>
        <span className="rail__track"><i id="rail-fill" /></span>
        <span className="rail__fr" id="rail-fr">FR 0000</span>
        <span className="rail__name" id="rail-name">Leader</span>
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
