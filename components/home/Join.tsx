import type { Film } from "@/content/types";
import { Frame } from "@/components/Frame";
import { ArrowLink } from "@/components/ArrowLink";

/** Feature block: one still in a panel, one headline, one action. */
export function Join({ film }: { film?: Film }) {
  return (
    <section id="join" aria-labelledby="join-title" className="wrap py-20 sm:py-28 border-t border-rule">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
        <div className="lg:order-2">
          {film ? (
            <div className="panel">
              <Frame film={film} />
            </div>
          ) : null}
        </div>
        <div className="lg:order-1">
          <p className="eyebrow mb-4">Join</p>
          <h2 id="join-title" className="display text-display-lg text-ink max-w-[12ch]">
            No experience needed.
          </h2>
          <p className="text-body-lg mt-6 prose-block">
            If you want to write, act, shoot, edit, or just be on set, say so. Every UNC
            student is welcome, from any major.
          </p>
          <div className="mt-10">
            <ArrowLink href="https://www.instagram.com/uncstudentfilmassociation" external>
              Message the club on Instagram
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
