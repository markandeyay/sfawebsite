/**
 * Which six films fill the homepage strip (SFA_SYSTEM_DESIGN.md 11.1, 16.6).
 * The four award winners with a usable frame, plus two non-winners whose
 * treated frames are the strongest, so the strip shows range rather than
 * only the podium. The other films are listed by name beneath the strip.
 * Order is the display order. Reasoning in DESIGN_NOTES.md.
 */
export const FEATURED_SLUGS = [
  "fdoc",
  "silenced",
  "senior-assassin",
  "a-newby-cupids-guide-to-love-and-more",
  "how-does-it-feel",
  "omnes-unum",
] as const;
