# UNC Student Film Association website

A three-route demo of the club's new site: the homepage, one film page, and
the 2025 awards ceremony. Next.js 16 (App Router), TypeScript, Tailwind v4,
statically generated, deployed on Vercel at https://sfawebsite-kappa.vercel.app (production builds from `main` on every push). There is no CMS: the whole site is a
pure function of two JSON files.

## Add a film

1. Add an entry to `content/films.json` (copy an existing one). Required:
   `slug`, `title`, `year`, `track`, `director`, `logline`, `youtubeId`,
   `viewable`, `runtime` (or `null`), `still`, `awards`, `credits`.
2. If it won anything, add the same categories to `content/awards.json`
   under that year, and list them in the film's `awards` array. The build
   fails if the two files disagree.
3. Run `npm run stills` to fetch the YouTube frame and write it to
   `public/stills/`. Set `"still": null` if no frame exists.
4. Run `npm run check` (types, lint) and `npm run build`.

Category names must match `CANONICAL_CATEGORIES` in `content/types.ts`.
Credits are a flat list of `{ "role", "name" }` pairs in the order they
should roll.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run check` | Type check and lint |
| `npm run stills` | Fetch and process film stills (`--sheets` for comparison sheets, see `scripts/process-stills.ts`) |

## Where things are

- `content/` — `films.json`, `awards.json`, the types, and the validator that
  fails the build on malformed content.
- `components/` — shared components.
- `components/home/`, `components/film/`, `components/awards/` — per-route
  pieces.
- `app/globals.css` — the design tokens (palette, type scale) and the few
  component-shaped rules (eyebrows, arrow links, panels, credit block).
- `scripts/process-stills.ts` — fetches and crops each film's YouTube frame.
- `DESIGN_NOTES.md` — every design decision, what was rejected, and why.
- `docs/` — hero and dither comparison images referenced by the notes.

## Content the club still needs to supply

See DESIGN_NOTES.md section 5: exec board names, semester dates, full crew
credits per film, person-level award winners, and the 2026 slate.
