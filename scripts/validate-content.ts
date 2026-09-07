/**
 * validate-content.ts
 *
 * Build-time content check. Runs as `prebuild` (so `next build` never starts
 * on bad content) and as the first step of `npm run check`.
 *
 *   npx tsx scripts/validate-content.ts
 *
 * Two stages:
 *
 *   1. Schema and cross-file validation. Importing `content/index.ts` runs
 *      the validator on films.json and awards.json at module load; any
 *      problem throws a ContentError naming the file, the path, and what is
 *      wrong. That module is pure (no fs), which is why this script exists.
 *
 *   2. On-disk checks. Every film with a non-null `still` must have all four
 *      renditions the image pipeline writes to public/stills:
 *
 *        {slug}.webp             the untreated frame (the hover/focus reward)
 *        {slug}-sm.webp          the same frame at card size (640x360)
 *        {slug}-treated.webp     the 1280px duotone dither
 *        {slug}-treated-sm.webp  the native-resolution dither for cards
 *
 *      plus whatever paths the film's `still` field actually declares (today
 *      those coincide with the 1280 pair). Missing files are listed in full
 *      and the process exits 1.
 *
 * Exit code is 0 only when both stages pass.
 */

import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const STILLS_DIR = path.join(ROOT, "public", "stills");
const STILLS_URL_PREFIX = "/stills/";

/** Renditions the pipeline writes for every film that has a frame. */
const RENDITIONS = ["{slug}.webp", "{slug}-sm.webp", "{slug}-treated.webp", "{slug}-treated-sm.webp"] as const;

function rel(p: string): string {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

async function main(): Promise<void> {
  // Stage 1: schema + cross-file validation (throws on the first problem).
  let content: typeof import("../content");
  try {
    content = await import("../content");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`content validation failed:\n  ${message}`);
    process.exit(1);
  }

  const films = content.getFilms();
  const ceremonies = content.getCeremonies();

  // Stage 2: on-disk checks.
  const missing: string[] = [];
  const unexpected: string[] = [];
  let checked = 0;

  for (const film of films) {
    if (film.still === null) {
      // No frame exists for this film. If the pipeline left a file behind
      // anyway, the data is stale one way or the other; say so, but do not
      // fail: an extra file cannot break a page.
      for (const pattern of RENDITIONS) {
        const file = path.join(STILLS_DIR, pattern.replace("{slug}", film.slug));
        if (existsSync(file)) unexpected.push(`${rel(file)} exists but ${film.slug} has "still": null`);
      }
      continue;
    }

    const required = new Set<string>();
    for (const pattern of RENDITIONS) {
      required.add(path.join(STILLS_DIR, pattern.replace("{slug}", film.slug)));
    }
    for (const declared of [film.still.original, film.still.treated]) {
      // The validator already guarantees the "/stills/" prefix.
      required.add(path.join(STILLS_DIR, declared.slice(STILLS_URL_PREFIX.length)));
    }
    for (const file of required) {
      checked++;
      if (!existsSync(file)) missing.push(`${rel(file)}  (No. ${content.formatCatalogNumber(film.no)} ${film.slug})`);
    }
  }

  for (const note of unexpected) console.warn(`note: ${note}`);

  if (missing.length > 0) {
    console.error(
      `content validation failed: ${missing.length} still file${missing.length === 1 ? "" : "s"} missing from public/stills ` +
        `(run \`npm run stills\`, or set "still": null for a film with no frame):`,
    );
    for (const m of missing) console.error(`  ${m}`);
    process.exit(1);
  }

  const withStill = films.filter((f) => f.still !== null).length;
  console.log(
    `content OK: ${films.length} films (No. ${content.formatCatalogNumber(1)}-${content.formatCatalogNumber(films.length)}), ` +
      `${ceremonies.length} ceremon${ceremonies.length === 1 ? "y" : "ies"}, ` +
      `${checked} still files verified for ${withStill} films with a frame`,
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});
