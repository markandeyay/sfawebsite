import { gsap, ScrollTrigger, EASE, DUR, onDesktop, prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   SCENES — scroll choreography, one scene per section.

   THREE RULES, ENFORCED THROUGHOUT
   1. Transform and opacity only. Nothing here animates a property that
      can trigger layout.
   2. Exactly ONE pin on a page — the slate.
   3. Everything pinned or scrubbed is created inside a single
      matchMedia scope, in document order, so pin spacers exist before
      later triggers measure against them.
   ═══════════════════════════════════════════════════════════════════ */

/* Hidden-by-default states are applied in JS, never in CSS, so a JS
   failure leaves a fully readable page instead of an empty one. */
const has = (sel: string) => document.querySelector(sel) !== null;
const set = (sel: string, vars: gsap.TweenVars) => {
  if (has(sel)) gsap.set(sel, vars);
};

export const prepareScenes = () => {
  if (prefersReduced()) return;
  set("[data-hero]", { opacity: 0, y: 44 });
  /* the letterbox closes in from both edges, the viewfinder snaps on */
  set(".hero__bar.-top", { yPercent: -100 });
  set(".hero__bar.-bottom", { yPercent: 100 });
  set(".hero__hud", { opacity: 0 });
  set(".hero__vf i", { opacity: 0, scale: 1.8 });
  set("[data-hero-fade]", { opacity: 0 });
  set(".hero__eyebrow .ln", { scaleX: 0, transformOrigin: "0 50%" });
  set(".hero__mascot .badge", { opacity: 0, scale: 0.4, rotate: -90 });
  set(".hero__side", { opacity: 0, y: 40 });
  set("[data-film-hero]", { opacity: 0, y: 40 });
};

/* The iris opens onto a page that then assembles itself. Beats are
   deliberately overlapped rather than sequential. */
export const heroIntro = () => {
  if (prefersReduced()) return;

  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  const stage = document.querySelector<HTMLElement>(".hero__stage");

  if (stage) {
    tl.to(".hero__bar", { yPercent: 0, duration: 0.9, ease: "power3.inOut" }, 0)
      /* the title rises letter by letter through the CSS reveal */
      .add(() => stage.classList.add("-in"), 0.28)
      .to(".hero__vf i", { opacity: 0.8, scale: 1, duration: 0.55, ease: EASE.snap, stagger: 0.06 }, 0.55)
      .to(".hero__hud", { opacity: 1, duration: DUR.d3 }, 0.8)
      .to(".hero__eyebrow .ln", { scaleX: 1, duration: 1.1, stagger: 0.09 }, 0.3)
      .to(".hero__mascot[data-hero]", { opacity: 1, y: 0, duration: 1.35, ease: EASE.snap }, 0.45)
      .to(".hero__mascot .badge", { opacity: 1, scale: 1, rotate: 0, duration: 1.1, ease: EASE.snap }, 0.9)
      .to(".hero__line[data-hero]", { opacity: 1, y: 0, duration: DUR.d4 }, 1.05)
      .to("[data-hero-fade]", { opacity: 1, duration: DUR.d4, stagger: 0.1 }, 0.7)
      .to(".hero__side", { opacity: 0.55, y: 0, duration: DUR.d4 }, 1.1)
      .add(() => stage.classList.add("-settled"), 3.2);

    /* the slate keeps breathing after the intro lands */
    gsap.to(".hero__mascot", {
      y: -14, rotate: 1.2, duration: 3.6,
      ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2,
    });
  }

  /* inner pages: a shorter arrival */
  if (document.querySelector("[data-film-hero]")) {
    tl.to("[data-film-hero]", { opacity: 1, y: 0, duration: DUR.d4, stagger: 0.09 }, 0.1)
      .to("[data-hero-fade]", { opacity: 1, duration: DUR.d4, stagger: 0.1 }, 0.3);
  }
};

export const initScenes = (): (() => void) => {
  if (prefersReduced()) return () => {};
  const tweens: gsap.core.Tween[] = [];

  /* ── ambient parallax (all breakpoints, all cheap) ──────────── */
  if (document.getElementById("hero")) {
    tweens.push(gsap.to(".hero__lockup", {
      yPercent: -14, ease: EASE.linear,
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    }));
    tweens.push(gsap.to(".hero__mascot", {
      yPercent: 16, ease: EASE.linear,
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    }));
    tweens.push(gsap.to(".hero__eyebrow", {
      yPercent: -70, opacity: 0, ease: EASE.linear,
      scrollTrigger: { trigger: "#hero", start: "top top", end: "58% top", scrub: true },
    }));
  }

  const ghost = document.querySelector(".story__ghost");
  if (ghost) {
    tweens.push(gsap.fromTo(ghost, { xPercent: 8 }, {
      xPercent: -20, ease: EASE.linear,
      scrollTrigger: { trigger: "#story", start: "top bottom", end: "bottom top", scrub: 1.1 },
    }));
  }

  const spin = document.querySelector("[data-spin]");
  if (spin) {
    tweens.push(gsap.fromTo(spin, { rotate: -18, yPercent: 10 }, {
      rotate: 18, yPercent: -10, ease: EASE.linear,
      scrollTrigger: { trigger: "#credits", start: "top bottom", end: "bottom top", scrub: 1 },
    }));
  }

  /* ── desktop choreography, single scope, document order ─────── */
  const mm = onDesktop(() => {
    storyScene();
    slateScene();
    rackScene();
    crewScene();
    creditsScene();
    filmScene();
    nightScene();
  });

  return () => {
    tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
    mm?.revert();
  };
};

/* ── CALL SHEET — the manifesto rises, the sheet fills ─────────── */
const storyScene = () => {
  const root = document.getElementById("story-pin");
  if (!root) return;

  const lines = gsap.utils.toArray<HTMLElement>("[data-ln]");
  const bodies = gsap.utils.toArray<HTMLElement>("[data-body]");
  const facts = gsap.utils.toArray<HTMLElement>("[data-fact]");
  const media = root.querySelector<HTMLElement>("[data-story-media]");
  const badge = root.querySelector<HTMLElement>("[data-badge]");

  const tl = gsap.timeline({
    defaults: { ease: EASE.out },
    scrollTrigger: { trigger: root, start: "top 82%", end: "bottom 68%", scrub: 0.9, invalidateOnRefresh: true },
  });

  lines.forEach((ln, i) => {
    tl.fromTo(ln, { yPercent: 118 }, { yPercent: 0, duration: 0.3 }, i * 0.09);
  });
  const marked = lines.find((l) => l.classList.contains("ln--mark"));
  if (marked) {
    tl.fromTo(marked, { backgroundSize: "0% 62%" }, { backgroundSize: "100% 62%", duration: 0.26, ease: "power1.inOut" }, 0.3);
  }
  bodies.forEach((b, i) => {
    tl.fromTo(b, { x: b.dataset.body === "l" ? -46 : 46, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 0.34 + i * 0.12);
  });
  if (media) {
    tl.fromTo(media,
      { clipPath: "inset(0 0 100% 0)", rotate: 3.5, transformOrigin: "50% 100%" },
      { clipPath: "inset(0 0 0% 0)", rotate: 0, duration: 0.46, ease: "power2.inOut" }, 0.18);
  }
  if (badge) {
    tl.fromTo(badge, { opacity: 0, scale: 0.4, y: 26 }, { opacity: 1, scale: 1, y: 0, duration: 0.24, ease: EASE.snap }, 0.62);
  }
  facts.forEach((f, i) => {
    tl.fromTo(f, { x: f.dataset.fact === "l" ? -34 : 34, opacity: 0 }, { x: 0, opacity: 1, duration: 0.14 }, 0.48 + i * 0.06);
  });
};

/* ── THE SLATE — the one pin on the page ──────────────────────── */
const slateScene = () => {
  const pin = document.getElementById("slate-pin");
  const track = document.getElementById("slate-track");
  if (!pin || !track) return;

  const cur = document.getElementById("sl-cur");
  const fill = document.getElementById("sl-fill");
  const shots = gsap.utils.toArray<HTMLElement>("[data-drift]");
  const total = shots.length;

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 40);

  /* Entrance: the reel deals itself out before the pin takes over. */
  gsap.fromTo(shots,
    {
      y: (i: number) => 70 + i * 28,
      rotate: (i: number) => (i % 2 ? 6 : -6) - i * 0.5,
      scale: 0.86,
      opacity: 0,
    },
    {
      y: 0, rotate: 0, scale: 1, opacity: 1,
      duration: 0.95, ease: EASE.out, stagger: 0.08,
      scrollTrigger: { trigger: pin, start: "top 90%", once: true },
    });

  let lastIdx = -1;
  gsap.to(track, {
    x: () => -distance(),
    ease: EASE.linear,
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: () => `+=${distance()}`,
      pin: true,
      anticipatePin: 1,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        const idx = Math.min(total, Math.floor(p * (total - 0.001)) + 1);
        if (cur && idx !== lastIdx) {
          lastIdx = idx;
          cur.textContent = String(idx).padStart(2, "0");
        }
        if (fill) fill.style.transform = `scaleX(${p.toFixed(4)})`;
      },
    },
  });

  shots.forEach((fig) => {
    const amt = parseFloat(fig.dataset.drift || "0");
    gsap.fromTo(fig,
      { y: 0, rotate: 0 },
      {
        y: amt * 5.5,
        rotate: amt * 0.08,
        ease: EASE.linear,
        immediateRender: false,
        scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${distance()}`, scrub: 1.2 },
      });
  });
};

/* ── AWARDS NIGHT — the frames arrive, then the laurels land ───── */
const rackScene = () => {
  const cards = gsap.utils.toArray<HTMLElement>("[data-product]");
  if (!cards.length) return;

  const tl = gsap.timeline({
    defaults: { ease: EASE.out },
    scrollTrigger: { trigger: "#rack", start: "top 76%", end: "top 14%", scrub: 0.9 },
  });

  cards.forEach((card, i) => {
    tl.fromTo(card, { y: 110, rotate: i % 2 === 0 ? -3 : 3, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 0.46 }, i * 0.1);
    const laurel = card.querySelector<HTMLElement>("[data-stamp]");
    if (laurel) {
      tl.fromTo(laurel, { scale: 1.7, y: -26, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.26, ease: EASE.snap }, i * 0.1 + 0.3);
    }
  });
};

/* ── THE CREW — the slates deal in from the deck ─────────────── */
const crewScene = () => {
  const cards = gsap.utils.toArray<HTMLElement>("[data-tribe]");
  if (!cards.length) return;
  gsap.fromTo(cards,
    { y: 90, rotate: (i: number) => (i - 1.5) * 3.2, opacity: 0 },
    {
      y: 0, rotate: 0, opacity: 1, duration: 0.5, ease: EASE.out, stagger: 0.09,
      scrollTrigger: { trigger: "#crew", start: "top 78%", end: "top 26%", scrub: 0.9 },
    });
};

/* ── END CREDITS — the crawl rises, the columns slide in ─────── */
const creditsScene = () => {
  const cols = gsap.utils.toArray<HTMLElement>("[data-store]");
  if (cols.length) {
    gsap.fromTo(cols,
      { x: (i: number) => (i % 2 === 0 ? -80 : 80), opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.5, ease: EASE.out, stagger: 0.09,
        scrollTrigger: { trigger: "#credits", start: "top 76%", end: "top 20%", scrub: 0.9 },
      });
  }
  const rows = gsap.utils.toArray<HTMLElement>("[data-roll-row]");
  if (rows.length) {
    gsap.fromTo(rows,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.4, ease: EASE.out, stagger: 0.06,
        scrollTrigger: { trigger: "[data-roll]", start: "top 85%", end: "bottom 60%", scrub: 0.8 },
      });
  }
};

/* ── FILM PAGE — the laurels land, the neighbours deal in ──────── */
const filmScene = () => {
  const seals = gsap.utils.toArray<HTMLElement>("[data-seal]");
  if (seals.length) {
    gsap.fromTo(seals,
      { scale: 1.6, y: -30, opacity: 0 },
      {
        scale: 1, y: 0, opacity: 1, duration: 0.5, ease: EASE.snap, stagger: 0.08,
        scrollTrigger: { trigger: "[data-seals]", start: "top 85%", once: true },
      });
  }
};

/* ── AWARDS NIGHT PAGE — winners cascade, the finale blooms ────── */
const nightScene = () => {
  const wins = gsap.utils.toArray<HTMLElement>("[data-win]");
  if (wins.length) {
    wins.forEach((w, i) => {
      gsap.fromTo(w,
        { x: i % 2 ? 40 : -40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.5, ease: EASE.out,
          scrollTrigger: { trigger: w, start: "top 88%", once: true },
        });
      const seal = w.querySelector<HTMLElement>(".win__seal .laurel");
      if (seal) {
        gsap.fromTo(seal,
          { scale: 1.6, y: -20, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: EASE.snap, delay: 0.15,
            scrollTrigger: { trigger: w, start: "top 88%", once: true } });
      }
    });
  }
  const finale = document.querySelector<HTMLElement>("[data-finale]");
  if (finale) {
    gsap.fromTo(finale,
      { clipPath: "inset(0 0 100% 0)", rotate: 2.5, transformOrigin: "50% 100%" },
      { clipPath: "inset(0 0 0% 0)", rotate: 0, duration: 1, ease: "power2.inOut",
        scrollTrigger: { trigger: finale, start: "top 80%", once: true } });
  }
};

export const refreshScenes = () => ScrollTrigger.refresh();
