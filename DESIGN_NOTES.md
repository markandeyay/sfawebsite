# Design notes — UNC Student Film Association rebuild

Working log for the three-route demo. Two readers: me on later passes, and the
client, who has to defend these choices to the club president. Every decision
below says what was tried, what was rejected, and why.

Section numbers in brackets refer to `SFA_SYSTEM_DESIGN.md`.

---

## 1. Design plan (written before any component code) [14.1]

### 1.1 Token system

Palette is locked [5.1]. What is mine is everything around it: how the six
colors are allowed to be used, the type scale, spacing, and radii.

**Color roles**

| Token | Hex | Allowed uses | Forbidden uses |
|---|---|---|---|
| `base` | `#0B0D0F` | Page background. The dark tone in every dithered still. Text on cream buttons. | — |
| `surface` | `#14181C` | Nav, cards, the video facade backing, form fields, footer. | Never as a "section band" alternating with base; that is the striped-landing-page look. |
| `carolina` | `#4B9CD3` | The light tone in every dithered still. Links, focus rings, the play affordance, active nav item, the projector spill glow in the hero. | Headings. Large filled areas other than stills. |
| `deep` | `#2A5C7D` | 1px borders and rules. Optional third dither tone. Disabled states. | Text on base, ever [5.1]. |
| `gold` | `#D4AF37` | `AwardBadge` only. | Everything else. Enforced by `scripts/check-gold.mjs`, which fails the build if the string `gold` appears in any component or page other than `components/AwardBadge.tsx`. |
| `cream` | `#EDE9E1` | All text. Primary button fill. The wordmark. | — |

Secondary text is cream at 62% opacity over base, which lands around 6.4:1
contrast. There is no separate "muted grey" token; adding one is how dark
sites drift into six greys.

**Type scale** (hand-set, not Tailwind's default steps)

| Name | Size | Leading | Tracking | Face | Where |
|---|---|---|---|---|---|
| `display-xl` | clamp(3rem, 9vw, 8rem) | 0.92 | -0.025em | Bodoni Moda 600 | Wordmark in the hero |
| `display-lg` | clamp(2.5rem, 6vw, 5rem) | 0.95 | -0.02em | Bodoni Moda 600 | Film title on the film page, ceremony title |
| `display-md` | clamp(1.75rem, 3vw, 2.5rem) | 1.05 | -0.01em | Bodoni Moda 500 | Section headings, Best Picture |
| `display-sm` | 1.375rem | 1.15 | 0 | Bodoni Moda 500 | Card titles, winner film titles in award rows |
| `body-lg` | 1.125rem | 1.5 | 0 | Archivo 400 | Loglines, the one-paragraph "what we do" |
| `body` | 1rem | 1.6 | 0 | Archivo 400 | Everything else, max 62ch |
| `credit` | 0.9375rem | 1.2 | 0.06em on roles | Archivo, width 70 | Credit block, award category names, card captions |
| `label` | 0.8125rem | 1.2 | 0.04em | Archivo, width 80 | Nav, buttons, footer |

**Spacing.** An 8px base with a deliberately short list: 4, 8, 12, 16, 24, 32,
48, 64, 96, 144. Section gaps are 96 on desktop and 64 on mobile, never more.
Generous white space on a dark site reads as empty, not luxurious.

**Radius.** Zero. Film frames, credit rolls, and award envelopes are all
rectangles. The only rounded shape on the site is the circular play button.
This is one of the cheapest ways to not look like a card-grid template.

**Borders and rules.** 1px `deep`. Rules separate credit-block sections and
award rows. No shadows anywhere; there is no light source above the page to
cast them.

### 1.2 The two typefaces

**Display: Bodoni Moda** (variable, weights 400–900, optical size axis, real
italics). Didone serifs are the type of prestige-drama posters and awards
season. Set at 600 with tight tracking on a near-black ground, the club name
becomes a masthead, which matters because there is no wordmark [8.5]. Film
titles in running text get the italic, which is how titles are set in print.

Rejected for display:
- *Instrument Serif*. It is the first serif I would reach for on any dark
  editorial brief, which is exactly the 5.6 problem. It is also everywhere
  right now.
- *Fraunces*. Warm and wonky; reads as a bakery or an indie software brand,
  not a dark room.
- *Cinzel* (the Trajan clone). The actual movie-poster serif, and for that
  reason a cliché that reads as a fantasy epic or a wedding.
- *Anton / Bebas / Oswald* as display. Impact-style condensed uppercase reads
  as a trailer, a sports team, or a meme, and it would leave nowhere for the
  credit block's condensed sans to be distinct.

**Credits and body: Archivo** (variable, weight and *width* axes). One family
does two jobs by width. At width 70 it is a condensed grotesque with the
proportions of an end-credit roll; at width 100 it is a plain, slightly
mechanical body face that suits copy written in a first-year's terms. Using
one variable family for both means one font file and one voice, and it keeps
the site inside the two-family limit while still having a distinct credits
setting [5.3].

Rejected for credits/body:
- *Inter / Inter Tight*. The machine default for body text; would make the
  site reskinnable into a SaaS page by swapping copy.
- *Barlow Condensed + Barlow*. A perfectly good pairing but two Google
  families for what Archivo's width axis does in one.
- *Oswald*. The most-used condensed face on the web; reads as a template.

### 1.3 Route wireframes

Legend: `[img]` is a 16:9 dithered still with hover/focus reveal. `▣` is an
`AwardBadge` (the only gold). Desktop first, then the 375px stack noted.

**`/` Homepage**

```
┌──────────────────────────────────────────────────────────────────────┐
│ Student Film Association          Films   Awards 2025   Join         │  nav, surface
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              ┌────────────────────────────────────┐                  │  00 Cold open
│      spill   │                                    │   spill          │  the "lit screen":
│      glow    │        [img]  hero still           │   glow           │  a 16:9 screen in a
│              │        (letterboxed)               │                  │  dark room, carolina
│              └────────────────────────────────────┘                  │  light spilling out
│                                                                      │
│   Student Film                                                       │  display-xl
│   Association                                                        │  (the wordmark)
│   Students at UNC pitch, shoot, and screen films.   [ See the films ]│  one CTA
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ Now showing                                                          │  01
│ Pitches for the next slate open this fall.   Dates: to be posted     │  placeholder, obvious
│ [ Message the club on Instagram ]                                    │
├──────────────────────────────────────────────────────────────────────┤
│ The 2025 slate                                                       │  02 catalog strip
│ ┌[img]────┐ ┌[img]────┐ ┌[img]────┐                                  │  6 frames, 3×2
│ │FDOC     │ │Silenced │ │Senior…  │   caption: title left,           │  captions set like
│ └─────────┘ └─────────┘ └─────────┘   director right, credit style   │  a credit line
│ ┌[img]────┐ ┌[img]────┐ ┌[img]────┐                                  │
│ └─────────┘ └─────────┘ └─────────┘                                  │
│ Also on the slate: How Does It Feel?, Spaghetti and Me, …  (links)   │  the other six, text
├──────────────────────────────────────────────────────────────────────┤
│ The 2025 awards                                                      │  03 first gold
│ Fifteen categories. One film took seven.                             │
│ ▣ Best Picture  FDOC          ▣ Best Director  FDOC   …(top 3–4)     │
│ [ See the whole ceremony ]                                           │
├──────────────────────────────────────────────────────────────────────┤
│ How a film gets made here                                            │  04 numbered: a
│ 1 Pitch     2 Review     3 Crew up     4 Shoot     5 Festival        │  real sequence
│ (two tracks explained in plain words under the steps)                │
├──────────────────────────────────────────────────────────────────────┤
│ The crew                                                             │  05 credit block
│            President   Name to be supplied                           │  role right-aligned,
│       Vice president   Name to be supplied                           │  name left-aligned,
│            Treasurer   Name to be supplied                           │  center gutter
├──────────────────────────────────────────────────────────────────────┤
│ Join                                                                 │  06
│ No experience needed. [ Message the club on Instagram ]              │
│ footer: Instagram  YouTube  LinkedIn  Bylaws  Older club reel        │
└──────────────────────────────────────────────────────────────────────┘
```

At 375px: nav collapses to wordmark + two links; hero screen goes full-width
with the spill glow above and below it; wordmark drops to ~3rem on two lines;
catalog strip becomes a single column; how-it-works steps stack; the credit
block stacks role over name [5.4].

**`/films/fdoc` Film page**

```
┌──────────────────────────────────────────────────────────────────────┐
│ nav                                                                  │
├──────────────────────────────────────────────────────────────────────┤
│ FDOC                                        2025 slate               │  display-lg;
│                                             Directed by Keller Huffman│ meta as prose,
│ Follow a case of beer as it switches hands…                          │  no dot-joined string
│                                                                      │
│ ┌──────────────────────────────────────────────────────────┐         │  video facade:
│ │                                                          │         │  treated still +
│ │                     [img]   (▶)                          │         │  play button;
│ │                                                          │         │  iframe on click
│ └──────────────────────────────────────────────────────────┘         │
├──────────────────────────────────────────────────────────────────────┤
│ Winner of seven awards at the 2025 ceremony                          │  award stack:
│  ▣ Best Picture   ▣ Best Director   ▣ Best Screenplay   ▣ Best Editing│ poster-style
│  ▣ Best Cinematography   ▣ Best Sound Design   ▣ Best Set Design     │  laurel row, wraps
├──────────────────────────────────────────────────────────────────────┤
│ Credits                                                              │  credit block
│                 Directed by   Keller Huffman                         │
│ ┌──────────────────────────────────────────────────────────┐         │  empty state inside
│ │ The rest of this crew is uncredited. FDOC won for        │         │  the block: the
│ │ editing, cinematography, sound design and set design,    │         │  pitch argument
│ │ so at least four more names belong here. Send the full   │         │
│ │ credits and they appear in this block.                   │         │
│ └──────────────────────────────────────────────────────────┘         │
├──────────────────────────────────────────────────────────────────────┤
│ ◀ Discrete Magematics                          Silenced ▶            │  adjacent films,
│   [img small]                                  [img small]           │  wraps around
└──────────────────────────────────────────────────────────────────────┘
```

At 375px: title full width, meta under it, facade full-bleed, badges two per
row, credit block stacked, adjacent films stacked.

**`/awards/2025` Ceremony page**

```
┌──────────────────────────────────────────────────────────────────────┐
│ nav                                                                  │
├──────────────────────────────────────────────────────────────────────┤
│ The 2025 ceremony                                                    │  display-lg
│ May 2025. Fifteen categories, five films, one sweep.                 │
│                                                                      │
│   FDOC                          7                                    │  tally: Bodoni
│   Silenced                      3                                    │  numerals, the
│   Senior Assassin               3                                    │  night's headline
│   A Newby Cupid's Guide…        1                                    │  as data, in cream
│   At Last, the Gift             1                                    │
├──────────────────────────────────────────────────────────────────────┤
│ Craft                                                                │  act 1 (7 rows)
│        Best Set Design   │  ▣ FDOC                                   │  row: category in
│    Best Costume Design   │  ▣ Silenced                               │  condensed caps on
│   Best Hair and Makeup   │  ▣ Silenced                               │  the left, winner
│      Best Sound Design   │  ▣ FDOC                                   │  in Bodoni on the
│    Best Original Score   │  ▣ Senior Assassin                        │  right, person line
│     Best Cinematography  │  ▣ FDOC                                   │  only when present
│           Best Editing   │  ▣ FDOC                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Performance                                                          │  act 2 (4 rows)
│ Best Supporting Actress  │  ▣ Silenced                               │
│   Best Supporting Actor  │  ▣ Senior Assassin                        │
│       Best Lead Actress  │  ▣ A Newby Cupid's Guide to Love & More   │
│         Best Lead Actor  │  ▣ Senior Assassin                        │
├──────────────────────────────────────────────────────────────────────┤
│ Picture                                                              │  act 3
│         Best Screenplay  │  ▣ FDOC                                   │
│         Audience Choice  │  ▣ At Last, the Gift                      │
│           Best Director  │  ▣ FDOC                                   │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────┐         │  Best Picture:
│ │                   [img] FDOC still                       │         │  the finale, the
│ └──────────────────────────────────────────────────────────┘         │  only still on the
│ ▣ Best Picture                                                       │  page, full width
│ FDOC                                                                 │
│ Directed by Keller Huffman        [ Watch FDOC ]                     │
└──────────────────────────────────────────────────────────────────────┘
```

At 375px: tally stays two-column (it is narrow); award rows stack category
over winner; Best Picture finale is full-bleed.

Ceremony order (ascending toward Best Picture) and department grouping
coincide, so the page runs in ceremony order *and* reads in three acts. The
only still on the page belongs to Best Picture. Every other row is type and
gold, so the finale is the one place the page opens up.

### 1.4 Principles specific to this project

1. **Gold is a vote.** If it is gold, members voted for it. One component may
   use the color, and the build fails if a second one tries.
2. **Frames, not posters.** Every image is a 16:9 frame from a real film,
   treated the same way, and the untreated frame is the reward for attention
   (hover or focus). No image exists on the site that was not shot by a
   student.
3. **Credits are the product.** The credit block is the reason a member sends
   a link. An empty credit slot is an invitation written in words, never a
   blank that could be mistaken for a value.
4. **Say it like a first-year would.** Sentence case everywhere, including
   buttons. No internal jargon before it is explained. Every call to action
   says what happens when you click.
5. **The light comes from the screen.** The page is a dark room. The only
   light sources are the stills themselves and the Carolina spill around
   them. No decorative gradients, no grain over the whole page, no glow on
   buttons.

### 1.5 Decisions on the delegated list [16]

| # | Decision | Call |
|---|---|---|
| 1 | Typefaces | Bodoni Moda + Archivo (width axis). See 1.2. |
| 2 | Dither | Decided after the pipeline agent's comparison; see section 2 below. |
| 3 | Hero | Two concepts built: "Ken Burns push" (A) and "Lit screen" (B). Result in section 3. |
| 4 | Numbering | Only on the how-it-works steps. Homepage sections are not a sequence. Award rows run in ceremony order, which is a sequence, but numbering fifteen envelopes adds nothing the order does not already say. |
| 5 | Awards composition | Headline tally, then three acts in ceremony order, Best Picture as a full-width finale with the only still. See 1.3. |
| 6 | Six films in the strip | The five award-winning films plus one non-winner chosen for the strongest treated frame, and the other six listed as text links beneath so every film on the slate is reachable. Final pick in section 2. |
| 7 | Seven gold badges | A poster-style laurel row that wraps, Best Picture first. Composition is the film-world convention ("WINNER — BEST PICTURE" strips on one-sheets), not a list. |
| 8 | Thin credits | Real director credit plus an in-block empty state that names the departments the awards prove existed. Chosen over "categories as credits" because a role with no name is a blank, and blanks read as broken [7.4]. |
| 9 | Club reel | Not on the homepage. It is from an old cycle and the hero already carries the visual. Linked in the footer as "older club reel". |
| 10 | Tailwind vs CSS | Tailwind v4. Tokens live in one `@theme` block in `globals.css`, which is also where the gold check can find them. Component-shaped CSS (the credit grid, the reveal, the hero screen) lives in a small `@layer components` block rather than utility soup. |

### 1.6 Review against 5.6: what I would have produced for any brief

I went through the draft above element by element and asked whether an
unrelated dark-editorial brief would have gotten the same thing.

| Element in the draft | Verdict | What changed |
|---|---|---|
| Small tracked-out uppercase "eyebrow" label above each section heading ("THE CATALOG") | Default. I do this on every dark site. | Cut entirely. Headings stand alone in Bodoni with a plain-sentence subhead. Uppercase tracking survives only in the credit block roles, where it is the film convention. |
| Film meta as a dot-joined string ("2025 · Studio · 18 min") | Default, and called out by name in 5.6. | Meta is prose ("2025 slate", "Directed by Keller Huffman") laid out as two short lines. Runtime, when it exists, becomes a third line and disappears cleanly when null. |
| "See the films →" buttons | Default. | No arrows. Buttons are verbs. |
| Rounded cards with a soft shadow for the catalog | Default. | Zero radius, no shadow, 1px deep border only on the focused card. Cards are frames on a contact sheet. |
| Centered hero: giant wordmark, subtitle, two buttons | The universal landing hero. | Concept B moves the wordmark below the screen and left-aligns it, with one call to action. The screen, not the type, is the first thing seen. |
| Instrument Serif + Inter | The pairing I would have reached for. | Bodoni Moda + Archivo, see 1.2. |
| Whole-page film-grain overlay | Common on every "cinematic" AI layout. | Removed. Grain lives only inside the stills, where it is the treatment. |
| Fade-and-slide-up on every section as it scrolls in | The generic default named in 5.5. | None. The motion budget goes to the hero lamp-up (section 3) and nowhere else; the still reveal is interaction feedback, not entrance animation. |
| Numbered sections "01 / 02 / 03" | Default, and the client likes it on his reference site. | Numbers only on the five how-it-works steps, which are a real sequence. |
| Alternating base/surface section bands | Default way to break up a long dark page. | Sections are separated by 1px deep rules and headings, like acts. Surface is reserved for things that are actually raised: nav, facade, form. |

Kept on purpose after the review, with the reason:
- Letterbox bars on the hero screen. Generated in CSS, and a real film
  convention rather than decoration [9.4].
- A gold laurel in `AwardBadge`. The festival laurel is a cliché *because* it
  is the actual convention for announcing a win on a poster; a film audience
  reads it instantly. It is drawn as two thin arcs, not a stock wreath.
- The credit block. Structurally specific to the subject, per 5.6 itself.

---

## 2. Image treatment [9, 16.2]

The pipeline agent compared four dithers at two and three tones and three
working widths, producing contact sheets of all twelve stills for each
combination (`npm run stills -- --sheets`). I looked at the sheets and made
the call. Reference images: `docs/dither-contact-sheet.png` (chosen) and
`docs/dither-floyd-rejected.png` (rejected).

**Chosen: ordered Bayer 8×8, two tones (base and carolina), 320px working
width, nearest-neighbour upscale to 1280×720, lossless webp.**

- *Bayer 8×8 over Floyd–Steinberg and Atkinson.* Error diffusion reads as a
  fax of a photograph: it preserves tonal detail, so a well-lit frame still
  looks well-lit and a phone-shot interior still looks like a phone-shot
  interior. Bayer reads as a screen print. It flattens the sources harder,
  which is the whole point [9.2]. Atkinson is the most graphic of the four
  but blows out the two darkest faces (FDOC, Omnes Unum) into nothing.
  Bayer 4×4 reads as crosshatch texture rather than print.
- *Two tones over three.* With `deep` as a midtone every frame looks
  nicer on its own, but the well-lit films resolve into flat deep fields and
  the grid starts showing who lit their film properly again. Two tones
  keep the set together, which matters more than any single frame.
- *320px working width.* Each dither cell becomes an exact 4px block at
  1280. 480 gives 2.67px cells and faint moiré; 640 gives 2px cells that
  read as a smooth photo at card size and lose the print character.
- *Lossless.* A two-colour image compresses to 2–5 KB losslessly; lossy webp
  is 25× larger and adds a thousand off-palette colours to the grain.
- Every treated file was verified to contain only `#0B0D0F` and `#4B9CD3`.

**Card-size rendition.** The first homepage pass showed tile-shaped moiré on
the cards: 4px cells downscaled to about 340px land at about 1.05px per cell
and beat against the pixel grid. Three fixes were rendered side by side:
(a) the 1280px still downscaled with smoothing, (b) the native 320×180
rendition upscaled with `image-rendering: pixelated`, (c) the native
rendition upscaled with default smoothing. (b) was worst: at a non-integer
ratio, nearest-neighbour duplicates every twentieth column and the tiles get
bigger. (c) was clean. So the pipeline now also writes
`{slug}-treated-sm.webp` at native resolution and `FilmCard` serves it;
the hero, facade, and awards finale keep the 1280px file.

**Bad sources, kept as they are [17].**
- *At Last, the Gift* has no thumbnail at all: the YouTube upload is private,
  so every thumbnail variant 404s. Nothing was substituted. The content
  schema now allows `still: null`, `viewable` is false, and the
  `Frame` component renders a type-only 16:9 leader (surface rectangle,
  title in the display face, "No frame available" in the credit style). It
  is an Audience Choice winner, so it sits in the "also on the slate" list
  rather than the six-up strip.
- *Discrete Magematics* is a 2:3 poster on black, not a frame. It treats to a
  solid carolina rectangle with illegible text. It is the one card that
  visibly breaks the grid, and it is the film's real thumbnail.
- *Slam!* is a title card at 640×480 (no max-res thumbnail; the pipeline fell
  back to the standard-definition one).
- *Silenced* carries an "Official Selection, Argyle Film Festival 2026"
  laurel baked into the frame. It survives the treatment legibly, but it is
  an award graphic outside the site's award system.

## 3. Hero concepts [11.1, 16.3]

Two built, both screenshotted at 1440 and 375. Images in `docs/`.

**A. The push (rejected).** `components/home/HeroPush.tsx`, kept in the
repo for the record. A full-width letterboxed FDOC still, a 28-second scale
from 1.0 to 1.07, a scrim, and the wordmark, description, and button over
the image. It is the brief's safe recommendation and it works. It is also
the universal dark landing hero: type over an image with a gradient under
it. The dither fights the wordmark (high-frequency noise behind serifs), the
scrim exists only to fix that, and section 13 says text over a still needs
a backing at all. Nothing about it says "film club" rather than "agency".

**B. The lit screen (kept).** `components/home/HeroScreen.tsx`. The brief's
own hint: the most characteristic thing in this world is a dark room with a
lit screen. A 16:9 screen sits in the room carrying the dithered still, with
letterbox bars above and below it. Carolina light spills off the screen onto
the walls (a radial gradient behind it, the one place a gradient is allowed
by principle 5, because it is the light source). The wordmark sits *under*
the screen as a one-line title card, not over the image, so it needs no scrim
and the still stays untouched. On load the lamp comes up: the glow fades in
over 1.6s and the screen brightens over 1.4s. That is the site's one
orchestrated motion moment [5.5]; nothing else on the site animates in.

Iteration on B: the first build hid the glow entirely (its ellipse faded out
at the screen's edge, so it sat behind the frame), and the two-line
display-xl wordmark pushed below the fold at 1440×900. Fixed by widening the
glow to 30% carolina at centre with a slower falloff, shrinking the screen
to 48rem, and setting the wordmark on one line at clamp(2.75rem, 6.4vw,
6rem), which is also a better title card.

Touch devices never hover, so on `(hover: none)` the screen runs the reveal
once after the lamp-up (real frame at 2.4s, back to treated at 5.2s). A
phone visitor sees the signature interaction explain itself.

**Reduced motion.** No lamp-up and no glow fade: the room is already lit
when the page arrives. The still reveal becomes an instant swap rather than
a cross-fade. The touch auto-reveal does not run. Same information, no
motion, nothing missing.

## 4. Screenshot passes [14.2]

Every pass was captured at 1440 and 375 with Playwright driving the
installed Chrome (exact viewports, full-page), and looked at before anything
was changed. Chanel's rule at the end of each pass: remove one thing.

### 4.0 `/` Homepage

**Pass 1** (1440 / 375). The hero worked. Wrong: the "Now showing" rule sat
four pixels under the hero button; the winner laurels in the awards teaser
floated 12px from their titles; the lede for the awards section dropped the
"took seven" sentence because I had written the sweep rule as a strict
majority and 7 of 15 is not one; and every card in the strip showed
tile-shaped moiré (section 2). Changed: hero bottom padding 64/96, laurel
gap 8px, sweep rule to "at least five wins and at least double the
runner-up", card rendition (section 2).

**Pass 2** (1440 / 375). Moiré unchanged. Cause: the base `.still__treated`
rule already carried `image-rendering: pixelated` from the first design
system commit and the card rule had not applied. Rendered the three options
side by side (section 2) and switched cards to smooth upscaling of the native
rendition.

**Pass 3** (1440 / 375). Cards clean; the six frames read as one contact
sheet. Confirmed on the 375 capture that the nav wraps to two rows
(wordmark, then links) rather than shrinking the wordmark, and that the
touch auto-reveal fired (the capture caught the real frame mid-cycle).
*Removed:* the second call to action I had planned beside the hero button.
One action per section.

### 4.1 `/awards/2025`

Built as `app/awards/[year]/page.tsx` with `components/awards/{Tally,Act,AwardRow,BestPicture}.tsx`
and the pure helpers in `components/awards/ceremony.ts`. Every number on the page
(fifteen, five, seven, the tally, the sweep sentence) is derived from
`awards.json`; the only hand-written words are "May", the act names and "Directed by".

The question asked on every pass: is this a list, or an event? The answer the
page settles on is that the *acts* are allowed to be a list because they are
framed by two things that are not: a tally that states the night's result as
data before a single envelope opens, and a finale that is the one place the
page shows a picture.

**Pass 1** (1440 / 375). The header, tally and finale worked first time. The
acts did not: a 1fr/1fr grid put the gutter in the dead centre of a 1152px
wrap, so each row was a small gold badge floating beside a 500px void and the
whole act read as a form. The category caps sat a few pixels below the winner's
baseline, because `items-baseline` on a row whose winner is an inline-flex
badge aligns to the laurel SVG, which has no baseline. The finale's "Watch
FDOC" button was justified 900px away from "Directed by Keller Huffman".
Mobile was already right: rows stack category over winner, the still bleeds to
the viewport edge. *Removed:* an `sr-only` "7 wins" duplicate on the tally
numeral; a `dl` already reads "FDOC, 7".

**Pass 2.** Act lists capped at 56rem with a 2fr/3fr grid, so the category
column is the narrow one and the gutter sits at two fifths, the proportion of
the credit block on the film page. Rows align to the top with a 4px offset on
the label instead of to a synthesized baseline. Finale credit and button now
sit together on one line, left-aligned, as in the wireframe. The rules
looked alternately bright and dim in the capture; measured rather than guessed
(below).

**Pass 3.** Measurement showed the winner link was `inline-block`, so the
`dd` carried a 5px line-box strut under every badge; made it `block w-fit`.
Sampling a column of pixels in the PNG showed every rule is exactly one pixel
of pure `deep`, so the alternating brightness was the image viewer's downscale,
not the render. Moved every spacing onto the plan's 8px list (row padding 24,
act top 32/48, finale text 32/48). *Removed:* an "Accepted by {person}" line I
had invented for the finale. The plan's finale is still, laurel, title,
director, button, and "accepted by" is a guess at what a Best Picture
`person` would mean.

**Pass 4.** Tried the tally numerals one step up (display-lg). Wrong: at 80px
they match the h1 and the tally becomes a scoreboard that shouts over the
title. The plan's scale was right (numerals one step below the h1; the sweep
sentence carries the headline in words). Bodoni Moda's "1" reads as a bar at
opsz 96 at any size; that is the face, not a bug. Act gaps pulled back from
96 + 24 to 64 + 24 so the space after an act's last row (88px) is inside the
plan's 96px ceiling, with 48px from rule to the next act name. 320px: no
horizontal overflow; long titles wrap inside the laurels.

**Pass 5.** Person-level test: set `"Placeholder Person"` on Best Lead Actor in
both content files, captured, then reverted (`git diff content/` empty). The
name renders as a gold credit line under the title, the laurels re-centre on
the two-line block, and the category label stays level with the title line.
Hover on a winner: gold offset underline, consistent with `.link`; kept.
*Removed:* a dead `max-w-full` on the row link.

Definition of "sweep" (in `ceremony.ts`): the leading film has at least half
the categories, rounded down, and at least double the runner-up. Seven of
fifteen against three qualifies; eight against seven would not. A strict
majority would have dropped "one sweep" from the lede for this exact night.

### 4.2 `/films/fdoc`

Built by the film-page agent against the shared components; its passes are
reproduced here from its report, followed by my own pass.

**Pass 1** (1440 / 375). Structure right first time. Wrong: section rules
carried 192px of air (double the plan's ceiling); the credit empty-state
panel sat hard-left while the single director row was centred on the
gutter; at 375 two large badges plus the gap came to 344px against a 343px
column, so the laurel row collapsed by accident. Changed: rules to 48+48
desktop / 32+32 mobile; panel centred under the gutter; mobile badge gap
reduced.

**Pass 2** (1440 / 375 / 320, plus `/films/at-last-the-gift` and
`/films/slam`). Slam renders no Awards section and no orphan rule. At Last,
the Gift renders the type-only leader at facade width, a dark screen for a
film that is not showing. Wrong: the reduced mobile gap produced a
2/1/1/1/1/1 wrap; the not-streaming line was a 15px caption. Changed: badges
become a deliberate single column below 40rem; explanation moved to body
size.

**Pass 3** (with a temporary "Placeholder Person (test)" on Best Director in
both content files). Person line renders as a cream credit line under the
category; removed afterwards, `git diff content/` empty.

**My pass** (1440 / 375). The seven laurels wrap 5+2 on desktop and stack
on mobile, which is how a one-sheet lists wins; kept. The credit block with
one real row and the in-block invitation reads as intended: the invitation
names the five departments the awards prove existed. Adjacent-film frames
loaded on a second capture (the first missed one to lazy loading, not a
bug).

### 4.3 Accessibility and responsive audit [13, 14.3]

An audit agent ran against the finished routes with Playwright and reported
findings only. No blockers. Raw numbers it measured:

- No horizontal overflow on any route at 320, 375, 640 at 2x, or 720 at 2x.
- Contrast on rendered colours: body 16.1:1, muted 6.5:1, gold 9.3:1,
  carolina links 6.5:1, nav 14.7:1, the facade label over the scrim 12.2:1
  at worst. No text sits on a still without a solid backing.
- One h1 per route, no skipped levels. Every focusable element reached by Tab
  in order with a 2px carolina outline; every `.reveal` element revealed
  its frame on focus. No iframe on any route until the facade is clicked.
  Zero console errors. Reduced motion: no animations on load, instant swap
  on hover and focus.

Fixed from its list:
- The hero screen was a focusable div with no role or name. It is now a link
  to the film page with an accessible name, which keeps focus reveal, tap
  reveal, and the touch auto-reveal.
- Winner links on the ceremony page and the homepage teaser had no link
  affordance until hover. The badge now takes a `linked` flag that adds a
  persistent gold underline (inside `AwardBadge`, so the gold rule holds);
  the tally titles carry a cream underline.
- The facade's accessible name now contains its visible label ("Play the
  film: FDOC") for speech input.
- Focus rings on nav links and buttons faded in over 150ms because
  `transition-colors` includes outline colour; transitions are now limited
  to colour, background, and border.
- The Best Picture landmark was named after the winner; it is now named
  "Best Picture".

Left as is: the smallest text is 13px (nav, footer, buttons), at the
threshold; the "Not streaming" card label is unreachable with the current
data because the one non-viewable film also has no still.

## 5. Things the club needs to supply

Each of these is an explicit empty state on the live site, written so it
reads as an invitation rather than a gap. Together they are the pitch
argument: the current site cannot hold any of this.

1. **Exec board names.** The crew block on the homepage lists roles with
   "Name to be supplied". Roles used: president, vice president, treasurer,
   executive producers, and the screenwriting, editing, and acting guilds,
   per the structure the club describes. Confirm the real roles.
2. **Semester dates.** Pitches open, review board decisions, festival.
   "Now showing" carries "date to be announced" for all three.
3. **Full crew credits per film.** Each film page shows the director and an
   in-block note naming the departments its awards prove existed.
4. **Person-level award winners.** Every acting, craft, and score award is
   film-level only. The award row and badge components already render a
   person line when one exists; tested with a placeholder and removed.
5. **The 2026 slate.** The festival happened in May 2026 and was never
   published. One JSON entry per film plus `npm run stills`.
6. **A public upload of At Last, the Gift**, or a still from it. The video is
   private, so the site has no frame for an Audience Choice winner.
7. **Confirmation of the "independent films" copy** in How it works. It
   describes indie films as member-led projects outside the greenlit slate;
   that is my best reading of the old site's vocabulary, not the club's
   words.
8. **A domain.** The site's metadata points at the Vercel URL until then.
