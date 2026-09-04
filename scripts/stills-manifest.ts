/**
 * stills-manifest.ts
 *
 * The twelve films whose YouTube thumbnails feed `process-stills.ts`.
 *
 * TODO: this list is a temporary stand-in. Once `content/films.json` exists
 * (it carries `slug` and `youtubeId` for every film) `process-stills.ts`
 * should read that file instead, and this module can be deleted. See the
 * commented-out code path at the top of `process-stills.ts`.
 */

export interface StillSource {
  /** URL slug for the film; also the output filename in /public/stills. */
  slug: string;
  /** YouTube video id, used to build the i.ytimg.com thumbnail URL. */
  youtubeId: string;
}

export const STILLS: StillSource[] = [
  { slug: "fdoc", youtubeId: "2RFfhQ--oos" },
  { slug: "silenced", youtubeId: "Mx3-gEfzYN4" },
  { slug: "senior-assassin", youtubeId: "fEXqE4i4IpM" },
  { slug: "a-newby-cupids-guide-to-love-and-more", youtubeId: "RNyXv09ujv0" },
  { slug: "at-last-the-gift", youtubeId: "LKPT6smWlJo" },
  { slug: "how-does-it-feel", youtubeId: "Mji_606d6ZI" },
  { slug: "spaghetti-and-me", youtubeId: "cnp1SLmIZps" },
  { slug: "the-tulips", youtubeId: "GTBtTmzMdCo" },
  { slug: "omnes-unum", youtubeId: "bslYQmVjFkk" },
  { slug: "slam", youtubeId: "1DsY62HjXWw" },
  { slug: "hard-pills-to-swallow", youtubeId: "NHlh36jURDg" },
  { slug: "discrete-magematics", youtubeId: "BnjpJGetkyo" },
];
