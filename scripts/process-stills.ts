/**
 * process-stills.ts — build-time image pipeline for the film stills.
 *
 * Source list: content/films.json (slug + youtubeId), read at run time.
 *
 * For every film it:
 *   1. fetches the YouTube thumbnail (maxresdefault.jpg; when that is missing or
 *      is the 120x90 placeholder it falls back to sddefault.jpg, then hqdefault.jpg),
 *      caching the raw JPEG in scripts/.cache/{slug}.jpg so re-runs never
 *      re-fetch. A film YouTube has no thumbnail for at all (private or removed
 *      video) is skipped with a warning. A frame is never substituted.
 *   2. trims black letterbox bars (sd/hqdefault are 4:3 with the 16:9 frame inside;
 *      some films are letterboxed inside the frame itself) and centre-crops to 16:9;
 *   3. writes three renditions into public/stills:
 *        {slug}.webp             untreated frame, 1280x720, lossy q80
 *        {slug}-treated.webp     the duotone dither, 1280x720, lossless, every
 *                                dither cell a crisp (1280 / work) px block
 *        {slug}-treated-sm.webp  the same dither at its native working resolution
 *                                (640x360 by default), for film cards. With the
 *                                fine-grained screens (Bayer, error diffusion) the
 *                                1280 file downscaled to card width beats against
 *                                the pixel grid and moirés, so cards serve this one
 *                                and let the browser resample it smoothly. The
 *                                halftone's dot pitch (16 px at 1280) is coarse
 *                                enough that either file resamples cleanly.
 *      Treated and original share dimensions so the hover/focus crossfade cannot
 *      shift layout.
 *   4. reads every treated file back and verifies it is exactly the expected
 *      size and contains only palette colours.
 *
 * The treatment (chosen from the comparison in scripts/DITHER_REPORT.md): a
 * rotated clustered-dot halftone screen. Luminance is normalised and tone-mapped,
 * then thresholded against a 45-degree dot lattice whose spot function grows a
 * round carolina dot from each cell centre until the dots touch at 50% and a
 * round base hole shrinks toward the corners. Two tones, base and carolina.
 *
 * Engineered irregularity (REMEDIATION_BRIEF.md 4.6): each film's dither
 * pattern is shifted by a phase derived from an FNV-1a hash of its slug, so no
 * two stills share a grain alignment. The halftone lattice gets a continuous
 * sub-cell shift (fx, fy) in [0, 1) cells, taken from bits 9-31 of the hash,
 * applied before rotation; the ordered Bayer matrix gets an integer (dx, dy)
 * shift plus one of its eight dihedral symmetries (512 alignments). The hash is
 * a pure function of the slug, so the same source always produces a
 * byte-identical output and the script stays idempotent; the run prints every
 * film's phase and the pattern it makes on a flat 50% field. Error diffusion
 * has no periodic pattern to shift, so the phase is not used there.
 *
 * Defaults were chosen by eye from the contact sheets; see scripts/DITHER_REPORT.md.
 *
 * Usage:   npm run stills -- [flags]      (or: npx tsx scripts/process-stills.ts)
 *
 *   --algo=halftone|bayer8|bayer4|floyd|atkinson|none   treatment    (default: halftone)
 *   --tones=2|3            base+carolina, or base+deep+carolina       (default: 2)
 *   --work=<px>            working width the dither runs at; the result is
 *                          upscaled to 1280 with nearest-neighbour so each
 *                          dither cell becomes a crisp 1280/work px block  (default: 640)
 *   --cell=<px>            halftone only: dot pitch in working pixels, i.e.
 *                          cell * (1280 / work) px at 1280               (default: 8)
 *   --angle=<deg>          halftone only: screen angle                    (default: 45)
 *   --posterize=<n>        quantise luminance to n steps before the screen, 0 = off
 *                          (default: 0)
 *   --contrast=<n>         contrast multiplier around mid grey, 1 = none  (default: 1.15)
 *   --gamma=<n>            >1 lifts midtones, <1 darkens them, 1 = none   (default: 1.3)
 *   --no-normalize         skip the histogram stretch (on by default; it is what
 *                          flattens well-lit and badly-lit sources together)
 *   --no-phase             disable the per-slug phase offset (for A/B only)
 *   --encoding=lossless|near|lossy   treated webp encoding (default: lossless; a
 *                          2-3 colour image is 2-5 KB lossless, ~25x larger lossy)
 *   --only=slug[,slug]     process a subset
 *   --refetch              ignore the cache and download again
 *   --sheets               also build the comparison contact sheets in
 *                          screenshots/dither/ (gitignored; the chosen ones are
 *                          copied into docs/ by hand)
 *
 * Only dependency is sharp. Every pixel-level step (tone curve, dither,
 * palette) runs in plain TypeScript on raw buffers so it can be read and
 * tuned without knowing libvips.
 */

import sharp, { type OverlayOptions, type Sharp } from "sharp";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ROOT = process.cwd(); // npm scripts always run from the package root
const FILMS_FILE = path.join(ROOT, "content", "films.json");
const CACHE_DIR = path.join(ROOT, "scripts", ".cache");
const OUT_DIR = path.join(ROOT, "public", "stills");
const SHEET_DIR = path.join(ROOT, "screenshots", "dither");

const OUT_W = 1280;
const OUT_H = 720;
const ORIGINAL_QUALITY = 80;

/** Locked palette (SFA_SYSTEM_DESIGN.md 5.1). Treated output uses ONLY these tones. */
const PALETTE = {
  base: [0x0b, 0x0d, 0x0f],
  deep: [0x2a, 0x5c, 0x7d],
  carolina: [0x4b, 0x9c, 0xd3],
} as const;

type Rgb = readonly [number, number, number];
/** Dark-to-light ramps for 2 and 3 tones. */
const RAMPS: Record<2 | 3, Rgb[]> = {
  2: [PALETTE.base, PALETTE.carolina],
  3: [PALETTE.base, PALETTE.deep, PALETTE.carolina],
};

const ALGOS = ["halftone", "bayer8", "bayer4", "floyd", "atkinson", "none"] as const;
type Algo = (typeof ALGOS)[number];

interface Options {
  algo: Algo;
  tones: 2 | 3;
  work: number;
  cell: number;
  angle: number;
  posterize: number;
  contrast: number;
  gamma: number;
  normalize: boolean;
  phase: boolean;
  encoding: "near" | "lossless" | "lossy";
  only: string[] | null;
  refetch: boolean;
  sheets: boolean;
}

const DEFAULTS: Options = {
  algo: "halftone",
  tones: 2,
  work: 640,
  cell: 8,
  angle: 45,
  posterize: 0,
  contrast: 1.15,
  gamma: 1.3,
  normalize: true,
  phase: true,
  encoding: "lossless",
  only: null,
  refetch: false,
  sheets: false,
};

function parseArgs(argv: string[]): Options {
  const opts: Options = { ...DEFAULTS };
  const num = (key: string, value: string | undefined): number => {
    const n = Number(value);
    if (value === undefined || Number.isNaN(n)) throw new Error(`--${key} needs a number`);
    return n;
  };
  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    switch (key) {
      case "algo":
        if (!ALGOS.includes(value as Algo)) throw new Error(`--algo must be one of ${ALGOS.join(", ")}`);
        opts.algo = value as Algo;
        break;
      case "tones":
        if (value !== "2" && value !== "3") throw new Error("--tones must be 2 or 3");
        opts.tones = Number(value) as 2 | 3;
        break;
      case "work":
        opts.work = num(key, value);
        break;
      case "cell":
        opts.cell = num(key, value);
        break;
      case "angle":
        opts.angle = num(key, value);
        break;
      case "posterize":
        opts.posterize = num(key, value);
        break;
      case "contrast":
        opts.contrast = num(key, value);
        break;
      case "gamma":
        opts.gamma = num(key, value);
        break;
      case "no-normalize":
        opts.normalize = false;
        break;
      case "no-phase":
        opts.phase = false;
        break;
      case "encoding":
        if (value !== "near" && value !== "lossless" && value !== "lossy") throw new Error("--encoding must be near, lossless or lossy");
        opts.encoding = value;
        break;
      case "only":
        if (!value) throw new Error("--only needs a comma-separated list of slugs");
        opts.only = value.split(",");
        break;
      case "refetch":
        opts.refetch = true;
        break;
      case "sheets":
        opts.sheets = true;
        break;
      default:
        throw new Error(`Unknown flag: ${arg}`);
    }
  }
  if (OUT_W % opts.work !== 0) {
    console.warn(`  note: 1280 is not a multiple of work=${opts.work}; dither cells will be uneven (use 320, 640, 256, 160).`);
  }
  return opts;
}

// ---------------------------------------------------------------------------
// Source list: content/films.json
// ---------------------------------------------------------------------------

interface StillSource {
  /** URL slug for the film; also the output filename in /public/stills. */
  slug: string;
  /** YouTube video id, used to build the i.ytimg.com thumbnail URL. */
  youtubeId: string;
}

function loadFilms(): StillSource[] {
  const raw: unknown = JSON.parse(readFileSync(FILMS_FILE, "utf8"));
  if (!Array.isArray(raw)) throw new Error(`${FILMS_FILE} must be a JSON array of films`);
  return raw.map((film, i) => {
    const f = film as Record<string, unknown>;
    if (typeof f.slug !== "string" || !/^[a-z0-9-]+$/.test(f.slug)) throw new Error(`films.json[${i}]: bad slug ${JSON.stringify(f.slug)}`);
    if (typeof f.youtubeId !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(f.youtubeId)) throw new Error(`films.json[${i}] (${f.slug}): bad youtubeId ${JSON.stringify(f.youtubeId)}`);
    return { slug: f.slug, youtubeId: f.youtubeId };
  });
}

// ---------------------------------------------------------------------------
// Step 1: fetch + cache
// ---------------------------------------------------------------------------

/** Tried in order. sddefault (640x480) sits between max-res and hqdefault (480x360). */
const VARIANTS = ["maxresdefault", "sddefault", "hqdefault"] as const;
type Variant = (typeof VARIANTS)[number];

interface Fetched {
  file: string;
  variant: Variant;
  width: number;
  height: number;
}

/** YouTube serves a 120x90 placeholder for videos with no max-res still. */
const MIN_REAL_WIDTH = 640;

async function download(id: string, variant: Variant): Promise<Buffer | null> {
  const res = await fetch(`https://i.ytimg.com/vi/${id}/${variant}.jpg`);
  if (res.status !== 200) return null;
  return Buffer.from(await res.arrayBuffer());
}

/** Returns null when YouTube has no thumbnail at all (private/removed video, wrong id). */
async function fetchStill(film: StillSource, refetch: boolean): Promise<Fetched | null> {
  const file = path.join(CACHE_DIR, `${film.slug}.jpg`);
  const metaFile = path.join(CACHE_DIR, `${film.slug}.json`);

  if (!refetch && existsSync(file) && existsSync(metaFile)) {
    return { file, ...JSON.parse(readFileSync(metaFile, "utf8")) };
  }

  for (const variant of VARIANTS) {
    const buf = await download(film.youtubeId, variant);
    if (!buf) continue;
    const { width = 0, height = 0 } = await sharp(buf).metadata();
    if (variant === "maxresdefault" && width < MIN_REAL_WIDTH) continue; // the 120x90 placeholder
    writeFileSync(file, buf);
    writeFileSync(metaFile, JSON.stringify({ variant, width, height }));
    return { file, variant, width, height };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Step 2: letterbox detection + 16:9 crop
// ---------------------------------------------------------------------------

interface Region {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Find black bars at the top and bottom of the frame. A bar row is one whose
 * mean luminance is nearly black and whose brightest pixel is still dark, so
 * a night sky (mean is low but with bright specks) is not mistaken for a bar.
 * Then centre-crop whatever remains to 16:9.
 */
async function findFrame(file: string): Promise<{ region: Region; barsTrimmed: number }> {
  const { data, info } = await sharp(file).grayscale().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const isBar = (y: number) => {
    let sum = 0;
    let max = 0;
    for (let x = 0; x < width; x++) {
      const v = data[y * width + x];
      sum += v;
      if (v > max) max = v;
    }
    return sum / width < 12 && max < 56;
  };

  const maxBar = Math.floor(height * 0.3); // never eat more than 30% from either edge
  let top = 0;
  while (top < maxBar && isBar(top)) top++;
  let bottom = height;
  while (bottom > height - maxBar && isBar(bottom - 1)) bottom--;
  const barsTrimmed = top + (height - bottom);

  // Cover-crop the remaining area to 16:9, centred.
  let w = width;
  let h = bottom - top;
  let left = 0;
  if (w / h > 16 / 9) {
    w = Math.round(h * (16 / 9));
    left = Math.floor((width - w) / 2);
  } else {
    h = Math.round(w * (9 / 16));
    top += Math.floor((bottom - top - h) / 2);
  }
  return { region: { left, top, width: w, height: h }, barsTrimmed };
}

// ---------------------------------------------------------------------------
// Step 3a: per-slug phase (engineered irregularity)
// ---------------------------------------------------------------------------

interface Phase {
  hash: number;
  /** Ordered Bayer: integer shift of the threshold matrix, 0..n-1 each. */
  dx: number;
  dy: number;
  /** Ordered Bayer: which of the matrix's 8 dihedral symmetries, 0..7. */
  sym: number;
  /** Halftone: continuous shift of the dot lattice, in cells, 0..1 each. */
  fx: number;
  fy: number;
}

/** FNV-1a, 32-bit. Stable across runs and machines; no dependency. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

const NO_PHASE: Phase = { hash: 0, dx: 0, dy: 0, sym: 0, fx: 0, fy: 0 };

function phaseFor(slug: string, enabled: boolean): Phase {
  if (!enabled) return NO_PHASE;
  const h = fnv1a(slug);
  return {
    hash: h,
    dx: h & 7,
    dy: (h >>> 3) & 7,
    sym: (h >>> 6) & 7,
    fx: ((h >>> 9) & 0x7ff) / 0x800,
    fy: ((h >>> 20) & 0xfff) / 0x1000,
  };
}

// ---------------------------------------------------------------------------
// Step 3b: the screens
// ---------------------------------------------------------------------------

/** Ordered-dither threshold matrix of size n (2, 4, 8, ...), values 0..n*n-1. */
function bayerMatrix(n: number): number[][] {
  if (n === 2) return [[0, 2], [3, 1]];
  const half = bayerMatrix(n / 2);
  const m: number[][] = [];
  for (let y = 0; y < n; y++) {
    m.push([]);
    for (let x = 0; x < n; x++) {
      // M(2n) = [[4M, 4M+2], [4M+3, 4M+1]]
      const quadrant = [[0, 2], [3, 1]][y < n / 2 ? 0 : 1][x < n / 2 ? 0 : 1];
      m[y].push(4 * half[y % (n / 2)][x % (n / 2)] + quadrant);
    }
  }
  return m;
}

/**
 * Per-pixel thresholds (0..1) for an ordered Bayer screen with the film's
 * phase applied: the matrix is shifted by (dx, dy) and read through one of
 * its eight symmetries (transpose, flip x, flip y, and their combinations).
 */
function bayerScreen(w: number, h: number, n: number, phase: Phase): Float32Array {
  const m = bayerMatrix(n);
  const t = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let px = (x + phase.dx) % n;
      let py = (y + phase.dy) % n;
      if (phase.sym & 1) [px, py] = [py, px];
      if (phase.sym & 2) px = n - 1 - px;
      if (phase.sym & 4) py = n - 1 - py;
      t[y * w + x] = 1 - (m[py][px] + 0.5) / (n * n);
    }
  }
  return t;
}

/**
 * The halftone spot function (PostScript's "Euclidean" dot), on a unit cell
 * with coordinates in [-1, 1). Highest values are inked first: a round dot
 * grows from the cell centre until it touches its neighbours at 50%, after
 * which a round hole shrinks toward the cell corners. That crossover is what
 * makes a printed halftone read as print rather than as a Bayer rosette.
 */
function spot(nx: number, ny: number): number {
  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  if (ax + ay <= 1) return 1 - (nx * nx + ny * ny);
  return (ax - 1) * (ax - 1) + (ay - 1) * (ay - 1) - 1;
}

/**
 * Rank table for the spot function: rank(s) = fraction of the cell whose spot
 * value is >= s, i.e. the luminance at which a pixel with spot value s turns
 * on. Built numerically so the tone reproduction is area-accurate across the
 * dot/hole crossover.
 */
const SPOT_BINS = 4096;
const spotRank: Float32Array = (() => {
  const N = 512;
  const vals = new Float32Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      vals[j * N + i] = spot(((i + 0.5) / N) * 2 - 1, ((j + 0.5) / N) * 2 - 1);
    }
  }
  vals.sort();
  const lut = new Float32Array(SPOT_BINS + 1);
  let idx = 0;
  for (let b = 0; b <= SPOT_BINS; b++) {
    const s = -1 + (2 * b) / SPOT_BINS;
    while (idx < vals.length && vals[idx] < s) idx++;
    lut[b] = (vals.length - idx) / vals.length;
  }
  return lut;
})();

/**
 * Per-pixel thresholds (0..1) for a rotated clustered-dot screen with a dot
 * pitch of `cell` working pixels at `angle` degrees. The film's phase shifts
 * the lattice by (fx, fy) cells before rotation, so every film's dots sit at
 * a different sub-cell position.
 */
function halftoneScreen(w: number, h: number, cell: number, angle: number, phase: Phase): Float32Array {
  const th = (angle * Math.PI) / 180;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const t = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const Y = y + 0.5 + phase.fy * cell;
    for (let x = 0; x < w; x++) {
      const X = x + 0.5 + phase.fx * cell;
      const u = (X * c + Y * s) / cell;
      const v = (-X * s + Y * c) / cell;
      const nx = 2 * (u - Math.floor(u)) - 1;
      const ny = 2 * (v - Math.floor(v)) - 1;
      const sv = spot(nx, ny);
      t[y * w + x] = spotRank[Math.round(((sv + 1) / 2) * SPOT_BINS)];
    }
  }
  return t;
}

// ---------------------------------------------------------------------------
// Step 3c: the treatment
// ---------------------------------------------------------------------------

/**
 * Dither a luminance buffer (0..1 floats, row-major) to `levels` tones.
 * Returns one tone index per pixel.
 */
function dither(lum: Float32Array, w: number, h: number, levels: number, opts: Options, phase: Phase): Uint8Array {
  const out = new Uint8Array(w * h);
  const top = levels - 1;
  const step = 1 / top;

  if (opts.algo === "none") {
    for (let i = 0; i < lum.length; i++) out[i] = Math.round(lum[i] * top);
    return out;
  }

  if (opts.algo === "bayer4" || opts.algo === "bayer8" || opts.algo === "halftone") {
    const screen =
      opts.algo === "halftone"
        ? halftoneScreen(w, h, opts.cell, opts.angle, phase)
        : bayerScreen(w, h, opts.algo === "bayer4" ? 4 : 8, phase);
    for (let i = 0; i < lum.length; i++) {
      const value = lum[i] * top;
      const k = Math.floor(value);
      const f = value - k;
      out[i] = k >= top ? top : f >= screen[i] ? k + 1 : k;
    }
    return out;
  }

  // Error diffusion (Floyd–Steinberg / Atkinson), serpentine scan to avoid
  // the diagonal "worm" artefacts of a plain raster scan.
  const kernel: Array<[dx: number, dy: number, weight: number]> =
    opts.algo === "floyd"
      ? [[1, 0, 7 / 16], [-1, 1, 3 / 16], [0, 1, 5 / 16], [1, 1, 1 / 16]]
      : [[1, 0, 1 / 8], [2, 0, 1 / 8], [-1, 1, 1 / 8], [0, 1, 1 / 8], [1, 1, 1 / 8], [0, 2, 1 / 8]];

  const work = Float32Array.from(lum);
  for (let y = 0; y < h; y++) {
    const reverse = y % 2 === 1;
    for (let i = 0; i < w; i++) {
      const x = reverse ? w - 1 - i : i;
      const idx = y * w + x;
      const old = work[idx];
      const q = Math.max(0, Math.min(top, Math.round(old * top)));
      out[idx] = q;
      const err = old - q * step;
      for (const [dx, dy, weight] of kernel) {
        const nx = x + (reverse ? -dx : dx);
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny >= h) continue;
        work[ny * w + nx] += err * weight;
      }
    }
  }
  return out;
}

interface Treated {
  /** Raw RGB at the working resolution, one pixel per dither cell. */
  rgb: Buffer;
  width: number;
  height: number;
}

/**
 * Grayscale → (normalise) → contrast/gamma → (posterize) → dither at the
 * working width → paint with the palette.
 */
async function treat(file: string, region: Region, opts: Options, phase: Phase): Promise<Treated> {
  const w = opts.work;
  const h = Math.round((w * 9) / 16);

  let pipeline = sharp(file).extract(region).resize(w, h, { fit: "cover" }).grayscale();
  if (opts.normalize) pipeline = pipeline.normalise();
  const { data } = await pipeline.raw().toBuffer({ resolveWithObject: true });

  // Tone curve on 0..1 floats: contrast around mid grey, then gamma, then an
  // optional hard posterize.
  const lum = new Float32Array(w * h);
  const steps = opts.posterize >= 2 ? opts.posterize - 1 : 0;
  for (let i = 0; i < lum.length; i++) {
    let v = data[i] / 255;
    v = (v - 0.5) * opts.contrast + 0.5;
    v = v < 0 ? 0 : v > 1 ? 1 : v;
    if (opts.gamma !== 1) v = Math.pow(v, 1 / opts.gamma);
    if (steps) v = Math.round(v * steps) / steps;
    lum[i] = v;
  }

  const ramp = RAMPS[opts.tones];
  const tones = dither(lum, w, h, ramp.length, opts, phase);

  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0; i < tones.length; i++) {
    const [r, g, b] = ramp[tones[i]];
    rgb[i * 3] = r;
    rgb[i * 3 + 1] = g;
    rgb[i * 3 + 2] = b;
  }
  return { rgb, width: w, height: h };
}

/** Native working resolution, one pixel per dither cell (the -treated-sm file). */
function nativeOf(t: Treated): Sharp {
  return sharp(t.rgb, { raw: { width: t.width, height: t.height, channels: 3 } });
}

/** 1280x720 with crisp integer cells (the -treated file). */
function fullOf(t: Treated): Sharp {
  return nativeOf(t).resize(OUT_W, OUT_H, { kernel: "nearest" });
}

function encodeTreated(img: Sharp, encoding: Options["encoding"]): Sharp {
  switch (encoding) {
    case "lossy":
      return img.webp({ quality: 90, effort: 6 });
    case "near":
      return img.webp({ nearLossless: true, quality: 80, effort: 6 });
    case "lossless":
    default:
      return img.webp({ lossless: true, effort: 6 });
  }
}

// ---------------------------------------------------------------------------
// Step 4: verification
// ---------------------------------------------------------------------------

function hex(rgb: Rgb): string {
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

interface Verified {
  ok: boolean;
  width: number;
  height: number;
  colours: string[];
}

/** Decode a written file and check its size and that every pixel is a palette colour. */
async function verifyTreated(file: string, width: number, height: number, ramp: Rgb[]): Promise<Verified> {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const seen = new Set<number>();
  for (let i = 0; i < data.length; i += info.channels) {
    seen.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
  }
  const colours = [...seen].sort((a, b) => a - b).map((v) => "#" + v.toString(16).padStart(6, "0"));
  const allowed = new Set(ramp.map(hex));
  const ok = info.width === width && info.height === height && colours.every((c) => allowed.has(c));
  return { ok, width: info.width, height: info.height, colours };
}

/**
 * The phase check: dither a flat 50% field with the film's phase and return
 * its first row as a bit string, plus a hash of the whole field. Two films
 * with different phases give different patterns from identical input.
 */
function phaseSignature(opts: Options, phase: Phase): { row: string; field: string } {
  const w = 32;
  const h = 8;
  const lum = new Float32Array(w * h).fill(0.5);
  const tones = dither(lum, w, h, 2, opts, phase);
  let row = "";
  for (let x = 0; x < w; x++) row += tones[x] ? "#" : ".";
  let all = "";
  for (let i = 0; i < tones.length; i++) all += tones[i];
  return { row, field: fnv1a(all).toString(16).padStart(8, "0") };
}

// ---------------------------------------------------------------------------
// Contact sheets (only with --sheets; output is gitignored)
// ---------------------------------------------------------------------------

interface Cell {
  image: Buffer;
  label: string;
}

const LABEL_H = 28;
const GAP = 12;

function svgLabel(text: string, width: number, height: number, size = 16): Buffer {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<text x="0" y="${height - 8}" font-family="Consolas, Menlo, monospace" font-size="${size}" fill="#e6e6e6">${safe}</text></svg>`,
  );
}

/** Lay cells out in a grid. Every cell image must already be cellW x cellH. */
async function contactSheet(title: string, cells: Cell[], columns: number, cellW: number, cellH: number, outFile: string): Promise<void> {
  const rows = Math.ceil(cells.length / columns);
  const titleH = 40;
  const width = GAP + columns * (cellW + GAP);
  const height = titleH + GAP + rows * (cellH + LABEL_H + GAP);

  const layers: OverlayOptions[] = [{ input: svgLabel(title, width - GAP * 2, titleH, 20), left: GAP, top: 0 }];
  for (let i = 0; i < cells.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const left = GAP + col * (cellW + GAP);
    const top = titleH + GAP + row * (cellH + LABEL_H + GAP);
    layers.push({ input: cells[i].image, left, top });
    layers.push({ input: svgLabel(cells[i].label, cellW, LABEL_H, 14), left, top: top + cellH });
  }

  await sharp({ create: { width, height, channels: 3, background: "#202226" } })
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toFile(outFile);
  console.log(`  sheet  ${path.relative(ROOT, outFile)}  (${width}x${height})`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface Result {
  slug: string;
  variant: Variant;
  source: string;
  barsTrimmed: number;
  originalBytes: number;
  treatedBytes: number;
  smBytes: number;
  phase: Phase;
  full: Verified;
  sm: Verified;
}

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function describe(o: Options): string {
  const screen = o.algo === "halftone" ? ` cell=${o.cell} angle=${o.angle}` : "";
  const post = o.posterize >= 2 ? ` posterize=${o.posterize}` : "";
  return `${o.algo} / ${o.tones} tones / work=${o.work}${screen}${post} / contrast=${o.contrast} gamma=${o.gamma}${o.normalize ? "" : " no-normalize"}${o.phase ? "" : " no-phase"}`;
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  mkdirSync(CACHE_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const all = loadFilms();
  const films = opts.only ? all.filter((f) => opts.only!.includes(f.slug)) : all;
  if (films.length === 0) throw new Error("--only matched no films");

  console.log(`process-stills: ${describe(opts)} encoding=${opts.encoding}  (${all.length} films in content/films.json)`);

  const ramp = RAMPS[opts.tones];
  const nativeW = opts.work;
  const nativeH = Math.round((opts.work * 9) / 16);
  const results: Result[] = [];
  const missing: string[] = [];
  const frames = new Map<string, { file: string; region: Region }>();

  for (const film of films) {
    const fetched = await fetchStill(film, opts.refetch);
    if (!fetched) {
      console.warn(`  ${film.slug.padEnd(40)} MISSING: YouTube has no thumbnail for ${film.youtubeId} (private, removed, or wrong id). Skipped, nothing substituted.`);
      missing.push(film.slug);
      continue;
    }
    const { region, barsTrimmed } = await findFrame(fetched.file);
    frames.set(film.slug, { file: fetched.file, region });

    const originalOut = path.join(OUT_DIR, `${film.slug}.webp`);
    const treatedOut = path.join(OUT_DIR, `${film.slug}-treated.webp`);
    const smOut = path.join(OUT_DIR, `${film.slug}-treated-sm.webp`);

    await sharp(fetched.file)
      .extract(region)
      .resize(OUT_W, OUT_H, { fit: "cover" })
      .webp({ quality: ORIGINAL_QUALITY, effort: 6 })
      .toFile(originalOut);

    const phase = phaseFor(film.slug, opts.phase);
    const treated = await treat(fetched.file, region, opts, phase);
    await encodeTreated(fullOf(treated), opts.encoding).toFile(treatedOut);
    await encodeTreated(nativeOf(treated), opts.encoding).toFile(smOut);

    const result: Result = {
      slug: film.slug,
      variant: fetched.variant,
      source: `${fetched.width}x${fetched.height}`,
      barsTrimmed,
      originalBytes: statSync(originalOut).size,
      treatedBytes: statSync(treatedOut).size,
      smBytes: statSync(smOut).size,
      phase,
      full: await verifyTreated(treatedOut, OUT_W, OUT_H, ramp),
      sm: await verifyTreated(smOut, nativeW, nativeH, ramp),
    };
    results.push(result);
    console.log(
      `  ${film.slug.padEnd(40)} ${fetched.variant.padEnd(14)} ${result.source.padEnd(9)} bars=${String(barsTrimmed).padStart(3)}  original=${kb(result.originalBytes).padStart(8)}  treated=${kb(result.treatedBytes).padStart(7)}  sm=${kb(result.smBytes).padStart(6)}`,
    );
  }

  const fallbacks = results.filter((r) => r.variant !== "maxresdefault").map((r) => `${r.slug} (${r.variant})`);
  console.log(`\n${results.length} films processed. Fallbacks: ${fallbacks.length ? fallbacks.join(", ") : "none"}`);
  if (missing.length) console.warn(`MISSING (no output written): ${missing.join(", ")}`);

  // Verification table.
  console.log(`\nverify: treated files must be ${OUT_W}x${OUT_H} / ${nativeW}x${nativeH} and contain only ${ramp.map(hex).join(", ")}`);
  let bad = 0;
  for (const r of results) {
    const line = (label: string, v: Verified) => `  ${r.slug.padEnd(40)} ${label.padEnd(11)} ${`${v.width}x${v.height}`.padEnd(9)} ${v.colours.join(" ")}  ${v.ok ? "ok" : "FAIL"}`;
    console.log(line("treated", r.full));
    console.log(line("treated-sm", r.sm));
    if (!r.full.ok || !r.sm.ok) bad++;
  }
  if (bad) throw new Error(`${bad} treated file(s) failed verification`);

  // Phase table: same flat 50% field, each film's phase.
  if (opts.algo === "halftone" || opts.algo === "bayer4" || opts.algo === "bayer8") {
    console.log(`\nphase (FNV-1a of slug${opts.phase ? "" : ", DISABLED by --no-phase"}): flat 50% field, first row of 32 px`);
    const seen = new Map<string, string>();
    let dupes = 0;
    for (const r of results) {
      const sig = phaseSignature(opts, r.phase);
      const p =
        opts.algo === "halftone"
          ? `fx=${r.phase.fx.toFixed(3)} fy=${r.phase.fy.toFixed(3)}`
          : `dx=${r.phase.dx} dy=${r.phase.dy} sym=${r.phase.sym}`;
      const dupe = seen.get(sig.field);
      if (dupe) dupes++;
      seen.set(sig.field, r.slug);
      console.log(`  ${r.slug.padEnd(40)} ${r.phase.hash.toString(16).padStart(8, "0")}  ${p.padEnd(26)} ${sig.row}  ${sig.field}${dupe ? `  SAME AS ${dupe}` : ""}`);
    }
    console.log(dupes ? `  ${dupes} film(s) share a phase with another` : `  all ${results.length} phases distinct`);
  }

  if (!opts.sheets) return;

  // -------------------------------------------------------------------------
  // Sheets. Every treated cell is rendered from the native dither at an
  // integer scale (nearest) or at 1:1, never by downscaling the 1280 file,
  // so the sheet shows the real pattern and not a viewer's moiré.
  // -------------------------------------------------------------------------
  mkdirSync(SHEET_DIR, { recursive: true });
  console.log("\nBuilding comparison sheets...");
  const processed = films.filter((f) => frames.has(f.slug));
  const representative = ["fdoc", "silenced", "spaghetti-and-me", "discrete-magematics"].filter((s) => frames.has(s));

  const treatFor = (slug: string, o: Partial<Options>) => {
    const f = frames.get(slug)!;
    const merged = { ...opts, ...o };
    return treat(f.file, f.region, merged, phaseFor(slug, merged.phase));
  };
  /** Original at cell size (lanczos; it is a photograph). */
  const origCell = (slug: string, w: number, h: number) =>
    sharp(path.join(OUT_DIR, `${slug}.webp`)).resize(w, h, { fit: "cover" }).png().toBuffer();
  /** Whole treated frame at cell size: nearest when the scale is an integer, else linear. */
  const frameCell = async (slug: string, o: Partial<Options>, w: number, h: number) => {
    const t = await treatFor(slug, o);
    const integer = w % t.width === 0 && h % t.height === 0;
    return nativeOf(t).resize(w, h, { kernel: integer ? "nearest" : "linear" }).png().toBuffer();
  };
  /** A 1:1 window from the centre of the 1280x720 file (hero scale). */
  const heroCell = async (slug: string, o: Partial<Options>, w: number, h: number) => {
    const t = await treatFor(slug, o);
    const buf = await fullOf(t).png().toBuffer();
    return sharp(buf).extract({ left: (OUT_W - w) / 2, top: (OUT_H - h) / 2, width: w, height: h }).png().toBuffer();
  };
  /** The card: native rendition upscaled by the browser with smoothing. */
  const cardCell = async (slug: string, o: Partial<Options>, w: number, h: number) => {
    const t = await treatFor(slug, o);
    return nativeOf(t).resize(w, h, { kernel: "linear" }).png().toBuffer();
  };
  const origHero = (slug: string, w: number, h: number) =>
    sharp(path.join(OUT_DIR, `${slug}.webp`)).extract({ left: (OUT_W - w) / 2, top: (OUT_H - h) / 2, width: w, height: h }).png().toBuffer();

  const CW = 640;
  const CH = 360;

  // Each approach is compared at its own best integer-cell resolution with the
  // same tone curve: Bayer and error diffusion at 320 (4 px cells; at 640 they
  // read as a smooth photograph), the halftone at 640 (2 px blocks, so the
  // dots are round rather than crosses).
  const APPROACHES: Array<{ name: string; settings: Partial<Options> }> = [
    { name: "bayer8", settings: { algo: "bayer8", work: 320 } },
    { name: "floyd", settings: { algo: "floyd", work: 320 } },
    { name: "halftone", settings: { algo: "halftone", work: 640, cell: opts.cell } },
    { name: "bayer4", settings: { algo: "bayer4", work: 320 } },
    { name: "atkinson", settings: { algo: "atkinson", work: 320 } },
  ];
  const FINALISTS = APPROACHES.slice(0, 3);

  // 1. One sheet per approach: every film, original beside treated, integer nearest.
  for (const a of APPROACHES) {
    const cells: Cell[] = [];
    for (const film of processed) {
      cells.push({ image: await origCell(film.slug, CW, CH), label: `${film.slug} (original)` });
      cells.push({ image: await frameCell(film.slug, a.settings, CW, CH), label: `${film.slug} (${a.name})` });
    }
    await contactSheet(`approach: ${describe({ ...opts, ...a.settings })}`, cells, 2, CW, CH, path.join(SHEET_DIR, `approach-${a.name}.png`));
  }

  // 2. Finalists at card scale: native rendition upscaled to 400px with smoothing.
  {
    const cells: Cell[] = [];
    for (const slug of representative) {
      for (const a of FINALISTS) {
        cells.push({ image: await cardCell(slug, a.settings, 400, 225), label: `${slug} — ${a.name} @ card 400px` });
      }
    }
    await contactSheet(`finalists at card size (native rendition smoothly resampled to 400)`, cells, 3, 400, 225, path.join(SHEET_DIR, "finalists-card.png"));
  }

  // 3. Finalists at hero scale: 1:1 windows from the 1280 file.
  {
    const cells: Cell[] = [];
    for (const slug of representative) {
      cells.push({ image: await origHero(slug, 480, 270), label: `${slug} — original 1:1` });
      for (const a of FINALISTS) {
        cells.push({ image: await heroCell(slug, a.settings, 480, 270), label: `${slug} — ${a.name} 1:1 @1280` });
      }
    }
    await contactSheet(`finalists at hero size (1:1 centre window of the 1280x720 file)`, cells, 4, 480, 270, path.join(SHEET_DIR, "finalists-hero.png"));
  }

  // 3b. Finalists as the hero screen shows them: the 1280 file resampled to
  //     768 wide (the 48rem screen), so moiré from a non-integer downscale shows.
  {
    const HW = 768;
    const HH = 432;
    const heroView = async (slug: string, o: Partial<Options>) => {
      const t = await treatFor(slug, o);
      const buf = await fullOf(t).png().toBuffer();
      return sharp(buf).resize(HW, HH, { kernel: "linear" }).png().toBuffer();
    };
    const cells: Cell[] = [];
    for (const slug of representative) {
      cells.push({ image: await origCell(slug, HW, HH), label: `${slug} — original @ hero 768` });
      for (const a of FINALISTS) {
        cells.push({ image: await heroView(slug, a.settings), label: `${slug} — ${a.name} @ hero 768` });
      }
    }
    await contactSheet(`finalists as the hero screen shows them (1280 file resampled to 768 wide)`, cells, 2, HW, HH, path.join(SHEET_DIR, "finalists-heroview.png"));
  }

  // 4. Halftone parameter sweep: pitch and working width, 1:1 windows.
  {
    const variants: Array<Partial<Options> & { label: string }> = [
      { label: "work320 cell6", algo: "halftone", work: 320, cell: 6 },
      { label: "work320 cell8", algo: "halftone", work: 320, cell: 8 },
      { label: "work640 cell8", algo: "halftone", work: 640, cell: 8 },
      { label: "work640 cell10", algo: "halftone", work: 640, cell: 10 },
      { label: "work640 cell12", algo: "halftone", work: 640, cell: 12 },
      { label: "work640 cell16", algo: "halftone", work: 640, cell: 16 },
    ];
    const cells: Cell[] = [];
    for (const slug of representative) {
      for (const v of variants) {
        cells.push({ image: await heroCell(slug, v, 320, 180), label: `${slug} — ${v.label}` });
      }
    }
    await contactSheet(`halftone sweep, 1:1 windows @1280 (angle ${opts.angle})`, cells, variants.length, 320, 180, path.join(SHEET_DIR, "halftone-sweep.png"));
  }

  // 5. Halftone sweep at card scale (the same variants as the browser would show them).
  {
    const variants: Array<Partial<Options> & { label: string }> = [
      { label: "work320 cell6", algo: "halftone", work: 320, cell: 6 },
      { label: "work320 cell8", algo: "halftone", work: 320, cell: 8 },
      { label: "work640 cell8", algo: "halftone", work: 640, cell: 8 },
      { label: "work640 cell10", algo: "halftone", work: 640, cell: 10 },
      { label: "work640 cell12", algo: "halftone", work: 640, cell: 12 },
      { label: "work640 cell16", algo: "halftone", work: 640, cell: 16 },
    ];
    const cells: Cell[] = [];
    for (const slug of representative) {
      for (const v of variants) {
        cells.push({ image: await cardCell(slug, v, 320, 180), label: `${slug} — ${v.label} @ card` });
      }
    }
    await contactSheet(`halftone sweep at card size (smooth resample of the native rendition to 320)`, cells, variants.length, 320, 180, path.join(SHEET_DIR, "halftone-sweep-card.png"));
  }

  // 6. Posterize: hard steps before the screen, halftone and bayer8.
  {
    const variants: Array<Partial<Options> & { label: string }> = [
      { label: "halftone", ...FINALISTS[2].settings, posterize: 0 },
      { label: "halftone post4", ...FINALISTS[2].settings, posterize: 4 },
      { label: "halftone post6", ...FINALISTS[2].settings, posterize: 6 },
      { label: "bayer8", ...FINALISTS[0].settings, posterize: 0 },
      { label: "bayer8 post4", ...FINALISTS[0].settings, posterize: 4 },
      { label: "bayer8 post6", ...FINALISTS[0].settings, posterize: 6 },
    ];
    const cells: Cell[] = [];
    for (const slug of representative) {
      for (const v of variants) {
        cells.push({ image: await frameCell(slug, v, 320, 180), label: `${slug} — ${v.label}` });
      }
    }
    await contactSheet(`posterize before the screen (native 1:1)`, cells, variants.length, 320, 180, path.join(SHEET_DIR, "posterize.png"));
  }

  // 7. Three tones for the three finalists.
  {
    const cells: Cell[] = [];
    for (const slug of representative) {
      for (const a of FINALISTS) {
        cells.push({ image: await frameCell(slug, { ...a.settings, tones: 3 }, 320, 180), label: `${slug} — ${a.name} 3 tones` });
      }
    }
    await contactSheet(`three tones (base, deep, carolina), native 1:1`, cells, 3, 320, 180, path.join(SHEET_DIR, "tones-3.png"));
  }

  // 8. Phase check: the same flat 50% field through every film's phase, 8x nearest.
  {
    const cells: Cell[] = [];
    for (const film of processed) {
      const w = 40;
      const h = 24;
      const lum = new Float32Array(w * h).fill(0.5);
      const tones = dither(lum, w, h, 2, opts, phaseFor(film.slug, opts.phase));
      const rgb = Buffer.alloc(w * h * 3);
      for (let i = 0; i < tones.length; i++) {
        const [r, g, b] = ramp[tones[i]];
        rgb[i * 3] = r;
        rgb[i * 3 + 1] = g;
        rgb[i * 3 + 2] = b;
      }
      const image = await sharp(rgb, { raw: { width: w, height: h, channels: 3 } }).resize(w * 8, h * 8, { kernel: "nearest" }).png().toBuffer();
      cells.push({ image, label: `${film.slug} (flat 50%)` });
    }
    await contactSheet(`phase check: identical flat field, each film's phase (${opts.algo})`, cells, 4, 320, 192, path.join(SHEET_DIR, "phase-check.png"));
  }

  // 9. The record: originals beside the treated files actually written to public/stills.
  {
    const cells: Cell[] = [];
    for (const film of processed) {
      cells.push({ image: await origCell(film.slug, CW, CH), label: `${film.slug} (original)` });
      const sm = sharp(path.join(OUT_DIR, `${film.slug}-treated-sm.webp`));
      const integer = CW % nativeW === 0 && CH % nativeH === 0;
      cells.push({ image: await sm.resize(CW, CH, { kernel: integer ? "nearest" : "linear" }).png().toBuffer(), label: `${film.slug} (treated)` });
    }
    await contactSheet(`original vs treated / ${describe(opts)}`, cells, 2, CW, CH, path.join(SHEET_DIR, "contact-sheet.png"));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
