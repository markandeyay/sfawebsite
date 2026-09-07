import type { Film } from "@/content/types";
import { Frame } from "@/components/Frame";
import { ButtonLink } from "@/components/Button";

/** Feature block: one still in a panel, one headline, one action. */
export function Join({ film }: { film?: Film }) {
  return (
    <section id="join" aria-labelledby="join-title" className="wrap py-section sm:py-section border-t border-rule">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center">
        <div className="lg:order-2">
          {film ? (
            <div className="panel">
              <Frame film={film} />
            </div>
          ) : null}
        </div>
        <div className="lg:order-1">
          <p className="condensed text-2 text-fg-muted mb-4">Join</p>
          <h2 id="join-title" className="display text-7 text-fg max-w-title">
            No experience needed.
          </h2>
          <p className="text-4 mt-6 measure">
            If you want to write, act, shoot, edit, or just be on set, say so. Every UNC
            student is welcome, from any major.
          </p>
          <div className="mt-8">
            <ButtonLink variant="link" href="https://www.instagram.com/uncstudentfilmassociation" external>
              Message the club on Instagram
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
