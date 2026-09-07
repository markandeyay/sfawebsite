/* ═══════════════════════════════════════════════════════════════════
   MARKS — the hand-drawn set vocabulary that lives in the atmosphere,
   the section deco, the loader field and the crossings.

   Two kinds of ink: doodles drawn with rough.js strokes (SVG) and words
   hand-lettered in marker faces (PNG with alpha). Each carries its own
   aspect ratio; every placement sets width and lets height follow.
   Files live in public/assets/marks.
   ═══════════════════════════════════════════════════════════════════ */

export interface Mark {
  file: string;
  ar: number;
}

export const MARKS: Mark[] = [
  { file: "clapper.svg", ar: 1 },
  { file: "reel.svg", ar: 420 / 400 },
  { file: "megaphone.svg", ar: 480 / 400 },
  { file: "chair.svg", ar: 330 / 400 },
  { file: "spot.svg", ar: 360 / 400 },
  { file: "ticket.svg", ar: 510 / 300 },
  { file: "star.svg", ar: 1 },
  { file: "w-action.png", ar: 895 / 256 },
  { file: "w-cut.png", ar: 543 / 256 },
  { file: "w-roll.png", ar: 936 / 156 },
  { file: "w-take.png", ar: 682 / 246 },
  { file: "w-speed.png", ar: 574 / 205 },
  { file: "w-quiet.png", ar: 951 / 127 },
];

/* the large composition used once per section as the hero piece */
export const SHEET: Mark = { file: "sheet.png", ar: 955 / 1154 };

/** "reel" -> the registry entry whose file is reel.svg or reel.png */
export const markByName = (name: string): Mark =>
  [...MARKS, SHEET].find((m) => m.file.replace(/\.[a-z]+$/, "") === name) ?? { file: `${name}.svg`, ar: 1 };

export const markSrc = (file: string) => `/assets/marks/${file}`;

export const markImg = (file: string) => {
  const img = document.createElement("img");
  img.src = markSrc(file);
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";
  return img;
};
