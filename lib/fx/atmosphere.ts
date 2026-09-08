import { gsap, prefersReduced } from "./motion";
import { onScroll } from "./scroll";
import { FIELD_MARKS, CROSSERS, markImg } from "./marks";

/* ═══════════════════════════════════════════════════════════════════
   ATMOSPHERE — the world behind the page.

   Three depths, each parallaxing at its own rate:

     FAR   lanes streaming sideways: screenplay lines in Courier, film
           edge codes on perforated strips, one lane of poster words
     MID   a drift field of strips, reels, cans and take notes
     NEAR  occasional crossings that cut the whole screen

   Everything streams on CSS keyframes on the compositor. The only
   main-thread work is one transform per depth on scroll, and the loops
   are paused while an opaque section covers the viewport.
   ═══════════════════════════════════════════════════════════════════ */

const SCRIPT = [
  "FADE IN:", "INT. STUDENT UNION — NIGHT", "EXT. THE QUAD — DAY", "CUT TO:",
  "SMASH CUT TO:", "(beat)", "ROLL SOUND", "SPEED", "MARK IT", "ACTION",
  "CUT", "CHECK THE GATE", "QUIET ON SET", "(V.O.)", "(CONT'D)", "MATCH CUT:",
  "INT. SCREENING ROOM — NIGHT", "EXT. FRANKLIN ST — DUSK", "FADE OUT.",
];
const EDGE = [
  "SFA 2025", "ROLL A", "12A", "13", "14", "15A", "SCENE 12 TAKE 2", "KEEP",
  "NO. 001", "NO. 002", "NO. 003", "PRINT", "HEAD", "TAIL", "SYNC",
];
type Kind = "script" | "edge";
interface Tier { kind: Kind; fs: [number, number]; op: [number, number]; dur: [number, number] }
/* no poster words: big ghost brand words under a title are a watermark
   field, not a projection booth's paperwork */
const TIERS: Record<Kind, Tier> = {
  script: { kind: "script", fs: [18, 26], op: [0.035, 0.05], dur: [110, 160] },
  edge: { kind: "edge", fs: [11, 14], op: [0.10, 0.14], dur: [90, 130] },
};

/* Tint budget. Ink carries the field; the brand colours are seasoning. */
const TINTS: Array<[string, number]> = [
  ["14, 13, 12", 0.66],
  ["75, 156, 211", 0.2],
  ["224, 38, 31", 0.07],
  ["19, 41, 75", 0.07],
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
  const LANES = narrow ? 6 : 9;
  const FIELD = narrow ? 4 : 6;
  const scale = Math.min(1, Math.max(0.5, vw / 1440));

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

  /* ── FAR: the lanes ─────────────────────────────────────────────── */
  const farFrag = document.createDocumentFragment();
  for (let i = 0; i < LANES; i++) {
    /* script lines, with a strip of edge code every third lane */
    const tier = i % 3 === 1 ? TIERS.edge : TIERS.script;
    const fs = rand(tier.fs[0], tier.fs[1]) * scale;
    const lane = document.createElement("div");
    lane.className = "atmos__lane";
    lane.dataset.kind = tier.kind;
    lane.style.setProperty("--y", `${(i / LANES) * 108 - 4 + rand(-1.6, 1.6)}vh`);
    lane.style.setProperty("--fs", `${fs.toFixed(1)}px`);
    lane.style.setProperty("--c", `rgba(${pickTint()}, ${rand(tier.op[0], tier.op[1]).toFixed(3)})`);
    lane.style.setProperty("--dur", `${rand(tier.dur[0], tier.dur[1]).toFixed(0)}s`);
    if (i % 3 === 2) lane.dataset.dir = "r";

    const perChar = fs * 0.62;
    const unit = document.createElement("span");
    let width = 0;
    let guard = 0;
    const words = tier.kind === "edge" ? EDGE : SCRIPT;
    while (width < vw * 1.25 && guard++ < 80) {
      const txt = pick(words);
      const b = document.createElement("b");
      b.textContent = txt;
      unit.appendChild(b);
      if (tier.kind === "edge") {
        for (let k = 0; k < 3; k++) unit.appendChild(document.createElement("i"));
        width += fs * 3;
      }
      width += (txt.length + 2) * perChar + fs * 0.6;
    }
    lane.appendChild(unit);
    lane.appendChild(unit.cloneNode(true));
    farFrag.appendChild(lane);
  }
  far.appendChild(farFrag);

  /* ── MID: the drift field ─────────────────────────────────────── */
  const midFrag = document.createDocumentFragment();
  const cols = narrow ? 2 : 3;
  const bag = [...FIELD_MARKS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < FIELD; i++) {
    const el = document.createElement("div");
    el.className = "atmos__mark";
    const col = i % cols;
    const row = Math.floor(i / cols);
    el.style.setProperty("--x", `${(col / cols) * 100 + rand(4, 18)}vw`);
    el.style.setProperty("--y", `${(row / Math.ceil(FIELD / cols)) * 96 + rand(2, 16)}vh`);
    el.style.setProperty("--w", `${(rand(5, 11) * (narrow ? 1.35 : 1)).toFixed(2)}vw`);
    el.style.setProperty("--rot", `${rand(-26, 26).toFixed(1)}deg`);
    el.style.setProperty("--sway", `${rand(9, 22).toFixed(1)}px`);
    el.style.setProperty("--spin", `${rand(-11, 11).toFixed(1)}deg`);
    el.style.setProperty("--dur", `${rand(11, 24).toFixed(1)}s`);
    el.style.setProperty("--delay", `${rand(-14, 0).toFixed(1)}s`);
    el.style.setProperty("--op", rand(0.09, 0.15).toFixed(3));
    const m = bag[i % bag.length];
    el.style.setProperty("--ar", String(m.ar));
    el.appendChild(markImg(m.file));
    midFrag.appendChild(el);
  }
  mid.appendChild(midFrag);

  /* ── NEAR: crossings ──────────────────────────────────────────── */
  const nearFrag = document.createDocumentFragment();
  const crossers: HTMLElement[] = [];
  for (const m of CROSSERS) {
    const el = document.createElement("div");
    el.className = "atmos__chara";
    el.style.setProperty("--ar", String(m.ar));
    el.appendChild(markImg(m.file));
    nearFrag.appendChild(el);
    crossers.push(el);
  }
  near.appendChild(nearFrag);

  /* ── pause while an opaque section covers the viewport ────────── */
  const opaque = Array.from(document.querySelectorAll<HTMLElement>(".sec.t-ink, .sec.t-navy, .footer"));
  let paused = false;
  const setPaused = (p: boolean) => {
    if (p === paused) return;
    paused = p;
    root.style.setProperty("--atmos-play", p ? "paused" : "running");
  };
  const coveredNow = () => {
    const h = window.innerHeight;
    for (const el of opaque) {
      const r = el.getBoundingClientRect();
      if (r.top <= 0 && r.bottom >= h) return true;
    }
    return false;
  };

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
    const covered = coveredNow();
    setPaused(covered);
    if (covered) return;
    const v = -velocity * 1.1;
    for (const set of setters) set(v);
    settle?.kill();
    settle = gsap.delayedCall(0.25, () => { for (const set of setters) set(0); });
  });

  let call: gsap.core.Tween | null = null;
  let cursor = 0;
  const scheduleCross = (first = false) => {
    call = gsap.delayedCall(first ? 5 : rand(7, 13), () => {
      const el = crossers[cursor++ % crossers.length];
      if (!el) return;
      el.classList.remove("-run");
      void el.offsetWidth;
      el.style.setProperty("--y", `${rand(6, 80)}vh`);
      el.style.setProperty("--w", `${rand(10, 22).toFixed(1)}vw`);
      el.style.setProperty("--dur", `${rand(11, 18).toFixed(1)}s`);
      el.style.setProperty("--tilt", `${rand(-10, 10).toFixed(1)}deg`);
      el.classList.add("-run");
      scheduleCross();
    });
  };

  return {
    start: () => {
      running = true;
      root.classList.add("-ready");
      setPaused(coveredNow());
      scheduleCross(true);
    },
    stop: () => {
      running = false;
      call?.kill();
      setPaused(true);
    },
    destroy: () => {
      running = false;
      call?.kill();
      settle?.kill();
      off();
    },
  };
};
