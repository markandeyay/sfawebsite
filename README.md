# UNC Student Film Association

The club's site as a studio lot, built on the same engine as the client's
stussy.ink: newsprint paper, four surfaces that each own a section, a
condensed display voice with outlined second words, mono kickers in slug-line
form, a three-depth atmosphere of set vocabulary and hand-inked doodles,
tilted marquee tapes that react to scroll speed, film stills in die-cut frames
on offset colour plates, award seals as stamps, a gooey stripe curtain
between routes, a lagging cursor that names what it is over, and a loader
whose counter waits for the real assets. Every film carries a catalog number.
Stills are the club's own frames, shown as shot.

Three routes: the lot (`/`), one page per film (`/films/[slug]`), and awards
night (`/awards/[year]`). Next.js 16 (App Router), TypeScript, GSAP, Lenis,
statically generated. There is no CMS: the whole site is a pure function of
two JSON files.

Live at https://sfawebsite-kappa.vercel.app. Production builds from `main` on
every push (Vercel GitHub integration).

## Add a film

1. Add an entry to `content/films.json` (copy one; every field is required,
   `runtime` and `still` may be `null`).
2. `no` is the catalog number: production order across all years. Take the
   next number after the current highest, never reuse or renumber.
3. If it won, add the same categories to `content/awards.json` and to the
   film's `awards` array (the build checks both agree).
4. `npm run stills` fetches its YouTube frame into `public/stills/`. No frame?
   Set `"still": null` and the slate leader renders instead.
5. `npm run check`, then `npm run build`.

Category names must match `CANONICAL_CATEGORIES` in `content/types.ts`.
Credits are `{ "role", "name" }` pairs in the order they should roll.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:3000 (Next allows one per project) |
| `npm run build` | Validates content, then `next build` |
| `npm run check` | Content validation (schema, cross-file, every still on disk), `tsc --noEmit`, ESLint |
| `npm run stills` | Writes `{slug}.webp` (1280x720) and `{slug}-sm.webp` (640x360) per film. Idempotent. `--treated` also writes the halftone renditions kept for the record |

## Where things are

- `app/styles/` is the design system, in the order it loads: `tokens.css`
  (the single source of truth: colours, surfaces, type, space, motion,
  depth), `base.css`, `chrome.css` (atmosphere, loader, curtain, header,
  rail, cursor), `components.css` (section heads, bands, media frames,
  stamps, sheen, badges, the credit roll, reveals), `sections.css`,
  `extras.css` (the slate card, seals, the pitch chooser), `responsive.css`.
- `lib/fx/` is the engine: `motion` (eases and durations mirrored from the
  tokens), `scroll` (one Lenis, one broadcast), `atmosphere`, `bands`,
  `chrome`, `cursor`, `curtain`, `deco`, `loader`, `media`, `reveals`,
  `scenes` (scroll choreography, one pin per page), `marks` (the doodle
  registry) and `boot` (one boot per route, torn down on navigation).
- `components/engine/` mounts the chrome and boots the engine per route;
  `components/lot/` are the homepage sections and the shared pieces
  (section head, band, media frame, stamp, badge, catalog number, seal
  labels); `components/film/` the film page's screen.
- `content/`: `films.json`, `awards.json`, the types and the validator.
- `public/assets/marks/`: the handstyle wordmarks (rasterised from marker
  faces), the rough-stroke SVG doodles and the hand-lettered word marks.
  `scripts/` holds the still pipeline and the content validator.
- `docs/APPS_SCRIPT_SETUP.md`: how to wire the pitch form to a Google Apps
  Script mail relay; until then the form points at Instagram.
- `DESIGN_NOTES.md` is the record of every direction, rejection and pass;
  `AUDIT.md` the diagnosis of an earlier build.

Dependencies beyond Next and React: `gsap` (scroll choreography, the
curtain, the bands), `lenis` (momentum scroll), `sharp` (the still pipeline).

## Content the club still needs to supply

Exec-board names (the end credits roll shows "Name to be supplied"), semester
dates, full crew credits per film, person-level award winners, a public
upload or a frame for At Last, the Gift, the 2026 slate, and a mail relay for
the pitch form.
