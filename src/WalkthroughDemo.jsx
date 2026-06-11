// src/WalkthroughDemo.jsx — guided walkthrough player for the sprint pages.
// Renders a script from walkthroughs.js: a board of zones that fills with
// notes one click at a time, ending on an insight step that highlights the
// script's tension notes. A teaching demo, not a tool — no persistence.
import { useState } from "react";
import { color, font, radius, pill } from "./theme.js";

// Deterministic hand-placed feel: rotation per note index (degrees).
const ROTATIONS = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.9, -1.9, 1.4, -0.7, 1.6, -1.1, 0.8];

const smallPill = (variant) => ({ ...pill(variant), padding: "9px 18px", fontSize: 14 });

// Callers must set a unique `key` per script so React remounts (and resets
// step state) when navigating between pages that both render a demo.
export default function WalkthroughDemo({ script, accent = color.accent }) {
  const [rawStep, setStep] = useState(0);
  const { zones, steps, labels = {} } = script;
  const insightStep = steps.length + 1; // 0 = intro, 1..N = notes, N+1 = insight
  const clampStep = (s) => Math.min(Math.max(s, 0), insightStep);
  const step = clampStep(rawStep); // guards stale state if a key is ever missed

  const atInsight = step === insightStep;
  const visible = steps.slice(0, Math.min(step, steps.length));
  const current = step >= 1 && step <= steps.length ? steps[step - 1] : null;

  // A step without its own beat carries the most recent one forward.
  const beatAt = (i) => {
    for (let j = i; j >= 0; j--) if (steps[j].beat) return steps[j].beat;
    return script.intro;
  };
  const beat = step === 0 ? script.intro : atInsight ? script.insightBeat : beatAt(step - 1);
  const nextLabel = step === 0
    ? labels.start || "Start the story"
    : step === steps.length
      ? labels.reveal || "Reveal the insight"
      : labels.next || "Next note";

  return (
    <figure style={{ margin: "0 0 28px", background: color.surface, border: `1px solid ${color.line}`, borderRadius: radius.lg, padding: "20px 20px 16px", fontFamily: font.sans }}>
      <style>{`
        @keyframes hiab-wt-note-in { from { opacity: 0; transform: translateY(-12px) scale(1.05); } }
        .hiab-wt-note { animation: hiab-wt-note-in 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .hiab-wt-grid { display: grid; grid-template-columns: repeat(var(--wt-cols), 1fr); gap: 10px; }
        @media (max-width: 640px) { .hiab-wt-grid { grid-template-columns: repeat(var(--wt-narrow-cols), 1fr); } }
        @media (prefers-reduced-motion: reduce) { .hiab-wt-note { animation: none; } }
      `}</style>

      <p style={{ margin: "0 0 14px", minHeight: 44, fontSize: 15, lineHeight: 1.5, color: color.ink, fontWeight: 600 }}>{beat}</p>

      <div className="hiab-wt-grid" style={{ "--wt-cols": script.cols, "--wt-narrow-cols": script.narrowCols || 1 }}>
        {zones.map((z) => {
          const notes = visible
            .map((s, i) => ({ ...s, index: i }))
            .filter((s) => s.zone === z.key);
          return (
            <section key={z.key} aria-label={z.label} style={{ background: color.rail, border: `1px solid ${color.lineSoft}`, borderRadius: radius.md, padding: 12, minHeight: script.zoneMinHeight || 130 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: color.muted, marginBottom: 2 }}>{z.label}</div>
              {z.hint && <div style={{ fontSize: 12, color: color.faint, lineHeight: 1.4, marginBottom: 10 }}>{z.hint}</div>}
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {notes.map((n) => {
                  const highlighted = atInsight && n.tension;
                  const dimmed = atInsight && !n.tension;
                  // Rotation reads as hand-placed on small notes but as a glitch
                  // on full-width bars, so single-column boards stay straight.
                  const rotate = script.cols > 1 ? ROTATIONS[n.index % ROTATIONS.length] : 0;
                  return (
                    <li key={n.index} className="hiab-wt-note" style={{ transform: `rotate(${rotate}deg)`, transition: "opacity 300ms, border-color 300ms", opacity: dimmed ? 0.4 : 1, background: highlighted ? color.accentSoft : color.surface, border: `${highlighted ? 2 : 1}px solid ${highlighted ? accent : n.index === step - 1 ? accent : color.line}`, borderRadius: radius.sm, boxShadow: "0 2px 5px rgba(19,19,19,0.08)", padding: "8px 10px", fontSize: 13, lineHeight: 1.45, color: color.body }}>
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
          <strong style={{ color: accent }}>The insight:</strong> {script.insightTakeaway}
        </div>
      )}

      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        {current ? `${beat} ${zones.find((z) => z.key === current.zone).label}: ${current.note}` : atInsight ? script.insightTakeaway : ""}
      </div>

      <figcaption style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setStep((s) => clampStep(s - 1))} disabled={step === 0} style={{ ...smallPill("secondary"), opacity: step === 0 ? 0.4 : 1, cursor: step === 0 ? "default" : "pointer" }}>
          Back
        </button>
        <div style={{ display: "flex", gap: 5, flex: 1, justifyContent: "center" }} aria-hidden="true">
          {Array.from({ length: insightStep + 1 }, (_, i) => (
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
