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

### 4.4 Production build check

The production build was served locally and every route captured again at
1440 and 375. Visually identical to the dev captures. One difference showed
only in production: the first three homepage cards were marked high
priority, and Next prefetching other routes caused React to preload those
card images on the film and awards pages, which logged "preloaded but not
used" warnings. Cards are below the fold, so the priority flag was removed;
all three routes now load with an empty console. The hero still and the
film-page facade keep their priority.

## 6. Deployment [12.4]

No deploy token was present in the environment, so the site was deployed
through the brief's fallback path: the GitHub repo imported in the Vercel
dashboard, framework auto-detected, no environment variables. Production
builds from `main` on every push.

- Production: https://sfawebsite-kappa.vercel.app
- First deployment: https://sfawebsite-9wxvcl4yf-markandeyayalamanchi9-1237s-projects.vercel.app

Two things learned on the way. `sfawebsite.vercel.app` belongs to an
unrelated project, so Vercel assigned the `-kappa` domain; the site's
metadata URL was updated to match. And the team-scoped alias
(`sfawebsite-markandeyayalamanchi9-1237s-projects.vercel.app`) sits behind
Vercel's login wall by default, so it must not be the link handed to the
president; the `-kappa` domain is public.

Cold-visit check on the production domain: all three routes captured at
1440 and 375 with an empty console, identical to the local production build.

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

---

## 7. Second direction: the A24 register (2026-09-04)

The client reviewed the first build and rejected it: "looks like AI slop".
The instruction was to mirror the aesthetics of A24's site (a24films.com),
recolor it for UNC, use no gradients, and avoid black-and-gold. That
overrides four sections the brief had marked LOCKED (the palette in 5.1, the
gold rule in 5.2, the dither system in 9, the dark ground throughout). The
client is the author of the brief, so the override stands; sections 1 to 6
above are kept as the record of the first direction.

### 7.1 What A24's site actually does

Captured at 1440 and 375 before writing anything (`a24-home-*` and
`a24-films-*` in the session shots). The grammar:

- A full-bleed still with the slate stacked as a list of titles at the
  bottom-left in a large tight grotesque, each with a small year
  superscript; hovering a title swaps the backdrop.
- White sections. Feature blocks alternate an image on a light grey panel
  with a column of small uppercase grey eyebrow, huge headline, and a long
  thin arrow followed by an uppercase label.
- A three-across grid of stills with an eyebrow and a title beneath each.
- A solid dark footer band with columns of uppercase links.
- One typeface, a tight grotesque, at two scales: enormous for headlines,
  small uppercase for everything that is a label. No rounded corners, no
  shadows, no decoration.

### 7.2 Mapping it to UNC

| A24 | SFA |
|---|---|
| Black type on white | UNC navy `#13294B` on white |
| Black footer | Navy footer |
| No accent colour | Carolina Blue `#4B9CD3` for eyebrow-level accents, hover, award labels |
| Light grey image panels | `#F2F4F6`, a cool grey so it sits with the blue |
| Serif A24 mark centred in the nav | "SFA" set tight in the display face, centred |
| Neue Haas-style grotesque | Inter Tight (headlines) and Inter (text) from Google Fonts |

Gold is gone entirely; awards are Carolina uppercase labels and navy titles.
The only gradient on the site is the scrim under the hero title list, which
is a navy-to-transparent fade for legibility, the same device A24 uses.

### 7.3 What was removed from the first build

- The two-tone dither and the hover reveal. Stills are now shown as shot.
  The pipeline keeps fetching and cropping originals; treated renditions
  are no longer written or served.
- The gold rule and its build check.
- The dark ground, the projector-glow hero, the laurel badges, Bodoni Moda.
- The credit-block-as-end-credits conceit. Role and name pairs are still a
  `dl`, but set as eyebrow and headline on thin rules, which is how A24
  sets crew on a film page.

### 7.4 Passes

**Homepage pass 1** (1440 / 375). The register landed at once: hero, feature
blocks, grid, footer. Wrong: the six-title hero list at 4.5rem overflowed
the frame and covered the face; the long title wrapped and pushed its year
to the far edge. Changed: list capped at 34rem wide and clamp(1.75rem,
3.4vw, 3rem); hero taller (80svh).

**Homepage pass 2.** Wrong: at 375 the "Awards 2025" nav label collided with
the centred mark; the wrapped title's year still floated because it was a
flex sibling. Changed: the year is an inline superscript inside the title;
the year drops off the nav label below 40rem. Seven "Name to be supplied"
rows at display size shouted; the placeholder now sits at body size in
muted, so a real name would read louder than its absence.

**Homepage pass 3.** Clean at both widths. Nothing removed.

**Film page** (three passes by the film-page agent, then mine). Pass 1: in
register at once; the awards list and the credit block share a 14rem label
column so the two halves align. Pass 2: the type-only leader for At Last,
the Gift was a 760px empty grey field at full width, loud rather than
quiet; capped at 48rem. Slam confirmed to render no Awards heading. Pass 3:
award labels sat low in their rows from a carried-over nudge; removed. My
pass: the facade had two affordances, a round white play circle and a
square label, and the circle broke the no-rounded-corners rule. Kept the
square label only, with a small play mark, and it turns Carolina on hover.

**Awards page** (five passes by the awards agent). Pass 1: finale had as
much air below as above, so the page ended in a void; the header ran into
the tally without a rule. Pass 2: finale padding made asymmetric; a rule
added above the tally so header, tally, and acts share one rhythm. Pass 3:
heading-to-first-rule gaps unified; person-level enhancement verified with
a placeholder and reverted. Passes 4 and 5: the lede orphaned "2025." at
1440, fixed with a non-breaking space; 320 clean.

### 7.5 Deployment

Pushed to `main`; Vercel rebuilt production at
https://sfawebsite-kappa.vercel.app. Verified live after the push.

## 8. Third direction (2026-09-07): the brief's four moves

The client rejected the second direction as "generic vibe-coded slop".
`REMEDIATION_BRIEF.md` is the response; `AUDIT.md` is the diagnosis. This
section is the design-system record for Wave 2. Sections 1 to 7 stay as the
record of the two earlier directions.

### 8.1 Why the second direction failed

From `AUDIT.md` section 6. The token file was tidy (eight type sizes, six
colours, no stray hex) and that was not the problem. The system reproduced a
borrowed grammar (eyebrow, headline, long arrow, grey panel, Inter Tight)
that, detached from A24's content, is the template every generated marketing
page converges on, recoloured to the equally common white/navy/blue/Inter
cluster. Nothing on any route was specific to a film club: no catalog
numbers, no image treatment (the dither pipeline existed and was switched
off, so twelve mixed thumbnails read as a YouTube playlist), no end-credit
block (roles were eyebrow/headline rows), no gold (a win and a hover state
were the same Carolina). Motion was eighteen framework-default 150ms
transitions and native scroll. Section padding was four values with no rule
behind the choice, and the accent was on eyebrows, hovers, links, focus,
selection and award labels alike.

### 8.2 Tokens

`app/globals.css` is the single source of truth; `scripts/check-tokens.mjs`
(run by `npm run check`) fails on a hex colour, a literal ms/s duration, the
word "gold", a Tailwind arbitrary value with px/rem/#, a `duration-*` /
`delay-*` / `animate-*` / `ease-[...]` utility, a palette utility used
outside the token file, or a second `scroll` listener. Tailwind's numeric
spacing multiplier is off (`--spacing: initial`), so `p-5`, `mt-7`, `gap-10`
do not exist.

**Colours.** Six palette tokens (SFA_SYSTEM_DESIGN 5.1, locked) plus two
alphas. Components never use palette utilities; they use the role utilities,
which resolve on the element (`@theme inline`) so one class on a section
recolours every child.

| Palette token | Value | Notes |
|---|---|---|
| `--color-base` | `#0B0D0F` | Page ground; the dark tone in every still |
| `--color-surface` | `#14181C` | Footer, leaders, raised blocks |
| `--color-carolina` | `#4B9CD3` | Accent; the light tone in every still. 6.5:1 on base |
| `--color-deep` | `#2A5C7D` | Hairlines only. Never text |
| `--color-gold` | `#D4AF37` | `AwardBadge` only. 9.3:1 on base, 8.5:1 on surface |
| `--color-cream` | `#EDE9E1` | All text. 15:1 on base |
| `--color-cream-muted` | cream at 64% | Secondary text. 6.9:1 on base |
| `--color-base-muted` | base at 78% | Secondary text on a carolina ground. 4.9:1 |

| Role variable | Utility | `.on-base` (default) | `.on-surface` | `.on-carolina` |
|---|---|---|---|---|
| `--surface` | `bg-ground` | base | surface | carolina |
| `--on-surface` | `text-fg` | cream | cream | base |
| `--on-surface-muted` | `text-fg-muted` | cream-muted | cream-muted | base-muted |
| `--rule` | `border-rule` | deep | deep | deep |
| `--accent` | `text-accent` | carolina | carolina | base |

**Type.** Nine fluid steps, `clamp()` between a 24rem and a 90rem viewport,
leading, tracking and (from step 5) weight set per step in the theme.
Utilities `text-1` .. `text-9`.

| Step | Size | Leading | Tracking | Weight | Used for |
|---|---|---|---|---|---|
| 1 | 0.75 to 0.8125rem | 1.4 | 0.01em | 400 | captions, the smallest label |
| 2 | 0.875 to 0.9375rem | 1.35 | 0 | 400 | credits, catalog number on cards and rows, nav links, buttons, footer |
| 3 | 1 to 1.0625rem | 1.55 | 0 | 400 | body, credit block names |
| 4 | 1.125 to 1.25rem | 1.45 | -0.005em | 400 | lede, logline, award row badge |
| 5 | 1.375 to 1.75rem | 1.12 | -0.015em | 600 | card titles, winner titles |
| 6 | 1.75 to 2.5rem | 1.02 | -0.025em | 600 | section headings, footer wordmark |
| 7 | 2.5 to 4rem | 0.96 | -0.03em | 700 | page titles |
| 8 | 3 to 6.5rem (anchored at 20rem since 11.1 G1; was 3.5rem at 24rem) | 0.9 | -0.035em | 700 | display: hero wordmark, film title |
| 9 | 5 to 12rem | 0.85 | -0.02em | 700 | scale moments, condensed voice: catalog number on the film page, tally numerals |

**Spacing.** Geometric from 4px, closed: `1` 0.25rem, `2` 0.5, `3` 0.75,
`4` 1, `6` 1.5, `8` 2, `12` 3, `16` 4, `24` 6, `32` 8 (plus `0`). Fluid
rhythm: `gutter` clamp(1rem, 3vw, 2.5rem) (the wrap's side padding),
`block` clamp(2rem, 5vw, 4rem) (sub-blocks), `section` clamp(4rem, 10vw,
8rem) (ordinary sections), `stage` clamp(6rem, 15vw, 12rem) (hero and
finale: section x 1.5). Hierarchy through unequal padding. Measures:
`max-w-wrap` 90rem, `max-w-measure` 60ch, `max-w-short` 34ch, `max-w-title`
14ch. Radius 0 everywhere; no shadows; the one hairline is `--hairline`
(1px) and the one focus ring `--focus-ring` (2px), both defined once.

**Easings (exactly four)** and **durations (exactly five)**, mirrored
one-to-one in `lib/motion.ts` (`EASE`, `EASE_FN`, `DUR`). Tailwind's
`ease-out` / `ease-in` / `ease-in-out` / `ease-linear` map to these;
durations are `dur-1` .. `dur-5` (a custom utility; `duration-<n>` is
banned because it takes any number). Bare `transition` utilities default to
`--dur-1` / `--ease-out`.

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | expo-out: arrivals, reveals, hover-in |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | expo-in: exits, hover-out |
| `--ease-in-out` | `cubic-bezier(0.83, 0, 0.17, 1)` | state changes that go and come back |
| `--ease-linear` | `linear` | continuous motion only |
| `--dur-1` | 120ms | colour and focus micro-changes |
| `--dur-2` | 240ms | small moves (the nav hairline) |
| `--dur-3` | 480ms | reveals |
| `--dur-4` | 800ms | the dither crossfade |
| `--dur-5` | 1400ms | hero orchestration |

### 8.3 Type system, and the rejected display direction

**Archivo**, one variable file loaded once with the width axis
(`next/font/google`, `axes: ["wdth"]`). Two voices from one family:

- Width 100: interface and body. 400 body, 500 labels, 600 to 700 display.
- Width 75 (`.condensed`, `font-stretch: 75%`, tabular figures): credits and
  catalog numbers. Widths 68, 75 and 82 were set side by side on a credit
  block, a `No. 007` at step 9 and a `No. 031` at step 2 (bottom of the
  comparison page). 68 squeezed the credits at text size; 82 was barely
  distinct from the body voice. 75 is the condensed width that still reads
  as the same family.

**Direction 1 (chosen): Archivo itself as display.** Width 100, 600 to 700,
large and tight (tracking -0.025 to -0.035em, leading 0.9 to 1.02).
`docs/type-direction-chosen.png`.

**Direction 2 (rejected): a serif for display.** Two faces were built so the
rejection is of the idea, not of one font: Instrument Serif (the default
reach of every dark editorial layout) and Newsreader (a transitional face
with an optical-size axis, chosen precisely because it is not Instrument or
Bodoni). `docs/type-direction-rejected.png`. Rejected because:

1. The catalog number is the most repeated element on the site. In
   Direction 1 its condensed digits, the credit block and the display share
   one skeleton, so number, card, credits and heading read as one system.
   In both serif directions the number in serif and the credits in
   condensed grotesk are two systems meeting on every card.
2. Direction 2a is the Instrument-Serif-on-black template the brief names as
   the risk (3.2); it cannot be told apart from it at a glance.
3. Direction 2b avoids that but puts the ceremonial register on every page.
   The brief reserves the Academy register for the awards page alone (Part
   2, The Academy); the ceremony can reach it through step 8 and 9 scale,
   negative space and gold, without a second face.
4. The halftone stills plus a heavy grotesk read as printed matter, a
   contact sheet with a stamped number. The serif reads as an invitation,
   which is the wrong object for eleven of the twelve films.

The wordmark is the club's name, "Student Film Association", in the display
voice (initials only in the nav below 40rem). There is no logo.

### 8.4 The four components, and the shell they depend on

**`CatalogNumber` `{ no, size: "card" | "row" | "page" }`.** Renders
`No. 007`: "No." in the grotesk at 500, a thin space, the digits condensed
at 600 with tabular figures. Card and row are step 2 in `--on-surface-muted`;
page is step 9 in `--on-surface` with "No." reduced to 0.32em and raised to
the cap line. Never carolina, never gold. Accessible name "Catalog number
7" (visually hidden text; the visible parts are `aria-hidden`). Tilt: 8.5.

**`FilmCard` `{ film, headingLevel?, priority? }`.** A 16:9 `Frame` (the
640x360 treated rendition at rest; the 1280 original on hover, focus and
focus-within), then a caption row outside the frame: the catalog number at
the start, the title in step 5, and beneath the title in the condensed
voice the director, "Festival only" when `viewable` is false, and the win
count in gold if the film won. The whole card is one link with the focus
ring on it; hover changes the title colour only. No scale. A film with
`still: null` gets the type-only leader (a surface rectangle, "No frame
available" in the credits voice, the title in step 5). Timing jitter: 8.5.

**`CreditBlock` `{ rows | groups, aside?, headingId? | label? }`.** A
`role="group"` of `<dl>`s. Two equal columns meeting at a centre gutter of
`--spacing-6`; role right-aligned in `--on-surface-muted` at 400, name
left-aligned at 600; condensed voice, step 3, leading 1.15; a hairline
above the block and between groups. A missing name renders "Name to be
supplied" in italic muted, never a blank. The `aside` (the invitation to
send credits) sits inside the block in the body voice, centred, no box.
Below 40rem the row stacks, role over name, still condensed.

**`AwardBadge` `{ category?, person?, count?, mode: "inline" | "row" |
"count", href?, linked? }`.** The only file containing the word gold. The
mark is a small solid gold square before the text (an envelope seal; a
rectangle like everything else), the category in the condensed voice at
600, the person on a second line in cream at 400 when published. `inline`
is step 2 (film page lists), `row` is step 4 (ceremony rows), `count`
renders "7 wins" / "1 win" for cards and teasers. Gold on base is 9.3:1.
Tilt: 8.5.

The shell: **`Still` / `Frame`** (two stacked `<img>`, plain `<img>` so the
lossless two-colour webp is never recompressed; crossfade on `--dur-4`,
`--ease-out` in and `--ease-in` out; hover only under `(hover: hover) and
(pointer: fine)`; `.is-revealed` for route agents; instant under
`.-no-motion` and `prefers-reduced-motion`), **`SiteNav`** (sticky, the
wordmark and three links on the page's own ground; a hairline appears only
under `html[data-scrolled]`), **`SiteFooter`** (`.on-surface`, real links,
the colophon "Catalog numbers run in production order across all years"),
**`ButtonLink`** (primary cream fill, secondary hairline, link underlined in
the accent; sentence case, no arrows, no icons; hover changes colour only on
`--dur-1`), **`SectionHeading`** (title and one optional sentence, no
eyebrow), **`Wordmark`**, **`VideoEmbed`** (the treated still with a solid
"Play the film" label, `aria-label="Play FDOC"`; the iframe is created on
click). `ArrowLink` is deleted.

### 8.5 Engineered irregularity hooks (brief 4.6)

All from `lib/hash.ts` (FNV-1a, deterministic, so server and client agree),
never `Math.random`. Each is a custom property on the element; the CSS reads it.

| Where | Property | Range | Seed |
|---|---|---|---|
| `CatalogNumber` | `--tilt` | -0.6 to +0.6deg | `catno:<no>` |
| `CatalogNumber` | `--nudge` (baseline) | -0.02 to +0.02em | `catno:<no>:y` |
| `FilmCard` | `--reveal-dur` | 0.85x to 1.15x of `--dur-4` (680 to 920ms) | `card:<slug>` |
| `FilmCard` | `--reveal-delay` | 0 to 90ms | `card:<slug>:delay` |
| `AwardBadge` | `--tilt` | -0.6 to +0.6deg | `award:<category>` or `award:count:<n>` |
| stills | halftone screen phase | per film | the pipeline (8.6) |

The motion agent adds per-glyph rotation and baseline offset on split
headlines and per-element reveal delays and easings (8.7).

### 8.6 The halftone

Every still is a two-colour print at rest: base and carolina, a rotated
clustered-dot halftone screen at a 16px pitch with a per-film phase offset
so no two stills share a grain alignment, written at build time by
`scripts/process-stills.ts` as `{slug}-treated.webp` (1280x720, lossless),
`{slug}-treated-sm.webp` (640x360, for cards) and `{slug}.webp` (the
original). The choice over Bayer and Floyd-Steinberg, the contact sheets and
the serving rules (no `image-rendering: pixelated`; text over a treated
still always has a scrim) are in `scripts/DITHER_REPORT.md`. Carolina is
inside the artwork, which is where UNC lives on this site.

### 8.7 Motion

Merged by the lead from the motion agent's notes. Lenis is the one dependency added in this wave.

Files: `lib/hash.ts`, `lib/motion.ts`, `lib/scroll.ts`,
`lib/head-script.ts`, `components/motion/{SmoothScroll,ScrollFlag,Reveal,SplitText}.tsx`, `app/motion.css`.

#### 8.7.1 Dependency: `lenis` 1.3.26 (MIT, no dependencies)

Brief 4.3 calls momentum scrolling the largest single perceived-quality lever and asks for Lenis with a
duration near 1.05 and an expo ease. Lenis is 15 lines to wire (`components/motion/SmoothScroll.tsx`),
has zero runtime dependencies, ships ESM with types, and its own native scroll listener re-emits keyboard,
anchor and scrollbar scrolls, so one event source covers every way a page can move. The four CSS rules it
needs are copied into `app/motion.css` (no second stylesheet). Configuration: `duration: 1.05`,
`easing: EASE_FN.out` (the same expo-out curve as `--ease-out`), `autoRaf: false` (one loop of ours,
below), `smoothWheel: true`, `syncTouch: false` (touch keeps native inertia), `anchors: false` (below).

#### 8.7.2 Mirrored easings and durations (brief 4.2)

`lib/motion.ts` exports `EASE` (CSS strings), `EASE_FN` (the same curves as functions) and `DUR`, equal
one-to-one to `--ease-out/in/in-out/linear` and `--dur-1..5` in `app/globals.css`. Lenis runs on
`EASE_FN.out`; every CSS transition runs on the tokens. Also exported: `STAGGER` (16 ms, derived as
`DUR[1] / 7.5`, mirrored in CSS as `calc(var(--dur-1) / 7.5)`) and `STAGGER_CAP` (40).

#### 8.7.3 One scroll handler (brief 4.4)

`lib/scroll.ts` is the only scroll broadcast. `subscribeScroll(fn)` delivers `{ y, dy, progress, direction }`,
calls `fn` once immediately, returns an unsubscribe. `getScroll()` reads without subscribing. Sources:

- While `SmoothScroll` is mounted it takes a driver (`driveScroll()`) and pushes Lenis's `scroll` event
  into the broadcast. Lenis owns the page's only native `scroll` listener in that mode.
- Otherwise (reduced motion, or before/after Lenis) ONE passive native `scroll` listener, coalesced with
  `requestAnimationFrame`, attached only while there is at least one subscriber.

`ScrollFlag` is the first consumer: it sets `data-scrolled` on `<html>` past 24 px (style the nav with
`html[data-scrolled] .site-nav`). Verified with Playwright (`scratchpad/motion-check.js`): exactly one
non-React `scroll` listener is active in every mode, including after a runtime reduced-motion flip in either
direction. React itself registers `scroll` on `document` as part of its root event system; that is React,
not this codebase.

#### 8.7.4 The rAF loop

One loop, in `SmoothScroll`, calling `lenis.raf(time)`. Lenis's `raf` returns immediately when no
animation is running. The loop is cancelled on `visibilitychange` (hidden) and resumed when visible, and on
unmount. Lenis's `autoRaf` is off so there is never a second loop.

#### 8.7.5 The reveal contract (brief 4.5, 4.7)

- `Reveal` renders `as` with `class="reveal reveal--fade|rise|none"`. One module-level
  `IntersectionObserver` (threshold 0.15, `rootMargin: 0 0 10% 0`, plus "reveal on first intersection"
  for elements taller than 60% of the viewport) adds `is-in` once. `is-settled` follows on the element's own
  `transitionend`, and by a clock guard (`DUR[3] + delay + glyphs * STAGGER + 200 ms`) in case it never
  fires. Settled releases `will-change`.
- Hidden state is CSS-only and lives under `.js .reveal`. The `js` class comes from the inline head script,
  so server markup is never hidden and a JS failure leaves a readable page. The head script also removes
  `js` after 4 s if no motion component has set `data-motion-ready`, so a failed bundle cannot leave the
  page blank.
- Inline custom properties: `--enter-delay` (base `delay` + `jitter(seed, 0, 150)` ms when seeded) and
  `--enter-ease` (`pick(seed + "/ease", [--ease-out, --ease-in-out])` when seeded). They are named
  `enter`, not `reveal`, because `Frame` already uses `--reveal-delay` for the dither crossfade and custom
  properties inherit: a seeded `Reveal` around a hero frame would otherwise lag its hover crossfade.
- `SplitText` (server component) splits into `span.split-word` (nowrap, so a word never breaks across
  lines) and `span.split-glyph` (aria-hidden) with `--i`, `--rot` (±1°) and `--dy` (±0.02 em) from
  `jitter(seed:index)`. The outer element carries `aria-label={text}`. Inside a `Reveal`, glyphs stagger by
  `calc(var(--enter-delay) + min(var(--i), 40) * var(--stagger))` and the wrapper itself does not fade
  (`.reveal:has(.split-glyph)`), so the first glyph is never gated behind a second fade. The resting
  rotate/translate is kept after the animation: it is the engineered irregularity (brief 4.6).
- Use with intent (Wave 3 direction): SplitText+Reveal on the one heading per route that deserves it;
  plain `Reveal` with `seed` for grids and rows so timing is ragged; no reveal on credit blocks.

#### 8.7.6 Reduced motion (brief 4.3, 4.7)

The head script adds `-no-motion` to `<html>` when `prefers-reduced-motion: reduce` matches and keeps it
in sync on change. `SmoothScroll` never instantiates Lenis under it, destroys Lenis when the query flips
to reduce, and recreates it when it flips back; the scroll broadcast falls back to the native listener each
time. `app/motion.css` forces every `.reveal` and `.split-glyph` to its settled state with `!important`
under `.-no-motion` and again under `@media (prefers-reduced-motion: reduce)` (for the case where the
head script did not run). Glyphs keep their static resting tilt under reduced motion: it is not motion.
Verified: with `reducedMotion: 'reduce'` the root has `-no-motion`, `html.lenis` is absent,
`window.lenisVersion` is undefined, all 148 reveal elements are at opacity 1 without scrolling, no element
has a transition duration, and native scrolling still broadcasts.

#### 8.7.7 Anchors and focus

Lenis `anchors` is off. A same-page `#hash` link jumps natively (honouring `scroll-padding-top`), moves
the sequential focus start point as the browser does, and Lenis re-syncs from the native scroll event.
Verified: after clicking `#bottom` the page sits at the target minus `scroll-padding-top` and stays there
for 1.3 s (Lenis does not fight). The skip link keeps its native focus behaviour. Do not add
`scroll-behavior: smooth` to `html`; it fights Lenis.

#### 8.7.8 Not ported (brief 4.8)

No lagging cursor, no gooey curtain page transition, no drifting atmosphere layer, no breathing mascot.
No parallax. No scroll-linked marquee. The motion budget is the dither crossfade (Frame, design system)
plus one orchestrated arrival per route, built from `Reveal` delays.

#### 8.7.9 Wiring (done by the design system in `app/layout.tsx` / `app/globals.css`)

`<script dangerouslySetInnerHTML={{ __html: MOTION_HEAD_SCRIPT }} />` first in `<head>`;
`suppressHydrationWarning` on `<html>` (the head script adds classes before React hydrates);
`<SmoothScroll />` and `<ScrollFlag />` once in the body; `@import "./motion.css"` after the tailwind import.
`SmoothScroll` is a no-op on a second mount.

---

## 9. Homepage (2026-09-07, third direction)

Written by the homepage agent; merged by the lead. Hero concept captures: `docs/hero-concept-titlecard-chosen.png`, `docs/hero-concept-keyart-rejected.png`.

For the lead to merge into `DESIGN_NOTES.md` section 9. Files: `app/page.tsx`,
`components/home/{HeroTitleCard,NowShowing,Catalog,AwardsTeaser,HowItWorks,Crew,Join}.tsx`,
`lib/home.ts`. Deleted: `components/home/Hero.tsx`, `components/home/CatalogStrip.tsx`,
`lib/featured.ts` (the old hero's title list is gone, so nothing imports it).
Captures: `docs/hero-concept-keyart-rejected.png`, `docs/hero-concept-titlecard-chosen.png`
(each is 1440 beside 375, the top 1300px). The Sept 3 files `hero-concept-a-*` /
`hero-concept-b-*` belong to the first direction (section 3) and are untouched.

### 9.1 Hero: two concepts, one kept

Both were built as real components against the frozen system and shot at 1440 and 375.

**Title card (chosen).** The club's name at step 8 (SplitText in a Reveal, the one
orchestrated heading), then a 12-column row: the one sentence of context and the one
action ("Watch FDOC", primary) in columns 1-4; the key film's frame (`Frame size="full"`,
the Best Picture winner from `getSiteKeyFilm`, halftoned, resolving on hover and focus)
in columns 5-12, linked to the film page; beneath the frame the caption in the card's own
grammar (`card__caption`: `CatalogNumber size="row"`, title at step 5, "Directed by" in the
condensed voice). At 375 it stacks: name, frame, caption, sentence, action, all inside the
first screen.

**Key art (rejected).** The key still full-bleed at 70svh with a solid base band beneath it
carrying the wordmark and "No. 001 FDOC, 2025"; a client component that resolved the
dither once on arrival on touch devices. Rejected because:

1. Full-bleed means cropping. At 375 a 16:9 film became a 2:3 slice of itself, and the
   16px halftone screen (tuned for a 1280-wide frame) at bleed scale read as noise rather
   than as a frame. The title card keeps every frame 16:9, which is the honest shape.
2. At 375 the club's name, its only mark, fell below the fold.
3. "Hero image with a heading in a band under it" is the module every template opens
   with; recoloured, it is the generated pattern. The title card is the A24 restraint:
   the name, one frame, one number.
4. It needed client state (the touch reveal) for a section that should be static markup.

**The arrival.** Reveal delays only: frame at 0, caption at `DUR[2]`, title glyphs from
`DUR[3]` with the 16ms stagger. Measured from the moment `is-in` lands (Playwright,
`scratchpad/hero-seq.mjs`): frame 0 to 1 over ~400ms, caption from ~240ms, first glyph
from ~480ms, last glyph settled at ~1050ms. Still, then number, then name, inside
`DUR[5]`. Nothing else on the route uses a delay; the catalog and teaser rows use seeded
jitter only. Under reduced motion everything is simply there (rm capture identical to
the settled state).

### 9.2 Sections, and the shape each one has

Not every section is heading-then-grid:

- **Now showing**: a hairline strip under the hero, heading at step 6 left, the sentence
  and the Instagram link right. No dates exist, so it says so ("Dates to be posted").
- **The 2025 slate** (`#films`): step 7 heading, one-line lede, then all twelve films in
  catalog order as `FilmCard`s, 4 across at 1440 (3 at lg, 2 at sm, 1 at 375). Each card is
  a `Reveal as="li" variant="rise" seed="catalog:<slug>"` so the sheet arrives ragged.
  Numbers read at every width (375 checked).
- **The 2025 awards**: the first gold. The sentence is derived (`summarizeCeremony` in
  `lib/home.ts`: total categories, distinct winning films, `held`, and a sweep line only
  when the lead took at least half the categories and twice the runner-up; for 2025 that
  is "FDOC took seven of them"). The rows are one per winning film: its most prestigious
  category (ceremony order) as `AwardBadge mode="row"`, then `CatalogNumber` and the
  linked title in the card grammar. Five rows, five films, five categories; the ceremony
  page has the fifteen. Rows are seeded Reveals.
- **How a film gets made here**: heading left (4 cols), the five steps right (8 cols) as
  an ordered list with the step number in the condensed voice at step 6 (plain 1 to 5, not
  zero-padded, so it cannot be mistaken for a catalog number). The tracks are named only
  after the process: "A film made this way is a studio film ... the club calls those
  independent films."
- **Who runs it**: heading and lede, then `CreditBlock` with the seven roles the club
  describes, every name `null` (the block's own "Name to be supplied"), the aside inside
  the block saying what to send. No Reveal on credits.
- **Join** (`#join`): a hairline, "No experience needed." at step 7, one sentence, the
  one action (`JOIN_ACTION`). Bottom padding is the footer's own margin.

Spacing: hero `pt-block pb-section`; the strip has no padding of its own (it belongs to
the hero); the catalog `pt-stage pb-section` so the largest breath on the page sits
between the cold open and the body of work; awards, how, crew `py-section`; join
`pt-section`. Type steps in use: 8 (hero), 7 (slate, join), 6 (section headings, step
numerals), 5 (card and row titles), 4 (ledes, sentences), 3 (body), 2 (condensed meta,
buttons), 1 is not used on this route.

### 9.3 Passes

**Pass 1 (1440 + 375).** Wrong: (a) the primary button rendered cream on cream, see
section 5; (b) the hero's sentence and action were stranded bottom-left under nothing
while the frame sat bottom-right; (c) the now-showing heading in `max-w-title` broke into
a three-line poem; (d) the credit block's group titles sat at the far left while the
rows met at the centre. Changed: sentence and action moved up beside the frame, top-
aligned; heading width released. Removed (Chanel): the three credit groups; one flat
roll of seven roles instead.

**Pass 2.** Wrong: (a) hero-to-strip and strip-to-catalog gaps were both ~192px, so the
rhythm was flat; (b) Join at `py-stage` was a carolina field with a paragraph in one
corner; (c) hairlines between process rows rendered in two tones (sub-pixel from fluid
type; not fixable here, ignored). Changed: hero `pb-section`, strip `py-0`, catalog
`pt-stage`; Join `py-section`. Removed: the stage padding on the hero's tail.

**Pass 3.** Wrong: (a) the inverted Join was the CTA banner every marketing page ends
with (the Part 1 question fails) and left a black band before the footer; (b) trying
the hero's left column bottom-aligned with the caption pushed the action below the
1440x900 fold, worse than before, reverted; (c) unverified: arrival timing, anchors,
reduced motion, focus, 320. Removed: the `.on-carolina` surface. Carolina lives inside
the stills on this route and nowhere else; the inverted surface is unused on the
homepage and available to the awards page if it wants it. Verified (section 4).

**Pass 4.** Wrong: Join's bottom padding plus the footer's margin was 256px of nothing.
Changed: Join `pt-section` only. Final captures `p4-*` in the scratchpad.

### 9.4 Verification

- `npm run check` clean (content, tsc, eslint, check-tokens: 52 files).
- `npm run build` clean.
- Anchors under Lenis: `/#films` and `/#join` on load and via the nav links land with
  the target's top at 64px (the nav height; `scroll-mt-16` on both sections). Lenis
  active (`html.lenis`), no fight.
- Reduced motion (`rm=1`): the fold is identical to the settled page; nothing hidden.
- Focus (`#films .card`): carolina ring on the whole FDOC card, frame resolved to the
  real still.
- 320: the homepage's own content fits. `scrollWidth` is 332 because of the frozen
  footer wordmark, see section 5.
- No console errors at 1440 or 375.

### 9.5 Gaps and problems in the frozen system (for the lead)

1. **`a { color: inherit }` in `app/globals.css` section 3 is un-layered**, so it beats
   every `@layer components` colour on links: `.btn--primary` (cream text on cream fill,
   invisible), and `a.award` (a linked badge loses its gold). Workaround in my files:
   `text-ground!` on primary `ButtonLink`s (an important role utility; remove once
   fixed). Fix: move section 3 into `@layer base`, or drop the rule.
2. **`.btn--primary:hover` on `.on-carolina`** sets `background: var(--accent)` (base)
   and `color: var(--color-base)`: base on base. Moot on the homepage now that nothing
   is inverted, but it will bite whoever inverts a section with a primary button.
3. **`.wordmark--footer` is `white-space: nowrap`** and 316px wide at 320, so every
   route overflows horizontally at 320 by 12px through the footer. Fix in globals
   (`white-space: normal` on the footer size) or the footer.
4. **`CreditBlock` requires `rows` even when `groups` is passed** (type). Harmless;
   `rows={[]}` works.
5. **`Reveal as="li"`** works; `Reveal` has no `key`-safe wrapper for lists, so each
   list item is the Reveal itself. Fine, noting it.
6. The independent-film sentence in How it works ("the club calls those independent
   films") is the one line on the route the seed does not state outright; the seed
   only names the two tracks. The club should confirm it or supply its own words.

---

## 10. Film page and awards page (2026-09-07, third direction)

Written by the film-and-awards agent; merged by the lead.

Against the frozen system (DESIGN_NOTES section 8) and `scratchpad/wave3-direction.md`.
Screenshots referenced are in the session scratchpad under `shots/agentE/` (`p1-` to `p5-`, `rm-`, `w320-`, `focus-`).
Files: `app/films/[slug]/page.tsx`, `components/film/*`, `app/awards/[year]/page.tsx`, `components/awards/*`.
Nothing frozen was touched; `VideoEmbed` did not need editing.

### 10.1 Film page: what was built

- **Above the fold.** `CatalogNumber size="page"` (step 9) simply there, like a stamp; the title beneath it as the one orchestrated heading (`Reveal variant="none"` + `SplitText`, so nothing above the fold is hidden before hydration); at `lg` the meta lines ("2025 slate", "Directed by …", runtime only when known, in the condensed voice) and the logline sit as a billing block at the foot of the title in the third column. Below `lg` everything stacks.
- **The screen.** `VideoEmbed` as is (accessible name "Play FDOC", iframe only on click). For `viewable: false` or `still: null` the system's type-only leader from `Frame` at half width with one sentence beside it: "At Last, the Gift is not streaming. It screened at the festival only." (a sentence, not a label; "festival only" is what `viewable: false` means in `content/types.ts`).
- **Awards as one object.** Seals grouped by department, department read from the ceremony data, most prestigious group first (picture, performance, craft) and most prestigious category first inside a group; content-sized columns (`flex-wrap`, `gap-x-24`) so FDOC's seven read as a compact object beside the "Awards" heading rather than a table or a wrapping pile. `AwardBadge mode="row"` (step 4) so the seals carry at a distance; each seal is a `Reveal variant="rise"` with a seed, so seven settle raggedly. A lone group (At Last, Cupid) carries no department label. A film with no awards renders no section and no rule (verified `/films/slam`).
- **Credits.** `CreditBlock` with the real director row, no reveal, and, while that is the only credit, the in-block invitation naming the roles the film's own awards prove existed: "Only the director is credited so far. The awards prove there was also a screenwriter, an editor, a cinematographer, a sound designer and a set designer. Send the full credits and they go here." The mapping from category to role is `ROLE_FOR` in `components/film/words.ts` (acting awards prove a cast; Best Picture, Best Director and Audience Choice prove nothing extra). The aside disappears once more than one credit exists.
- **Also on the 2025 slate.** `getAdjacentFilms` (previous, then next, wrapping), rendered with the system's `FilmCard` so the number sits in the same place as on the homepage; each card a seeded `Reveal rise`. Heading falls back to "Next to it in the catalog" if a neighbour is from another year (it cannot happen with one slate, but the wrap will cross years later). Deduplicated for a catalog of two, hidden for a catalog of one.
- **The last line.** One sentence derived from the data ("FDOC won seven of the fifteen awards at the 2025 ceremony." / "Slam! is one of twelve films on the 2025 slate.") and the link "See the 2025 awards" on its own line.
- **Spacing.** Header `pt-block`, screen `mt-block` (close: the poster and the screen are one unit), then `mt-section` per block; one hairline after the screen (above Awards, inside the conditional) and the credit block's own; no rule anywhere else.

### 10.2 Awards page: what was built

The Academy register, in this room only: centred, heavy negative space, the largest type on the site, gold as data.

- **Header.** "The 2025 awards" at step 7 (`SplitText` + `Reveal none`), then "Fifteen awards to five films, presented May 2025." (`held` from the data, counts derived).
- **The seam.** The page has one axis, and it is the credit block's grammar turned to the awards: whatever announces sits right-aligned on the left, the film (`CatalogNumber` row size, then the linked title at step 5) sits left-aligned on the right, meeting at the centre (`.seam` in `components/awards/ceremony.css`). The tally and the fifteen winner rows share it, so the page reads as one programme.
- **The tally.** One row per winning film, most wins first: the numeral in the condensed voice at step 8 on the left, the film on the right. The numerals are `SplitText` inside `Reveal none` with `delay = DUR[3] + i * DUR[2]`, so they arrive after the title one beat apart; assistive tech hears "7 wins" through a visually hidden unit. Section heading "Wins by film" is visually hidden.
- **Three acts** (Craft, Performance, Picture, from `department`, ceremony order within each; `components/awards/ceremony.ts` unchanged). Winner row = `AwardBadge mode="row"` (category, person line only when present) on the left, number + linked title on the right, `Reveal rise` with a seed per category so rows settle on varied timing. No rules between rows. Nominees block renders only if the array is non-empty (it is empty). Nothing invented.
- **Finale.** The seal, then the only still on the page (the key film, halftoned at rest, `Reveal fade`), then the catalog number, the title at step 8 as the page's one un-underlined link, then "Directed by …". The block is a `frame-trigger`, so hovering anywhere in it or focusing the title link resolves the still. `pt-stage` above; the footer's own margin closes the page.

### 10.3 Rejections and decisions

- **Horizontal tally rejected** (`p1-awards-2025-1440-seg0.png`): five step-9 numerals across the page with a large "wins" unit read as a scoreboard, not a ceremony, and the shrink-to-fit columns broke long titles one word per line. Replaced by the seam rows (pass 2).
- **Step 9 for the tally numerals rejected.** Five step-9 numerals stacked are ~950px of digits at 1440. Step 8 (the same size as the finale title, one above the page title) keeps the tally the headline without becoming a wall. The lead's type table lists "tally numerals" under step 9; this is a deliberate deviation.
- **Per-row "wins" unit removed** (Chanel, pass 1). The lede already says "fifteen awards to five films"; five numerals summing to fifteen need no unit in sight.
- **Category printed twice per row** (the previous build: category label plus the badge) rejected: the seal is the category.
- **Two links to the film in the finale** (frame link plus title link, or a "Watch FDOC" button) rejected: one link, the title; the wrapper is the hover/focus trigger.
- **Laurel row for FDOC's seven** rejected without building: it fits one line only at the widest viewport and becomes the wrapping pile everywhere else; department columns are stable at every width and carry more information.
- **Credit rows with five "Name to be supplied"** rejected in favour of the direction's single director row plus the in-block sentence naming the roles.

### 10.4 Passes

### Film page (`/films/fdoc`, `/films/slam`, `/films/at-last-the-gift`, `/films/a-newby-cupids-guide-to-love-and-more`)

- **Pass 1** (`p1-films-fdoc-*`). Wrong: the closing sentence and its link wrapped mid-phrase inside the 60ch measure; two consecutive rule-plus-heading sections (Awards, Also on the slate) made the same rhythm twice; nothing else structural. Changed: link on its own line under the sentence. Removed: the hairline above "Also on the 2025 slate" (the cards separate themselves; the only rules left are the one after the screen and the credit block's own).
- **Pass 2** (`p2-films-*`). Wrong: the At Last leader at two-thirds width was a 900px empty rectangle that read as a placeholder; a single-seal award stack (At Last, Cupid) carried a department heading for nothing; Slam confirmed clean (no Awards section, no orphan rule). Changed: leader at half width with the sentence beside it. Removed: the group heading when there is only one group.
- **Pass 3** (`p3-films-*`, `focus-films-fdoc-1440-fold.png`). Verified the four routes at 1440 and 375; focus on the facade resolves the still and shows the ring; the Cupid title wraps to three balanced lines with the billing block at its foot. Nothing further changed.

### Awards page (`/awards/2025`)

- **Pass 1** (`p1-awards-*`). Wrong: scoreboard tally; titles collapsing to one word per line; the finale title (step 7) smaller than the tally numerals; lede orphaning "2025." at 375. Changed: seam rows for the tally at step 8, page title to step 7, finale title to step 8, `text-balance` on the lede. Removed: the five "wins" units.
- **Pass 2** (`p2-awards-*`). Wrong: rows missing from the 1440 full-page capture (see 6); the finale's `pb-stage` doubled the footer's `mt-section` into ~320px of nothing. Removed: `pb-stage` on the finale.
- **Pass 3** (`p3-awards-*`, `rm-awards-2025-1440-rm.png`, `w320-*`, `focus-awards-2025-1440-fold.png`). Reduced motion: every reveal settled, no transitions. Focus on a winner link: ring visible on "FDOC" in the Craft act. 320: no overflow from anything on the route (see 6 for the footer). Wrong: at 375 the act headings were centred over left-aligned stacked rows. Changed: headings centre only from 40rem, where the seam exists. Removed: the mobile centring.
- **Pass 4.** Wrong: three different gaps under the finale (8, 2, 3). Changed: number `mt-8`, title `mt-2`, director `mt-2`. Removed: the odd gap.
- **Pass 5** (`p5-awards-*`). Wrong: a hairline underline under a step-8 title read as a rule between the title and the director line. Removed: the underline on the finale title (`.finale__title`; hover colour and the still resolving are its hover state, the ring its focus state). All 21 reveals present at 1440 with a hydration settle before the scroll-through.

### 10.5 Copy written

- "2025 slate" / "Directed by Keller Huffman" (meta lines).
- "At Last, the Gift is not streaming. It screened at the festival only."
- "Only the director is credited so far. The awards prove there was also …. Send the full credits and they go here."
- "Also on the 2025 slate" / "Next to it in the catalog".
- "FDOC won seven of the fifteen awards at the 2025 ceremony." / "Slam! is one of twelve films on the 2025 slate." / "See the 2025 awards".
- "The 2025 awards" / "Fifteen awards to five films, presented May 2025." / "Wins by film" (hidden) / "Craft", "Performance", "Picture".

### 10.6 Gaps and things for the lead

- **Footer overflow at 320 (frozen).** Every route, including `/`, scrolls to 332px at a 320px viewport. The cause is `SiteFooter`'s `Wordmark size="footer"` (`.wordmark` is `white-space: nowrap`; "Student Film Association" at text-6 is 316px in a 288px column). Fix in the frozen shell: allow the footer wordmark to wrap (`white-space: normal` for `.wordmark--footer`) or use the initials below 24rem as the nav does.
- **Capture script races hydration.** `shot.mjs` begins its scroll-through the moment `networkidle` fires, before `Reveal` effects have attached observers, so reveals near the top of a page are scrolled past unobserved and show as missing in full-page captures (`p2-`, `p3-awards-2025-1440-seg0.png`). A 400ms settle after load makes all 21 reveals fire under the same 720px jumps (`scratchpad/revealcheck.mjs`). I used a copy, `scratchpad/shotE.mjs`, with a 500ms settle after `goto`; the homepage agent's captures may show the same artefact.
- **Route-local CSS.** `components/awards/ceremony.css` (the seam, the tally rows, the finale title) is imported by the ceremony page only, tokens only. If the seam is wanted elsewhere it belongs in `globals.css`.
- **Type-step deviation.** Tally numerals at step 8, not the step 9 the type table suggests (see 3).
- **Content the club should supply**: person-level winners (the row and the seal already render the person line when present), runtimes, credits beyond the director, a frame for At Last, the Gift.

## 11. Audit, remediation, final pass (2026-09-07)

Written by the remediation agent after the auditor's pass over the third
direction (findings G1 to G12, measured against the production build with
Playwright and Chrome). Every finding was fixed; nothing was left. Scripts and
raw results in the session scratchpad: `agentH-probe.mjs` / `agentH-probe.json`
(after the fixes), `agentH-lcp.mjs`, `agentH-final.mjs` / `agentH-final.json`
(after the removals); captures `shots/agentH/h1-*` (after the fixes) and
`h2-*` (final).

### 11.1 Findings

| Id | Sev. | Finding | Fix | Evidence after |
|---|---|---|---|---|
| G1 | major | Horizontal scroll at 320 on `/films/discrete-magematics`: "Magematics" nowrap at the step-8 floor (56px) is 308px in a 288px column | Step 8 alone re-anchored at 20rem: `--text-8: clamp(3rem, 2rem + 5vw, 6.5rem)` (`app/globals.css`). The auditor's floor of 3rem on its own would not have done it: the 24rem-anchored line still gives 53px at 320, 292px for the word | 48px at 320, 50.75px at 375, 104px at 1440 (unchanged); scrollWidth == clientWidth on all 14 routes at 320, 375, 640, 720 and 1440 |
| G2 | major | Every card downloaded its untreated 1280x720 original at rest, on touch too (351 KB of the homepage's 445 KB of images) | A fourth rendition, `{slug}-sm.webp` (640x360, the card's 2x), from `scripts/process-stills.ts` (idempotent: the 33 existing files were byte-identical after the run) and required by `scripts/validate-content.ts`; `components/Still.tsx` serves it for `size="card"` and wraps the original in `<picture><source media="(hover: hover) and (pointer: fine)">`, so where nothing can hover the second layer falls back to the treated file the browser already has (`revealed` bypasses the gate) | `/` images 444,913 to 283,991 B at 1440 and to 93,780 B at 375 (page 759 to 599 / 409 KB); `/films/fdoc` 132,223 to 93,619 / 23,865 B. Hover on a card resolves `fdoc-sm.webp` (natural 640); a touch context requests no original |
| G3 | minor | The dither crossfade still ran (0.7 to 0.8s) under reduced motion: the `:hover` / `:focus-within` rules at (0,3,0) beat the `-no-motion` override | Trigger selectors wrapped in `:where()` so they stay at (0,1,0) and the reduced-motion rules win | `reducedMotion: reduce`, focus a card: opacity 1 after one frame, transition `none`; the facade likewise |
| G4 | minor | The homepage LCP (the hero still) was gated on hydration by a `Reveal fade` | The hero frame is a plain link; the caption and the name keep their delays | LCP = FCP: 56ms warm / 380ms cold at 1440 (was 776 / 1592); 48ms warm at 375 (was 692) |
| G5 | minor | The skip link landed the h1 under the sticky nav (33px covered at 375) | `scroll-padding-top: var(--spacing-16)` on `html`; the per-section `scroll-mt-16` on `#films`, `#join` and `SectionHeading` dropped | After Tab + Enter: h1 top 128 (1440) / 96 (375) against nav bottom 65; `/#films` and `/#join` land at 64 |
| G6 | minor | Focus was dropped when the facade became the iframe | `VideoEmbed` focuses the iframe by ref when `playing` flips | Enter on `.facade`: `activeElement` is the iframe "FDOC (YouTube)" |
| G7 | minor | Card links announced the title twice ("Frame from FDOC Catalog number 1 FDOC ...") | `Frame` gained `decorative` (alt "" on the still, `aria-hidden` on the type-only leader), set by `FilmCard` only | link "Catalog number 1 FDOC Keller Huffman 7 wins"; "Catalog number 5 At Last, the Gift Christopher Cooper Festival only 1 win". The hero link, facade, finale and film-page leader keep their names |
| G8 | minor | Below lg, Tab reached "Watch FDOC" (y 568) before the frame above it (y 230) | DOM order is now the stacked order (frame, caption, sentence and action) with explicit grid placement at lg (`lg:col-start-1 lg:row-start-1` on the text column) instead of `order-last` | 375: frame (y 220) then Watch FDOC (559). Deliberate trade-off: at 1440 the frame (right) now precedes the button (left); both sit in the first screen, so no scrolling is involved |
| G9 | minor | `SplitText` exposed its text only as `aria-label` on a role-less span; the tally numerals were not voiced outside a naming context | `SplitText` renders a visually hidden text node, then the glyph words in an `aria-hidden` wrapper; `aria-label` dropped | Tally rows read "7 wins Catalog number 1 FDOC"; the headings "Student Film Association", "FDOC", "The 2025 awards" are unchanged |
| G10 | minor | Catalog tilts were effectively two values (+0.41..0.46 for 001-009, -0.26..-0.28 for 010-012): FNV-1a's weak final-byte avalanche | murmur3 finalizer in `lib/hash.ts` `hash01` | Tilts 0.40 0.34 0.52 -0.50 0.21 -0.02 0.41 0.28 -0.02 -0.35 0.14 0.53; win counts -0.49 / -0.05 / 0.33; seals spread -0.55..0.48. Every seeded value on the site changed with it (card crossfade timing, reveal delays and eases, glyph tilts), so the figures quoted in 9.1 and 9.4 are superseded. The stills' halftone phases use the pipeline's own hash and did not change |
| G11 | minor | Nav and footer text links were 15-19px tall (WCAG 2.5.8 by the spacing exception only) | `.site-nav__link` and `.link--quiet` are `inline-flex` with `min-height: var(--spacing-6)`; footer lists `gap-1` so the pitch barely moves | Films 37x24, Awards 51x24; footer links 26px tall (25 at 375), pitch 30px (was 27); underline intact |
| G12 | minor | Seven external links opened a new tab with no indication | `target="_blank"` and `rel="noreferrer"` removed from `ButtonLink`, `SiteFooter` and `FilmFacade`; there is no page state to keep | 0 `[target="_blank"]` on any route |

Two literal delays became tokens on the way: the `Reveal` settle guard's
`+ 200` is `DUR[2]`, and the tally numerals' delay is capped at `DUR[5]` so no
numeral waits past the orchestration budget however many films win. `picture`
joined `img, video, iframe { display: block }`; `.frame > img` became
`.frame img` for the `<picture>` wrapper.

### 11.2 Chanel's rule: one thing off each page

- **`/`: the "Message the club on Instagram" link in the Now showing strip.**
  The identical action (same label, same href) is the page's closing button in
  Join, and the nav's Join already points there; a third copy was the
  marketing default of a call to action in every section. The strip is now
  the heading and the sentence.
- **`/films/[slug]`: the "See the 2025 awards" link under the last sentence.**
  The nav's Awards link is on screen at the same moment and goes to the same
  page, and for a film that won nothing a link to the ceremony was a "related
  link" by habit. The derived sentence ("FDOC won seven of the fifteen awards
  at the 2025 ceremony." / "Slam! is one of twelve films on the 2025 slate.")
  stands alone as the end card.
- **`/awards/2025`: the catalog number in the finale.** A step-2 "No. 001"
  centred between a 1360px still and a step-8 title was a seventh of the
  title's size and read as a stray meta line; the film's number is already on
  its tally row and on each of its winner rows. The finale is the seal, the
  still, the title and the director. The auditor's count of catalog numbers
  (12 cards, 14 winner rows, 5 tally rows, every film page) is unchanged.

Tab stops move accordingly: `/` 36 to 35, `/films/fdoc` 10 to 9,
`/awards/2025` 11 unchanged.

### 11.3 Definition of done (REMEDIATION_BRIEF.md Part 7)

| Item | Status | Evidence |
|---|---|---|
| Catalog numbers on every film, production order, consistent | done | `CatalogNumber` on 12/12 cards, 14 winner rows, 5 tally rows, every film page; `no` 1-12 from `content/films.json`, validated contiguous |
| Build-time dither pipeline, stills inspected, committed | done | `scripts/process-stills.ts`; 44 files in `public/stills` (11 films x 4; the twelfth has no frame by design); `scripts/DITHER_REPORT.md`, `docs/dither-*.png`; all 11 treated stills looked at again in `shots/agentH` |
| Credit block on the film page and the exec board | done | `components/CreditBlock.tsx` via `components/film/FilmCredits.tsx` and `components/home/Crew.tsx` |
| `gold` referenced in exactly one component | done, precisely | `grep -rniw gold app components lib content` hits `components/AwardBadge.tsx` (comments; it renders `.award`) and `app/globals.css` (the `--color-gold` token and the one `.award { color: var(--color-gold) }` rule). So the rule holds with the token definition and its single consuming rule living in the token file; exactly one component renders `.award`. Compiled CSS contains "gold" twice; `scripts/check-tokens.mjs` fails on a third file |
| Token file; hex grep outside it returns nothing | done | 0 hex in `app/`, `components/`, `lib/`, `content/` outside `app/globals.css`. Outside the scanned tree, `scripts/process-stills.ts` (`PALETTE`) and `app/icon.svg` carry base and carolina because the pipeline and the favicon have no CSS to read |
| At least eight fluid type steps in active use | done | Eight of nine: `text-2` x10 (+5 `var(--text-2)`), `text-3` x2 (+3), `text-4` x9 (+2), `text-5` x7, `text-6` x7 (+1), `text-7` x2, `text-8` x4 (+1), `text-9` x1 (+1) across `app/` and `components/`. `text-1` (captions) is defined and not yet used; the smallest text on the site is step 2 |
| Exactly four easings and five durations defined and used | done, one reserved | Defined once in `app/globals.css` (4 `--ease-*`, 5 `--dur-*`), mirrored in `lib/motion.ts`. Used: `--ease-out` x14, `--ease-in` x1, `--ease-in-out` x1 (the seeded Reveal pick); `--dur-1` x12, `--dur-2` x1 CSS + 3 JS, `--dur-3` x2 + 3, `--dur-4` x3 + 1, `--dur-5` x1 JS (the tally cap). `--ease-linear` is defined and unused: it is for continuous motion and the site has none (brief 4.8). The one duration outside the tokens is Lenis's `duration: 1.05` (seconds), the value brief 4.3 prescribes |
| Smooth scroll with a native fallback under reduced motion | done | `components/motion/SmoothScroll.tsx`; under `-no-motion` Lenis is never created (`html.lenis` absent, `window.lenisVersion` undefined) and `lib/scroll.ts` attaches its native listener |
| One scroll handler for the whole page | done | `grep addEventListener('scroll')`: 1, in `lib/scroll.ts` (Lenis owns the native one while it runs); 1 `new IntersectionObserver`, in `components/motion/Reveal.tsx` |
| Zero all-caps tracked-out eyebrows | done | 0 `text-transform: uppercase` elements on any route (auditor); the small labels left are sentence-case list headings |
| Zero middle-dot meta strings | done | 0 on any route |
| Zero arrows appended to link text | done | 0 arrow characters, 0 SVG arrows; `ArrowLink` deleted in wave 2 |
| Not every section uses the same entrance | done | Hero: the frame is simply there, the caption fades, the name arrives glyph by glyph; catalog and adjacent cards rise on seeded timing; teaser rows fade; process, crew, credits and join have no reveal; awards: numerals staggered, rows rise, the finale fades |
| Not every surface shares one radius and one shadow | done | Radius 0 and no shadow anywhere (`--radius-*: initial`, `--shadow-*: initial`); surfaces differ by tone (base, surface), hairline and unequal air (`block`, `section`, `stage`), not by a card treatment |
| Engineered irregularity in at least two places | done | Six: catalog tilt and nudge, badge tilt, card crossfade duration and delay, reveal delay and ease, glyph rotation and baseline, halftone phase per still |
| Every route correct at 375, no horizontal scroll at 320 | done | 14 routes x 320 / 375 / 640 / 720 / 1440: scrollWidth == clientWidth (`agentH-final.json`, `overflow`) |
| Keyboard navigable, visible focus, reveal on focus | done | Every stop matches `:focus-visible` with the 2px carolina ring; focusing a card, the hero link, the facade or the finale title resolves the still (re-checked after G3) |
| Reduced-motion path implemented and tested | done | Root `js -no-motion`, 0 running transitions, 0 animations, reveals settled, crossfade instant (G3) |
| No text over dither without a scrim | done | The facade label has a solid cream fill; every caption sits outside its frame; the leader's text sits on the solid surface tone |
| Build clean, no type errors, no console errors | done | `npm run check` clean (content, tsc, eslint, check-tokens 52 files); `next build` 17 pages; 0 console errors or warnings on 5 routes x 3 widths |
| Deployed and loading on a cold visit | done for the committed build | `curl` https://sfawebsite-kappa.vercel.app: 200 in 0.17s, cold; this pass deploys on the lead's next push to `main` |
| `AUDIT.md` written before any changes | done | Dated against `98654b0`, before wave 2 |
| `DESIGN_NOTES.md` records every rejected direction | done | Sections 1 to 11 |
| `README.md` explains how to add a film in under ten lines | done | Five numbered steps, nine lines with their wraps, plus two of notes |
