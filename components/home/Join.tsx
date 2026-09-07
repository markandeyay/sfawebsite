import { ButtonLink } from "@/components/Button";
import { JOIN_ACTION } from "@/lib/site";

/**
 * Join: the page's closing card. One heading, one sentence, one action, on
 * the page's own ground. An inverted carolina block was built and removed
 * (docs/notes-home.md, pass 3): it was the CTA banner every marketing page
 * ends with, and Carolina belongs inside the stills, not under a button.
 */
export function Join() {
  return (
    <section id="join" aria-labelledby="join-title" className="wrap pt-section">
      <div className="hairline-t pt-block">
        <h2 id="join-title" className="display text-7 max-w-title">
          No experience needed.
        </h2>
        <p className="mt-6 text-4 measure">
          If you want to write, act, shoot, edit, or just be on a set, say so. Any UNC student can
          join, from any major.
        </p>
        <ButtonLink href={JOIN_ACTION.href} external className="mt-8">
          {JOIN_ACTION.label}
        </ButtonLink>
      </div>
    </section>
  );
}
