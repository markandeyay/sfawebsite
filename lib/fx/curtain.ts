import { gsap, EASE, prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   THE IRIS — the silent era's transition.

   A black iris closes on the page from a point just off-centre (never
   dead centre; the eye reads a centred iris as a UI spinner), a slate
   claps in the dark, and the iris opens on the next page from a
   different point. The ink field carries a round hole cut by a CSS
   mask; --iris is the hole radius (see chrome.css).

   Two shapes of use: `wipe(mid)` for anchor jumps on one page, and
   `cover(then)` / `uncover()` around a route change, where the new
   page opens the iris once it has mounted.
   ═══════════════════════════════════════════════════════════════════ */

const rnd = (min: number, max: number) => min + Math.random() * (max - min);

export class Curtain {
  private el: HTMLElement;
  private iris: HTMLElement;
  private flash: HTMLElement | null;
  private slate: HTMLElement | null;
  private busy = false;
  covered = false;

  constructor(id: string) {
    this.el = document.getElementById(id)!;
    this.iris = this.el.querySelector<HTMLElement>(".curtain__iris")!;
    this.flash = this.el.querySelector<HTMLElement>(".curtain__flash");
    this.slate = this.el.querySelector<HTMLElement>(".curtain__slate");
  }

  private arm() {
    this.el.classList.add("-active");
    this.el.classList.remove("-clap");
    /* the iris centre wanders a little each time */
    this.iris.style.setProperty("--cx", `${rnd(38, 62).toFixed(1)}%`);
    this.iris.style.setProperty("--cy", `${rnd(40, 60).toFixed(1)}%`);
  }

  private closeInto(tl: gsap.core.Timeline, at = 0) {
    /* --iris is the radius of the hole in the ink: 120vmax clears the
       whole viewport from any centre, 0 is black */
    tl.fromTo(this.iris, { "--iris": "120vmax" }, { "--iris": "0vmax", duration: 0.62, ease: "power3.in" }, at);
    if (this.slate) {
      tl.fromTo(this.slate,
        { opacity: 0, scale: 0.7, rotate: rnd(-10, -4) },
        { opacity: 1, scale: 1, rotate: rnd(-3, 3), duration: 0.34, ease: EASE.snap }, at + 0.5);
      tl.add(() => this.el.classList.add("-clap"), at + 0.62);
    }
    if (this.flash) {
      /* the clap is a flash frame */
      tl.fromTo(this.flash, { opacity: 0 }, { opacity: 0.9, duration: 0.05, ease: "none" }, at + 0.84)
        .to(this.flash, { opacity: 0, duration: 0.14, ease: "power2.out" }, at + 0.89);
    }
  }

  private openInto(tl: gsap.core.Timeline, at: number) {
    if (this.slate) tl.to(this.slate, { opacity: 0, scale: 0.9, duration: 0.2, ease: "power2.in" }, at);
    tl.to(this.iris, { "--iris": "120vmax", duration: 0.7, ease: "power3.out" }, at + 0.05);
  }

  wipe(mid: () => void) {
    if (prefersReduced()) {
      mid();
      return;
    }
    if (this.busy) return;
    this.busy = true;
    this.arm();
    const tl = gsap.timeline({
      onComplete: () => {
        this.el.classList.remove("-active", "-clap");
        this.busy = false;
      },
    });
    this.closeInto(tl, 0);
    tl.add(mid, 0.9);
    this.openInto(tl, 1.0);
  }

  cover(then: () => void) {
    if (prefersReduced()) {
      then();
      return;
    }
    if (this.busy) return;
    this.busy = true;
    this.arm();
    const tl = gsap.timeline({
      onComplete: () => {
        this.covered = true;
        this.busy = false;
        then();
      },
    });
    this.closeInto(tl, 0);
  }

  uncover() {
    if (!this.covered) return;
    this.covered = false;
    const tl = gsap.timeline({
      onComplete: () => this.el.classList.remove("-active", "-clap"),
    });
    this.openInto(tl, 0.05);
  }
}
