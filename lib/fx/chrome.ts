import { onScroll } from "./scroll";
import { prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   CHROME — header auto-hide, the timecode, the frame counter rail,
   page-top, active nav, the surface stamp, the cue mark.

   Scroll is the crank: the timecode and the frame counter are both
   derived from scroll progress, so the two counters on one HUD agree,
   scrolling up runs the count backwards like a Steenbeck, and nothing
   repaints while the page is still. Every class write is guarded by a
   state flip.
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

export const initChrome = (): (() => void) => {
  const header = document.getElementById("header");
  const pagetop = document.getElementById("pagetop");
  const railFill = document.getElementById("rail-fill");
  const railIdx = document.getElementById("rail-idx");
  const railName = document.getElementById("rail-name");
  const railFr = document.getElementById("rail-fr");
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
    if (tc) tc.textContent = `TC ${timecode(frames)}`;
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

  /* active scene via an observer; the same observer stamps the surface
     under the chrome on the root, which recolours header, rail, cue and
     page-top through CSS */
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
        if (railIdx) railIdx.textContent = `Reel ${el.dataset.idx || "00"}`;
        if (railName) railName.textContent = el.dataset.name || "";
        navLinks.forEach((a, key) => a.classList.toggle("-active", key === id));
        document.documentElement.dataset.surface = el.matches(".t-ink, .t-navy, .footer")
          ? "dark"
          : el.matches(".t-carolina")
            ? "caro"
            : "light";
      }
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
  );
  scenes.forEach((s) => io.observe(s));

  return () => {
    off();
    io.disconnect();
    window.clearTimeout(cueTimer);
    header?.classList.remove("-hidden");
    delete document.documentElement.dataset.surface;
  };
};
