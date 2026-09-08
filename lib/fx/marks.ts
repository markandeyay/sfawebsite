/* ═══════════════════════════════════════════════════════════════════
   MARKS — the film marks that live in the atmosphere, the section deco
   and the crossings: strips of film, a reel, a can, the kit a student
   crew actually carries (C-stand, boom, gaff tape, script, apple box,
   light meter), drawn with rough.js strokes so the line wobbles, and
   the take notes an editor writes on a strip in grease pencil.
   ═══════════════════════════════════════════════════════════════════ */

export interface Mark {
  file: string;
  ar: number;
}

export const MARKS: Mark[] = [
  { file: "strip.svg", ar: 520 / 220 },
  { file: "strip-v.svg", ar: 220 / 520 },
  { file: "reel.svg", ar: 420 / 400 },
  { file: "can.svg", ar: 1 },
  { file: "clapper.svg", ar: 1 },
  { file: "script.svg", ar: 340 / 440 },
  { file: "cstand.svg", ar: 300 / 520 },
  { file: "boom.svg", ar: 520 / 300 },
  { file: "gaff.svg", ar: 320 / 300 },
  { file: "applebox.svg", ar: 480 / 320 },
  { file: "meter.svg", ar: 300 / 420 },
  { file: "ticket.svg", ar: 510 / 300 },
  { file: "n-pick.png", ar: 553 / 198 },
  { file: "n-ng.png", ar: 337 / 170 },
  { file: "n-hold.png", ar: 581 / 188 },
  { file: "n-mos.png", ar: 532 / 200 },
];

/* the drift field behind the page: only what belongs in a projection
   booth's paperwork, so the far field reads as film, not a sticker wall */
export const FIELD_MARKS = MARKS.filter((m) => /^(strip|reel|can|n-)/.test(m.file));

/* what crosses the screen now and then */
export const CROSSERS = MARKS.filter((m) => /^(strip|script)/.test(m.file));

/** "reel" -> the registry entry whose file is reel.svg or reel.png */
export const markByName = (name: string): Mark =>
  MARKS.find((m) => m.file.replace(/\.[a-z]+$/, "") === name) ?? { file: `${name}.svg`, ar: 1 };

export const markSrc = (file: string) => `/assets/marks/${file}`;

export const markImg = (file: string) => {
  const img = document.createElement("img");
  img.src = markSrc(file);
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";
  return img;
};
