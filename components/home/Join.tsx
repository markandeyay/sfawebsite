import { SectionHeading } from "@/components/SectionHeading";
import { ButtonLink } from "@/components/Button";
import { JOIN_ACTION } from "@/lib/site";

/** One clear action. There is no form yet; the club's Instagram is the door. */
export function Join() {
  return (
    <section id="join" aria-labelledby="join-title" className="wrap py-16 sm:py-24 border-t border-deep">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-end">
        <SectionHeading
          id="join-title"
          title="Join"
          lede="Most members arrive with no film experience. If you want to write, act, shoot, edit, or just be on set, say so. Every UNC student is welcome, from any major."
        />
        <div className="lg:justify-self-end">
          <ButtonLink href={JOIN_ACTION.href} external>
            {JOIN_ACTION.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
