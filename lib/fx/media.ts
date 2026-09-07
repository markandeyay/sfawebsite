import { gsap, EASE, canHover, prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   MEDIA — the fanning image stack.

   Two ghost copies sit exactly behind the photo at rest and fan out on
   hover, so the still frame is completely clean and the motion appears
   from nowhere. The ghosts are built ONLY when the device actually has
   a fine pointer.
   ═══════════════════════════════════════════════════════════════════ */

const ROT = 8.5;
const SCALE = 0.86;

export const initMedia = (): (() => void) => {
  if (!canHover() || prefersReduced()) return () => {};
  const cleanups: Array<() => void> = [];

  document.querySelectorAll<HTMLElement>("[data-media]").forEach((el) => {
    const frame = el.querySelector<HTMLElement>(".media__frame");
    const base = frame?.querySelector<HTMLImageElement>(".media__img");
    if (!frame || !base || frame.dataset.ghosts) return;
    frame.dataset.ghosts = "1";

    const ghosts: HTMLElement[] = [];
    for (let i = 0; i < 2; i++) {
      const g = base.cloneNode(true) as HTMLImageElement;
      g.setAttribute("aria-hidden", "true");
      g.alt = "";
      g.loading = "lazy";
      g.classList.add("media__ghost");
      frame.insertBefore(g, base);
      ghosts.push(g);
    }

    const settle = () => {
      if (!gsap.isTweening(ghosts)) frame.classList.remove("-live");
    };
    const enter = () => {
      frame.classList.add("-live");
      gsap.to(ghosts, {
        rotate: (i: number) => ROT * (i + 1) * (i % 2 ? -1 : 1),
        scale: (i: number) => 1 - (1 - SCALE) * (i + 1),
        duration: 0.7,
        ease: EASE.out,
        stagger: 0.05,
        overwrite: "auto",
        onComplete: settle,
      });
    };
    const leave = () => {
      frame.classList.add("-live");
      gsap.to(ghosts, { rotate: 0, scale: 1, duration: 0.5, ease: EASE.out, overwrite: "auto", onComplete: settle });
    };

    frame.addEventListener("pointerenter", enter);
    frame.addEventListener("pointerleave", leave);
    cleanups.push(() => {
      frame.removeEventListener("pointerenter", enter);
      frame.removeEventListener("pointerleave", leave);
      ghosts.forEach((g) => g.remove());
      delete frame.dataset.ghosts;
    });
  });

  return () => cleanups.forEach((c) => c());
};
