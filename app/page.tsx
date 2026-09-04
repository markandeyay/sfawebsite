import { getFilms } from "@/content";
import { FilmCard } from "@/components/FilmCard";
import { SectionHeading } from "@/components/SectionHeading";

// Temporary: exercises the shared components until the real homepage lands.
export default function Home() {
  const films = getFilms();
  return (
    <div className="wrap py-16">
      <SectionHeading title="The 2025 slate" lede="Twelve films, one festival." />
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {films.map((film) => (
          <li key={film.slug}>
            <FilmCard film={film} />
          </li>
        ))}
      </ul>
    </div>
  );
}
