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
    <section aria-label="Films from the 2025 slate" className="relative bg-ink text-white">
      <div className="relative h-[80svh] min-h-[32rem] max-h-[60rem] overflow-hidden">
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
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0">
          <div className="wrap pb-8 sm:pb-12 flex items-end justify-between gap-8">
            <ol className="flex flex-col gap-1 max-w-[34rem]" onMouseLeave={() => setActive(0)}>
              {films.map((f, i) => (
                <li key={f.slug}>
                  <Link
                    href={`/films/${f.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={`display no-underline inline text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.02] tracking-[-0.03em] transition-[color] ${
                      i === active ? "text-white" : "text-white/55 hover:text-white"
                    }`}
                  >
                    <span className="text-balance">{f.title}</span>{" "}
                    <sup className="label text-white/80 font-normal tracking-[0.04em] align-super text-[0.7rem] whitespace-nowrap">
                      {f.year}
                    </sup>
                  </Link>
                </li>
              ))}
            </ol>
            <p className="eyebrow text-white/70 hidden sm:block text-right max-w-[14rem]">
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
