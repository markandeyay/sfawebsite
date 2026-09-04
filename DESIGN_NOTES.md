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

## 2. Image treatment

*(filled in after the pipeline comparison)*

## 3. Hero concepts

*(filled in after both are built and screenshotted)*

## 4. Screenshot passes

*(one entry per pass per route, desktop and 375px)*

## 5. Things the club needs to supply

*(running list; doubles as the pitch argument)*
