# AUDIT — the build on `main` as of 2026-09-07, before any code change

Written against commit `98654b0` (the "A24 register recolored for UNC" direction of 2026-09-04) per `REMEDIATION_BRIEF.md` Part 0, before a single line of new code. Screenshots referenced were taken with Playwright driving installed Chrome at 1440×900 and 375×812 (`shots/baseline/*`, session scratchpad).

## 0. What the screenshots show

**`/` at 1440.** White page. Three-part nav (FILMS / AWARDS 2025, "SFA" centred, JOIN) in 12px uppercase tracked Inter. A full-bleed FDOC frame with six film titles stacked bottom-left in Inter Tight over a navy-to-transparent scrim, each with a superscript year; "FDOC / DIRECTED BY KELLER HUFFMAN" in uppercase bottom-right. Then a repeating block: a grey `#F2F4F6` panel with a still inside, beside a column of uppercase eyebrow, large headline, and a long thin arrow followed by an uppercase label ("→ SEE THE CEREMONY"). Then "2025 films": a 3-across grid of twelve stills shown as shot, each with an uppercase comma-joined meta line ("KELLER HUFFMAN, 7 AWARDS") and a title. The grid is visually chaotic: a red "SLAM!" title card, a purple 2:3 poster on black (Discrete Magematics), a script-font title card (The Tulips), a black-and-white frame with a baked-in festival laurel (Silenced), and a grey "NO FRAME AVAILABLE" box. Then the same panel-plus-column block twice more (how it works, join), a "Name to be supplied" list, and a navy footer.

**`/` at 375.** Same in one column. The hero title list covers the face in the frame. Every section is the same stack: eyebrow, headline, panel, arrow link. The page is 10,376px tall.

**`/films/fdoc`.** Eyebrow "2025 SLATE, DIRECTED BY KELLER HUFFMAN", title, logline, the frame with a square "▶ PLAY THE FILM" label, then "Awards" as a list of uppercase Carolina labels, "Credits" as label/headline rows on thin rules, then previous/next. Thin: the page is three short lists.

**`/awards/2025`.** Eyebrow "THE CEREMONY", "2025 awards" at display size, a lede, a rule, a grey panel with the FDOC still, and "Wins by film" as a tally. Then fifteen rows of uppercase Carolina category label and navy title. It is a list. Nothing on the page says ceremony except the word.

Reduced-motion and hover/focus captures: the only hover effect is a 2% scale on cards and colour changes on links; under reduced motion the scale is disabled. Focus rings are 2px Carolina. No console errors on any route.

## 1. Counts (Part 0, step 2)

Scope: `app/globals.css`, `app/**/*.tsx`, `components/**/*.tsx`, `lib/*.ts`. `app/globals.css` is the only stylesheet (`@theme` block plus a `@layer components` block, 221 lines).

| Dimension | Distinct values | The values |
|---|---|---|
| Font sizes (tokens) | 8 | `display-xl` clamp(3.25rem, 8vw, 7.5rem), `display-lg` clamp(2.75rem, 5.5vw, 5.25rem), `display-md` clamp(2rem, 3.6vw, 3.25rem), `display-sm` clamp(1.375rem, 2vw, 1.75rem), `body-lg` 1.125rem, `body` 1rem, `credit` 0.9375rem, `label` 0.75rem |
| Font sizes in use (utility counts) | 8, but 3 do most of the work | `text-display-sm` ×11, `text-display-md` ×9, `text-body-lg` ×9, `text-display-lg` ×5, `text-label` ×5, `text-display-xl` ×3, `text-credit` ×2, `text-body` ×2. Below display size the scale is static (no `clamp()`), so at 375 body, lede, credit and label are the same sizes as at 1440. |
| Spacing values in use | 14 numeric steps plus 3 `clamp()` values | Tailwind steps used: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 40 (× 0.25rem). Tailwind 4's open multiplier is enabled, so any integer is a valid step and nothing stops a fifteenth. CSS: `.wrap` padding clamp(1rem, 3vw, 2.75rem), `.panel` padding clamp(1.5rem, 6vw, 5rem), credit-block row-gap 1rem. Section padding is `py-28` ×6, `py-20` ×6, `py-24` ×4, `py-16` ×5: four values for the same job with no hierarchy behind the choice. |
| Transition durations | 3, none tokenised | Tailwind default 150ms (bare `transition` ×14, `transition-transform` ×2, `transition-opacity` ×1), `duration-500` ×3 (card hover scale), `200ms` (arrow-link, `globals.css:156`) |
| Easings | 3, none tokenised | Tailwind default `cubic-bezier(0.4, 0, 0.2, 1)` on 17 transitions, `ease-out` ×2, `ease` (arrow-link) |
| Border radii | 1 | 0 everywhere (`--radius-*: initial`, `--radius-none`, `--radius-full` defined but unused) |
| Shadows | 0 | `--shadow-*: initial` |
| Colours (tokens) | 8 tokens, 6 hex values | `white`/`paper` #ffffff, `panel` #f2f4f6, `rule` #dfe4e9, `ink`/`navy` #13294b, `muted` #6b7a8c, `carolina` #4b9cd3. Two aliases duplicate values. Plus the hero scrim, a navy→transparent gradient. |
| Colours in use | 6 | `text-ink` ×26, `text-white` ×17, `text-carolina` ×11, `bg-paper`, `bg-panel`, `bg-navy`, `.muted` |
| Font families | 2 | Inter Tight (display), Inter (everything else) |

## 2. Hardcoded values (Part 0, step 3)

| Grep | Hits |
|---|---|
| Hex colours outside `app/globals.css` | 0 |
| `ms`/`s` durations outside a motion module | 1: `app/globals.css:156` `transition: transform 200ms ease` (there is no motion module) |
| Tailwind arbitrary values `[…]` | 3: `grid-cols-[1fr_auto_1fr]` (SiteNav), `scale-[1.02]` (FilmCard), `max-w-[…]` in the hero |
| `px` values outside the token file | `outline: 2px`, `text-decoration-thickness: 1px`, `border-top: 1px`, the arrow SVG stroke 1.25 (all in `globals.css` or SVG attributes) |

The token file is clean. Cleanliness is not the problem.

## 3. Animation entry points (Part 0, step 4)

| Kind | Count | Where |
|---|---|---|
| `IntersectionObserver` | 0 | — |
| `scroll` listeners | 0 | — |
| `@keyframes` | 0 | — |
| `requestAnimationFrame` | 0 | — |
| `transition` declarations | 18 | 14 bare `transition` (nav links, buttons, links, badges), 2 `transition-transform` (FilmCard hover scale, VideoEmbed), 1 `transition-opacity`, 1 CSS (arrow-link) |

Eighteen independent transitions, seventeen of them at the framework default of 150ms `ease-in-out`-ish, zero orchestration, native scroll. No entrance animation anywhere (which is at least not the fade-slide-up tell), so the motion story is: nothing designed happens.

## 4. What `DESIGN_NOTES.md` section 7 claimed vs what is in the code

Claimed: mirror A24's grammar (full-bleed still with title list, white sections, grey image panels, eyebrow + headline + long arrow, 3-across grid, dark footer, one grotesque at two scales), recoloured navy/Carolina, "no decoration". Delivered: exactly that. The notes are honest. The first-direction pipeline (Bayer 8×8 dither, `-treated` files) was kept in the repo but switched off ("stills are now shown as shot"); the gold rule and its build check were removed; the credit block was flattened into label/headline rows; Bodoni Moda was replaced by Inter Tight. Section 7.3 lists all four removals. So the build is a faithful port of a grammar, and the grammar without A24's content (posters, trailers, a hundred films) is the template.

## 5. Tell-by-tell against Part 1

| Tell | Verdict | Evidence |
|---|---|---|
| All-caps tracked-out eyebrow above every heading | **PRESENT** | `.eyebrow` and `.label` (uppercase, 0.06em tracking, 12px) in `globals.css:90–108`; used in `SectionHeading.tsx`, `FilmCard.tsx:35`, `FilmHeader`, awards header ("THE CEREMONY"), NowShowing, HowItWorks, Crew, Join, footer |
| One word in a headline accented | absent | — |
| Meta strings joined with middle dots | **PARTIAL** | Same device with a comma: `FilmCard.tsx:17–22` builds `"KELLER HUFFMAN, 7 AWARDS"`, and `FilmHeader` builds `"2025 SLATE, DIRECTED BY KELLER HUFFMAN"` |
| Monospace for data labels | absent | — |
| Arrow appended to link/button text | **PRESENT** | `components/ArrowLink.tsx`: a 52px SVG arrow before an uppercase label, used for every section action on every route |
| `WORD — fragment` labels | absent | — |
| Two or three font sizes doing all the work | **PARTIAL** | 8 tokens exist; `display-sm`, `display-md`, `body-lg` carry 29 of 46 uses; nothing between 1.125rem and clamp(1.375…) and nothing fluid below display |
| Identically sized rounded cards | **PARTIAL** | Radius 0, but the catalog is twelve identical 16:9 cards with an identical caption, and the four feature blocks are the same panel+column module |
| One border radius on everything | n/a | 0 everywhere, by design (frames) |
| Same soft grey shadow under every surface | absent | none |
| Gradient washes as decoration | absent | one scrim, informational |
| Section after section of the same rhythm | **PRESENT** | Awards teaser, how it works, join: grey panel with still + column of eyebrow/headline/arrow. Left-aligned rather than centred, but the same module four times |
| Equal padding so nothing reads as more important | **PRESENT** | `py-28`/`py-24`/`py-20` on every section with no rule for which gets which; the hero and the awards finale get the same air as "how it works" |
| Fade-and-slide-up on every section | absent | no entrance animation at all |
| Identical hover transition on every card | **PRESENT** | `FilmCard.tsx:32` `transition-transform duration-500 ease-out group-hover:scale-[1.02]` on all twelve; every link `transition` + `hover:text-carolina` |
| Default `ease-in-out` at 150ms | **PRESENT** | 17 of 18 transitions use Tailwind's default duration and curve |
| Native scroll with no momentum | **PRESENT** | no smooth scroll |
| Nothing orchestrated | **PRESENT** | zero observers, zero sequencing |
| Near-black + one bright accent | absent | white ground; replaced by the equally common "white + navy + one blue + Inter" SaaS cluster |
| Cream near #F4F1EA | absent | — |
| Accent used for everything | **PRESENT** | Carolina on eyebrows (`text-carolina` ×11), every hover, link underline, selection, focus ring, award labels, arrow-link hover, the video label hover |

Additional tells not on the list:
- **Inter Tight + Inter.** The machine-default pairing; the previous notes (section 1.2) rejected it for exactly that reason before the second direction reinstated it.
- **Stills shown as shot.** The single largest visual failure. Twelve thumbnails from mixed equipment, a poster, two title cards and a laurel, in one grid, read as a YouTube playlist. The build-time dither pipeline exists in the repo and was switched off.
- **The four moves are all absent.** No catalog numbers. No dither. No end-credit block (the roles are eyebrow/headline rows). No gold; awards are Carolina labels, so a win and a hover state are the same colour.
- **Awards page is a list.** Fifteen identical rows. The tally is the only structural idea and it is a table.

## 6. Diagnosis

The counts are **not** high and unsystematic. Eight type tokens, six colours, no stray hex, one radius: the token file is tidy. The disease is **systematic but generic**: the system reproduces a borrowed grammar (eyebrow, headline, long arrow, grey panel, grotesk) that, detached from A24's content, is the template every generated marketing page converges on, with the palette swapped for the equally common white/navy/blue/Inter cluster. Nothing on any route is specific to a film club: no numbers, no credits, no treatment on the frames, no scarcity to the accent. And the motion layer is eighteen framework-default transitions and native scroll, which is the feel of a form.

Secondary, but real: spacing is fourteen values from an open multiplier with no hierarchy; durations and easings are untokenised framework defaults; the type scale is static below display size.

## 7. The ten most consequential fixes, ranked

1. **Turn the dither back on and serve it** (Move 2). Halftone treatment on every still at rest, real frame on hover and focus. Fixes the grid, the hero, the facade and the finale at once and puts Carolina inside the artwork instead of on the labels.
2. **Catalog numbers** (Move 1). `No. 001` on every card, film page and winner row, same face and place everywhere.
3. **Delete the eyebrow and the arrow link.** Replace with headings that stand alone and buttons that are verbs.
4. **Type system.** Archivo (neutral grotesk; its width axis gives the condensed voice for credits and numbers), a nine-step fluid scale, one display voice chosen from two built directions.
5. **The end-credit block** (Move 3). Role right, name left, centre gutter, condensed, hairline rule; on the film page and for the exec board.
6. **Gold as a data type** (Move 4). Reinstate the locked palette; `gold` in one component; the awards page becomes the goldest page and nothing else has any.
7. **Token file with teeth.** Six colours plus role variables, four easings, five durations, a closed spacing scale (Tailwind's multiplier disabled), enforced by a check script.
8. **Motion.** Lenis with a reduced-motion native fallback, one scroll broadcast, CSS-transition reveals with per-glyph stagger, `-no-motion` contract; delete the hover scale and the seventeen default transitions.
9. **Hierarchy through unequal space and different section shapes.** Hero and finale get more air than "how it works"; not every section is panel-plus-column.
10. **Engineered irregularity.** Numbers and badges off-true under a degree, card reveal timing varied, dither phase per image (done in the pipeline), award rows settling on varied timing.
