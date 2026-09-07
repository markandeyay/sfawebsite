import { gsap, prefersReduced } from "./motion";
import { onScroll } from "./scroll";

/* ═══════════════════════════════════════════════════════════════════
   BANDS — the tilted marquee tape between sections.

   Constant linear travel at a fixed pixels-per-second, so every row
   moves at the same visual speed regardless of how much text it holds.
   Scroll velocity bends the playhead RATE via timeScale, never the
   position. Rows are paused while off-screen.
   ═══════════════════════════════════════════════════════════════════ */

const PPS = 74; /* pixels per second */

export const initBands = (): (() => void) => {
  const loops: gsap.core.Tween[] = [];
  const byBand = new Map<Element, gsap.core.Tween[]>();

  document.querySelectorAll<HTMLElement>("[data-band-row]").forEach((row) => {
    const set = row.querySelector<HTMLElement>("[data-band-set]");
    if (!set) return;
    if (row.dataset.bandDone) return;
    row.dataset.bandDone = "1";

    /* clone whole sets until the row covers two viewports */
    const unit = set.scrollWidth;
    if (unit < 8) return;
    const need = Math.ceil((window.innerWidth * 2) / unit) + 1;
    for (let i = 1; i < need; i++) row.appendChild(set.cloneNode(true));

    const speed = parseFloat(row.dataset.speed || "1");
    const dir = speed < 0 ? -1 : 1;
    const dur = unit / (PPS * Math.abs(speed));

    const loop = gsap.fromTo(
      row,
      { x: dir > 0 ? 0 : -unit },
      { x: dir > 0 ? -unit : 0, duration: dur, ease: "none", repeat: -1, paused: true },
    );
    loops.push(loop);

    const band = row.closest("[data-band]");
    if (band) {
      const list = byBand.get(band) || [];
      list.push(loop);
      byBand.set(band, list);
    }
  });

  /* under reduced motion the loops are built but never played */
  if (prefersReduced()) return () => loops.forEach((l) => l.kill());

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const list = byBand.get(entry.target);
        if (!list) continue;
        for (const loop of list) {
          if (entry.isIntersecting) loop.play();
          else loop.pause();
        }
      }
    },
    { rootMargin: "20% 0px" },
  );
  byBand.forEach((_, band) => io.observe(band));

  const proxy = { rate: 1 };
  const rateTo = gsap.quickTo(proxy, "rate", {
    duration: 0.4,
    ease: "power2.out",
    onUpdate: () => {
      for (let i = 0; i < loops.length; i++) loops[i].timeScale(proxy.rate);
    },
  });
  let reset: gsap.core.Tween | null = null;

  const bands = Array.from(byBand.keys());
  let urgent = false;
  let calmCall: gsap.core.Tween | null = null;
  const setUrgent = (on: boolean) => {
    if (on === urgent) return;
    urgent = on;
    for (const b of bands) b.classList.toggle("-urgent", on);
  };

  const off = onScroll(({ velocity }) => {
    const v = Math.min(Math.abs(velocity), 44);
    rateTo(1 + v * 0.34);
    reset?.kill();
    reset = gsap.delayedCall(0.6, () => rateTo(1));

    if (v > 16) {
      setUrgent(true);
      calmCall?.kill();
      calmCall = gsap.delayedCall(0.45, () => setUrgent(false));
    }
  });

  return () => {
    off();
    io.disconnect();
    reset?.kill();
    calmCall?.kill();
    loops.forEach((l) => l.kill());
  };
};
