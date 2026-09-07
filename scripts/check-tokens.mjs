#!/usr/bin/env node
/**
 * check-tokens.mjs: the token file's teeth (REMEDIATION_BRIEF.md 4.1).
 *
 * app/globals.css is the single source of truth for colour, size, spacing,
 * easing and duration. This script fails (exit 1) when anything else in
 * app/, components/, lib/ or content/ invents one. Run by `npm run check`.
 *
 * Rules
 *  1. hex colours (#rgb, #rrggbb, #rrggbbaa) anywhere but app/globals.css.
 *     SVG files are exempt (app/icon.svg carries the palette by necessity).
 *  2. literal durations (a number followed by ms or s, e.g. 300ms, 0.3s)
 *     anywhere but app/globals.css, app/motion.css and lib/motion.ts.
 *     A runtime template such as `${d}ms` is allowed: it carries no number.
 *  3. the string "gold" (case-insensitive) anywhere but
 *     components/AwardBadge.tsx and app/globals.css.
 *  4. Tailwind arbitrary values whose bracket contains px, rem or # ,
 *     e.g. p-[13px], text-[1.125rem], bg-[#fff].
 *  5. Tailwind utilities that bypass the motion tokens:
 *       duration-<anything>   (bare numbers; use dur-1 .. dur-5)
 *       delay-<anything>      (bare numbers; set --reveal-delay from lib/motion DUR)
 *       ease-[...]            (arbitrary curve; use ease-out / ease-in / ease-in-out / ease-linear)
 *       ease-initial
 *       animate-<anything>    (the animate namespace is reset; keyframes live in motion.css)
 *       transition-[...] with a literal duration inside
 *  6. Tailwind palette utilities outside the token file and AwardBadge:
 *       (bg|text|border|decoration|outline|fill|stroke|from|to|via)-(base|surface|carolina|deep|cream|cream-muted|base-muted)
 *     Components reference role colours only: bg-ground, text-fg,
 *     text-fg-muted, border-rule, text-accent.
 *  7. more than one addEventListener("scroll" across app/, components/, lib/.
 *     lib/scroll.ts is the one broadcast; everything else subscribes to it.
 *
 * Comments are NOT exempt: a hex in a comment is still a hex somebody will
 * copy. Say "carolina" or "--color-carolina" instead.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SCAN_DIRS = ["app", "components", "lib", "content"];
const EXT = new Set([".ts", ".tsx", ".css", ".mjs", ".js", ".json"]);

const TOKEN_FILE = "app/globals.css";
const MOTION_FILES = new Set([TOKEN_FILE, "app/motion.css", "lib/motion.ts"]);
const GOLD_FILES = new Set([TOKEN_FILE, "components/AwardBadge.tsx"]);
const PALETTE_UTILITY_FILES = new Set([TOKEN_FILE, "components/AwardBadge.tsx"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXT.has(name.slice(name.lastIndexOf(".")))) out.push(full);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => {
  try {
    return walk(join(ROOT, d));
  } catch {
    return [];
  }
});

const problems = [];
let scrollListeners = 0;

const RULES = [
  {
    name: "hex colour outside the token file",
    re: /#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi,
    exempt: (rel) => rel === TOKEN_FILE || rel.endsWith(".svg"),
    // Ignore fragment links like href="#main" and hash-bang / heading ids.
    filter: (m, line) => !/(href=|url\(|["'`]#)/.test(line.slice(Math.max(0, line.indexOf(m) - 8), line.indexOf(m) + 1)),
  },
  {
    name: "literal duration outside the motion files",
    re: /(?<![\w.$-])\d+(?:\.\d+)?m?s\b(?![\w-])/g,
    exempt: (rel) => MOTION_FILES.has(rel),
    // "10s" inside an ISO date or a sentence like "the 1980s" would be rare in code; keep strict.
    filter: (m, line) => !/^\s*(\/\/|\*|\/\*)/.test(line) || true,
  },
  {
    name: '"gold" outside components/AwardBadge.tsx',
    re: /gold/gi,
    exempt: (rel) => GOLD_FILES.has(rel),
  },
  {
    name: "Tailwind arbitrary value with px/rem/#",
    re: /[\w:-]+-\[[^\]\s]*(?:px|rem|#)[^\]\s]*\]/g,
    exempt: (rel) => rel === TOKEN_FILE,
  },
  {
    name: "Tailwind motion utility that bypasses tokens",
    re: /(?<![\w-])(?:[\w-]+:)*(?:duration-[\w[\]().-]+|delay-[\w[\]().-]+|ease-\[[^\]]*\]|ease-initial|animate-[\w[\]().-]+|transition-\[[^\]]*\d+m?s[^\]]*\])/g,
    exempt: (rel) => rel === TOKEN_FILE || rel === "app/motion.css",
  },
  {
    name: "palette utility in a component (use a role: bg-ground, text-fg, text-fg-muted, border-rule, text-accent)",
    re: /(?<![\w-])(?:[\w-]+:)*(?:bg|text|border|decoration|outline|fill|stroke|from|to|via|ring|accent)-(?:base|surface|carolina|deep|cream|cream-muted|base-muted)(?![\w-])/g,
    exempt: (rel) => PALETTE_UTILITY_FILES.has(rel),
  },
];

for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join("/");
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");

  scrollListeners += (text.match(/addEventListener\(\s*["'`]scroll["'`]/g) ?? []).length;

  for (const rule of RULES) {
    if (rule.exempt?.(rel)) continue;
    lines.forEach((line, i) => {
      for (const m of line.matchAll(rule.re)) {
        if (rule.filter && !rule.filter(m[0], line)) continue;
        problems.push(`${rel}:${i + 1}: ${rule.name}: ${m[0].trim()}`);
      }
    });
  }
}

if (scrollListeners > 1) {
  problems.push(`${scrollListeners} addEventListener("scroll") calls across app/components/lib; only lib/scroll.ts may add one`);
}

if (problems.length) {
  console.error(`check-tokens: ${problems.length} problem${problems.length === 1 ? "" : "s"}\n`);
  for (const p of problems) console.error("  " + p);
  console.error("\nEvery colour, size, spacing, easing and duration is defined once in app/globals.css. Use the token.");
  process.exit(1);
}

console.log(`check-tokens: ${files.length} files clean`);
