import { gsap, prefersReduced } from "./motion";
import { onScroll } from "./scroll";
import { MARKS, SHEET, markImg } from "./marks";

/* ═══════════════════════════════════════════════════════════════════
   ATMOSPHERE — the world behind the page.

   Three depths, each parallaxing at its own rate:

     FAR   typeset lanes streaming sideways (the underprint)
     MID   a drift field of hand-drawn marks, slowly breathing
     NEAR  occasional fast crossings that cut the whole screen

   Everything streams on CSS keyframes, which Chrome runs on the
   compositor — no rAF, no ticker, no per-frame JS. The only main-thread
   work is one transform per depth on scroll.

   The phrases are the set's vocabulary: what a crew says on the day,
   what a slate reads, what the club is.
   ═══════════════════════════════════════════════════════════════════ */

const PHRASES = [
  "Roll Sound", "Speed", "Mark It", "Action", "Cut", "Check the Gate",
  "Student Film Association", "Chapel Hill, NC", "Festival in May",
  "Take 2", "Scene 12", "INT. Student Union — Night", "Fade In:",
  "Twelve Films", "Fifteen Awards", "No Experience Needed",
  "Southern Part of Heaven", "Go Heels", "Est. UNC", "Quiet on Set",
];

interface Tier { fs: [number, number]; op: [number, number]; weight: number; dur: [number, number] }
const TIERS: Tier[] = [
  { fs: [84, 124], op: [0.028, 0.040], weight: 800, dur: [150, 210] },
  { fs: [38, 54],  op: [0.032, 0.046], weight: 800, dur: [110, 160] },
  { fs: [18, 25],  op: [0.045, 0.062], weight: 500, dur: [80,  120] },
];

/* Tint budget. Ink carries the field; the brand colours are seasoning. */
const TINTS: Array<[string, number]> = [
  ["16, 15, 13", 0.62],
  ["75, 156, 211", 0.22],
  ["255, 74, 23", 0.09],
  ["240, 180, 41", 0.07],
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

const pickTint = () => {
  let r = Math.random();
  for (const [rgb, w] of TINTS) {
    if (r < w) return rgb;
    r -= w;
  }
  return TINTS[0][0];
};

export interface Atmosphere {
  start: () => void;
  stop: () => void;
  destroy: () => void;
}

export const initAtmosphere = (): Atmosphere | null => {
  const root = document.getElementById("atmos");
  if (!root || prefersReduced()) return null;
  root.innerHTML = "";
  root.classList.remove("-ready");

  const vw = window.innerWidth;
  const narrow = vw < 900;
  const LANES = narrow ? 10 : 16;
  const FIELD = narrow ? 7 : 13;

  /* The tier sizes are tuned against a ~1440px stage. */
  const scale = Math.min(1, Math.max(0.42, vw / 1440));

  const layer = (depth: string) => {
    const el = document.createElement("div");
    el.className = "atmos__layer";
    el.dataset.depth = depth;
    root.appendChild(el);
    return el;
  };
  const far = layer("far");
  const mid = layer("mid");
  const near = layer("near");

  /* ── FAR: typeset lanes ─────────────────────────────────────────── */
  const farFrag = document.createDocumentFragment();
  for (let i = 0; i < LANES; i++) {
    const tier = TIERS[i % 4 === 1 ? 0 : i % 2 === 0 ? 2 : 1];
    const fs = rand(tier.fs[0], tier.fs[1]) * scale;
    const lane = document.createElement("div");
    lane.className = "atmos__lane";

    lane.style.setProperty("--y", `${(i / LANES) * 108 - 4 + rand(-1.6, 1.6)}vh`);
    lane.style.setProperty("--fs", `${fs.toFixed(1)}px`);
    lane.style.setProperty("--fw", String(tier.weight));
    lane.style.setProperty("--c", `rgba(${pickTint()}, ${rand(tier.op[0], tier.op[1]).toFixed(3)})`);
    lane.style.setProperty("--dur", `${rand(tier.dur[0], tier.dur[1]).toFixed(0)}s`);
    if (i % 3 === 2) lane.dataset.dir = "r";

    const perChar = fs * 0.4;
    const unit = document.createElement("span");
    let width = 0;
    let guard = 0;
    while (width < vw * 1.25 && guard++ < 60) {
      const txt = pick(PHRASES);
      const b = document.createElement("b");
      b.textContent = `${txt} ★`;
      unit.appendChild(b);
      width += (txt.length + 2) * perChar + fs * 0.6;
    }
    lane.appendChild(unit);
    lane.appendChild(unit.cloneNode(true));
    farFrag.appendChild(lane);
  }
  far.appendChild(farFrag);

  /* ── MID: the drift field ─────────────────────────────────────── */
  const midFrag = document.createDocumentFragment();
  const cols = narrow ? 2 : 4;
  const bag = [...MARKS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < FIELD; i++) {
    const el = document.createElement("div");
    el.className = "atmos__mark";
    const col = i % cols;
    const row = Math.floor(i / cols);
    el.style.setProperty("--x", `${(col / cols) * 100 + rand(2, 16)}vw`);
    el.style.setProperty("--y", `${(row / Math.ceil(FIELD / cols)) * 96 + rand(1, 14)}vh`);
    el.style.setProperty("--w", `${(rand(4.6, 11) * (narrow ? 1.35 : 1)).toFixed(2)}vw`);
    el.style.setProperty("--rot", `${rand(-26, 26).toFixed(1)}deg`);
    el.style.setProperty("--sway", `${rand(9, 22).toFixed(1)}px`);
    el.style.setProperty("--spin", `${rand(-11, 11).toFixed(1)}deg`);
    el.style.setProperty("--dur", `${rand(11, 24).toFixed(1)}s`);
    el.style.setProperty("--delay", `${rand(-14, 0).toFixed(1)}s`);
    el.style.setProperty("--op", rand(0.10, 0.19).toFixed(3));
    const m = bag[i % bag.length];
    el.style.setProperty("--ar", String(m.ar));
    el.appendChild(markImg(m.file));
    midFrag.appendChild(el);
  }
  mid.appendChild(midFrag);

  /* ── NEAR: crossings ──────────────────────────────────────────── */
  const nearFrag = document.createDocumentFragment();
  const crossers: HTMLElement[] = [];
  for (const m of [...MARKS, SHEET]) {
    const el = document.createElement("div");
    el.className = "atmos__chara";
    el.style.setProperty("--ar", String(m.ar));
    el.appendChild(markImg(m.file));
    nearFrag.appendChild(el);
    crossers.push(el);
  }
  near.appendChild(nearFrag);

  /* ── scroll response: one transform per depth ─────────────────── */
  const rates: Array<[HTMLElement, number]> = [[far, 1], [mid, 2.3], [near, 3.4]];
  const setters = rates.map(([el, rate]) => {
    const to = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    return (v: number) => to(gsap.utils.clamp(-90, 90, v * rate));
  });
  let settle: gsap.core.Tween | null = null;
  let running = false;

  const off = onScroll(({ velocity }) => {
    if (!running) return;
    const v = -velocity * 1.1;
    for (const set of setters) set(v);
    settle?.kill();
    settle = gsap.delayedCall(0.25, () => { for (const set of setters) set(0); });
  });

  /* ── crossing scheduler ─────────────────────────────────────────── */
  let call: gsap.core.Tween | null = null;
  let cursor = 0;
  const scheduleCross = (first = false) => {
    call = gsap.delayedCall(first ? 4 : rand(5, 10), () => {
      const el = crossers[cursor++ % crossers.length];
      el.classList.remove("-run");
      void el.offsetWidth; /* restart the keyframe */
      el.style.setProperty("--y", `${rand(6, 80)}vh`);
      el.style.setProperty("--w", `${rand(8, 17).toFixed(1)}vw`);
      el.style.setProperty("--dur", `${rand(10, 17).toFixed(1)}s`);
      el.style.setProperty("--tilt", `${rand(-14, 14).toFixed(1)}deg`);
      el.classList.add("-run");
      scheduleCross();
    });
  };

  return {
    start: () => {
      running = true;
      root.classList.add("-ready");
      root.style.removeProperty("--atmos-play");
      scheduleCross(true);
    },
    stop: () => {
      running = false;
      call?.kill();
      root.style.setProperty("--atmos-play", "paused");
    },
    destroy: () => {
      running = false;
      call?.kill();
      settle?.kill();
      off();
    },
  };
};
