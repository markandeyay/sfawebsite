import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ═══════════════════════════════════════════════════════════════════
   MOTION CORE — one easing family, one set of durations, one place
   that decides whether the site animates at all.

   These eases mirror the CSS custom properties in app/styles/tokens.css
   so a transition and a tween on the same element cannot disagree:
     --e-out    ≈ expo.out       --e-inout ≈ power4.inOut
     --e-soft   ≈ power2.out     --e-snap  ≈ back.out(1.7)

   Ported from the client's stussy engine (core/motion.ts). Everything
   that touches `window` is inside a function: this module is imported
   by client components that Next renders on the server first.
   ═══════════════════════════════════════════════════════════════════ */

export const EASE = {
  out: "expo.out",
  inOut: "power4.inOut",
  soft: "power2.out",
  snap: "back.out(1.7)",
  linear: "none",
} as const;

export const DUR = { d1: 0.16, d2: 0.32, d3: 0.56, d4: 0.9, d5: 1.3 } as const;

export const DESKTOP = "(min-width: 901px)";

const isBrowser = () => typeof window !== "undefined";

export const prefersReduced = () =>
  isBrowser() && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const canHover = () =>
  isBrowser() && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let registered = false;

export const initMotion = () => {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  gsap.defaults({ ease: EASE.out, duration: DUR.d3 });

  /* Mobile browsers fire resize when the address bar collapses during a
     scroll. Without this, every such collapse re-measures every trigger
     mid-gesture — the classic "pinned section jumps on mobile" bug. */
  ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" });

  if (prefersReduced()) {
    /* The class is the contract: components.css uses it to force every
       reveal into its settled state, so nothing can be left invisible
       because a tween never ran. */
    document.documentElement.classList.add("-no-motion");
  }

  /* A change of preference mid-session should not leave the page in a
     half-animated limbo — reload into the correct mode. */
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => window.location.reload();
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/* Register desktop-only choreography. Everything inside runs in ONE
   matchMedia scope so triggers are created in document order — pin
   spacers must exist before later triggers measure their start.
   Returns the MatchMedia so the caller can revert it on teardown. */
export const onDesktop = (fn: () => void) => {
  if (prefersReduced()) return null;
  const mm = gsap.matchMedia();
  mm.add(DESKTOP, fn);
  return mm;
};

export { gsap, ScrollTrigger };
