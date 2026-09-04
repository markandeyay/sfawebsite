# UNC Student Film Association — Website Rebuild

**System design document, v1**
**Prepared for execution by Claude Code**
**Date: September 2026**

---

## 0. How to use this document

You are Claude Code, operating inside an empty local folder called `sfawebsite`. This document is the only file present. Everything you need is in here. You should not need to browse the web for content, though you may browse for library documentation.

This document is a **scaffold, not a spec sheet**. It pins down the things that are already decided, hands you a complete seed dataset, and then explicitly delegates a set of design and implementation decisions to you. Sections marked **[DELEGATED]** are yours to reason through and decide. Sections marked **[LOCKED]** were decided by the client and should not be relitigated.

The client is a UNC student who is a competent engineer but is not the designer here. He picked the direction; you are the design lead executing it. He would rather you make a strong opinionated choice and explain it than ask him five questions.

### Suggested kickoff prompt

The user will paste something like this. If they paste less, act on this anyway.

> Read SFA_SYSTEM_DESIGN.md end to end before doing anything. Then set up the repo, push to the remote listed in section 12, plan your design in writing, build the three routes, screenshot and critique your own work in a loop until it clears the quality bar in section 15, and deploy. Use subagents for parallelizable work. Ask me only when you hit something in section 18 you genuinely cannot decide, or when you need my credentials.

### Working posture

- **Plan before building.** Section 14 defines the working method. Follow it.
- **Iterate visually.** You have a computer. Render the site, screenshot it, look at it, criticize it, fix it. Repeat. A page you have never looked at is not finished.
- **Use subagents.** Section 14.3 lists the natural parallel splits.
- **Commit continuously.** Every meaningful checkpoint gets a commit. The user is not configuring git; you are.
- **Do not ask permission to proceed.** Ask only for credentials or for the decisions listed in 18.4.

---

## 1. The project in one paragraph

The UNC Student Film Association is a student-run film production club with roughly 100 members. Each year, members pitch scripts, a review board greenlights a slate, crews form, films get made, and the year ends with a festival and an awards ceremony modeled on the Oscars. Their current website is a Weebly site that does none of this justice. This project replaces it with a site that treats the club's output like a real film catalog and its awards like a real ceremony. The immediate deliverable is a three-route demo, deployed and shareable, that the client shows to the club president within a week to win approval for the full build.

---

## 2. What exists today, and what is wrong with it

Current site: `https://uncstudentfilmassociationunc.weebly.com/`

You do not need to visit it. Everything usable has been extracted into section 8. This section explains what to avoid repeating.

### 2.1 Structural failures

**The navigation is the club's internal vocabulary.** The menu contains "2025 Studio Process," "2025 Indie Process," "2024 Studio Process," "2024 Indie Process," "2023 Studio Process," "2022 Films," "2021 Films," "2020 Films." A visitor has no idea what "Studio Process" means. Worse, the structure grows by two nav items per year. It is an archive pretending to be a navigation.

**Films have no pages.** Every film exists as a YouTube embed, a one-line logline, a director credit, and an award list, all crammed into a Weebly table cell. There are no detail pages, no cast, no crew, no stills, no runtime. For a club whose entire output is collaborative films made by student crews, nobody who worked on a film has anything to link to. This is the single biggest failure of the current site and the biggest opportunity of the rebuild.

**Awards are bolded text with pipe characters.** Literally: `BEST PICTURE | BEST SCREENPLAY | BEST DIRECTOR | BEST EDITING`. And the acting awards name the winning *film* rather than the winning *actor*, which is backwards for a page whose purpose is crediting people.

**Layout is done with HTML tables.** The nav is rendered twice in the DOM. The homepage carries ten YouTube iframes above the fold.

**Nothing is time-aware.** As of September 2026 the homepage still leads with the May 2025 award winners. The site is a full cycle stale. There is no pitch date, no deadline, no recruitment call to action, during the exact month when recruitment matters most.

**The domain is `uncstudentfilmassociationunc.weebly.com`.** It contains "unc" twice and the word "weebly."

### 2.2 Aesthetic failure

Default Weebly sans-serif, white background, everything shouting in capitals, grey YouTube player rectangles as the dominant visual element. Film is a dark-room medium and the site looks like a dentist's office. There is no typographic identity, no consistent image treatment, and no sense of occasion anywhere, including on the page about the awards ceremony.

---

## 3. Audience and success criteria

### 3.1 Who this is for, in priority order

1. **A UNC student deciding whether to join.** Usually a first-year, usually with no film experience, usually arriving in September. Needs to understand what the club does, see that the output is good, and find one obvious next action.
2. **The club president, this week.** Needs to see that the rebuild is a serious upgrade worth committing the club to.
3. **Club members looking for their own credit.** The retention mechanic. A member who can send a link to their name on a real site stays.
4. **Outsiders: alumni, faculty, potential sponsors, festival programmers.** Need the club to look legitimate in under ten seconds.

### 3.2 The demo succeeds if

The president scrolls the homepage, hits a catalog of films that look like they belong to the same organization, opens one film and sees a real credited page, opens the 2025 awards and sees the ceremony rendered as an event, and says some version of "when can we switch."

### 3.3 The demo fails if

It reads as a template with the club's content dropped in. Section 5.6 is about avoiding exactly that.

---

## 4. Scope

### 4.1 In scope for this build [LOCKED]

Three routes, finished to a polish. Not nine routes at seventy percent.

| Route | Purpose |
|---|---|
| `/` | Homepage. Hero, current cycle, catalog strip, awards teaser, how it works, crew, join. |
| `/films/fdoc` | One fully realized film page. FDOC swept seven categories in 2025, so its award stack demonstrates the system at full weight. |
| `/awards/2025` | The 2025 ceremony as a page. This is where the gold-as-data idea pays off and it is the strongest concept in the redesign. |

The catalog grid lives as a strip on the homepage rather than as a separate `/films` route. A six-up strip demonstrates the image system just as convincingly as a full index page and buys back the time for the awards page.

Build the routing and data layer so the remaining routes in section 6 are additive, not a refactor. Other film pages may render from the same template if that costs nothing; do not spend time polishing them.

### 4.2 Explicitly out of scope

- CMS, database, authentication, admin panel
- Script or pitch submission handling
- `/people/[slug]` pages, though the data model must support them later
- Search
- Analytics beyond whatever Vercel gives for free
- A custom domain purchase
- Generated or synthetic imagery of any kind (see 9.4)
- Any content for cycles other than 2025

---

## 5. Design direction

### 5.1 Palette [LOCKED]

The client chose this after reviewing three options. Do not substitute.

| Token | Hex | Role |
|---|---|---|
| `base` | `#0B0D0F` | Page background. Deliberately not pure black, which goes flat under grain. |
| `surface` | `#14181C` | Cards, nav, form fields, raised elements. |
| `carolina` | `#4B9CD3` | UNC's official Carolina Blue. The house color. Duotone highlight, links, focus rings, active states. |
| `deep` | `#2A5C7D` | Duotone shadow, borders, muted and disabled states. |
| `gold` | `#D4AF37` | **Winners only.** See 5.2. |
| `cream` | `#EDE9E1` | All body and heading text. |

Contrast against `base`: cream is roughly 15:1, gold roughly 9:1, Carolina roughly 7:1. All clear WCAG AA for body text. `deep` does not, so never use it for text on `base`.

### 5.2 The gold rule [LOCKED]

**Gold is a data type, not a decoration.** If an element on this site is gold, it is because someone voted for it. Award winners, and nothing else. Not headings, not buttons, not borders, not hover states, not the logo.

This is the strongest idea in the redesign and it does two jobs. It makes the awards archive genuinely exciting to scroll, because gold is scarce everywhere else. And it prevents the site from drifting into the black-and-gold steakhouse register that black-plus-gold designs fall into by default.

Enforce it in code. A single `Award` or `Winner` component should be the only place `gold` appears in the stylesheet. If a second place needs it, that is a signal to reconsider, not to add a class.

### 5.3 Typography [DELEGATED]

Constraints: Google Fonts only, no licensing conversation before a pitch. Two families maximum.

Roles that need covering:
- **Display.** Film titles, section heads, the club name. This is where the personality lives.
- **Credits.** Role and name pairs in the end-credit blocks. The film industry convention is a condensed sans, and honoring that convention is a large part of what will make this site feel like it was made by people who watch movies.
- **Body.** Loglines, about copy, form labels.

Credits and body can be the same family at different widths if that reads better to you.

Starting points, not instructions: Instrument Serif, Bodoni Moda, or Fraunces for display; Archivo Narrow, Oswald, or Barlow Condensed for credits; Inter Tight, Public Sans, or Sora for body. Reject any of these if you find something better suited. The one thing to avoid is a pairing that could belong to any other project.

Set a real type scale with intentional weights and spacing rather than defaulting to Tailwind's steps. Body line length under 80 characters.

### 5.4 The end-credit block [LOCKED as a concept, DELEGATED as an implementation]

Build a component that renders role and name pairs in the layout of an actual film end-credit block: right-aligned role, left-aligned name, meeting at a center gutter, condensed sans, tight leading.

Use it twice. Once for the exec board on the homepage, once at the bottom of every film page. One component, two placements, and it does more for the intended feeling than any color choice will. This is the detail that signals the site was made by someone who has actually sat through credits.

Reduce it to a stacked layout on narrow screens rather than shrinking the type.

### 5.5 Motion [DELEGATED with a constraint]

Spend your motion budget in one place. One orchestrated moment lands; fade-and-slide-up on every section is the generic default and will read as machine-made.

The obvious candidate for the one moment is the image reveal described in section 9. It is user-triggered, it explains itself, and it is the site's signature.

Whatever you build must have a `prefers-reduced-motion` path that is not a degraded experience but a deliberate alternative. Budget real time for this; it always takes longer than expected.

### 5.6 The generic-design trap

This is the highest-risk part of the brief and worth reading twice.

The client's chosen direction, a near-black background with a bright accent, is one of the most common clusters in machine-generated design. So is a cream background near `#F4F1EA`, which is why the cream token above was moved off that value. So is the whole kit of: all-caps tracked-out eyebrow labels above every heading, `01 / 02 / 03` section numbers, meta strings joined with middle dots, arrows appended to button text, and identical rounded cards with the same soft grey shadow.

The palette is locked, so you cannot differentiate there. **Differentiation has to come from three places instead:**

1. **The image treatment** (section 9). Nobody else's site looks like a contact sheet of dithered film frames.
2. **The credit block** (5.4). Structurally specific to this subject matter.
3. **The gold rule** (5.2). A color that encodes data rather than decorating.

On section numbering specifically: the reference site the client likes uses numbered sections heavily, and he liked that. But numbering is only honest when the content is genuinely a sequence. The club's production process *is* a sequence, so numbering the "how it works" steps is legitimate. A homepage's sections are not a sequence, so numbering them is decoration. Reels are numbered and that is a real film-world convention, so there may be a version of this that earns its place. Reason it through and make a call rather than applying numbers everywhere or nowhere.

### 5.7 Copy

There is no copywriter. You are writing the words.

The current site's voice is capital-letters institutional. The new voice should be plain, specific, and confident. Say what the club does in the terms a first-year would use. "Studio Process" and "Indie Process" are internal jargon and should be explained in plain language before the terms are used at all, if the terms survive.

Calls to action name what happens. Empty states are invitations. Sentence case throughout, including buttons and labels.

---

## 6. Information architecture

### 6.1 The full target map

Build only the three bolded routes. Design the data layer so the rest are additive.

| Route | What it is | Status |
|---|---|---|
| **`/`** | Homepage | **In scope** |
| `/films` | Full catalog, filterable by year and track | Later |
| **`/films/[slug]`** | Single film: video, logline, full credits, awards | **In scope, one instance polished** |
| `/awards` | Index of ceremonies by year | Later |
| **`/awards/[year]`** | One ceremony as a page | **In scope, 2025 only** |
| `/about` | What the club is, both tracks explained plainly | Later |
| `/people/[slug]` | A member's credits across all years | Later, highest-value future feature |
| `/join` | Interest form, semester calendar, FAQ | Later |
| `/resources` | Workshops, templates, bylaws | Later |

Nine routes replace fourteen archive pages, and the film count grows forever without touching the nav.

Two structural rules. "Studio Process" and "Indie Process" become a filter on `/films`, never nav items. And `/people/[slug]` is nearly free to build later because it is just a query over credit arrays you are already storing, which is why section 7 shapes credits the way it does.

### 6.2 Homepage section stack

Ordered. Names are working labels, not final copy.

| # | Section | Contents |
|---|---|---|
| 00 | Cold open | Hero. See 11.1. |
| 01 | Now showing | Current cycle dates and the primary call to action. |
| 02 | The catalog | Six-up strip of dithered film stills, linking to film pages. |
| 03 | The awards | Teaser for the 2025 ceremony. Gold appears here for the first time. |
| 04 | How it works | The two tracks explained in plain language. Legitimately a sequence. |
| 05 | The crew | Exec board as an end-credit block. |
| 06 | Join | One form or one link, plus footer. |

---

## 7. Content model

Two JSON files under `/content`. The entire site is a pure function of these.

### 7.1 `films.json`

```jsonc
{
  "slug": "fdoc",
  "title": "FDOC",
  "year": 2025,
  "track": "studio",              // "studio" | "indie"
  "director": "Keller Huffman",
  "logline": "Follow a case of beer as it switches hands...",
  "youtubeId": "2RFfhQ--oos",
  "viewable": true,               // false = festival exclusivity, see 7.4
  "runtime": null,                // minutes, null when unknown
  "still": {
    "treated": "/stills/fdoc-treated.webp",
    "original": "/stills/fdoc.webp"
  },
  "awards": [
    { "category": "Best Picture", "person": null }
  ],
  "credits": [
    { "role": "Director", "name": "Keller Huffman" }
  ]
}
```

Notes on the shape:

- `credits` is a flat array of role and name pairs, not a nested object. This is deliberate. Film credits are irregular, the same person holds multiple roles, and a flat array renders directly into the credit block in source order. It also makes `/people/[slug]` a one-line filter later.
- `awards[].person` is null when the award is film-level and a name when it is person-level. See 7.4 for why most of these are null right now.
- `runtime` is null across the board because the source site never published runtimes. Design the component so a null runtime disappears cleanly rather than rendering an empty slot.

### 7.2 `awards.json`

```jsonc
{
  "year": 2025,
  "categories": [
    {
      "category": "Best Picture",
      "winner": { "filmSlug": "fdoc", "person": null },
      "nominees": []
    }
  ]
}
```

Winner and nominee entries share a shape so one component renders both from one loop, with gold applied only to the winner. `nominees` is empty across the board, which is a content gap, not a schema gap. See 7.4.

### 7.3 Types

Define TypeScript types for both and validate at build time. A malformed content file should fail the build loudly, not render a broken page.

### 7.4 Known content gaps, and how to design around them

These are real and you cannot fix them. Design so their absence looks intentional.

**Person-level award winners are unknown.** The source site says Senior Assassin won Best Lead Actor without naming the actor. Every acting, cinematography, editing, and score award is film-level only. This is why `person` is null nearly everywhere.

> **Design instruction:** do not render empty name slots. On an awards page, blanks are the one thing that reads as unfinished. Make the winner row render correctly with film only, and treat the person line as an enhancement that appears when present. Build and test with at least one fake-but-clearly-placeholder person entry so the enhanced state is verified, then remove it before shipping.

**Nominees are unknown.** Only winners were ever published. A ceremony page with winners and no nominees is a legitimate design; a ceremony page with a "Nominees" heading and nothing under it is not.

> **Design instruction:** make nominees a conditional block. If the array is empty, the category renders as a clean winner row.

**Award category names are inconsistent in the source.** The homepage says "Best Director," the film page says "Best Directing." Normalize to one canonical list in the seed data and note the change in a comment.

**The 2026 cycle is missing entirely.** The site was never updated after May 2025 and it is now September 2026. The client has no 2026 data. This is a talking point for the pitch, not something to paper over: the current site is a full cycle stale, which is itself part of the argument for a site that is easy to update.

**Runtimes, cast lists, and crew beyond the director do not exist anywhere.**

> **Design instruction:** the FDOC page needs a credible credit block to demonstrate the concept, and there is exactly one real credit available. Do not invent names. Render the credit block with the real director credit plus the seven award categories FDOC won, presented as credits where the category implies a role. If that reads too thin, add a clearly-marked empty state inviting the club to supply full credits, which doubles as a pitch argument. Choose whichever reads better and say which you chose and why.

---

## 8. Seed content

This is real, scraped from the live site. Use it verbatim except where noted.

### 8.1 Club description

From the club's own YouTube channel, lightly trimmed. Rewrite for the site in your own voice per section 5.7; this is source material, not final copy.

> Student Film Association, formerly the Carolina Film Association, is a student-run independent filmmaking organization committed to helping students develop their cinematic craft. It offers resources, guidance, and structure to student filmmakers. Ideas, pitches, and scripts of any nature are welcomed from all UNC students. After a feasibility assessment in the fall semester, greenlit productions are assigned a producer and begin building a crew of actors, editors, cinematographers, and set crew. During the spring semester, those crews develop the work, which is screened at the SFA Film Festival in May.

Other facts available: the club has grown to over 100 undergraduates from many academic disciplines; it is structured like a production company with an officer board, a board of executive producers, and department guilds for screenwriting, editing, acting and others; films run to roughly a twenty minute limit; scripts go to a script review board that decides what gets produced.

### 8.2 Films, 2025 studio process

All twelve. Awards listed are from the source and normalized per 7.4.

| Slug | Title | Director | YouTube ID | Awards |
|---|---|---|---|---|
| `fdoc` | FDOC | Keller Huffman | `2RFfhQ--oos` | Best Picture, Best Director, Best Screenplay, Best Editing, Best Cinematography, Best Sound Design, Best Set Design |
| `silenced` | Silenced | Peyton Jones | `Mx3-gEfzYN4` | Best Supporting Actress, Best Costume Design, Best Hair and Makeup |
| `senior-assassin` | Senior Assassin | Carson Withers | `fEXqE4i4IpM` | Best Lead Actor, Best Supporting Actor, Best Original Score |
| `a-newby-cupids-guide-to-love-and-more` | A Newby Cupid's Guide to Love & More | Joelle Adeleke | `RNyXv09ujv0` | Best Lead Actress |
| `at-last-the-gift` | At Last, the Gift | Christopher Cooper | `LKPT6smWlJo` | Audience Choice |
| `how-does-it-feel` | How Does It Feel? | Kiran Garcha | `Mji_606d6ZI` | — |
| `spaghetti-and-me` | Spaghetti and Me | Keaton Crooks | `cnp1SLmIZps` | — |
| `the-tulips` | The Tulips | Zoe Wynns | `GTBtTmzMdCo` | — |
| `omnes-unum` | Omnes Unum | Ember Penney | `bslYQmVjFkk` | — |
| `slam` | Slam! | Kolby Oglesby | `1DsY62HjXWw` | — |
| `hard-pills-to-swallow` | Hard Pills to Swallow | Eric Sprague | `NHlh36jURDg` | — |
| `discrete-magematics` | Discrete Magematics | David Majernik | `BnjpJGetkyo` | — |

Loglines, verbatim from the source:

- **FDOC:** Follow a case of beer as it switches hands among a vibrant college ensemble over the course of the first day of class.
- **Silenced:** Big Boss throws a dinner party for his friends. All is merry, but when someone dares to speak, it quickly becomes evident why the film is a silent one.
- **Senior Assassin:** When a game of Senior Assassin adds on a cash prize, a wannabe detective must find the mastermind who's picking off "The Teeth."
- **A Newby Cupid's Guide to Love & More:** A pair of Cupids-in-training must help a socially awkward college student fall in love. In the process, they end up causing a series of chaotic and near-lethal romantic mishaps.
- **At Last, the Gift:** Timothy Coleman disappeared thirteen months ago. Elaine Coleman is going to find him.
- **How Does It Feel?:** Jake is sentenced to prison for murder and undergoes a mysterious simulation as part of a rehabilitation program.
- **Spaghetti and Me:** A film about insecurity, AI, and the theatre.
- **The Tulips:** Dolores discovers a girl who's been buried alive. Now she must wrestle with whether to reveal her buried friend Tulip, while her sister becomes increasingly worried that Tulip isn't real at all.
- **Omnes Unum:** A physics professor's entire world unravels when he learns a universal truth.
- **Slam!:** A renowned slam poet returns to his old college to perform on open mic night. To his surprise, his strongest competitor is his old performance partner, who he left in the dust for fame. Only one voice will echo.
- **Hard Pills to Swallow:** Ex-roommates Jake and Steven reunite at a party senior year. When the night takes a turn for the worst, Steven's life ends up in Jake's hands. Will he save it?
- **Discrete Magematics:** When an aspiring computer science major accidentally signs up for a math class run by wizards, he finds himself roped into their scheme to take down his university's computer science department.

### 8.3 The 2025 ceremony

Fifteen categories. Winners only; nominees were never published.

| Category | Winning film | Winning person |
|---|---|---|
| Best Picture | FDOC | unknown |
| Best Director | FDOC | unknown |
| Best Screenplay | FDOC | unknown |
| Best Editing | FDOC | unknown |
| Best Cinematography | FDOC | unknown |
| Best Sound Design | FDOC | unknown |
| Best Set Design | FDOC | unknown |
| Best Lead Actor | Senior Assassin | unknown |
| Best Lead Actress | A Newby Cupid's Guide to Love & More | unknown |
| Best Supporting Actor | Senior Assassin | unknown |
| Best Supporting Actress | Silenced | unknown |
| Best Original Score | Senior Assassin | unknown |
| Best Costume Design | Silenced | unknown |
| Best Hair and Makeup | Silenced | unknown |
| Audience Choice | At Last, the Gift | unknown |

Ordering note: this is a plausible ceremony order, ascending in prestige toward Best Picture, which is how ceremonies actually run. Consider whether the page should present them in ceremony order rather than the order above, and whether Best Picture deserves different treatment from the other fourteen. That is a design decision worth making deliberately.

### 8.4 Other assets

- **Club reel on YouTube:** `nicAYLUCvD0`. The current homepage embeds it. It is old. Use it only if it earns its place.
- **Instagram:** `@uncstudentfilmassociation`
- **YouTube:** `@studentfilmassociationunc`
- **LinkedIn:** `linkedin.com/company/student-fillm-association-unc` (the typo is in the real URL, do not correct it)
- **Club bylaws:** hosted on Google Drive, file ID `1drsTe3_7csil9QdSOqq37OqhZpbgloBJ`

### 8.5 Content the client does not have

No exec board roster. No semester calendar or pitch dates. No photography of any kind. No logo or wordmark. No 2026 films.

> **Design instruction:** the exec board credit block and the current-cycle section both need placeholder content. Write placeholders that are obviously placeholders to the client but would not embarrass him if the president saw them. Do not invent plausible-looking fake names for real roles at a real organization. Use role labels with an evident empty state, or use the section to make the argument that this is the content the club needs to supply. There is no wordmark, so the club name set in the display face **is** the wordmark; treat that as a design opportunity rather than a gap.

---

## 9. The image system

This is the signature of the site and the thing that solves the client's hardest constraint.

### 9.1 The problem

There is no photography. What exists is twelve YouTube video IDs. YouTube exposes a still for every video at a predictable thumbnail URL. So the available image library is twelve auto-selected frames from student films, shot on mixed equipment, at mixed skill levels, in mixed lighting, at mixed resolutions. Dropping those into a grid produces visual chaos, and chaos reads as amateur.

### 9.2 The solution

Process every still into a two-color treatment using the `carolina` and `base` tokens: posterize, then apply ordered dithering. Heavy processing destroys the differences between source images. A blown-out phone-shot interior and a properly lit night exterior both resolve into the same grain field. Inconsistent sources stop being a weakness and become a deliberate print treatment.

The reveal, on hover or focus, cross-fades to the untreated frame. The treated state is the identity; the real frame is the reward.

### 9.3 Implementation [LOCKED as build-time, DELEGATED as algorithm]

**Process at build time, not runtime.** Write a Node script using `sharp` that fetches each thumbnail, applies the treatment, and writes both the treated and original images into `/public/stills`. Run it once, inspect all twelve outputs by eye, commit the results.

This matters for four reasons: the output is deterministic and reviewable; there is no runtime cost; there is no flash of untreated content; and you can hand-swap the source frame for any film that dithers badly, which is impossible with a CSS filter.

The reveal then reduces to two stacked images and an opacity transition. No canvas, no SVG filters, no JavaScript required for the base case.

The specific algorithm is yours. Floyd-Steinberg, ordered Bayer, a halftone dot screen, and a hard posterize all produce different characters. Try more than one, look at the results, and pick. Bayer dithering tends to read as printed matter; error-diffusion tends to read as photographic. Either is defensible. Consider whether a small amount of the `deep` token as a third tone helps or muddies it.

Thumbnail URLs follow the pattern `https://i.ytimg.com/vi/{videoId}/maxresdefault.jpg`, with `hqdefault.jpg` as a fallback for videos that lack a max-res still. Handle the fallback; some of these are old uploads.

**Cache the raw downloads** so re-running the treatment does not re-fetch. The script should be idempotent and safe to run repeatedly while you tune the algorithm.

### 9.4 Generated imagery [LOCKED]

**Do not generate any images.** No hero plates, no textures, no posters, no faces, no placeholder photography.

This was discussed and decided. The reasoning matters because it will come up: this site is a *record* of real work by real students. A generated still attached to a real film is a false claim about someone's work, published in the one place that work is supposed to be credited. And the audience is film students, which is the least forgiving possible audience for it.

Where you need visual material that photography cannot supply, solve it with type, layout, color, and the dither system. That constraint is a feature; it is what will make the site look like a considered object rather than an assembled one.

Grain, scan lines, letterbox bars, and similar effects generated in CSS or SVG are not images and are fine.

### 9.5 Aspect ratio [LOCKED]

Film cards are 16:9, not poster shape. There are frames, not posters. Center-cropping 16:9 frames into a 2:3 poster crop turns them to mush. Leaning into 16:9 makes the catalog read as a contact sheet, which is more honest for a student film club than faking a poster wall.

---

## 10. Component inventory

Not exhaustive, and the decomposition is yours. This is the set the routes imply.

| Component | Notes |
|---|---|
| `FilmCard` | 16:9, dithered still, reveal on hover and focus, title, director, year, award badges. Needs a locked variant for `viewable: false`. |
| `CreditBlock` | Section 5.4. Used on the film page and for the exec board. |
| `AwardBadge` | The only component in the codebase permitted to use `gold`. |
| `AwardRow` | One ceremony category. Renders winner, and nominees when present. |
| `VideoEmbed` | Lazy-loaded YouTube facade: render the treated still with a play affordance, load the iframe only on click. Never ship twelve live iframes. |
| `Marquee` | Optional. If used, one instance, reduced-motion safe, and carrying real information rather than filler. |
| `Hero` | See 11.1. |
| `SectionHeader` | Reason about numbering here per 5.6. |

---

## 11. Route specifications

### 11.1 `/` — Homepage

**Hero [DELEGATED with a strong recommendation].**

The recommendation is: do not use video. There is no current footage, the club reel is from an old cycle, and autoplay video is the thing that most reliably makes a student site feel amateur when it stutters. A slow push on a single dithered still, letterboxed, with the club name set large, loads instantly and survives having no assets.

That said, this is the first thing the president sees and it is where you should take your one real aesthetic risk. If you can reason your way to something better than a Ken Burns push, do it. The most characteristic thing in this subject's world is not a logo, it is a dark room with a lit screen. Something that opens with that idea is worth more than a well-executed default. Try at least two hero concepts, screenshot both, compare, and keep the better one. Say which you rejected and why.

**Now showing.** Current cycle dates and the primary call to action. The client has no dates. Build the component with a clear placeholder and make the call to action the interest link, so the section is not stale on arrival. A homepage whose only call to action is out of date is the exact criticism being made of the existing site.

**Catalog strip.** Six films from `films.json`. Which six is a design decision: the award winners are the strongest images-plus-story combination, but a slice that shows range may serve recruitment better.

**Awards teaser.** First gold on the page. Links to `/awards/2025`.

**How it works.** The two tracks in plain language. Genuinely sequential content, so numbering is legitimate here if you use it anywhere.

**The crew.** Credit block with placeholder handling per 8.5.

**Join and footer.** One clear action. Real social links from 8.4.

### 11.2 `/films/fdoc` — Film page

The page that proves the whole concept. Above the fold: title, year, director, logline, and the video facade. Below: the full credit block, the award stack, and navigation to adjacent films.

FDOC won seven categories, so the award stack is the visual event of this page. Seven gold badges in a row is a lot of gold in one place; that is the intended payoff of the scarcity rule elsewhere, but it needs composing rather than listing. Think about whether they stack, wrap, form a column, or get grouped by department.

Handle the thin-credits problem per 7.4.

### 11.3 `/awards/2025` — Ceremony page

Fifteen categories, one winner each, no nominees. The design problem is that fifteen near-identical rows is a list, and a list is not an event.

Things worth reasoning about: whether Best Picture gets separate treatment; whether categories group by department (craft, performance, picture) or run in ceremony order; whether the page opens with the night's headline, which is that one film took seven of fifteen categories; whether film stills appear per row or only for the top categories.

This page is the strongest idea in the redesign. Give it the most iteration.

---

## 12. Stack and repository

### 12.1 Stack [LOCKED]

- **Next.js**, App Router, TypeScript, static generation. The client already ships on Vercel.
- **Tailwind** for styling, with the palette wired in as theme tokens rather than arbitrary values. If you would rather use CSS modules or vanilla CSS with custom properties, that is defensible; say why and be consistent.
- **`sharp`** for the build-time image pipeline.
- **No CMS, no database, no auth.** Content is JSON in the repo. The client is the sole maintainer and this is deliberate.

Keep dependencies minimal. Every package added is a package the client maintains after you leave.

### 12.2 Suggested layout

Adapt freely.

```
/app
  /films/[slug]/page.tsx
  /awards/[year]/page.tsx
  layout.tsx
  page.tsx
/components
/content
  films.json
  awards.json
  types.ts
/scripts
  process-stills.ts
/public/stills
DESIGN_NOTES.md
README.md
```

### 12.3 Git and remote

The remote already exists and is empty:

```
https://github.com/markandeyay/sfawebsite.git
```

The user is not configuring git. You are. Steps:

1. Check `gh auth status` and `git config user.name`. If either is unset, ask the user once, briefly, and continue.
2. `git init`, set the default branch to `main`.
3. Write a `.gitignore` before the first commit. `node_modules`, `.next`, `.env*`, `.vercel`, and the raw thumbnail cache directory.
4. `git remote add origin https://github.com/markandeyay/sfawebsite.git`
5. Commit early. The first commit should be the scaffold, before any design work, so there is a clean baseline to diff against.
6. Push and confirm the push succeeded before continuing.

If the remote turns out to be non-empty, stop and ask rather than forcing anything.

### 12.4 Vercel

Deploy via the Vercel CLI. This requires the user's credentials, which you do not have and should not ask them to paste into the terminal for you to see.

1. `npm i -g vercel`
2. Run `vercel login` and **hand the terminal to the user** to complete authentication in their browser. Tell them plainly that this step is theirs.
3. `vercel link`, then `vercel --prod`.
4. Report the deployment URL back.

The alternative path, if CLI auth stalls: tell the user to connect the GitHub repo through the Vercel dashboard, which takes about thirty seconds and requires no terminal work. Offer this if step 2 is friction.

The deployed URL matters. The client is showing this to the president and may hand over the link, which means it will be opened on a phone. See section 15.

---

## 13. Accessibility

Treat this as a requirement, not a polish pass. If this site ever lands on a `unc.edu` subdomain it falls under the university's digital accessibility policy, and WCAG AA stops being optional.

- Palette contrast is already verified in 5.1. Never use `deep` for text on `base`.
- Any text over a dithered still needs a solid or scrimmed backing. Dither is high-frequency noise and destroys legibility.
- Visible keyboard focus everywhere, using `carolina`. Never remove outlines without replacing them.
- The image reveal must trigger on focus, not only hover, or it is invisible to keyboard users.
- `prefers-reduced-motion` gets a real alternative path, including for the hero and any marquee.
- Video facades need accessible names describing what plays.
- Semantic headings in order. No heading levels skipped for visual sizing.
- Test at 320px width and at 200% zoom.

---

## 14. Working method

### 14.1 Plan first, in writing

Before writing any component code, produce a short design plan: the token system, the two typefaces and their roles, a layout concept with ASCII wireframes for each of the three routes, and three to five principles specific to this project.

Then review that plan against section 5.6. For each element, ask whether you would have produced the same thing for an unrelated brief. Anything that would have come out the same way regardless of subject is a default rather than a choice; revise it and record what changed and why.

Only start coding after that review.

### 14.2 Build, screenshot, critique, repeat

You have a computer. Use it.

Run the dev server, render each route, take a screenshot, and actually look at it. Write down what is wrong. Fix it. Screenshot again. Three passes minimum per route, more for `/awards/2025`.

Screenshot at desktop and at 375px both times. The mobile layout is not a later step; the president may open this on a phone.

Chanel's rule applies at the end of each pass: remove one thing.

### 14.3 Subagents

Natural parallel splits:

- **Image pipeline agent.** Owns `scripts/process-stills.ts` end to end: fetching, fallback handling, caching, algorithm comparison, and producing a contact sheet of the twelve treated stills for review. Fully independent of layout work.
- **Content agent.** Owns transcribing section 8 into validated `films.json` and `awards.json` plus types. Mechanical, self-verifying, and blocking for everything else, so run it first or in parallel with the pipeline.
- **Route agents.** After the design system exists and is committed, the film page and awards page can be built in parallel by separate agents against the shared component library. Do not parallelize these before the tokens and shared components are settled, or you will get two divergent visual languages.
- **Accessibility and responsive audit agent.** Runs against the finished routes, produces a findings list rather than making changes directly.

Do not parallelize the design plan in 14.1. That is one coherent point of view and splitting it produces mush.

### 14.4 Keep notes

Maintain `DESIGN_NOTES.md` in the repo. Record what you tried, what you rejected, and why. Two audiences: yourself on later passes, and the client, who will need to defend these choices to a president who may push back on any of them.

Log the hero concepts you rejected, the dither algorithms you compared, and the reasoning behind the typography pairing. That file is genuinely part of the deliverable.

---

## 15. Definition of done

The demo ships when all of these are true.

**Function**
- [ ] All three routes render from JSON with no hardcoded content in components
- [ ] Twelve stills processed, committed, and individually eyeballed
- [ ] Reveal works on hover and on focus
- [ ] No live YouTube iframe loads until a user clicks
- [ ] Build passes clean with no type errors and no console errors
- [ ] Deployed to Vercel and the URL loads on a cold visit

**Design**
- [ ] Design plan written, reviewed against 5.6, and revisions recorded
- [ ] `gold` appears in exactly one component
- [ ] At least two hero concepts built and compared, with the rejected one documented
- [ ] Every route screenshotted and critiqued at least three times
- [ ] Nothing on any page is a placeholder that looks like a real value

**Responsive and accessible**
- [ ] Every route correct at 375px
- [ ] No horizontal scroll at 320px
- [ ] Keyboard-navigable end to end with visible focus
- [ ] Reduced-motion path implemented and tested
- [ ] Contrast verified, including text over stills

**Repo**
- [ ] Pushed to `markandeyay/sfawebsite` with a clean commit history
- [ ] `README.md` explains how to add a film in under ten lines
- [ ] `DESIGN_NOTES.md` complete

---

## 16. Delegated decisions

Reason through these and decide. Do not ask the client.

1. **Typeface pairing.** Section 5.3.
2. **Dither algorithm and tone count.** Section 9.3.
3. **Hero concept.** Section 11.1. Build two.
4. **Section numbering.** Whether it earns its place, and where. Section 5.6.
5. **Awards page composition.** The hardest and most valuable one. Section 11.3.
6. **Which six films go in the homepage strip.** Section 11.1.
7. **How seven gold badges compose on the FDOC page.** Section 11.2.
8. **Thin credits treatment.** Section 7.4.
9. **Whether the club reel appears on the homepage at all.** Section 8.4.
10. **Tailwind versus CSS modules.** Section 12.1.

### 16.1 Ask the client only for

- GitHub or Vercel credentials, or a step only they can perform
- A situation where the remote repo is not empty
- A genuine contradiction inside this document

Everything else: decide, build it, document the reasoning in `DESIGN_NOTES.md`, and move.

---

## 17. Risks

**The generic-design risk is the main one.** Section 5.6. The locked palette sits in a well-populated region of default machine-generated design. Differentiation has to be earned through the dither system, the credit block, and the gold rule. If the finished site could be reskinned into a crypto landing page by swapping the copy, it has failed.

**Time.** One week. The buffer will be consumed by responsive and reduced-motion work, which always takes longer than expected. If something has to be cut, cut homepage sections, not the awards page.

**Thin content.** The site must look deliberate while carrying loglines, directors, and twelve video IDs. Every empty state is a design problem to solve rather than a gap to leave.

**YouTube thumbnails.** Some of these are old uploads and may lack a max-res still. Handle the fallback. If a film's only available frame is unusable even after treatment, note it in `DESIGN_NOTES.md` rather than substituting a different image.

---

## 18. After the demo

Not in scope. Recorded so the architecture accommodates it.

1. `/people/[slug]`, which the credit array shape already supports and which is the highest-value retention feature on the roadmap
2. A real domain. `uncstudentfilmassociationunc.weebly.com` is the most fixable credibility problem the club has and the president can likely solve it with one email
3. Back-catalog import for 2020 through 2024
4. The 2026 cycle, which happened and was never published
5. Script and pitch submission
6. Festival exclusivity states, if the club submits externally, which would make `viewable: false` load-bearing
7. Handoff documentation for whoever maintains this after the client graduates in 2028
