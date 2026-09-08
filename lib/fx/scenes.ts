import { gsap, ScrollTrigger, EASE, DUR, onDesktop, prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   SCENES — scroll choreography, one scene per section.

   THREE RULES, ENFORCED THROUGHOUT
   1. Transform and opacity only. Nothing here animates a property that
      can trigger layout.
   2. Exactly ONE pin on a page — the slate. The credit crawl is a
      sticky block scrubbed inside its own stage, not a pin.
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
  /* the screen opens from a slit like a gate, the viewfinder snaps on */
  set(".hero__stage", { clipPath: "inset(48% 0 48% 0)" });
  set(".hero__hud", { opacity: 0 });
  set(".hero__vf i", { opacity: 0, scale: 1.8 });
  set("[data-hero]", { opacity: 0, y: 44 });
  set(".hero__mascot", { rotate: -5 });
  set("[data-hero-fade]", { opacity: 0 });
  set("[data-film-hero]", { opacity: 0, y: 40 });
};

/* The iris opens onto a page that then assembles itself. Beats are
   deliberately overlapped rather than sequential. */
export const heroIntro = () => {
  if (prefersReduced()) return;

  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  const stage = document.querySelector<HTMLElement>(".hero__stage");

  if (stage) {
    tl.to(stage, { clipPath: "inset(0% 0 0% 0)", duration: 1.0, ease: "power3.inOut" }, 0)
      /* once open, the clip goes: the slate hangs below the frame */
      .add(() => gsap.set(stage, { clearProps: "clipPath" }), 1.02)
      /* the title rises letter by letter through the CSS reveal */
      .add(() => stage.classList.add("-in"), 0.55)
      .to(".hero__vf i", { opacity: 0.8, scale: 1, duration: 0.55, ease: EASE.snap, stagger: 0.06 }, 0.8)
      .to(".hero__hud", { opacity: 1, duration: DUR.d3 }, 0.95)
      .to(".hero__mascot", { opacity: 1, y: 0, duration: 1.2, ease: EASE.snap }, 0.7)
      /* the slate claps once it is in frame */
      .fromTo(".slate-card__arm", { rotate: -16 }, { rotate: 0, duration: 0.16, ease: "power4.in" }, 1.55)
      .add(() => document.querySelector(".slate-card__frame")?.classList.add("-clap"), 1.71)
      .to(".slate-card__arm", { rotate: -6, duration: 0.7, ease: EASE.out }, 2.0)
      .to(".hero__line[data-hero]", { opacity: 1, y: 0, duration: DUR.d4 }, 1.2)
      .to("[data-hero-fade]", { opacity: 1, duration: DUR.d4, stagger: 0.1 }, 1.3)
      .add(() => {
        stage.classList.add("-settled");
        stage.style.willChange = "auto";
      }, 3.6);

    /* the slate keeps a hand's tremor after the intro lands */
    gsap.to(".hero__mascot", {
      y: -3, rotate: -4.4, duration: 5.5,
      ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3,
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
  const observers: IntersectionObserver[] = [];

  /* ── ambient (all breakpoints, all cheap) ──────────────────── */
  const stage = document.querySelector<HTMLElement>(".hero__stage");
  if (stage) {
    tweens.push(gsap.to(".hero__mascot", {
      yPercent: 10, ease: EASE.linear,
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    }));
    /* the title sweep only runs while the screen is on screen */
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) stage.classList.toggle("-off", !e.isIntersecting);
    });
    io.observe(stage);
    observers.push(io);
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

  /* the department slates clap shut as the crew arrives, on every
     breakpoint */
  const slates = gsap.utils.toArray<HTMLElement>("[data-slate-card]");
  if (slates.length) {
    tweens.push(gsap.fromTo(".crew-card__arm", { rotate: -14 }, {
      rotate: 0, duration: 0.18, ease: "power4.in", stagger: 0.09,
      scrollTrigger: { trigger: "#credits", start: "top 45%", once: true },
      onComplete: () => slates.forEach((s) => s.classList.add("-in")),
    }));
  }

  /* ── desktop choreography, single scope, document order ─────── */
  const mm = onDesktop(() => {
    storyScene();
    slateScene();
    awardsScene();
    crewScene();
    creditsScene();
    filmScene();
    nightScene();
  });

  return () => {
    tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
    observers.forEach((o) => o.disconnect());
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
  const can = root.querySelector<HTMLElement>("[data-can]");
  const mark = root.querySelector<HTMLElement>(".ln--mark .mk");

  const tl = gsap.timeline({
    defaults: { ease: EASE.out },
    scrollTrigger: { trigger: root, start: "top 82%", end: "bottom 68%", scrub: 0.9, invalidateOnRefresh: true },
  });

  lines.forEach((ln, i) => {
    tl.fromTo(ln, { yPercent: 118 }, { yPercent: 0, duration: 0.3 }, i * 0.09);
  });
  if (mark) {
    tl.fromTo(mark, { scaleX: 0 }, { scaleX: 1, duration: 0.26, ease: "power1.inOut" }, 0.3);
  }
  bodies.forEach((b, i) => {
    tl.fromTo(b, { x: b.dataset.body === "l" ? -46 : 46, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 0.34 + i * 0.12);
  });
  if (media) {
    tl.fromTo(media,
      { clipPath: "inset(0 0 100% 0)", rotate: 3.5, transformOrigin: "50% 100%" },
      { clipPath: "inset(0 0 0% 0)", rotate: 0, duration: 0.46, ease: "power2.inOut" }, 0.18);
  }
  if (can) {
    tl.fromTo(can, { opacity: 0, scale: 0.6, y: 26 }, { opacity: 1, scale: 1, y: 0, duration: 0.24, ease: EASE.snap }, 0.62);
  }
  facts.forEach((f, i) => {
    tl.fromTo(f, { x: f.dataset.fact === "l" ? -34 : 34, opacity: 0 }, { x: 0, opacity: 1, duration: 0.14 }, 0.48 + i * 0.06);
  });
};

/* ── THE SLATE — the one pin on the page ──────────────────────── */
const REEL_FRAMES = 2400;
const slateScene = () => {
  const pin = document.getElementById("slate-pin");
  const track = document.getElementById("slate-track");
  if (!pin || !track) return;

  const cur = document.getElementById("sl-cur");
  const fr = document.getElementById("sl-fr");
  const lamp = document.getElementById("sl-lamp");
  const shots = gsap.utils.toArray<HTMLElement>("[data-drift]");
  const total = shots.length;

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 40);

  /* Entrance: the strip rises into place before the pin takes over. */
  gsap.fromTo(shots,
    { y: (i: number) => 60 + i * 20, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: 0.95, ease: EASE.out, stagger: 0.06,
      scrollTrigger: { trigger: pin, start: "top 90%", once: true },
    });

  let lastIdx = -1;
  let lastFr = -1;
  let ranOut = false;
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
        const frame = Math.round(p * REEL_FRAMES);
        if (fr && frame !== lastFr) {
          lastFr = frame;
          fr.textContent = p > 0.985 ? "END" : String(frame).padStart(4, "0");
        }
        /* the strip runs out into the lamp at the tail, once per pass */
        if (lamp) {
          if (p > 0.985 && !ranOut) {
            ranOut = true;
            lamp.classList.remove("-run");
            void lamp.offsetWidth;
            lamp.classList.add("-run");
          } else if (p < 0.9 && ranOut) {
            ranOut = false;
          }
        }
      },
    },
  });

  shots.forEach((fig) => {
    const amt = parseFloat(fig.dataset.drift || "0");
    gsap.fromTo(fig,
      { y: 0 },
      {
        y: amt * 1.2,
        ease: EASE.linear,
        immediateRender: false,
        scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${distance()}`, scrub: 1.2 },
      });
  });
};

/* ── AWARDS NIGHT — the frames arrive, the laurels slide up out of
   the envelope ─────────────────────────────────────────────────── */
const awardsScene = () => {
  const cards = gsap.utils.toArray<HTMLElement>("[data-pic]");
  if (!cards.length) return;

  const tl = gsap.timeline({
    defaults: { ease: EASE.out },
    scrollTrigger: { trigger: "#awards", start: "top 76%", end: "top 14%", scrub: 0.9 },
  });

  cards.forEach((card, i) => {
    tl.fromTo(card, { y: 110, opacity: 0 }, { y: 0, opacity: 1, duration: 0.46 }, i * 0.1);
    const laurel = card.querySelector<HTMLElement>("[data-stamp]");
    if (laurel) {
      tl.fromTo(laurel, { yPercent: 160, rotate: -4 }, { yPercent: 0, rotate: -4, duration: 0.3, ease: "power3.out" }, i * 0.1 + 0.28);
    }
  });
};

/* ── THE CREW — the slates rise into the light ────────────────── */
const crewScene = () => {
  const cards = gsap.utils.toArray<HTMLElement>("[data-slate-card]");
  if (!cards.length) return;
  gsap.fromTo(cards,
    { y: 90, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.5, ease: EASE.out, stagger: 0.09,
      scrollTrigger: { trigger: "#credits", start: "top 78%", end: "top 26%", scrub: 0.9 },
    });
};

/* ── END CREDITS — the crawl, scrubbed inside its sticky stage ─── */
const creditsScene = () => {
  const stage = document.querySelector<HTMLElement>(".credits__stage");
  const roll = stage?.querySelector<HTMLElement>(".roll--crawl");
  if (!stage || !roll) return;
  gsap.fromTo(roll, { y: "34vh" }, {
    y: "-46%", ease: EASE.linear,
    scrollTrigger: { trigger: stage, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
  });
};

/* ── FILM PAGE — the laurels come in from the wings ──────────── */
const filmScene = () => {
  const seals = gsap.utils.toArray<HTMLElement>("[data-seal]");
  if (seals.length) {
    gsap.fromTo(seals,
      { x: -24, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.5, ease: EASE.out, stagger: 0.08,
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
          { x: -24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.45, ease: EASE.out, delay: 0.15,
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
    const can = finale.parentElement?.querySelector<HTMLElement>("[data-can]");
    if (can) {
      gsap.fromTo(can, { opacity: 0, scale: 0.6, y: 26 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: EASE.snap, delay: 0.7,
        scrollTrigger: { trigger: finale, start: "top 80%", once: true } });
    }
  }
};

export const refreshScenes = () => ScrollTrigger.refresh();
