import { prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   REVEALS — split text and enter-on-view.

   Deliberately CSS transitions rather than tweens: an observer flips
   one class and the compositor does the rest, so a page with 200
   revealed glyphs still has zero JS running during the animation.
   Stagger rides on --gd / --wd custom properties.
   ═══════════════════════════════════════════════════════════════════ */

const STEP_LETTER = 24;
const STEP_WORD = 34;

const splitLetters = (host: HTMLElement) => {
  let idx = 0;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        /* Glyph wrappers are inline-blocks, so without a word wrapper a
           long title could break between letters ("THE G / IFT"). Each
           word gets a nowrap span; spaces stay text nodes between them. */
        let word: HTMLElement | null = null;
        for (const ch of text) {
          if (ch === " ") {
            word = null;
            frag.appendChild(document.createTextNode(" "));
            continue;
          }
          if (!word) {
            word = document.createElement("span");
            word.className = "glword";
            frag.appendChild(word);
          }
          const w = document.createElement("span");
          w.className = "glw";
          const g = document.createElement("span");
          g.className = "gl";
          g.textContent = ch;
          g.style.setProperty("--gd", `${idx * STEP_LETTER}ms`);
          /* Letters settle slightly off-true: display type that reads as
             set by hand rather than snapped to a baseline. Under a degree
             and a couple of hundredths of an em, so it registers as
             character, not as a rendering bug. */
          g.style.setProperty("--gr", `${(Math.random() * 2 - 1).toFixed(2)}deg`);
          g.style.setProperty("--gy", `${(Math.random() * 0.036 - 0.018).toFixed(3)}em`);
          idx++;
          w.appendChild(g);
          word.appendChild(w);
        }
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE && !(child as HTMLElement).classList.contains("glw")) {
        walk(child);
      }
    });
  };
  walk(host);
  return idx;
};

const splitWords = (host: HTMLElement) => {
  const text = (host.textContent || "").trim();
  host.textContent = "";
  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((word, i) => {
    const w = document.createElement("span");
    w.className = "wdw";
    const g = document.createElement("span");
    g.className = "wd";
    g.textContent = word;
    g.style.setProperty("--wd", `${Math.min(i * STEP_WORD, 520)}ms`);
    w.appendChild(g);
    host.appendChild(w);
    host.appendChild(document.createTextNode(" "));
  });
  return words.length;
};

export const initReveals = (): (() => void) => {
  /* Reduced motion: -no-motion in components.css already forces the
     settled state, so splitting would only add DOM for nothing. */
  if (prefersReduced()) return () => {};

  const cost = new WeakMap<Element, number>();

  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = "1";
    cost.set(el, splitLetters(el) * STEP_LETTER);
  });
  document.querySelectorAll<HTMLElement>("[data-split-words]").forEach((el) => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = "1";
    cost.set(el, splitWords(el) * STEP_WORD);
  });

  const timers: number[] = [];
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add("-in");
        io.unobserve(el);

        /* release the compositor layers once the roll has landed */
        let longest = cost.get(el) || 0;
        el.querySelectorAll<HTMLElement>("[data-split], [data-split-words]").forEach((s) => {
          longest = Math.max(longest, cost.get(s) || 0);
        });
        timers.push(window.setTimeout(() => el.classList.add("-settled"), longest + 1400));
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  const targets = document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-head]");
  targets.forEach((el) => {
    /* siblings in the same parent cascade rather than landing together */
    const parent = el.parentElement;
    if (parent && el.hasAttribute("data-reveal")) {
      const sibs = Array.from(parent.querySelectorAll(":scope > [data-reveal]"));
      if (sibs.length > 1) {
        el.style.setProperty("--rd", `${Math.min(sibs.indexOf(el) * 80, 400)}ms`);
      }
    }
    io.observe(el);
  });

  return () => {
    io.disconnect();
    timers.forEach((t) => window.clearTimeout(t));
  };
};
