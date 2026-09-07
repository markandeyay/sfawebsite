"use client";

import Link from "next/link";
import { useState } from "react";

/* eslint-disable @next/next/no-img-element */

export interface HeroFilm {
  slug: string;
  title: string;
  year: number;
  director: string;
  image: string;
}

/**
 * Full-bleed still with the slate stacked as a list of titles over it.
 * Hovering or focusing a title swaps the backdrop to that film's frame.
 * All frames are in the DOM stacked at opacity 0, so the swap is instant.
 */
export function Hero({ films }: { films: HeroFilm[] }) {
  const [active, setActive] = useState(0);
  const current = films[active];

  return (
    <section aria-label="Films from the 2025 slate" className="relative bg-ground text-fg">
      <div className="relative h-[80svh] overflow-hidden">
        {films.map((f, i) => (
          <img
            key={f.slug}
            src={f.image}
            alt=""
            aria-hidden="true"
            width={1280}
            height={720}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ground via-ground to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0">
          <div className="wrap pb-8 sm:pb-12 flex items-end justify-between gap-8">
            <ol className="flex flex-col gap-1 max-w-short" onMouseLeave={() => setActive(0)}>
              {films.map((f, i) => (
                <li key={f.slug}>
                  <Link
                    href={`/films/${f.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={`display no-underline inline text-6 transition-[color] ${
                      i === active ? "text-fg" : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    <span className="text-balance">{f.title}</span>{" "}
                    <sup className="label text-fg-muted font-normal align-super text-1 whitespace-nowrap">
                      {f.year}
                    </sup>
                  </Link>
                </li>
              ))}
            </ol>
            <p className="condensed text-2 text-fg-muted text-fg-muted hidden sm:block text-right max-w-short">
              {current.title}
              <br />
              Directed by {current.director}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
