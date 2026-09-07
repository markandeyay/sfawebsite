import { gsap, EASE, prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   CURTAIN — the gooey stripe wipe.

   What makes it read as one liquid front instead of a row of sliding
   bars: widths from a weighted bag (mostly 1, some 2, one 3) so the
   stripe rhythm is irregular; every rect gets its OWN random in-ease
   and 0–150ms delay so the leading edge is ragged; and a blur + high-
   contrast colour matrix fuses neighbouring edges where they overlap.

   The mark stamps while the screen is covered, so the transition
   carries the brand instead of just hiding the jump.

   Two shapes of use: `wipe(mid)` for anchor jumps on one page, and
   `cover(then)` / `uncover()` around a route change, where the new
   page lifts the curtain once it has mounted.
   ═══════════════════════════════════════════════════════════════════ */

const RECTS = 26;
const TONES = ["flare", "carolina", "navy", "ink"];
const IN_EASES = ["power2.in", "power3.in", "power4.in"];
const OUT_EASES = ["power3.out", "power4.out", "expo.out"];

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export class Curtain {
  private el: HTMLElement;
  private g: SVGGElement;
  private stamp: HTMLElement | null;
  private rects: SVGRectElement[] = [];
  private busy = false;
  covered = false;

  constructor(id: string) {
    this.el = document.getElementById(id)!;
    this.g = document.getElementById("curtain-g") as unknown as SVGGElement;
    this.stamp = document.getElementById("curtain-stamp");

    this.g.innerHTML = "";
    for (let i = 0; i < RECTS; i++) {
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("y", "103");
      r.setAttribute("height", "103");
      this.g.appendChild(r);
      this.rects.push(r);
    }
    this.layout();
  }

  /* Re-rolled on every wipe so no two transitions share a rhythm. */
  private layout() {
    let weights = shuffle([1, 1, 1, 1, 1, 1, 2, 2, 3]);
    while (weights.length < RECTS) weights = weights.concat(shuffle(weights));
    weights = weights.slice(0, RECTS);

    const total = weights.reduce((a, b) => a + b, 0);
    const unit = 100 / total;
    let x = 0;
    this.rects.forEach((rect, i) => {
      const w = weights[i] * unit;
      rect.setAttribute("x", `${x}`);
      rect.setAttribute("width", `${w + 0.4}`);
      x += w;
    });
  }

  private arm() {
    this.el.dataset.tone = TONES[Math.floor(Math.random() * TONES.length)];
    this.el.classList.add("-active");
    this.layout();
  }

  private coverInto(tl: gsap.core.Timeline) {
    this.rects.forEach((rect) => {
      tl.fromTo(rect,
        { attr: { y: 103 } },
        {
          attr: { y: 0 },
          duration: rnd(0.34, 0.52),
          delay: rnd(0, 0.15),
          ease: IN_EASES[Math.floor(Math.random() * IN_EASES.length)],
        }, 0);
    });
    if (this.stamp) {
      tl.fromTo(this.stamp,
        { opacity: 0, scale: 2.1, rotate: rnd(-16, -4) },
        { opacity: 1, scale: 1, rotate: rnd(-4, 4), duration: 0.42, ease: EASE.snap }, 0.42);
    }
  }

  private uncoverInto(tl: gsap.core.Timeline, at: number) {
    if (this.stamp) {
      tl.to(this.stamp, { opacity: 0, scale: 0.94, duration: 0.26, ease: "power2.in" }, at);
    }
    this.rects.forEach((rect) => {
      tl.to(rect, {
        attr: { y: -103 },
        duration: rnd(0.36, 0.54),
        delay: rnd(0, 0.16),
        ease: OUT_EASES[Math.floor(Math.random() * OUT_EASES.length)],
      }, at + 0.1);
    });
  }

  /* Anchor jump: cover, do the thing, uncover. */
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
        this.el.classList.remove("-active");
        this.busy = false;
      },
    });
    this.coverInto(tl);
    tl.add(mid, 0.66);
    this.uncoverInto(tl, 0.86);
  }

  /* Route change: cover, then hand off. The curtain stays down until
     the next page calls uncover(). */
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
    this.coverInto(tl);
  }

  uncover() {
    if (!this.covered) return;
    this.covered = false;
    const tl = gsap.timeline({
      onComplete: () => this.el.classList.remove("-active"),
    });
    this.uncoverInto(tl, 0.05);
  }
}
