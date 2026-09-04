import Link from "next/link";
import { Frame } from "@/components/Frame";
import { SectionHeading } from "@/components/SectionHeading";
import type { Film } from "@/content/types";

interface AdjacentFilmsProps {
  prev: Film | undefined;
  next: Film | undefined;
  year: number;
}

function AdjacentLink({ film, relation }: { film: Film; relation: "Previous film" | "Next film" }) {
  return (
    <Link
      href={`/films/${film.slug}`}
      className="reveal group block no-underline text-cream"
      aria-label={`${relation}: ${film.title}`}
    >
      <div className="border border-transparent group-hover:border-deep group-focus-visible:border-carolina transition-colors">
        <Frame film={film} />
      </div>
      <p className="credit muted mt-3">{relation}</p>
      <p className="display-italic text-display-sm mt-1">{film.title}</p>
    </Link>
  );
}

/** Previous and next film on the slate. Two frames side by side; stacked on narrow screens. */
export function AdjacentFilms({ prev, next, year }: AdjacentFilmsProps) {
  if (!prev && !next) return null;
  return (
    <section aria-labelledby="more">
      <SectionHeading id="more" title={`More from the ${year} slate`} />
      <div className="mt-8 grid gap-10 sm:grid-cols-2 sm:gap-8">
        {prev ? <AdjacentLink film={prev} relation="Previous film" /> : null}
        {next ? <AdjacentLink film={next} relation="Next film" /> : null}
      </div>
    </section>
  );
}
