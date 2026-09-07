# SFA Website — Master Remediation Brief

**Drop this in the repo root. Read it completely before touching a file.**

You are the design lead and the engineering lead on a rebuild that already exists and is not good enough. The client's assessment is that the current build "looks like generic vibe-coded slop." Take that at face value. Your job is not to defend the existing code, it is to diagnose why that assessment is correct and fix it.

This brief has eight parts. Parts 1 through 4 are analysis and direction. Parts 5 through 8 are execution.

---

## PART 0 — Audit before you touch anything

Nobody has told you what specifically is wrong. Find out yourself.

1. Run the dev server. Screenshot every route at 1440px and at 375px. Look at the screenshots.
2. Read every stylesheet and count: how many distinct font sizes, how many distinct spacing values, how many distinct transition durations, how many distinct border radii, how many distinct colors are actually in use. Write the counts down.
3. Grep for hardcoded values: hex colors outside the token file, `ms` and `s` durations outside a motion module, `px` values that are not in a spacing scale.
4. Count animation entry points. How many separate `IntersectionObserver` instances, `scroll` listeners, and `transition` declarations exist?
5. Open `DESIGN_NOTES.md` if it exists. Read what the last pass claimed to do.

Write the findings into `AUDIT.md` at the repo root before you write a single line of new code. If the counts in step 2 are high and unsystematic, that is the actual disease and everything else is a symptom.

**Then compare your findings against Part 1.**

---

## PART 1 — What "vibe-coded slop" actually means

The phrase is not vague. Machine-generated frontend clusters around a specific and identifiable set of tells. Check the build against every one of these honestly.

### Typographic tells
- All-caps tracked-out eyebrow labels sitting above every heading
- One word in a headline accented in a different color or weight
- Meta strings joined with middle dots: `2025 · Studio · 18 min`
- A monospace face used for small data labels for no reason connected to the subject
- An arrow character appended to link and button text
- Labels built as `WORD — fragment`
- Only two or three font sizes doing all the work, so nothing has real hierarchy

### Layout tells
- Every piece of content chopped into identically sized rounded cards
- One border radius applied to everything regardless of hierarchy
- The same soft grey shadow, usually near `rgba(0,0,0,.1)`, under every surface
- Gradient washes used as decoration rather than as information
- Section after section of the same centered-heading-then-grid rhythm
- Equal padding on everything, so nothing reads as more or less important

### Motion tells
- Fade-and-slide-up entrance on every section, identical duration, identical distance
- Hover transitions on every card, identical everywhere
- Default `ease-in-out` at 150ms, which is the easing of a form control, not of a designed object
- Native scroll with no momentum
- Nothing orchestrated. Everything arrives independently and simultaneously.

### Color tells
- Near-black background (`#0B0B0B`, `#111`) with exactly one bright accent
- Cream near `#F4F1EA` as a background
- The accent used for everything: headings, buttons, borders, links, hovers, icons

**That last one is the trap this specific project is sitting in.** The palette was locked to near-black plus Carolina blue plus gold. That is structurally identical to the most common generated-design cluster. The palette cannot change. So differentiation has to be earned somewhere else, and Parts 2 through 4 are about where.

---

## PART 2 — The reference canon

These are real, current, and verified. Study what each one actually does, not what it vaguely feels like.

### A24 — `a24films.com`
A black field. Pure `#000000`, not a tinted near-black. Chrome reduced to almost nothing. Type set in NB International, a rigid grotesk, paired with its monospace subfamily. The identity was built by GrandArmy around deco typographic forms, aiming for something modern that nods to mid-century Hollywood.

**The lesson:** the restraint is the identity. A24's mark barely announces itself and the site follows suit. There is no decoration competing with the film titles. If you removed every ornament from the current SFA build and were left with nothing, that is a content problem, not a reason to add ornament back.

### MUBI — `mubi.com`
Three typefaces with clearly separated jobs: Tiempos Headline (serif, display), Riforma (grotesk, interface and body), and KCompress (compressed, for scale moments). The palette is neutral greys and white plus one saturated blue, `#001489`, used sparingly.

**The lesson, and it is the most directly transferable one:** MUBI proves a single saturated blue can carry an entire film brand without becoming a highlighter. Carolina blue occupies exactly that slot for SFA. Study how sparingly MUBI actually deploys `#001489` versus how liberally a generated build would deploy an accent.

Also: MUBI's film pages are *dense*. Awards, cast with photos, director, collections the film belongs to, the trailer, articles, reviews. A film page that is thin is a film page that has failed.

### The Criterion Collection — `criterion.com`
The site shell uses system fonts. The entire visual identity lives in the cover artwork and in one structural device: **the spine number.** Every release since 1984 carries a number. The number is not decoration, it is the assertion that these films constitute a canon worth counting.

**The lesson, and this is the single best idea available to steal:** SFA has produced roughly 30 to 40 films since 2020. Number them. Every film gets a catalog number in production order across all years, rendered in the same place, in the same treatment, on every card and every film page. `No. 031`.

This matters because it solves a real problem. The frontend-design discipline correctly warns that `01 / 02 / 03` markers are a generated-design tell *when the content is not actually a sequence*. A catalog of films produced in order **is** a sequence. Numbering it is not decoration, it is the truest available statement about what this club is: an organization with a body of work. It is also enormously flattering to the members, which serves the recruitment goal.

Do not number homepage sections. Number films.

### Sundance — `festival.sundance.org`
The 2023 Porto Rocha rebrand set the system in Monument Grotesk, chosen specifically because it makes an impact while staying neutral enough to sit under wildly different film genres.

**The lesson:** the type system must not have an opinion about the films. Twelve student films range from a silent dinner-party comedy to a prison simulation drama to a movie about wizards teaching discrete math. A display face with strong personality will fight most of them. Pick neutral and let the stills carry the tone.

### Cannes — `festival-cannes.com`
Each edition gets one piece of key art, usually a still from a canonical film, and that image carries the entire year's identity.

**The lesson:** each SFA cycle should have one key image. Pick the strongest treated still from the year and let it be the 2025 poster. It gives the archive a spine and it costs nothing.

### The Academy
Statuette gold against black, ceremonial serif, heavy negative space, the register of an engraved invitation rather than a web page.

**The lesson:** it is the register the awards page should reach for, and it is the *only* place on the site that should reach for it. Ceremony language everywhere becomes pompous. Ceremony language in one room becomes an event.

---

## PART 3 — The synthesis

Combine the above into a direction that is specific to this club and could not be reskinned into anything else.

### 3.1 The four moves that make this site not generic

Everything else is supporting structure. If these four are not unmistakably present in the final build, the work is not done.

**Move 1 — The catalog number.** Criterion's device, applied honestly. Every film carries `No. 0XX` in production order. It appears on the card, on the film page, and in the awards page winner rows. Set it in the same face and size everywhere. It is the most repeated element on the site and therefore the most identity-carrying.

**Move 2 — The dither system.** Already specified in the original design doc and it remains the visual signature. Every film still is posterized and dithered into Carolina blue and near-black at rest, resolving to the untreated frame on hover and on focus. This is what makes 30 inconsistent YouTube thumbnails read as one designed object. If the current build skipped this or implemented it as a CSS filter, that is likely the largest single reason it looks cheap. Do it at build time with `sharp`, inspect all outputs by eye, and commit the results.

**Move 3 — The end-credit block.** Role right-aligned, name left-aligned, meeting at a center gutter, condensed sans, tight leading, hairline rule. Used for the exec board and at the bottom of every film page. This is the detail that tells a film student the site was made by someone who has sat through credits.

**Move 4 — Gold as a data type.** Gold appears if and only if something won. Not headings, not buttons, not borders, not hovers, not the logo. Enforce it: `gold` should be referenced in exactly one component in the entire codebase. If a second place needs it, that is a signal to reconsider, not to add a class.

### 3.2 Type system

Neutral grotesk for interface and body, per the Sundance lesson. One display voice. One condensed face for credits and catalog numbers.

Google Fonts only. Candidates worth testing, not instructions: **Archivo** or **Public Sans** as the neutral grotesk; **Archivo Narrow**, **Barlow Condensed**, or **Oswald** for credits and numbers; and for display either a second weight of the grotesk set very large (the A24 approach, more restrained) or **Instrument Serif** / **Bodoni Moda** for a ceremonial register (the Academy approach, more risk).

Build both display directions, screenshot both, pick one, document the rejection. Do not ship the first one you try.

Set a real fluid scale with `clamp()` across at least eight steps. If the current build has three font sizes, that alone reads as unfinished regardless of which faces are used.

### 3.3 Where UNC lives

Not in a logo. Carolina blue *is* the UNC flair, and it earns its place by being the duotone highlight in every single film still, which means the university's color is physically inside the artwork rather than pasted next to it. That is a much better use of it than a ram in the header.

Resist: Rameses, the Old Well, "GDTBATH," script wordmarks, anything that would appear on a t-shirt at the student store. The club is a film organization that happens to be at UNC, not a UNC organization that happens to make films.

---

## PART 4 — Engineering discipline to port

The client wrote a separate project at `github.com/markandeyay/stussy` that reads as expensive. It is not expensive because of taste. It is expensive because of the following, and every one of these is portable to this codebase.

### 4.1 A token file with teeth

One file, declared as the single source of truth, with an explicit rule at the top: nothing below this file may invent a color, size, or easing. It should define:

- The six palette tokens, plus surface-role variables (`--surface`, `--on-surface`, `--rule`, `--accent`) so a section sets one class and every child recolors without a modifier
- A fluid type scale, at least eight steps
- A spacing scale, powers-based, no arbitrary values elsewhere
- Exactly four easings and five durations

Then enforce it. A grep for hex colors outside that file should return nothing.

### 4.2 Mirrored easings across CSS and JS

If any JavaScript animation library is in use, its easing constants must map one-to-one onto the CSS custom properties. A CSS transition and a JS tween landing on slightly different curves is one of the most common reasons a site feels subtly cheap without anyone being able to name why.

### 4.3 Smooth scroll

Momentum scrolling is perhaps the largest single perceived-quality lever available and it is roughly fifteen lines. Add Lenis with a duration near 1.05 and an expo-style ease.

**Non-negotiable:** under `prefers-reduced-motion`, smooth-scroll hijacking must be switched off entirely and replaced with a native scroll listener. Smooth scroll is exactly the kind of thing that preference exists to disable.

### 4.4 One scroll handler

Whatever reads scroll position (header state, parallax, marquee rate) subscribes to a single broadcast rather than attaching its own listener. The page should have one scroll handler regardless of how many features read it.

### 4.5 Reveals as CSS transitions, not tweens

Split headline text into per-glyph spans, set a stagger via a custom property, and let an `IntersectionObserver` flip one class. The compositor does the animation and zero JavaScript runs during it. Add a settled class afterward to release the layers.

### 4.6 Engineered irregularity

**This is the thesis of the entire brief.** Uniformity is what reads as machine-made. In the reference project, irregularity is deliberately manufactured in at least four independent places: per-glyph rotation of about a degree and baseline offset of a couple hundredths of an em on split text; weighted-random widths pulled from a shuffled bag so stripe rhythm is uneven; per-element random easings and 0 to 150ms delays so leading edges are ragged rather than diagonal; and jittered grid placement so scattered elements never land at tidy intervals.

Apply the same thinking here. Candidates:
- Catalog numbers and award badges sit slightly off-true, under a degree
- Film card reveal durations vary within a narrow band rather than being identical
- The dither pattern's phase offsets per image so no two stills share a grain alignment
- Award rows on the ceremony page settle with slightly staggered, slightly varied timing

Keep every deviation small enough to register as character rather than as a bug.

### 4.7 Failure and preference safety

- Hidden-by-default states get set in JavaScript, never in CSS, so a JS failure leaves a fully readable page rather than a blank one
- A `-no-motion` class on the root is the contract: under reduced motion, CSS forces every reveal into its settled state so nothing can be left invisible because a tween never ran
- Effects that only make sense with a mouse are built only under `(hover: hover) and (pointer: fine)`, not built and then hidden
- Off-screen loops pause via `IntersectionObserver`

### 4.8 What NOT to port

The reference project also contains a custom lagging cursor, a full-screen gooey curtain transition, a three-depth atmosphere layer of drifting marks, and a mascot that breathes. **Do not port any of these.**

They belong to a streetwear fiction where decoration is the product. This site's job is crediting real student work. A gooey stripe wipe between an awards page and a film page is decoration competing with content, and on a page listing real people's achievements it reads as unserious.

Spend the motion budget in one place. The dither reveal is that place.

---

## PART 5 — Subagent plan

Run these in the stated order. The dependency structure matters more than the parallelism.

### Wave 1 — parallel, no dependencies

**Agent A: Auditor.** Executes Part 0 in full and writes `AUDIT.md`. Produces the count tables and the tell-by-tell assessment against Part 1. Makes no code changes. Everything else waits on this.

**Agent B: Image pipeline.** Owns `scripts/process-stills.ts` end to end. Fetches YouTube thumbnails, handles the `maxresdefault` to `hqdefault` fallback, caches raw downloads so the script is idempotent while the algorithm is tuned, and implements the duotone dither. Compares at least three approaches (ordered Bayer, Floyd-Steinberg error diffusion, hard posterize with a halftone screen), produces a contact sheet of all outputs for each, and picks one with written reasoning. Fully independent of layout.

**Agent C: Content integrity.** Verifies `films.json` and `awards.json` against the seed data in the original design doc. Assigns catalog numbers in production order. Normalizes award category naming. Adds TypeScript types and build-time validation so a malformed content file fails the build loudly.

### Wave 2 — serial, single point of view

**Design system.** One agent, not several. Writes the token file, the type scale, and the four core components (`FilmCard`, `CreditBlock`, `AwardBadge`, `CatalogNumber`). Builds both display-type directions from 3.2, screenshots both, picks one, documents the rejection.

Do not parallelize this. A design system split across agents produces two visual languages wearing the same tokens.

Commit and push before Wave 3 begins.

### Wave 3 — parallel, against the frozen system

**Agent D: Homepage.** Hero (build two concepts, compare, document the rejection), current-cycle section, catalog strip, awards teaser, how-it-works, crew, join.

**Agent E: Film page and awards page.** These two share the most components and reasoning, so one agent should hold both. The awards page is the hardest surface on the site and deserves the most iteration.

**Agent F: Motion.** Ports 4.1 through 4.7. Owns the scroll broadcast, the reveal system, and the reduced-motion paths. Works across both route agents' output rather than owning a route.

### Wave 4 — serial

**Agent G: Audit and remediation.** Accessibility, responsive, and performance sweep. Produces a findings list. Findings get fixed by whoever owns the surface, not by the auditor.

**Final pass.** One agent, whole site, Chanel's rule: look at every page and remove one thing.

---

## PART 6 — Iteration protocol

You have a computer. A page you have never looked at is not finished.

For each route:
1. Render it. Screenshot at 1440px and 375px.
2. Look at the screenshots. Write down three specific things that are wrong. Not "could be better," specific.
3. Fix them.
4. Repeat.

**Three passes minimum per route. Five on the awards page.**

After every pass, ask the Part 1 question directly: *would I have produced this same element for a completely unrelated brief?* If yes, it is a default rather than a choice. Change it and record what changed in `DESIGN_NOTES.md`.

Deploy a preview build as soon as all three routes render, so production build differences surface on pass two rather than on the last day.

---

## PART 7 — Definition of done

**The four moves**
- [ ] Catalog numbers on every film, in production order, consistently placed
- [ ] Build-time dither pipeline, all stills inspected by eye, committed
- [ ] Credit block used on the film page and for the exec board
- [ ] `gold` referenced in exactly one component in the entire codebase

**System**
- [ ] Token file exists and a grep for hex colors outside it returns nothing
- [ ] At least eight fluid type steps in active use
- [ ] Exactly four easings and five durations defined and used
- [ ] Smooth scroll, with a native fallback under reduced motion
- [ ] One scroll handler for the whole page

**Against Part 1**
- [ ] Zero all-caps tracked-out eyebrow labels
- [ ] Zero middle-dot meta strings
- [ ] Zero arrows appended to link text
- [ ] Not every section uses the same entrance
- [ ] Not every surface shares one border radius and one shadow
- [ ] Engineered irregularity present in at least two places

**Quality floor**
- [ ] Every route correct at 375px, no horizontal scroll at 320px
- [ ] Keyboard navigable with visible focus, image reveal triggers on focus not only hover
- [ ] Reduced-motion path implemented and tested
- [ ] No text over dither without a scrim
- [ ] Build clean, no type errors, no console errors
- [ ] Deployed and loading on a cold visit

**Documentation**
- [ ] `AUDIT.md` written before any changes
- [ ] `DESIGN_NOTES.md` records every rejected direction and why
- [ ] `README.md` explains how to add a film in under ten lines

---

## PART 8 — Standing rules

- **Do not generate images.** No hero plates, no textures, no posters, no faces. This site is a record of real work by real students; a synthetic still attached to a real film is a false claim about someone's work, published where that work is supposed to be credited. The audience is film students, which is the least forgiving possible audience for it. Grain, scan lines, and letterbox bars produced in CSS or SVG are not images and are fine.
- **Do not invent names.** No plausible-looking fake exec board members, no fake actors on award rows. Missing content gets a designed empty state, not fiction.
- **Do not add a dependency without justifying it in `DESIGN_NOTES.md`.** The client maintains this after you leave.
- **Do not relitigate the palette.** It is locked. Differentiate through the four moves.
- **Deploy unattended.** `VERCEL_TOKEN` is in the environment. Use `vercel --token=$VERCEL_TOKEN`. Do not run `vercel login`, do not open a browser, do not ask for credentials.
- **Interrupt the client only** for a genuine contradiction in this brief or a blocked deploy. Everything else: decide, build, document the reasoning, keep moving.

---

## The one-line test

When it is finished, ask: could this site be reskinned into a crypto landing page by swapping the copy?

If yes, it failed. If the catalog numbers, the dithered stills, the credit blocks, and the gold-only-for-winners rule make that impossible, it worked.
