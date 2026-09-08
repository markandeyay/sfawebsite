import { SectionHead } from "./SectionHead";
import { PitchForm } from "./PitchForm";

/* The interest form as a formatted script page: number, slugline,
   action, then each field as a character cue over its dialogue line. */
export function Pitch() {
  return (
    <section className="sec t-paper" id="pitch" data-scene data-name="Pitch" data-idx="05">
      <SectionHead
        n="05"
        slug="INT. Send your pitch — anytime"
        title="Send your"
        em="Pitch"
        meta={["A script, an idea, or just a name", "The club reads everything"]}
      />

      <div className="pitch__grid">
        <div className="script" data-reveal>
          <span className="script__pg" aria-hidden="true">1.</span>
          <p className="script__slug">INT. Your pitch — day</p>
          <p className="script__action">
            No experience needed. Bring a script, an idea, or just yourself. Pitches open in the fall.
            If you want to write, act, shoot, edit, produce, or just be on a set, say so here and the
            club will find you a crew. Any UNC student, any major.
          </p>
          <p className="script__action">Fields marked <span className="req" aria-hidden="true">*</span> are required.</p>
          <PitchForm />
        </div>
      </div>
    </section>
  );
}
