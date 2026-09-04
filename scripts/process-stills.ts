/**
 * process-stills.ts — build-time image pipeline for the film stills.
 *
 * For every film it:
 *   1. fetches the YouTube thumbnail (maxresdefault.jpg; when that is missing or
 *      is the 120x90 placeholder it falls back to sddefault.jpg, then hqdefault.jpg),
 *      caching the raw JPEG in scripts/.cache/{slug}.jpg. A film with no
 *      thumbnail at all is skipped with a warning, never substituted;
 *   2. trims black letterbox bars (sd/hqdefault are 4:3 with the 16:9 frame inside;
 *      some films are letterboxed inside the frame itself) and centre-crops to 16:9;
 *   3. writes public/stills/{slug}.webp          (untreated frame, 1280x720, lossy q80)
 *      and    public/stills/{slug}-treated.webp  (two/three-tone dither, 1280x720,
 *             lossless so the grain is not smeared by compression).
 *
 * Defaults were chosen by eye from the contact sheets; see scripts/DITHER_REPORT.md.
 *
 * Usage:   npm run stills -- [flags]      (or: npx tsx scripts/process-stills.ts)
 *
 *   --algo=bayer4|bayer8|floyd|atkinson|none   dither algorithm      (default: bayer8)
 *   --tones=2|3            base+carolina, or base+deep+carolina       (default: 2)
 *   --work=<px>            working width the dither runs at; the result is
 *                          upscaled to 1280 with nearest-neighbour so each
 *                          dither cell becomes a crisp 1280/work px block  (default: 320)
 *   --contrast=<n>         contrast multiplier around mid grey, 1 = none  (default: 1.15)
 *   --gamma=<n>            >1 lifts midtones, <1 darkens them, 1 = none   (default: 1.3)
 *   --no-normalize         skip the histogram stretch (on by default; it is what
 *                          flattens well-lit and badly-lit sources together)
 *   --encoding=lossless|near|lossy   treated webp encoding (default: lossless — for
 *                          a 2-3 colour image it is the same size as near-lossless,
 *                          3-5 KB, while lossy is ~25x larger and smears the grain)
 *   --only=slug[,slug]     process a subset
 *   --refetch              ignore the cache and download again
 *   --sheets               also build comparison contact sheets in screenshots/dither/
 *
 * Source list: scripts/stills-manifest.ts.
 * TODO: once content/films.json exists, read it instead of the manifest:
 *   // const STILLS = JSON.parse(readFileSync("content/films.json", "utf8")).map((f) => ({ slug: f.slug, youtubeId: f.youtubeId }));
 *
 * Only dependency is sharp. Every pixel-level step (tone curve, dither,
 * palette) runs in plain TypeScript on raw buffers so it can be read and
 * tuned without knowing libvips.
 */

import sharp, { type OverlayOptions, type Sharp } from "sharp";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { STILLS, type StillSource } from "./stills-manifest";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ROOT = process.cwd(); // npm scripts always run from the package root
const CACHE_DIR = path.join(ROOT, "scripts", ".cache");
const OUT_DIR = path.join(ROOT, "public", "stills");
const SHEET_DIR = path.join(ROOT, "screenshots", "dither");

const OUT_W = 1280;
const OUT_H = 720;
const ORIGINAL_QUALITY = 80;

/** Locked palette. Treated output uses ONLY these tones. */
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

const ALGOS = ["bayer4", "bayer8", "floyd", "atkinson", "none"] as const;
type Algo = (typeof ALGOS)[number];

interface Options {
  algo: Algo;
  tones: 2 | 3;
  work: number;
  contrast: number;
  gamma: number;
  normalize: boolean;
  encoding: "near" | "lossless" | "lossy";
  only: string[] | null;
  refetch: boolean;
  sheets: boolean;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    algo: "bayer8",
    tones: 2,
    work: 320,
    contrast: 1.15,
    gamma: 1.3,
    normalize: true,
    encoding: "lossless",
    only: null,
    refetch: false,
    sheets: false,
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
        opts.work = Number(value);
        break;
      case "contrast":
        opts.contrast = Number(value);
        break;
      case "gamma":
        opts.gamma = Number(value);
        break;
      case "no-normalize":
        opts.normalize = false;
        break;
      case "encoding":
        if (value !== "near" && value !== "lossless" && value !== "lossy") throw new Error("--encoding must be near, lossless or lossy");
        opts.encoding = value;
        break;
      case "only":
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
  return opts;
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
// Step 3: the treatment
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

/** Quantise a 0..1 value to the nearest of `levels` evenly spaced steps. */
function quantise(v: number, levels: number): number {
  const i = Math.round(v * (levels - 1));
  return i < 0 ? 0 : i > levels - 1 ? levels - 1 : i;
}

/**
 * Dither a luminance buffer (0..1 floats, row-major) to `levels` tones.
 * Returns one tone index per pixel.
 */
function dither(lum: Float32Array, w: number, h: number, levels: number, algo: Algo): Uint8Array {
  const out = new Uint8Array(w * h);
  const step = 1 / (levels - 1);

  if (algo === "none") {
    for (let i = 0; i < lum.length; i++) out[i] = quantise(lum[i], levels);
    return out;
  }

  if (algo === "bayer4" || algo === "bayer8") {
    const n = algo === "bayer4" ? 4 : 8;
    const m = bayerMatrix(n);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = (m[y % n][x % n] + 0.5) / (n * n) - 0.5; // -0.5 .. +0.5
        out[y * w + x] = quantise(lum[y * w + x] + t * step, levels);
      }
    }
    return out;
  }

  // Error diffusion (Floyd–Steinberg / Atkinson), serpentine scan to avoid
  // the diagonal "worm" artefacts of a plain raster scan.
  const kernel: Array<[dx: number, dy: number, weight: number]> =
    algo === "floyd"
      ? [[1, 0, 7 / 16], [-1, 1, 3 / 16], [0, 1, 5 / 16], [1, 1, 1 / 16]]
      : [[1, 0, 1 / 8], [2, 0, 1 / 8], [-1, 1, 1 / 8], [0, 1, 1 / 8], [1, 1, 1 / 8], [0, 2, 1 / 8]];

  const work = Float32Array.from(lum);
  for (let y = 0; y < h; y++) {
    const reverse = y % 2 === 1;
    for (let i = 0; i < w; i++) {
      const x = reverse ? w - 1 - i : i;
      const idx = y * w + x;
      const old = work[idx];
      const q = quantise(old, levels);
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

/**
 * Grayscale → (normalise) → contrast/gamma → dither at the working width →
 * paint with the palette → nearest-neighbour upscale to 1280x720.
 * Returns a sharp instance holding the RGB result, ready for .webp()/.png().
 */
async function treat(file: string, region: Region, opts: Options): Promise<Sharp> {
  const w = opts.work;
  const h = Math.round((w * 9) / 16);

  let pipeline = sharp(file).extract(region).resize(w, h, { fit: "cover" }).grayscale();
  if (opts.normalize) pipeline = pipeline.normalise();
  const { data } = await pipeline.raw().toBuffer({ resolveWithObject: true });

  // Tone curve on 0..1 floats: contrast around mid grey, then gamma.
  const lum = new Float32Array(w * h);
  for (let i = 0; i < lum.length; i++) {
    let v = data[i] / 255;
    v = (v - 0.5) * opts.contrast + 0.5;
    v = v < 0 ? 0 : v > 1 ? 1 : v;
    if (opts.gamma !== 1) v = Math.pow(v, 1 / opts.gamma);
    lum[i] = v;
  }

  const ramp = RAMPS[opts.tones];
  const tones = dither(lum, w, h, ramp.length, opts.algo);

  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0; i < tones.length; i++) {
    const [r, g, b] = ramp[tones[i]];
    rgb[i * 3] = r;
    rgb[i * 3 + 1] = g;
    rgb[i * 3 + 2] = b;
  }

  return sharp(rgb, { raw: { width: w, height: h, channels: 3 } }).resize(OUT_W, OUT_H, { kernel: "nearest" });
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
// Contact sheets (only with --sheets; output is gitignored)
// ---------------------------------------------------------------------------

interface Cell {
  image: Buffer;
  label: string;
}

const CELL_W = 480;
const CELL_H = 270;
const LABEL_H = 28;
const GAP = 12;

function svgLabel(text: string, width: number, height: number, size = 16): Buffer {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<text x="0" y="${height - 8}" font-family="Consolas, Menlo, monospace" font-size="${size}" fill="#e6e6e6">${safe}</text></svg>`,
  );
}

async function contactSheet(title: string, cells: Cell[], columns: number, outFile: string): Promise<void> {
  const rows = Math.ceil(cells.length / columns);
  const titleH = 40;
  const width = GAP + columns * (CELL_W + GAP);
  const height = titleH + GAP + rows * (CELL_H + LABEL_H + GAP);

  const layers: OverlayOptions[] = [{ input: svgLabel(title, width - GAP * 2, titleH, 20), left: GAP, top: 0 }];
  for (let i = 0; i < cells.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const left = GAP + col * (CELL_W + GAP);
    const top = titleH + GAP + row * (CELL_H + LABEL_H + GAP);
    const thumb = await sharp(cells[i].image).resize(CELL_W, CELL_H, { fit: "cover" }).png().toBuffer();
    layers.push({ input: thumb, left, top });
    layers.push({ input: svgLabel(cells[i].label, CELL_W, LABEL_H, 14), left, top: top + CELL_H });
  }

  await sharp({ create: { width, height, channels: 3, background: "#202226" } })
    .composite(layers)
    .png()
    .toFile(outFile);
  console.log(`  sheet  ${path.relative(ROOT, outFile)}`);
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
}

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  mkdirSync(CACHE_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const films = opts.only ? STILLS.filter((f) => opts.only!.includes(f.slug)) : STILLS;
  if (films.length === 0) throw new Error("--only matched no films");

  console.log(`process-stills: algo=${opts.algo} tones=${opts.tones} work=${opts.work} contrast=${opts.contrast} gamma=${opts.gamma} normalize=${opts.normalize} encoding=${opts.encoding}`);

  const results: Result[] = [];
  const missing: string[] = [];
  const frames = new Map<string, { file: string; region: Region }>();

  for (const film of films) {
    const fetched = await fetchStill(film, opts.refetch);
    if (!fetched) {
      console.warn(`  ${film.slug.padEnd(40)} MISSING: YouTube has no thumbnail for ${film.youtubeId} (private, removed, or wrong id). Skipped.`);
      missing.push(film.slug);
      continue;
    }
    const { region, barsTrimmed } = await findFrame(fetched.file);
    frames.set(film.slug, { file: fetched.file, region });

    const originalOut = path.join(OUT_DIR, `${film.slug}.webp`);
    const treatedOut = path.join(OUT_DIR, `${film.slug}-treated.webp`);

    await sharp(fetched.file)
      .extract(region)
      .resize(OUT_W, OUT_H, { fit: "cover" })
      .webp({ quality: ORIGINAL_QUALITY, effort: 6 })
      .toFile(originalOut);

    const treated = await treat(fetched.file, region, opts);
    await encodeTreated(treated, opts.encoding).toFile(treatedOut);

    const result: Result = {
      slug: film.slug,
      variant: fetched.variant,
      source: `${fetched.width}x${fetched.height}`,
      barsTrimmed,
      originalBytes: statSync(originalOut).size,
      treatedBytes: statSync(treatedOut).size,
    };
    results.push(result);
    console.log(
      `  ${film.slug.padEnd(40)} ${fetched.variant.padEnd(14)} ${result.source.padEnd(9)} bars=${String(barsTrimmed).padStart(3)}  original=${kb(result.originalBytes).padStart(9)}  treated=${kb(result.treatedBytes).padStart(9)}`,
    );
  }

  const fallbacks = results.filter((r) => r.variant !== "maxresdefault").map((r) => `${r.slug} (${r.variant})`);
  console.log(`\n${results.length} films processed. Fallbacks: ${fallbacks.length ? fallbacks.join(", ") : "none"}`);
  if (missing.length) console.warn(`MISSING (no output written): ${missing.join(", ")}`);

  if (!opts.sheets) return;

  mkdirSync(SHEET_DIR, { recursive: true });
  console.log("\nBuilding comparison sheets...");
  const processed = films.filter((f) => frames.has(f.slug));

  const treatedPng = async (slug: string, o: Options) => {
    const f = frames.get(slug)!;
    return (await treat(f.file, f.region, o)).png().toBuffer();
  };

  // Every algorithm × tone count at the current working width.
  for (const algo of ALGOS.filter((a) => a !== "none")) {
    for (const tones of [2, 3] as const) {
      const cells: Cell[] = [];
      for (const film of processed) {
        cells.push({ image: await treatedPng(film.slug, { ...opts, algo, tones }), label: film.slug });
      }
      await contactSheet(
        `${algo} / ${tones} tones / work=${opts.work} / contrast=${opts.contrast} / gamma=${opts.gamma}`,
        cells,
        4,
        path.join(SHEET_DIR, `${algo}-${tones}tone.png`),
      );
    }
  }

  // Working-width comparison for the current algorithm on three films.
  const representative = ["fdoc", "silenced", "the-tulips"].filter((s) => frames.has(s)).slice(0, 3);
  if (representative.length) {
    const cells: Cell[] = [];
    for (const slug of representative) {
      for (const work of [320, 480, 640]) {
        cells.push({ image: await treatedPng(slug, { ...opts, work }), label: `${slug} @ work=${work}` });
      }
    }
    await contactSheet(`${opts.algo} / ${opts.tones} tones / working width comparison`, cells, 3, path.join(SHEET_DIR, `work-width-${opts.algo}-${opts.tones}tone.png`));
  }

  // Final: originals beside treated stills at the current settings.
  const finalCells: Cell[] = [];
  for (const film of processed) {
    finalCells.push({ image: readFileSync(path.join(OUT_DIR, `${film.slug}.webp`)), label: `${film.slug} (original)` });
    finalCells.push({ image: readFileSync(path.join(OUT_DIR, `${film.slug}-treated.webp`)), label: `${film.slug} (treated)` });
  }
  await contactSheet(
    `original vs treated / ${opts.algo} / ${opts.tones} tones / work=${opts.work}`,
    finalCells,
    4,
    path.join(SHEET_DIR, "contact-sheet.png"),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
