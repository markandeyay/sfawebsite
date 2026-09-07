# UNC Student Film Association

The club's site as a catalog: every film carries a number, stills are shown as
shot on cool grey panels, credits roll as end credits, and the one accent
colour appears at rest only where something won. Three routes:
the homepage, a page per film, and the awards ceremony. Next.js 16 (App
Router), TypeScript, Tailwind v4, statically generated. There is no CMS: the
whole site is a pure function of two JSON files.

Live at https://sfawebsite-kappa.vercel.app. Production builds from `main` on
every push (Vercel GitHub integration).

## Add a film

1. Add an entry to `content/films.json` (copy one; every field is required,
   `runtime` and `still` may be `null`).
2. `no` is the catalog number: production order across all years. Take the
   next number after the current highest, never reuse or renumber.
3. If it won, add the same categories to `content/awards.json` and to the
   film's `awards` array (the build checks both agree).
4. `npm run stills` fetches and treats its YouTube frame. No frame? Set
   `"still": null` and the type-only leader renders instead.
5. `npm run check`, then `npm run build`.

Category names must match `CANONICAL_CATEGORIES` in `content/types.ts`.
Credits are `{ "role", "name" }` pairs in the order they should roll.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:3000 |
| `npm run build` | Validates content, then `next build` (17 static pages) |
| `npm run check` | Content validation (schema, cross-file, every still file on disk), `tsc --noEmit`, ESLint, and `scripts/check-tokens.mjs` (fails on a hex colour, a literal duration, the word "gold", an arbitrary px/rem value, a palette utility or a second scroll listener anywhere outside the token file) |
| `npm run stills` | For each film writes two files to `public/stills/`: `{slug}.webp` (1280x720 frame) and `{slug}-sm.webp` (640x360, for cards). Idempotent. `--treated` also writes the halftone renditions the site no longer serves; `--sheets` builds the comparison sheets |

## Where things are

- `app/globals.css` is the token file and the single source of truth: six
  colours plus role variables, nine fluid type steps, a closed spacing scale,
  four easings, five durations, and the CSS for the shared components.
- `components/` holds the four moves (`CatalogNumber`, `Still`/`Frame`,
  `CreditBlock`, `AwardBadge`) and the shell; `components/home`,
  `components/film`, `components/awards` are per route.
- `components/motion/` and `app/motion.css`: smooth scroll, the one scroll
  broadcast (`lib/scroll.ts`), reveals as CSS transitions, split headlines;
  `lib/motion.ts` mirrors the CSS easings and durations for JavaScript.
- `content/`: `films.json`, `awards.json`, the types and the validator.
- `scripts/`: the still pipeline, the content validator, the token check,
  and `DITHER_REPORT.md` (the halftone comparison, kept for the record).
- `docs/`: the comparison images the notes refer to. `DESIGN_NOTES.md` is the
  full record of every direction, rejection and pass; `AUDIT.md` is the
  diagnosis of the build this one replaced.

One dependency was added beyond Next, React, Tailwind and sharp: `lenis`, for
momentum scrolling (`components/motion/SmoothScroll.tsx`, off under
`prefers-reduced-motion`); see `DESIGN_NOTES.md` 8.7.1.

## Content the club still needs to supply

Each is a designed empty state today, never an invented fact: exec board
names, semester dates, full crew credits per film, person-level award winners,
the 2026 slate, a public upload or a still of *At Last, the Gift*, confirmation
of the "independent films" wording, and a domain. Details in `DESIGN_NOTES.md`
section 5.
