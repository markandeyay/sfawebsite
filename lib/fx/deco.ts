import { gsap, EASE, prefersReduced } from "./motion";
import { markByName, markImg } from "./marks";

/* ═══════════════════════════════════════════════════════════════════
   SECTION DECO — background life inside the opaque sections.

   The atmosphere layer sits behind the page, so the sections that own
   a solid colour field would be completely flat behind their content.
   These are big, low-contrast marks scattered inside the section,
   parallaxing against the scroll so they sit *in* the field.
   ═══════════════════════════════════════════════════════════════════ */

/* Per-section casts. */
const CASTS: Record<string, string[]> = {
  slate: ["sheet", "reel", "clapper", "megaphone", "star"],
  crew: ["chair", "sheet", "spot", "clapper", "ticket"],
  credits: ["reel", "ticket", "sheet", "megaphone", "star"],
  finale: ["sheet", "star", "reel", "clapper", "spot"],
};

/* x/y in %, size in vw, rotation in deg — hand-placed so nothing lands
   on the display type or the reading column */
const SPOTS: Array<[number, number, number, number]> = [
  [76, 12, 13, -14],
  [8, 62, 17, 11],
  [58, 74, 10, -8],
  [90, 46, 9, 19],
  [33, 20, 8, -21],
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const initDeco = (): (() => void) => {
  if (prefersReduced()) return () => {};
  const tweens: gsap.core.Tween[] = [];
  const layers: HTMLElement[] = [];

  for (const [id, cast] of Object.entries(CASTS)) {
    const sec = document.getElementById(id);
    if (!sec || sec.querySelector(":scope > .sec__deco")) continue;

    const layer = document.createElement("div");
    layer.className = "sec__deco";
    layer.setAttribute("aria-hidden", "true");

    cast.forEach((name, i) => {
      const [x, y, w, rot] = SPOTS[i % SPOTS.length];
      const el = document.createElement("div");
      el.className = "sec__deco-mark";
      el.style.setProperty("--x", `${x + rand(-4, 4)}%`);
      el.style.setProperty("--y", `${y + rand(-5, 5)}%`);
      el.style.setProperty("--w", `${(w * rand(0.85, 1.2)).toFixed(1)}vw`);
      el.style.setProperty("--rot", `${rot + rand(-8, 8)}deg`);
      const mark = markByName(name);
      el.dataset.mark = name;
      el.style.setProperty("--ar", String(mark.ar));
      if (name === "sheet") el.style.setProperty("--w", `${(w * 2.4).toFixed(1)}vw`);
      el.appendChild(markImg(mark.file));
      layer.appendChild(el);
    });

    sec.insertBefore(layer, sec.firstChild);
    layers.push(layer);

    gsap.utils.toArray<HTMLElement>(layer.children).forEach((mark, i) => {
      tweens.push(gsap.fromTo(mark,
        { yPercent: (i % 2 ? 1 : -1) * rand(14, 30) },
        {
          yPercent: (i % 2 ? -1 : 1) * rand(14, 30),
          ease: EASE.linear,
          scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 1.15 },
        }));
    });
  }

  return () => {
    tweens.forEach((t) => {
      t.scrollTrigger?.kill();
      t.kill();
    });
    layers.forEach((l) => l.remove());
  };
};
