"use client";

import { useRef, useState, type FormEvent } from "react";
import { SITE } from "@/lib/site";

/* ═══════════════════════════════════════════════════════════════════
   PITCH FORM — front-end only. Posts to a Google Apps Script web app
   that relays the message as an email; paste the deployed URL into
   SCRIPT_URL (docs/APPS_SCRIPT_SETUP.md). Until the club wires it, the
   form says so and points at Instagram instead of pretending.
   Laid out as script pages are: a character cue, a parenthetical, the
   line.
   ═══════════════════════════════════════════════════════════════════ */

const SCRIPT_URL = "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["Write", "Act", "Shoot", "Edit", "Produce", "Just be on a set"];

export function PitchForm() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<{ msg: React.ReactNode; tone: "" | "ok" | "bad" }>({ msg: "", tone: "" });
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = form.current!;
    const data = new FormData(el);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const next = { name: !name, email: !email || !EMAIL_RE.test(email), message: !message };
    setBad(next);
    if (next.name || next.email || next.message) {
      setStatus({ msg: "Fill the marked fields", tone: "bad" });
      (el.querySelector(next.name ? "#p-name" : next.email ? "#p-email" : "#p-message") as HTMLElement)?.focus();
      return;
    }
    if (!SCRIPT_URL) {
      setStatus({
        msg: <>The pitch line isn&rsquo;t wired yet. <a href={SITE.instagram} rel="noreferrer">Message the club on Instagram</a> and say the same thing.</>,
        tone: "bad",
      });
      return;
    }
    setBusy(true);
    setStatus({ msg: "Sending…", tone: "" });
    try {
      const res = await fetch(SCRIPT_URL, { method: "POST", body: data });
      const out = await res.json().catch(() => null);
      if (!res.ok || (out && out.ok === false)) throw new Error(out?.error || res.statusText);
      el.reset();
      setStatus({ msg: "Sent. Someone from the club will write back.", tone: "ok" });
    } catch {
      setStatus({ msg: <>It didn&rsquo;t go through. Try again, or <a href={SITE.instagram} rel="noreferrer">message the club on Instagram</a>.</>, tone: "bad" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="pitch__form" ref={form} onSubmit={onSubmit} noValidate>
      <div className="pitch__row" data-reveal>
        <div className={`field ${bad.name ? "-bad" : ""}`}>
          <label className="field__label" htmlFor="p-name">Name <span className="req" aria-hidden="true">*</span></label>
          <span className="field__paren" aria-hidden="true">(who is pitching)</span>
          <input className="field__input" id="p-name" name="name" type="text" autoComplete="name" required aria-required="true" onInput={() => setBad((b) => ({ ...b, name: false }))} />
          <span className="field__err">Tell us who&rsquo;s writing</span>
        </div>
        <div className={`field ${bad.email ? "-bad" : ""}`}>
          <label className="field__label" htmlFor="p-email">Your email <span className="req" aria-hidden="true">*</span></label>
          <span className="field__paren" aria-hidden="true">(where the club writes back)</span>
          <input className="field__input" id="p-email" name="email" type="email" autoComplete="email" required aria-required="true" onInput={() => setBad((b) => ({ ...b, email: false }))} />
          <span className="field__err">Need a real address to write back</span>
        </div>
      </div>

      <div className="field" data-reveal>
        <span className="field__label" id="p-role-label">What you want to do</span>
        <span className="field__paren" aria-hidden="true">(check any)</span>
        <div className="cbs" role="group" aria-labelledby="p-role-label">
          {ROLES.map((r) => (
            <label className="cb" key={r}><input type="checkbox" name="role" value={r} /><span>{r}</span></label>
          ))}
        </div>
      </div>

      <div className={`field ${bad.message ? "-bad" : ""}`} data-reveal>
        <label className="field__label" htmlFor="p-message">Your pitch <span className="req" aria-hidden="true">*</span></label>
        <span className="field__paren" aria-hidden="true">(a logline, an idea, or just how you want to help)</span>
        <textarea className="field__input field__input--area" id="p-message" name="message" rows={5} required aria-required="true" onInput={() => setBad((b) => ({ ...b, message: false }))} />
        <span className="field__err">The slate won&rsquo;t roll empty</span>
      </div>

      <div className="pitch__foot" data-reveal>
        <button className="pill" type="submit" disabled={busy}>
          Send the pitch<svg aria-hidden="true"><use href="#i-arrow" /></svg>
        </button>
        <p className={`pitch__status ${status.tone ? `-${status.tone}` : ""}`} role="status" aria-live="polite">{status.msg}</p>
      </div>
    </form>
  );
}
