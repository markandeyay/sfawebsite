# UNC Student Film Association

The club's site as a screening room. Every device is borrowed from film's
physical life: an Academy countdown leader, an iris and a clapperboard
between routes, a camera HUD with a running timecode and a frame counter,
a title card with letterbox bars, screenplay sluglines for section heads,
strips of 35 mm as the tapes between sections, every still in sprocket-railed
film chrome with edge print, laurels for the awards, a call sheet, a credit
crawl, a script page for the pitch form and THE END over a strip of
perforations. Big Shoulders Display and Courier Prime on paper and ink, with
Carolina blue and REC red. The motion engine (GSAP + Lenis: smooth scroll,
one pinned reel, split-letter reveals, tapes that react to scroll speed, a
three-depth atmosphere of screenplay lines and edge codes) is the one from the
client's stussy.ink, kept and refitted. Every film carries a catalog number.
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
  depth), `base.css`, `chrome.css` (atmosphere, the leader, the iris, the HUD
  header, the rail, the cursor), `components.css` (sluglines, strips, film
  frames, laurels, the reel badge, the credit roll, reveals),
  `sections.css`, `extras.css` (the slate card, the call sheet, the script
  page, the pitch chooser), `responsive.css`.
- `lib/fx/` is the engine: `motion` (eases and durations mirrored from the
  tokens), `scroll` (one Lenis, one broadcast), `atmosphere`, `bands`,
  `chrome` (timecode, frame counter, cue mark), `cursor`, `curtain` (the
  iris), `deco`, `loader` (the countdown), `reveals`, `scenes` (scroll
  choreography, one pin per page), `marks` (the doodle registry) and `boot`
  (one boot per route, torn down on navigation).
- `components/engine/` mounts the chrome and boots the engine per route;
  `components/lot/` are the homepage sections (the screen, the slate, awards
  night, the call sheet, the crew and the crawl, the pitch, THE END) and
  the shared pieces (script-page head, strip, film frame, laurel
  (`Stamp.tsx`), can label (`Badge.tsx`), catalog number, laurel labels);
  `components/film/` the film page's screen with its ticket.
- `content/`: `films.json`, `awards.json`, the types and the validator.
- `public/assets/marks/`: the rough-stroke SVG doodles (strips of film, a
  reel, a clapper, a chair, a spot, a ticket, a star) and the hand-lettered
  word marks used in the atmosphere.
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
