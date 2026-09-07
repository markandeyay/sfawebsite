// Inline <head> script (no dependencies, idempotent). app/layout.tsx injects it with
// <script dangerouslySetInnerHTML={{ __html: MOTION_HEAD_SCRIPT }} />, before any stylesheet applies.
//
// What it does, in order:
//   1. adds class "js" to <html>: app/motion.css hides .reveal only under .js, so server markup
//      carries no hidden state and a JS failure leaves a fully readable page (brief 4.7);
//   2. adds "-no-motion" when prefers-reduced-motion: reduce matches, and keeps it in sync on change;
//   3. safety: if no motion component has hydrated within 4 s (the app bundle failed or is very
//      slow), it removes "js" again so nothing can be left invisible.
// SmoothScroll and Reveal set data-motion-ready on <html> when they mount.
// <html> needs suppressHydrationWarning because React hydrates it after these classes are added.

export const MOTION_HEAD_SCRIPT = [
  '(function(){',
  'var r=document.documentElement;',
  "if(r.hasAttribute('data-motion-head'))return;",
  "r.setAttribute('data-motion-head','');",
  'var l=r.classList;',
  "l.add('js');",
  "var m=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;",
  "function s(){if(m&&m.matches)l.add('-no-motion');else l.remove('-no-motion')}",
  's();',
  "if(m){if(m.addEventListener)m.addEventListener('change',s);else if(m.addListener)m.addListener(s)}",
  "setTimeout(function(){if(!r.hasAttribute('data-motion-ready'))l.remove('js')},4000);",
  '})();',
].join('');
