import { gsap, EASE, DUR, prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   THE LEADER — an Academy countdown that means something.

   The numeral counts down from 8 as real readiness arrives (fonts, the
   hero frame, a minimum beat), the sweep hand goes round once per
   number, and on 2 the picture starts: a white flash frame, then the
   field lifts. Runs once per session.
   ═══════════════════════════════════════════════════════════════════ */

const waitFor = (img: HTMLImageElement | null) =>
  new Promise<void>((res) => {
    if (!img || img.complete) return res();
    img.addEventListener("load", () => res(), { once: true });
    img.addEventListener("error", () => res(), { once: true });
  });

const FROM = 8;
const TO = 2;

export const runLoader = (onReveal: () => void) => {
  const loader = document.getElementById("loader");
  const num = document.getElementById("leader-num");
  const sweep = document.getElementById("leader-sweep");
  const tc = document.getElementById("leader-tc");

  if (!loader) {
    onReveal();
    return;
  }
  if (prefersReduced()) {
    loader.remove();
    onReveal();
    return;
  }

  const finish = () => {
    loader.classList.add("-flash");
    gsap.delayedCall(0.26, () => {
      loader.classList.add("-out");
      gsap.delayedCall(0.35, onReveal);
      gsap.delayedCall(DUR.d5 + 0.2, () => {
        loader.classList.add("-gone");
        loader.remove();
      });
    });
  };

  const p = { v: 0 };
  const steps = FROM - TO;
  let lastNum = -1;
  const paint = () => {
    const t = Math.min(p.v, 0.9999) * steps; /* 0 .. steps */
    const n = FROM - Math.floor(t);
    if (num && n !== lastNum) {
      lastNum = n;
      num.textContent = String(n);
      /* the 2-pop: one red frame when the 2 lands */
      if (n === TO) {
        loader.classList.add("-pop");
        gsap.delayedCall(0.042, () => loader.classList.remove("-pop"));
      }
    }
    const frac = t - Math.floor(t);
    sweep?.style.setProperty("--sweep", `${(frac * 360).toFixed(1)}deg`);
    if (tc) {
      const frames = Math.round(p.v * steps * 24);
      const s = Math.floor(frames / 24);
      tc.textContent = `TC 00:00:${String(s).padStart(2, "0")}:${String(frames % 24).padStart(2, "0")}`;
    }
  };
  paint();

  /* crawl toward the penultimate number while assets are in flight */
  const crawl = gsap.to(p, { v: 0.78, duration: 2.8, ease: "power2.out", onUpdate: paint });

  const ready = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    waitFor(document.querySelector(".slate-card__frame img")),
    new Promise<void>((res) => gsap.delayedCall(1.4, res)),
  ]);

  ready.then(() => {
    crawl.kill();
    gsap.to(p, {
      v: 1,
      duration: 0.7,
      ease: EASE.soft,
      onUpdate: paint,
      onComplete: () => gsap.delayedCall(0.18, finish),
    });
  });
};
