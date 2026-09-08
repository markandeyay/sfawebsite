import { onScroll } from "./scroll";
import { prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   CHROME — header auto-hide, the timecode, the frame counter rail,
   page-top, active nav, the surface stamps, the cue mark.

   Scroll is the crank: the timecode and the frame counter are both
   derived from scroll progress, so the two counters on one HUD agree,
   scrolling up runs the count backwards like a Steenbeck, and nothing
   repaints while the page is still. Every class write is guarded by a
   state flip.

   Three observers stamp the surface on the root: the centre band (for
   the rail, the nav and the reel name), the top band under the header
   and the bottom band under page-top, so each piece of chrome reads
   the colour actually beneath it and never goes ink on ink.
   ═══════════════════════════════════════════════════════════════════ */

const FPS = 24;
/* frames in the reel: the rail reads FR 0000 at the top and 9999 at the end */
const REEL = 9999;

const timecode = (frames: number) => {
  const f = frames % FPS;
  const s = Math.floor(frames / FPS) % 60;
  const m = Math.floor(frames / FPS / 60) % 60;
  const h = Math.floor(frames / FPS / 3600);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}:${p(f)}`;
};

const DARK = ".t-ink, .t-navy, .footer, .awards__card, .hero__stage";
const surfaceOf = (el: Element) => (el.matches(DARK) ? "dark" : el.matches(".t-carolina") ? "caro" : "light");

/* an observer over a band of the viewport that stamps the surface of
   the lowest-starting member currently inside that band */
const bandObserver = (targets: Element[], rootMargin: string, key: "surfaceTop" | "surfaceBottom") => {
  const inside = new Set<Element>();
  const stamp = () => {
    let best: Element | null = null;
    let bestTop = -Infinity;
    inside.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top > bestTop) {
        bestTop = top;
        best = el;
      }
    });
    if (best) document.documentElement.dataset[key] = surfaceOf(best);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inside.add(e.target);
        else inside.delete(e.target);
      }
      stamp();
    },
    { rootMargin, threshold: 0 },
  );
  targets.forEach((t) => io.observe(t));
  return io;
};

export const initChrome = (): (() => void) => {
  const header = document.getElementById("header");
  const pagetop = document.getElementById("pagetop");
  const railFill = document.getElementById("rail-fill");
  const railIdx = document.getElementById("rail-idx");
  const railName = document.getElementById("rail-name");
  const railFr = document.getElementById("rail-fr");
  const reel = document.getElementById("header-reel");
  const tc = document.getElementById("header-tc");
  const cue = document.getElementById("cue");

  let hidden = false;
  let topShown = false;
  let lastY = 0;
  let lastFrame = -1;
  const trackH = () => (railFill?.parentElement?.clientHeight ?? 0) - 2;

  const paintFrames = (frames: number) => {
    if (frames === lastFrame) return;
    lastFrame = frames;
    if (railFr) railFr.textContent = `FR ${String(frames).padStart(4, "0")}`;
    if (tc) tc.textContent = timecode(frames);
  };
  paintFrames(0);

  const off = onScroll(({ y, progress }) => {
    if (header) {
      const hide = y > lastY && y > 180;
      if (hide !== hidden) {
        hidden = hide;
        header.classList.toggle("-hidden", hide);
      }
    }
    if (pagetop) {
      const show = y > window.innerHeight * 1.1;
      if (show !== topShown) {
        topShown = show;
        pagetop.classList.toggle("-show", show);
      }
    }
    if (railFill) railFill.style.setProperty("--fr", `${(progress * trackH()).toFixed(1)}px`);
    paintFrames(Math.round(progress * REEL));
    lastY = y;
  });

  /* the cue mark blinks twice every so often, like a reel change */
  let cueTimer = 0;
  if (cue && !prefersReduced()) {
    const blink = () => {
      cue.classList.remove("-blink");
      void cue.offsetWidth;
      cue.classList.add("-blink");
      cueTimer = window.setTimeout(blink, 18000 + Math.random() * 14000);
    };
    cueTimer = window.setTimeout(blink, 9000);
  }

  /* active scene via the centre band */
  const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
  const navLinks = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>("[data-navlink]").forEach((a) => {
    navLinks.set(a.dataset.navlink!, a);
  });

  let current = "";
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const id = el.id;
        if (id === current) continue;
        current = id;
        const idx = el.dataset.idx || "00";
        const name = el.dataset.name || "";
        if (railIdx) railIdx.textContent = `Reel ${idx}`;
        if (railName) railName.textContent = name;
        if (reel) reel.textContent = `Reel ${idx} · ${name}`;
        navLinks.forEach((a, key) => a.classList.toggle("-active", key === id));
        document.documentElement.dataset.surface = surfaceOf(el);
      }
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
  );
  scenes.forEach((s) => io.observe(s));

  /* the surface under the header and under page-top: the scenes plus
     the two ink blocks that live inside paper scenes */
  const blocks = [...scenes, ...Array.from(document.querySelectorAll<HTMLElement>(".hero__stage, .awards__card"))];
  const ioTop = bandObserver(blocks, "0px 0px -92% 0px", "surfaceTop");
  const ioBottom = bandObserver(blocks, "-90% 0px 0px 0px", "surfaceBottom");

  return () => {
    off();
    io.disconnect();
    ioTop.disconnect();
    ioBottom.disconnect();
    window.clearTimeout(cueTimer);
    header?.classList.remove("-hidden");
    delete document.documentElement.dataset.surface;
    delete document.documentElement.dataset.surfaceTop;
    delete document.documentElement.dataset.surfaceBottom;
  };
};
