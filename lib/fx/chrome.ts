import { onScroll } from "./scroll";
import { prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   CHROME — header auto-hide, the running timecode, the frame counter
   rail, page-top, active nav, the cue mark.

   Everything scroll-driven reads from the single broadcast. Every
   class write is guarded by a state flip.
   ═══════════════════════════════════════════════════════════════════ */

const FPS = 24;

const timecode = (ms: number) => {
  const frames = Math.floor((ms / 1000) * FPS);
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
    if (railFr) {
      const frame = Math.round(progress * 9999);
      if (frame !== lastFrame) {
        lastFrame = frame;
        railFr.textContent = `FR ${String(frame).padStart(4, "0")}`;
      }
    }
    lastY = y;
  });

  /* the timecode runs at 24 fps from the moment the page booted; under
     reduced motion it is set once and left */
  const t0 = performance.now();
  let tcTimer = 0;
  if (tc) {
    if (prefersReduced()) tc.textContent = `TC ${timecode(0)}`;
    else tcTimer = window.setInterval(() => { tc.textContent = `TC ${timecode(performance.now() - t0)}`; }, 1000 / FPS);
  }

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

  /* active scene via an observer */
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
      }
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
  );
  scenes.forEach((s) => io.observe(s));

  return () => {
    off();
    io.disconnect();
    window.clearInterval(tcTimer);
    window.clearTimeout(cueTimer);
    header?.classList.remove("-hidden");
  };
};
