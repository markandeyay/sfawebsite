import { initMotion, prefersReduced, ScrollTrigger, gsap } from "./motion";
import { initScroll, scrollTo } from "./scroll";
import { runLoader } from "./loader";
import { Curtain, type SlateMeta } from "./curtain";
import { initAtmosphere, type Atmosphere } from "./atmosphere";
import { initDeco } from "./deco";
import { initBands } from "./bands";
import { initCursor } from "./cursor";
import { initChrome } from "./chrome";
import { initReveals } from "./reveals";
import { prepareScenes, heroIntro, initScenes, refreshScenes } from "./scenes";

/* ═══════════════════════════════════════════════════════════════════
   BOOT — one page, one engine.

   Boot order matters: motion prefs decide what everything else builds,
   scroll must exist before anything subscribes to it, and the hidden
   pre-intro states must be set before the loader can uncover them.

   Next renders every route as its own document under one persistent
   layout, so the engine boots per route and tears itself down on
   navigation. The loader runs once per session; later routes arrive
   under the curtain, which the new page lifts once it has booted.
   ═══════════════════════════════════════════════════════════════════ */

const LOADED_KEY = "sfa:loaded";

let curtain: Curtain | null = null;
let atmosphere: Atmosphere | null = null;

export const getCurtain = () => curtain;

/* Route navigation through the curtain: cover, then let the caller
   push the route. The next boot lifts it. */
export const navigateThrough = (href: string, push: (href: string) => void, meta?: SlateMeta) => {
  if (!curtain || prefersReduced()) {
    push(href);
    return;
  }
  curtain.cover(() => push(href), meta);
};

/* what the slate says for a same-page jump: the section's reel index
   and name */
const sceneMeta = (sel: string): SlateMeta => {
  const sec = document.querySelector<HTMLElement>(sel);
  return { scene: sec?.dataset.idx || "00", title: sec?.dataset.name || "" };
};

export const boot = (): (() => void) => {
  const cleanups: Array<() => void> = [];

  cleanups.push(initMotion());
  cleanups.push(initScroll());

  prepareScenes();

  if (!curtain) curtain = new Curtain("curtain");
  atmosphere?.destroy();
  atmosphere = initAtmosphere();
  /* inspectable from the console and the QA probes */
  (window as unknown as { __sfa: unknown }).__sfa = { curtain, get atmosphere() { return atmosphere; } };

  cleanups.push(initChrome());
  cleanups.push(initDeco());
  cleanups.push(initBands());
  cleanups.push(initCursor());
  cleanups.push(initReveals());
  cleanups.push(initScenes());

  /* anchor nav on the same page: cover, jump, uncover */
  const jump = (href: string) => {
    curtain!.wipe(() => scrollTo(href === "#hero" ? 0 : href, true), sceneMeta(href === "#hero" ? "#hero" : href));
  };
  const onAnchor = (e: Event) => {
    const a = (e.target as HTMLElement)?.closest<HTMLAnchorElement>("[data-nav]");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const i = href.indexOf("#");
    if (i < 0) return;
    const path = href.slice(0, i);
    const hash = href.slice(i);
    /* only same-page anchors; a different route goes through Engine's curtain */
    if (path && path !== window.location.pathname) return;
    if (!document.querySelector(hash === "#hero" ? "#hero" : hash)) return;
    e.preventDefault();
    jump(hash);
  };
  /* capture phase: runs before Next's <Link> handler, which respects
     defaultPrevented, so the curtain wipe owns same-page anchors */
  document.addEventListener("click", onAnchor, true);
  cleanups.push(() => document.removeEventListener("click", onAnchor, true));

  const onTop = () => jump("#hero");
  const pagetop = document.getElementById("pagetop");
  pagetop?.addEventListener("click", onTop);
  cleanups.push(() => pagetop?.removeEventListener("click", onTop));

  const reveal = () => {
    heroIntro();
    atmosphere?.start();
    refreshScenes();
  };

  const firstVisit = !sessionStorage.getItem(LOADED_KEY);
  const loader = document.getElementById("loader");
  if (firstVisit && loader) {
    sessionStorage.setItem(LOADED_KEY, "1");
    runLoader(reveal);
  } else {
    loader?.remove();
    const hash = window.location.hash;
    if (curtain.covered) {
      /* the previous page covered the screen for us; land on the anchor
         if there is one, then lift the curtain onto the assembled page */
      if (hash && document.querySelector(hash)) scrollTo(hash, true);
      else window.scrollTo(0, 0);
      gsap.delayedCall(0.05, () => {
        curtain!.uncover();
        gsap.delayedCall(0.2, reveal);
      });
    } else {
      gsap.delayedCall(0.05, reveal);
    }
  }

  /* late-loading images change the document height */
  const onLoad = () => refreshScenes();
  window.addEventListener("load", onLoad, { once: true });
  cleanups.push(() => window.removeEventListener("load", onLoad));

  return () => {
    atmosphere?.stop();
    cleanups.reverse().forEach((c) => c());
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.set("[data-hero], .hero__stage, .hero__hud, .hero__vf i, .slate-card__arm, [data-hero-fade], [data-film-hero]", { clearProps: "all" });
  };
};
