import { SectionHead } from "./SectionHead";
import { PitchForm } from "./PitchForm";

/* The interest form: a paper postcard between the ink fields. */
export function Pitch() {
  return (
    <section className="sec t-paper" id="pitch" data-scene data-name="Pitch" data-idx="06">
      <SectionHead
        n="06"
        slug="INT. Send your pitch — anytime"
        title="Send your"
        em="Pitch"
        no="06"
        meta={["A script, an idea, or just a name", "The club reads everything"]}
      />

      <div className="pitch__grid">
        <div className="pitch__copy" data-reveal>
          <p className="pitch__lede">No experience needed. Bring a script, an idea, or just yourself.</p>
          <p className="pitch__body">
            Pitches open in the fall. If you want to write, act, shoot, edit, produce, or just be on a
            set, say so here and the club will find you a crew. Any UNC student, any major.
          </p>
          <p className="pitch__key"><span className="req" aria-hidden="true">*</span> Required. Everything else is optional.</p>
        </div>
        <PitchForm />
      </div>
    </section>
  );
}
