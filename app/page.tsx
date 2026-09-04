import { getFilm, getFilms } from "@/content";
import { FilmCard } from "@/components/FilmCard";
import { SectionHeading } from "@/components/SectionHeading";
import { AwardBadge } from "@/components/AwardBadge";
import { CreditBlock } from "@/components/CreditBlock";
import { VideoEmbed } from "@/components/VideoEmbed";
import { ButtonLink } from "@/components/Button";

// Temporary component sheet until the real homepage lands.
export default function Home() {
  const films = getFilms();
  const fdoc = getFilm("fdoc")!;
  return (
    <div className="wrap py-16 flex flex-col gap-16">
      <section>
        <SectionHeading title="Buttons and links" lede="Primary, secondary, text link." />
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <ButtonLink href="/#films">See the films</ButtonLink>
          <ButtonLink href="/#join" variant="secondary">Message the club on Instagram</ButtonLink>
          <a href="#" className="link">Read the bylaws</a>
        </div>
      </section>
      <section>
        <SectionHeading title="Award badges" />
        <div className="mt-6 flex flex-wrap gap-6 items-center">
          <AwardBadge category="Best Picture" size="sm" />
          <AwardBadge category="Best Picture" size="md" />
          <AwardBadge category="Best Cinematography" size="lg" />
        </div>
        <div className="mt-6 flex flex-wrap gap-10 items-center">
          <AwardBadge kind="winner" size="sm">Silenced</AwardBadge>
          <AwardBadge kind="winner" size="md" person="Placeholder Person (test)">Senior Assassin</AwardBadge>
          <AwardBadge kind="winner" size="lg">FDOC</AwardBadge>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          {fdoc.awards.map((a) => (
            <AwardBadge key={a.category} category={a.category} />
          ))}
        </div>
      </section>
      <section>
        <SectionHeading title="Credit block" />
        <CreditBlock
          className="mt-8"
          label="Test credits"
          rows={[
            { role: "Directed by", name: "Keller Huffman" },
            { role: "President", name: null },
            { role: "Head of the editing guild", name: null },
          ]}
        >
          <p className="credit muted border border-deep p-4 max-w-prose">
            The rest of this crew is uncredited. Send the full credits and they appear here.
          </p>
        </CreditBlock>
      </section>
      <section>
        <SectionHeading title="Video facade" />
        <div className="mt-8 max-w-3xl">
          <VideoEmbed youtubeId={fdoc.youtubeId} title={fdoc.title} still={fdoc.still!} />
        </div>
      </section>
      <section>
        <SectionHeading title="The 2025 slate" lede="Twelve films, one festival." />
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {films.map((film) => (
            <li key={film.slug}>
              <FilmCard film={film} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
