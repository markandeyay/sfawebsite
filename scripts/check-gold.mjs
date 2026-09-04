// Enforces SFA_SYSTEM_DESIGN.md 5.2: gold is a data type. The token may be
// defined in app/globals.css and used in components/AwardBadge.tsx. Any other
// occurrence of the string "gold" in app/ or components/ fails the build.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ALLOWED = new Set(["components/AwardBadge.tsx", "app/globals.css"]);
const ROOTS = ["app", "components", "lib"];
const offenders = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css|mjs|js)$/.test(entry)) {
      const rel = p.split("\\").join("/");
      if (ALLOWED.has(rel)) continue;
      const lines = readFileSync(p, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (/gold/i.test(line)) offenders.push(`${rel}:${i + 1}: ${line.trim()}`);
      });
    }
  }
}

for (const root of ROOTS) {
  try {
    walk(root);
  } catch {
    /* folder may not exist yet */
  }
}

if (offenders.length) {
  console.error("Gold rule violated. `gold` may only appear in components/AwardBadge.tsx:\n");
  for (const o of offenders) console.error("  " + o);
  process.exit(1);
}
console.log("Gold rule holds: gold appears only in components/AwardBadge.tsx.");
