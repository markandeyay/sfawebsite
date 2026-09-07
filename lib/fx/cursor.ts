import { canHover, prefersReduced } from "./motion";

/* ═══════════════════════════════════════════════════════════════════
   CURSOR — a ring that lags the pointer and names what it is over.

   The rAF loop only runs while the ring is actually catching up. Once
   it lands within half a pixel of the pointer the loop stops dead, so
   an idle cursor costs literally nothing. Colour inverts over dark
   surfaces.
   ═══════════════════════════════════════════════════════════════════ */

const LERP = 0.19;
const HOT = "[data-cursor], a, button";

export const initCursor = (): (() => void) => {
  const el = document.getElementById("cursor");
  const label = document.getElementById("cursor-label");
  if (!el || !label || !canHover() || prefersReduced()) return () => {};

  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let x = tx;
  let y = ty;
  let raf = 0;

  const frame = () => {
    x += (tx - x) * LERP;
    y += (ty - y) * LERP;
    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5) {
      x = tx;
      y = ty;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX;
    ty = e.clientY;
    el.classList.add("-on");
    wake();
  };
  const onLeave = () => el.classList.remove("-on");
  const onOver = (e: Event) => {
    const t = (e.target as HTMLElement)?.closest<HTMLElement>(HOT);
    if (!t) return;
    const text = t.dataset.cursor;
    el.classList.add("-hot");
    label.textContent = text || "";
    el.classList.toggle("-invert", !!t.closest(".t-navy, .t-ink, .footer"));
  };
  const onOut = (e: Event) => {
    const t = (e.target as HTMLElement)?.closest<HTMLElement>(HOT);
    if (!t) return;
    const to = ((e as PointerEvent).relatedTarget as HTMLElement)?.closest?.(HOT);
    if (to === t) return;
    el.classList.remove("-hot");
    label.textContent = "";
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  document.addEventListener("pointerover", onOver);
  document.addEventListener("pointerout", onOut);

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("pointerover", onOver);
    document.removeEventListener("pointerout", onOut);
    if (raf) cancelAnimationFrame(raf);
    el.classList.remove("-hot");
    label.textContent = "";
  };
};
