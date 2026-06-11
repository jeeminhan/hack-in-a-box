// src/EmpathyMapDemo.jsx — guided walkthrough of an empathy map being built.
// A teaching demo for the Empathize page: a scripted story about one person
// fills the four quadrants one sticky note per click, ending on the insight.
import { useState } from "react";
import { color, font, radius, pill } from "./theme.js";

const QUADRANTS = [
  { key: "says",   label: "Says",   hint: "What they say out loud — direct quotes." },
  { key: "thinks", label: "Thinks", hint: "What's going through their mind — often unspoken." },
  { key: "does",   label: "Does",   hint: "What you observe them actually doing." },
  { key: "feels",  label: "Feels",  hint: "Their emotional state — name the feelings." },
];

// One story beat + one sticky note per step. `tension` marks the two notes the
// insight step highlights against each other.
const STORY = [
  { quadrant: "says",   tension: true, beat: "Maria, 34, visited last Sunday. Afterward, a greeter asks how it was.", note: "“It was nice — everyone seems really friendly.”" },
  { quadrant: "does",   beat: "Rewind to 9:58 that morning.", note: "Arrives two minutes late and slips into the back row." },
  { quadrant: "thinks", beat: "She looks around at the full sanctuary.", note: "“Everyone here already knows each other.”" },
  { quadrant: "feels",  beat: "The room is warm — but she's alone in it.", note: "Overwhelmed by how big it all is." },
  { quadrant: "does",   beat: "During the welcome time…", note: "Checks her phone instead of greeting anyone." },
  { quadrant: "says",   beat: "On her way out, she tells the greeter:", note: "“Maybe I'll check out a small group sometime.”" },
  { quadrant: "thinks", beat: "But on the drive home she wonders…", note: "“How would I even get involved? Where do I start?”" },
  { quadrant: "feels",  tension: true, beat: "Nobody asked her name.", note: "Invisible — like no one would notice if she never came back." },
  { quadrant: "feels",  beat: "And still…", note: "Wishes someone would personally invite her to something." },
];

const INTRO_BEAT = "Meet Maria. Your team just watched her first visit — step through what they observed.";
const INSIGHT_BEAT = "Now look across the quadrants. What doesn't line up?";
const INSIGHT_TAKEAWAY = "She says it was nice — but feels invisible. That tension is your insight, and it becomes your How-Might-We.";

// Deterministic hand-placed feel: rotation per note index (degrees).
const ROTATIONS = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.9, -1.9, 1.4, -0.7];

const INSIGHT_STEP = STORY.length + 1; // 0 = intro, 1..N = notes, N+1 = insight
const clampStep = (s) => Math.min(Math.max(s, 0), INSIGHT_STEP);

const smallPill = (variant) => ({ ...pill(variant), padding: "9px 18px", fontSize: 14 });

export default function EmpathyMapDemo({ accent = color.accent }) {
  const [step, setStep] = useState(0);
  const atInsight = step === INSIGHT_STEP;
  const visible = STORY.slice(0, Math.min(step, STORY.length));
  const current = step >= 1 && step <= STORY.length ? STORY[step - 1] : null;

  const beat = step === 0 ? INTRO_BEAT : atInsight ? INSIGHT_BEAT : current.beat;
  const nextLabel = step === 0 ? "Start the story" : step === STORY.length ? "Reveal the insight" : "Next note";

  return (
    <figure style={{ margin: "0 0 28px", background: color.surface, border: `1px solid ${color.line}`, borderRadius: radius.lg, padding: "20px 20px 16px", fontFamily: font.sans }}>
      <style>{`
        @keyframes hiab-emap-note-in { from { opacity: 0; transform: translateY(-12px) scale(1.05); } }
        .hiab-emap-note { animation: hiab-emap-note-in 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .hiab-emap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 380px) { .hiab-emap-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .hiab-emap-note { animation: none; } }
      `}</style>

      <p style={{ margin: "0 0 14px", minHeight: 44, fontSize: 15, lineHeight: 1.5, color: color.ink, fontWeight: 600 }}>{beat}</p>

      <div className="hiab-emap-grid">
        {QUADRANTS.map((q) => {
          const notes = visible
            .map((s, i) => ({ ...s, index: i }))
            .filter((s) => s.quadrant === q.key);
          return (
            <section key={q.key} aria-label={`${q.label} quadrant`} style={{ background: color.rail, border: `1px solid ${color.lineSoft}`, borderRadius: radius.md, padding: 12, minHeight: 130 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: color.muted, marginBottom: 2 }}>{q.label}</div>
              <div style={{ fontSize: 12, color: color.faint, lineHeight: 1.4, marginBottom: 10 }}>{q.hint}</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {notes.map((n) => {
                  const highlighted = atInsight && n.tension;
                  const dimmed = atInsight && !n.tension;
                  return (
                    <li key={n.index} className="hiab-emap-note" style={{ transform: `rotate(${ROTATIONS[n.index]}deg)`, transition: "opacity 300ms, border-color 300ms", opacity: dimmed ? 0.4 : 1, background: highlighted ? color.accentSoft : color.surface, border: `${highlighted ? 2 : 1}px solid ${highlighted ? accent : n.index === step - 1 ? accent : color.line}`, borderRadius: radius.sm, boxShadow: "0 2px 5px rgba(19,19,19,0.08)", padding: "8px 10px", fontSize: 13, lineHeight: 1.45, color: color.body }}>
                      {n.note}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {atInsight && (
        <div style={{ marginTop: 14, background: color.accentSoft, border: `1px solid ${accent}`, borderRadius: radius.md, padding: "12px 14px", fontSize: 14, lineHeight: 1.55, color: color.ink }}>
          <strong style={{ color: accent }}>The insight:</strong> {INSIGHT_TAKEAWAY}
        </div>
      )}

      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        {current ? `${current.beat} ${QUADRANTS.find((q) => q.key === current.quadrant).label}: ${current.note}` : atInsight ? INSIGHT_TAKEAWAY : ""}
      </div>

      <figcaption style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setStep((s) => clampStep(s - 1))} disabled={step === 0} style={{ ...smallPill("secondary"), opacity: step === 0 ? 0.4 : 1, cursor: step === 0 ? "default" : "pointer" }}>
          Back
        </button>
        <div style={{ display: "flex", gap: 5, flex: 1, justifyContent: "center" }} aria-hidden="true">
          {Array.from({ length: INSIGHT_STEP + 1 }, (_, i) => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i <= step ? accent : color.line, transition: "background 200ms" }} />
          ))}
        </div>
        {atInsight ? (
          <button type="button" onClick={() => setStep(0)} style={smallPill("secondary")}>Start over</button>
        ) : (
          <button type="button" onClick={() => setStep((s) => clampStep(s + 1))} style={smallPill("primary")}>{nextLabel}</button>
        )}
      </figcaption>
    </figure>
  );
}
