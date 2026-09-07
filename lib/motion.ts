// Motion tokens for JavaScript. These MUST mirror the CSS custom properties in
// app/globals.css one-to-one (brief 4.2): --ease-out, --ease-in, --ease-in-out,
// --ease-linear and --dur-1 .. --dur-5. Change both or neither.

export const EASE = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  in: 'cubic-bezier(0.7, 0, 0.84, 0)',
  inOut: 'cubic-bezier(0.83, 0, 0.17, 1)',
  linear: 'linear',
} as const;

// The same curves as functions, for Lenis and any JS-driven tween.
// out = expo-out (1 - 2^(-10t)); in = expo-in; inOut = expo-in-out.
export const EASE_FN = {
  out: (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  in: (t: number): number => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  inOut: (t: number): number =>
    t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  linear: (t: number): number => t,
} as const;

// Milliseconds. 1 colour/focus micro, 2 small moves, 3 reveals, 4 the dither crossfade, 5 hero orchestration.
export const DUR = { 1: 120, 2: 240, 3: 480, 4: 800, 5: 1400 } as const;

// Per-glyph stagger for SplitText, in ms. CSS derives the same value as calc(var(--dur-1) / 7.5).
export const STAGGER = DUR[1] / 7.5;

// SplitText caps the stagger index so a long heading never takes seconds to arrive.
export const STAGGER_CAP = 40;
