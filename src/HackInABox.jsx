import { useState, useEffect, useRef } from "react";
import { color, font, pill } from "./theme.js";
import WalkthroughDemo from "./WalkthroughDemo.jsx";
import { WALKTHROUGHS } from "./walkthroughs.js";

// Textured-gouache illustration set (Indigitous orange accent). See
// assets/illustrations/PLACEMENT.md for the full mapping.
import artHeroTable from "./assets/illustrations/hero-sprint-table.webp";
import artHeroBox from "./assets/illustrations/hero-kit-box.webp";
import artEmpathize from "./assets/illustrations/phase-1-empathize.webp";
import artDefine from "./assets/illustrations/phase-2-define.webp";
import artIdeate from "./assets/illustrations/phase-3-ideate.webp";
import artPrototype from "./assets/illustrations/phase-4-prototype.webp";
import artPitch from "./assets/illustrations/phase-5-pitch.webp";
import artAfter from "./assets/illustrations/phase-6-after-sprint.webp";
import artEmpathyMap from "./assets/illustrations/worksheet-empathy-map.webp";
import artPersonaCard from "./assets/illustrations/worksheet-persona-card.webp";
import artProblemStatement from "./assets/illustrations/worksheet-problem-statement.webp";
import artSprintSummary from "./assets/illustrations/worksheet-sprint-summary.webp";
import artCommunity from "./assets/illustrations/concept-community-network.webp";
import artLightbulb from "./assets/illustrations/concept-insight-lightbulb.webp";
import artStopwatch from "./assets/illustrations/concept-stopwatch.webp";
import artHandsCards from "./assets/illustrations/concept-hands-cards.webp";
// Subsection spot icons + banners (batch 2).
import artAiWhy from "./assets/illustrations/ai-why.webp";
import artAiTools from "./assets/illustrations/ai-tools.webp";
import artAiEachStep from "./assets/illustrations/ai-each-step.webp";
import artOverviewDifferent from "./assets/illustrations/overview-different.webp";
import artOverviewProcess from "./assets/illustrations/overview-process.webp";
import artFoundationCreated from "./assets/illustrations/foundation-created.webp";
import artFoundationHumility from "./assets/illustrations/foundation-humility.webp";
import artFoundationExperiment from "./assets/illustrations/foundation-experiment.webp";
import artFoundationValues from "./assets/illustrations/foundation-values.webp";
import artPreparePrayer from "./assets/illustrations/prepare-prayer.webp";
import artPrepareRecruit from "./assets/illustrations/prepare-recruit.webp";
import artPrepareTimeline from "./assets/illustrations/prepare-timeline.webp";
import artPrepareMultiChurch from "./assets/illustrations/prepare-multi-church.webp";
import artPrepareTeam from "./assets/illustrations/prepare-team.webp";
import artPrepareMaterials from "./assets/illustrations/prepare-materials.webp";
import artPrepareAgendas from "./assets/illustrations/prepare-agendas.webp";
import artProblemHmw from "./assets/illustrations/problem-hmw.webp";
import artProblemPitfalls from "./assets/illustrations/problem-pitfalls.webp";
import artEmpathyExercise from "./assets/illustrations/empathy-exercise.webp";
import artEmpathyPersonas from "./assets/illustrations/empathy-personas.webp";
import artIdeateRules from "./assets/illustrations/ideate-rules.webp";
import artIdeateCrazy8s from "./assets/illustrations/ideate-crazy8s.webp";
import artPrototypeForms from "./assets/illustrations/prototype-forms.webp";
import artPrototypeFeedback from "./assets/illustrations/prototype-feedback.webp";
import artAfterPhase1 from "./assets/illustrations/after-phase1-capture.webp";
import artAfterPhase2 from "./assets/illustrations/after-phase2-share.webp";
import artAfterPhase3 from "./assets/illustrations/after-phase3-alive.webp";
import artAfterCulture from "./assets/illustrations/after-culture.webp";
import artTemplateScipab from "./assets/illustrations/template-scipab.webp";

// Five-phase spine. Each phase has an id, label, and the section ids it contains.
// eslint-disable-next-line react-refresh/only-export-components
export const PHASES = [
  { id: "start",     label: "Get started",      sections: ["overview", "foundation"] },
  { id: "prepare",   label: "Prepare",          sections: ["prepare", "prepare-buyin", "prepare-recruit", "prepare-team", "prepare-agendas"] },
  { id: "run",       label: "Run the sprint",   sections: ["empathy", "personas", "problem", "ideate", "crazy8s", "prototype", "feedback", "pitch"] },
  { id: "after",     label: "After the sprint", sections: ["after", "after-share", "after-sustain"] },
  { id: "resources", label: "Resources",        sections: ["templates", "templates-post", "ai", "partner"] },
];

// The 5 numbered steps shown in the top step bar during the "run" phase.
// eslint-disable-next-line react-refresh/only-export-components
export const STEPS = [
  { id: "empathy",   n: 1, label: "Empathize" },
  { id: "problem",   n: 2, label: "Define" },
  { id: "ideate",    n: 3, label: "Ideate" },
  { id: "prototype", n: 4, label: "Prototype" },
  { id: "pitch",     n: 5, label: "Pitch" },
];

// A single sprint step can span more than one page (e.g. Empathize covers both
// the Empathy Maps page and the Personas page). Maps a page id → its step id so
// the 5-step bar highlights correctly even though there are more than 5 pages.
// eslint-disable-next-line react-refresh/only-export-components
export const STEP_PAGES = {
  empathy: ["empathy", "personas"],
  problem: ["problem"],
  ideate: ["ideate", "crazy8s"],
  prototype: ["prototype", "feedback"],
  pitch: ["pitch"],
};

// Flat lookup: which phase a section belongs to.
// eslint-disable-next-line react-refresh/only-export-components
export const phaseOf = (sectionId) =>
  PHASES.find((p) => p.sections.includes(sectionId))?.id ?? "start";

// Ordered walk-through of every content section, used by the sticky Prev/Next bar.
// "partner" (the full-screen AI chat) is intentionally excluded from the linear flow.
// eslint-disable-next-line react-refresh/only-export-components
export const FLOW = PHASES.flatMap((p) => p.sections).filter((id) => id !== "partner");

// Short, friendly labels for the Prev/Next bar.
// eslint-disable-next-line react-refresh/only-export-components
export const SECTION_LABELS = {
  overview: "Overview",
  foundation: "Foundation",
  prepare: "Before You Start",
  "prepare-buyin": "Leadership Buy-In",
  "prepare-recruit": "Recruit & Plan",
  "prepare-team": "Team & Materials",
  "prepare-agendas": "Sprint Formats",
  empathy: "Empathy Maps",
  personas: "Personas",
  problem: "Define",
  ideate: "Ideation",
  crazy8s: "Crazy 8s",
  prototype: "Prototyping",
  feedback: "Getting Feedback",
  pitch: "Pitch",
  after: "Capture & Document",
  "after-share": "Share with Leadership",
  "after-sustain": "Keep It Alive",
  templates: "Sprint Templates",
  "templates-post": "Post-Sprint Templates",
  ai: "AI in Your Sprint",
  partner: "AI Thinking Partner",
};

const phaseColors = new Proxy({}, { get: () => ({ bg: color.rail, accent: color.accent, light: color.accentSoft }) });

const AI_ENDPOINT = import.meta.env.VITE_HIAB_AI_ENDPOINT || "/api/chat";

function readStoredString(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function writeStoredString(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function isAiConfigured() {
  return Boolean(AI_ENDPOINT);
}

async function requestAiCoach(payload) {
  if (!AI_ENDPOINT) {
    throw new Error("AI coach endpoint is not configured.");
  }

  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`AI coach request failed with status ${response.status}`);
  }

  return response.json();
}

const PROTOTYPE_FORMATS = [
  { key: "storyboard",   label: "Storyboard",            instructions: "Produce 6 frames. For each: a one-sentence caption describing what's on screen and how the user feels. End with the moment they realize the value." },
  { key: "landing",      label: "Sketched landing page", instructions: "Produce a headline, a one-sentence subhead, 3 benefit bullets, a primary call-to-action button label, and a short FAQ of 3 questions with answers." },
  { key: "flyer",        label: "Mock flyer",            instructions: "Produce a flyer that's readable in 5 seconds: headline, a two-sentence pitch, the what / when / where, and a clear call to action. Plain words." },
  { key: "roleplay",     label: "Role-play script",      instructions: "Produce a 60-second dialogue between a volunteer leader and a hesitant church member. Show the objection, the human response, and a concrete next step." },
  { key: "schedule",     label: "Schedule / run-of-show",instructions: "Produce an hour-by-hour run-of-show for a 2-hour pilot. For each block: who does what, what the participants experience, and what to watch for." },
  { key: "paper",        label: "Paper model",           instructions: "Describe step-by-step how to build the prototype on paper with one sharpie. Include labels, key interactions to mime, and what the facilitator says at each step." },
];

function buildPrototypePrompt({ hmw, idea, formatKey, audience }) {
  const fmt = PROTOTYPE_FORMATS.find((f) => f.key === formatKey) || PROTOTYPE_FORMATS[0];
  const hmwLine = hmw && hmw.trim() ? hmw.trim() : "(write your How Might We question here)";
  const ideaLine = idea && idea.trim() ? idea.trim() : "(describe the idea you want to prototype here)";
  const audienceLine = audience && audience.trim() ? audience.trim() : "lay leaders and members of a local church";
  return `You are helping me prototype an idea from a church design-thinking sprint. Produce a draft I can show to 5 people for honest, 60-second reactions.

Context:
- How Might We: ${hmwLine}
- The idea I want to prototype: ${ideaLine}
- Audience: ${audienceLine}
- Desired prototype format: ${fmt.label}

Instructions:
${fmt.instructions}

Constraints:
- Plain English. No church jargon, no buzzwords.
- Concrete enough that someone can react in 60 seconds.
- Honest about the rough edges — this is a sketch, not a finished product.
- End with 3 specific questions I should ask my testers to draw out useful feedback.`;
}

const SCIPAB_STEPS = [
  {
    key: "situation",
    label: "Situation",
    letter: "S",
    color: color.accent,
    prompt: "Tell me about your church or ministry's current situation. What's the context? Think about your community, your congregation, your programs, or the people you're trying to reach.",
    helper: "Example: \"Our church is in a suburban neighborhood with a growing young professional population. We have about 200 members, mostly families, and run a traditional Sunday service with a small group program.\"",
    guideText: "State the current state of affairs — the relevant circumstances of your church or ministry.",
  },
  {
    key: "complication",
    label: "Complication",
    letter: "C",
    color: color.accent,
    prompt: "What's the critical issue or challenge that's disrupting your situation? What changes, pressures, or problems have emerged?",
    helper: "Example: \"Over the past two years, we've seen a significant drop in attendance among 20-35 year olds. Our small groups aren't attracting younger members, and we're struggling to connect with the new professionals moving into the area.\"",
    guideText: "Identify the critical issues — changes, pressures, or demands creating problems or opportunities.",
  },
  {
    key: "implication",
    label: "Implication",
    letter: "I",
    color: color.accent,
    prompt: "What happens if this problem isn't addressed? What are the consequences for your church, your community, or the people involved?",
    helper: "Example: \"If we don't engage this demographic, we risk becoming an aging congregation that can't sustain itself in 10 years. More importantly, there are hundreds of young professionals in our community who are spiritually hungry but feel disconnected from church.\"",
    guideText: "Show the personal or ministry consequences of failing to act on this problem.",
  },
  {
    key: "position",
    label: "Position",
    letter: "P",
    color: color.accent,
    prompt: "What do you believe needs to happen? What's your position on how this should be addressed? (It's okay if you're not sure — share your best thinking!)",
    helper: "Example: \"We believe we need to completely reimagine how we create community for young professionals — not just tweaking Sunday services, but creating new entry points and gathering formats that fit their lives.\"",
    guideText: "State clearly what you believe needs to be done to address this challenge.",
  },
  {
    key: "action",
    label: "Action",
    letter: "A",
    color: color.accent,
    prompt: "What specific action or next step are you hoping to take? What role do you want your church, your team, or a HIAB sprint to play?",
    helper: "Example: \"We want to run a HIAB sprint with a mix of our current young members and church leaders to brainstorm fresh approaches to community building. We'd also love to involve some of the unchurched professionals in the conversation.\"",
    guideText: "Describe the role you want others to play and the steps you'd like to explore.",
  },
  {
    key: "benefit",
    label: "Benefit",
    letter: "B",
    color: color.accent,
    prompt: "What would success look like? If this problem were solved, what would be the benefit to your church and community?",
    helper: "Example: \"If we crack this, we'd see a vibrant, multigenerational community where young professionals feel they belong. We'd have sustainable growth, new leaders emerging, and a church that's truly serving our changing neighborhood.\"",
    guideText: "Describe how solving this problem will address your church's specific needs. Be as concrete as possible.",
  },
];

function BrandMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 261.9 261.9" style={{ borderRadius: 5, display: "block" }}>
      <rect width="261.9" height="262.13" fill={color.accent} />
      <path d="M142.85,87.3H87.3v55.55h55.55ZM127,127H103.17V103.17H127Zm31.74-14.29v30.16H174.6V112.69ZM87.3,174.6h87.3V158.73H87.3Z" fill={color.rail} />
    </svg>
  );
}

function Icon({ name, size = 24, color = "currentColor", style }) {
  const icons = {
    home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />,
    book: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
    clipboard: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    heart: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    users: <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
    lightbulb: <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    cube: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    play: <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />,
    download: <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    check: <path d="M5 13l4 4L19 7" />,
    chevronRight: <path d="M9 5l7 7-7 7" />,
    chevronDown: <path d="M19 9l-7 7-7-7" />,
    clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    star: <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    x: <path d="M6 18L18 6M6 6l12 12" />,
    arrow: <path d="M13 7l5 5m0 0l-5 5m5-5H6" />,
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
    chat: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
    mic: <><path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z" /><path d="M19 10v1a7 7 0 01-14 0v-1M12 18v4M8 22h8" /></>,
    sparkle: <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    refresh: <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />,
    edit: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />,
    film: <path d="M19.82 2H4.18A2.18 2.18 0 002 4.18v15.64A2.18 2.18 0 004.18 22h15.64A2.18 2.18 0 0022 19.82V4.18A2.18 2.18 0 0019.82 2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />,
    compass: <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />,
    monitor: <path d="M2 3h20v14H2zM8 21h8M12 17v4" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {icons[name]}
    </svg>
  );
}

function Accordion({ title, subtitle, children, defaultOpen = false, accent = color.accent, spot }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${accent}22`, marginBottom: 12, overflow: "hidden", background: "#fff" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: subtitle ? "14px 20px 12px" : "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: open ? `${accent}08` : "transparent", border: "none", cursor: "pointer",
        fontFamily: font.sans, fontSize: 17, fontWeight: 600, color: color.ink, transition: "background 0.2s",
        textAlign: "left",
      }}>
        <div>
          <span>{title}</span>
          {subtitle && <div style={{ fontSize: 13, fontWeight: 400, color: accent, marginTop: 2, fontFamily: font.sans }}>{subtitle}</div>}
        </div>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", color: accent, flexShrink: 0, marginLeft: 12 }}>
          <Icon name="chevronDown" size={20} color={accent} />
        </span>
      </button>
      {open && <div style={{ padding: "4px 20px 20px", lineHeight: 1.7, color: color.body }}>{spot && <IllustrationBanner src={spot} />}{children}</div>}
    </div>
  );
}

function StepCard({ number, title, description, duration, accent = color.accent }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "24px 24px 20px", border: `1px solid ${accent}18`, boxShadow: `0 2px 12px ${accent}08`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${accent}12`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.sans, fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{number}</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 6px", fontFamily: font.sans, fontSize: 17, color: color.ink }}>{title}</h4>
          {duration && <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8, color: accent, fontSize: 13, fontWeight: 500 }}><Icon name="clock" size={14} color={accent} /> {duration}</div>}
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: color.body }}>{description}</p>
        </div>
      </div>
    </div>
  );
}

function TipBox({ children, accent = color.accent, label = "Tip" }) {
  return (
    <div style={{ background: `${accent}0A`, border: `1px solid ${accent}25`, borderRadius: 12, padding: "16px 20px", marginTop: 16, marginBottom: 8, fontSize: 15, lineHeight: 1.65, color: color.body }}>
      <strong style={{ color: accent, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</strong>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function PhaseHeader({ icon, title, subtitle, accent }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: subtitle ? 4 : 0 }}>
        <Icon name={icon} size={22} color={accent} />
        <h2 style={{ margin: 0, fontFamily: font.sans, fontSize: 26, fontWeight: 800, color: color.ink, letterSpacing: -0.3 }}>{title}</h2>
      </div>
      {subtitle && <p style={{ margin: "0 0 0 32px", fontSize: 14, color: color.muted, lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

// Reusable framed illustration. Warm-cream backing, rounded, lazy-loaded.
// `ratio` keeps space reserved so images never cause layout shift.
// `caption` renders the standard italic figcaption beneath the frame.
function SectionArt({ src, alt, ratio = "16 / 9", max = 680, caption, style }) {
  const frame = (
    <div style={{
      maxWidth: max, margin: caption ? "0 auto" : "0 auto 24px", borderRadius: 14, overflow: "hidden",
      background: color.rail, border: `1px solid ${color.line}`, ...style,
    }}>
      <img
        src={src} alt={alt} loading="lazy" decoding="async"
        style={{ display: "block", width: "100%", aspectRatio: ratio, objectFit: "cover" }}
      />
    </div>
  );
  if (!caption) return frame;
  return (
    <figure style={{ margin: "0 0 24px" }}>
      {frame}
      <figcaption style={{ fontSize: 13, color: color.muted, marginTop: 8, fontStyle: "italic", textAlign: "center" }}>{caption}</figcaption>
    </figure>
  );
}

// Illustration shown inside an accordion body or under an h3. Centered and width-capped so it
// stays a modest focal image (never huge on wide screens). The hairline border matters: the
// art's painted cream is close to the page/card cream, so without it the frame disappears and
// the image reads as a stretch of unexplained whitespace.
function IllustrationBanner({ src, ratio = "3 / 2", max = 300 }) {
  return (
    <div style={{ maxWidth: max, margin: "0 auto 18px", borderRadius: 12, overflow: "hidden", border: `1px solid ${color.line}`, background: "#fff" }}>
      <img
        src={src} alt="" loading="lazy" decoding="async"
        style={{ display: "block", width: "100%", aspectRatio: ratio, objectFit: "cover" }}
      />
    </div>
  );
}

// Standard intro paragraph directly under a page header — one spec for every page.
function Lead({ children }) {
  return <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>{children}</p>;
}

// Standard in-page section heading — one spec for every page.
function SectionHeading({ children }) {
  return <h3 style={{ fontFamily: font.sans, fontSize: 20, fontWeight: 700, margin: "0 0 14px", color: color.ink }}>{children}</h3>;
}

// Numbered "pick your path" navigation rows — tells different readers where to go next.
function PathList({ items, accent = color.accent, onNavigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
      {items.map((step, i) => (
        <button key={step.id} onClick={() => onNavigate(step.id)} style={{
          display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", textAlign: "left",
          background: `${accent}06`, borderRadius: 12, cursor: "pointer",
          border: `1px solid ${accent}18`, fontFamily: font.sans, width: "100%",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${accent}18`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <strong style={{ color: color.ink, fontSize: 15 }}>{step.title}</strong>
            <p style={{ margin: "3px 0 0", fontSize: 14, color: color.muted, lineHeight: 1.5 }}>{step.desc}</p>
          </div>
          <Icon name="chevronRight" size={18} color={accent} />
        </button>
      ))}
    </div>
  );
}

// Rail-backed feature list — sparkle rows with bold titles, shared by overview and AI pages.
function FeatureBox({ items, accent = color.accent }) {
  return (
    <div style={{ background: color.rail, borderRadius: 16, padding: 28, border: `1px solid ${color.line}`, marginBottom: 28 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < items.length - 1 ? 14 : 0 }}>
          <div style={{ marginTop: 1 }}><Icon name="sparkle" size={16} color={accent} /></div>
          <div><strong style={{ color: color.ink, fontSize: 15 }}>{item.title}:</strong> <span style={{ color: color.body, fontSize: 15, lineHeight: 1.6 }}>{item.desc}</span></div>
        </div>
      ))}
    </div>
  );
}

// The one deep-link banner style: dark ink panel, accent icon tile, chevron.
function CtaBanner({ icon, title, desc, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: color.ink, borderRadius: 16, padding: "24px 28px",
      color: "#fff", margin: "20px 0 28px", display: "flex", alignItems: "center", gap: 20, cursor: "pointer",
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={26} color={color.accent} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "0 0 4px", fontFamily: font.sans, fontSize: 18 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>{desc}</p>
      </div>
      <Icon name="chevronRight" size={20} color="rgba(255,255,255,0.5)" />
    </div>
  );
}

function TemplateCard({ title, desc, items, accent, onLaunch, image, launchLabel = "Go to this step" }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: `1px solid ${accent}18`, boxShadow: `0 2px 12px ${accent}08`, display: "flex", flexDirection: "column" }}>
      {image && (
        <div style={{ margin: "-24px -24px 16px", background: color.rail, borderBottom: `1px solid ${accent}12` }}>
          <img src={image} alt="" loading="lazy" decoding="async" style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }} />
        </div>
      )}
      <h4 style={{ margin: "0 0 8px", fontFamily: font.sans, fontSize: 18, color: color.ink }}>{title}</h4>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: color.muted, lineHeight: 1.6 }}>{desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent, marginTop: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: color.body, lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
      {onLaunch && (
        <button onClick={onLaunch} style={{
          marginTop: 16, background: accent, color: "#fff", border: "none",
          borderRadius: 8, padding: "10px 14px", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: font.sans,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>{launchLabel} →</button>
      )}
    </div>
  );
}

function FacilitatorNote({ children, title = "Facilitator Note" }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 10, border: `1px dashed ${color.line}`, marginTop: 12, marginBottom: 8, overflow: "hidden", background: color.rail }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
        background: open ? `${color.accent}08` : "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
        color: color.accent, fontFamily: font.sans,
      }}>
        {title}
        <span style={{ marginLeft: "auto", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>
          <Icon name="chevronDown" size={16} color={color.accent} />
        </span>
      </button>
      {open && <div style={{ padding: "4px 16px 14px", fontSize: 14, lineHeight: 1.6, color: color.body, borderTop: `1px dashed ${color.line}` }}>{children}</div>}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8,
  border: `1px solid ${color.line}`, fontFamily: "inherit", outline: "none",
};

const fieldLabel = { fontSize: 13, fontWeight: 600, color: color.body, display: "block", marginBottom: 6 };

// ========== PROTOTYPE PROMPT BUILDER ==========
function PrototypePromptBuilder({ hmw: hmwProp = "", idea: ideaProp = "" }) {
  const [hmw, setHmw] = useState(hmwProp);
  const [idea, setIdea] = useState(ideaProp);
  const [open, setOpen] = useState(false);
  const [formatKey, setFormatKey] = useState(PROTOTYPE_FORMATS[0].key);
  const [audience, setAudience] = useState("");
  const [copied, setCopied] = useState(false);
  const prompt = buildPrototypePrompt({ hmw, idea, formatKey, audience });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — user can still copy manually from the textarea
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 14, width: "100%",
          background: `linear-gradient(135deg, ${color.accent}10, ${color.accent}05)`,
          border: `1.5px solid ${color.accent}40`, borderRadius: 14,
          padding: "16px 18px", marginBottom: 16, cursor: "pointer",
          fontFamily: "inherit", textAlign: "left",
        }}
      >
        <div style={{
          flexShrink: 0, width: 42, height: 42, borderRadius: 12,
          background: color.accent, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="chat" size={20} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, color: color.ink, fontSize: 15 }}>Build your prototype with AI</div>
            <span style={{ background: color.accent, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: "2px 7px", borderRadius: 4, textTransform: "uppercase" }}>New</span>
          </div>
          <div style={{ fontSize: 13, color: color.body, lineHeight: 1.45 }}>
            Enter your HMW question and your favorite Crazy 8s idea, and we'll turn them into a ready-to-paste prompt for ChatGPT, Claude, or any AI — so you can get a real draft to show people in minutes.
          </div>
        </div>
        <div style={{ flexShrink: 0, color: color.accent, fontWeight: 700, fontSize: 13 }}>Open →</div>
      </button>
    );
  }

  return (
    <div style={{ marginBottom: 16, borderRadius: 14, border: `1.5px solid ${color.accent}40`, background: `linear-gradient(135deg, ${color.accent}10, ${color.accent}05)`, padding: "16px 18px" }}>
      <label style={{ display: "block", marginBottom: 10 }}>
        <span style={fieldLabel}>Your "How might we…" question</span>
        <input value={hmw} onChange={(e) => setHmw(e.target.value)} placeholder="How might we …?" style={inputStyle} />
      </label>
      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={fieldLabel}>The idea you want to prototype</span>
        <input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Describe your starred idea" style={inputStyle} />
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: color.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="chat" size={18} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: color.ink, fontSize: 15 }}>Build your prototype with AI</div>
          <div style={{ fontSize: 12, color: color.body, marginTop: 2 }}>Pick a format, then copy the prompt into ChatGPT or Claude.</div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: "none", border: "none", color: color.muted, cursor: "pointer", fontSize: 18, lineHeight: 1, fontFamily: "inherit" }}>×</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }} className="hiab-grid-2">
        <label>
          <span style={fieldLabel}>Prototype format</span>
          <select value={formatKey} onChange={(e) => setFormatKey(e.target.value)} style={{ ...inputStyle, fontFamily: font.sans, fontSize: 14 }}>
            {PROTOTYPE_FORMATS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </label>
        <label>
          <span style={fieldLabel}>Audience (optional)</span>
          <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. young adults at a suburban church" style={inputStyle} />
        </label>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${color.line}`, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
        <textarea
          value={prompt}
          readOnly
          rows={12}
          style={{ width: "100%", border: "none", outline: "none", resize: "vertical", fontSize: 13, lineHeight: 1.55, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: color.ink, background: "transparent" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={copy} style={{
          background: color.accent, color: "#fff", border: "none",
          borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}>{copied ? "Copied!" : "Copy prompt"}</button>
        <span style={{ fontSize: 12, color: color.muted }}>Paste into ChatGPT, Claude, or any AI assistant to draft your prototype.</span>
      </div>
    </div>
  );
}

// ========== SCIPAB CHATBOT COMPONENT ==========
function SCIPABChatbot() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = intro, 0-5 = SCIPAB steps, 6 = review, 7 = AI refinement
  const [responses, setResponses] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHackableInfo, setShowHackableInfo] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [churchName, setChurchName] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const aiConfigured = isAiConfigured();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, currentStep, showHackableInfo]);

  useEffect(() => {
    if (currentStep >= 0) inputRef.current?.focus();
  }, [currentStep]);

  const addBotMessage = (text, extra = {}) => {
    setChatHistory((prev) => [...prev, { role: "bot", text, ...extra }]);
  };
  const addUserMessage = (text) => {
    setChatHistory((prev) => [...prev, { role: "user", text }]);
  };

  const handleStart = () => {
    setCurrentStep(0);
    addBotMessage(
      `Great, let's build your problem statement using the SCIPAB framework! I'll walk you through 6 steps. Each one builds on the last to create a clear, compelling picture of your challenge.\n\nFirst — what's the name of your church or organization?`
    );
  };

  const handleChurchName = () => {
    if (!inputValue.trim()) return;
    setChurchName(inputValue.trim());
    addUserMessage(inputValue.trim());
    setInputValue("");
    setTimeout(() => {
      addBotMessage(
        `Welcome, ${inputValue.trim()}! 🙌\n\nLet's start with step 1 of 6.`,
        { stepIntro: true }
      );
    }, 400);
  };

  const handleSubmitStep = () => {
    if (!inputValue.trim()) return;
    const step = SCIPAB_STEPS[currentStep];
    const val = inputValue.trim();
    addUserMessage(val);
    setResponses((prev) => ({ ...prev, [step.key]: val }));
    setInputValue("");

    setTimeout(() => {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        addBotMessage(`Got it — great ${step.label.toLowerCase()} description! ✓\n\nNow let's move to the next step.`, { stepIntro: true });
      } else {
        setCurrentStep(6);
        addBotMessage("Excellent! You've completed all 6 SCIPAB steps! 🎉\n\nLet me put together your full problem statement...");
      }
    }, 500);
  };

  const handleAIRefine = async () => {
    setIsLoading(true);
    setCurrentStep(7);
    addBotMessage("Let me refine your submission into a polished SCIPAB problem statement and evaluate whether it's a hackable problem... ✨");

    try {
      const data = await requestAiCoach({
        type: "scipab",
        churchName,
        responses,
        steps: SCIPAB_STEPS.map(({ key, label }) => ({ key, label })),
      });
      setAiSummary(data.result || data);
      setIsLoading(false);
    } catch (err) {
      console.error("AI refinement error:", err);
      setAiSummary(null);
      setIsLoading(false);
      addBotMessage("I wasn't able to connect to the AI assistant right now, but your SCIPAB submission is saved above! You can still use it as-is for your Hack In A Box sprint.");
    }
  };

  const handleReset = () => {
    setCurrentStep(-1);
    setResponses({});
    setInputValue("");
    setChatHistory([]);
    setIsLoading(false);
    setShowHackableInfo(false);
    setAiSummary(null);
    setChurchName("");
  };

  const renderStepIndicator = () => {
    if (currentStep < 0 || currentStep > 5) return null;
    return (
      <div style={{ display: "flex", gap: 4, justifyContent: "center", margin: "16px 0 8px" }}>
        {SCIPAB_STEPS.map((step, i) => (
          <div key={i} style={{
            width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: font.sans, fontWeight: 700, fontSize: 14,
            background: i < currentStep ? step.color : i === currentStep ? `${step.color}18` : color.line,
            color: i < currentStep ? "#fff" : i === currentStep ? step.color : color.line,
            border: i === currentStep ? `2px solid ${step.color}` : "2px solid transparent",
            transition: "all 0.3s",
          }}>
            {i < currentStep ? "✓" : step.letter}
          </div>
        ))}
      </div>
    );
  };

  const renderCurrentPrompt = () => {
    if (currentStep < 0) return null;
    if (currentStep > 5) return null;

    // If we haven't entered church name yet
    if (!churchName) return null;

    const step = SCIPAB_STEPS[currentStep];
    return (
      <div style={{
        background: `${step.color}08`, border: `1px solid ${step.color}20`, borderRadius: 14,
        padding: "18px 20px", margin: "12px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: step.color, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: font.sans, fontWeight: 700, fontSize: 15,
          }}>{step.letter}</div>
          <div>
            <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 17, color: step.color }}>
              Step {currentStep + 1}: {step.label}
            </div>
            <div style={{ fontSize: 13, color: color.muted }}>{step.guideText}</div>
          </div>
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.6, color: color.body }}>{step.prompt}</p>
        <div style={{
          background: `${step.color}06`, borderRadius: 8, padding: "10px 14px",
          borderLeft: `3px solid ${step.color}40`, fontSize: 13, color: color.muted, lineHeight: 1.55, fontStyle: "italic",
        }}>
          {step.helper}
        </div>
      </div>
    );
  };

  const renderReview = () => {
    if (currentStep !== 6 && currentStep !== 7) return null;
    return (
      <div style={{ margin: "16px 0" }}>
        <div style={{
          background: "#fff", borderRadius: 16, border: `1px solid ${color.line}`, padding: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Icon name="clipboard" size={22} color={color.accent} />
            <h3 style={{ margin: 0, fontFamily: font.sans, fontSize: 20, color: color.ink }}>
              {churchName}'s SCIPAB Submission
            </h3>
          </div>
          {SCIPAB_STEPS.map((step) => (
            <div key={step.key} style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: `${step.color}06`, borderLeft: `3px solid ${step.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                {step.letter} — {step.label}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: color.body, lineHeight: 1.6 }}>{responses[step.key]}</p>
            </div>
          ))}

          {currentStep === 6 && !isLoading && (
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => {
                const text = `${churchName}'s SCIPAB Submission\n\n` + SCIPAB_STEPS.map(s => `${s.label}: ${responses[s.key]}`).join("\n\n");
                navigator.clipboard?.writeText(text);
              }} style={{
                flex: 1, padding: "14px 20px", borderRadius: 10, border: `1px solid ${color.line}`,
                background: "#fff", color: color.body, fontFamily: font.sans, fontSize: 14,
                fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                Copy to Clipboard
              </button>
              <button onClick={handleAIRefine} disabled={!aiConfigured} title={aiConfigured ? "" : "Configure VITE_HIAB_AI_ENDPOINT to enable AI coaching."} style={{
                flex: 2, padding: "14px 20px", borderRadius: 10, border: "none",
                background: aiConfigured ? color.accent : color.line, color: "#fff",
                fontFamily: font.sans, fontSize: 15, fontWeight: 600, cursor: aiConfigured ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: aiConfigured ? "0 4px 16px rgba(13,124,95,0.3)" : "none",
              }}>
                <Icon name="sparkle" size={18} color="#fff" /> {aiConfigured ? "Refine with AI Coach" : "AI Coach Not Configured"}
              </button>
            </div>
          )}
        </div>

        {isLoading && (
          <div style={{
            margin: "16px 0", padding: 20, borderRadius: 12, background: color.rail,
            border: `1px solid ${color.line}`, textAlign: "center",
          }}>
            <div style={{ marginBottom: 8 }}><Icon name="sparkle" size={28} color={color.accent} /></div>
            <p style={{ margin: 0, fontSize: 15, color: color.body }}>AI coach is reviewing your submission...</p>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
          </div>
        )}

        {aiSummary && (
          <div style={{ marginTop: 16 }}>
            {/* Hackability Score */}
            <div style={{
              background: color.ink, borderRadius: 16, padding: 24,
              color: "#fff", marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Icon name="zap" size={22} color={color.accent} />
                <h4 style={{ margin: 0, fontFamily: font.sans, fontSize: 18 }}>Hackability Score</h4>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: n <= aiSummary.hackability.score ? color.accent : "rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: font.sans, fontWeight: 700, fontSize: 16,
                    color: n <= aiSummary.hackability.score ? "#fff" : "rgba(255,255,255,0.3)",
                  }}>{n}</div>
                ))}
                <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>/ 5</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>{aiSummary.hackability.feedback}</p>
            </div>

            {/* HMW Question */}
            <div style={{
              background: `${color.accent}08`, border: `1px solid ${color.line}`, borderRadius: 14,
              padding: "20px 24px", textAlign: "center", marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: color.accent, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
                Your "How Might We" Question
              </div>
              <p style={{ margin: 0, fontFamily: font.sans, fontSize: 20, fontWeight: 700, color: color.ink, lineHeight: 1.4 }}>
                {aiSummary.hmw}
              </p>
            </div>

            {/* Refined SCIPAB */}
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${color.line}`, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name="sparkle" size={18} color={color.accent} />
                <h4 style={{ margin: 0, fontFamily: font.sans, fontSize: 16, color: color.ink }}>
                  Refined SCIPAB Statement
                </h4>
              </div>
              {SCIPAB_STEPS.map((step) => (
                <div key={step.key} style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 8, background: `${step.color}04`, borderLeft: `2px solid ${step.color}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {step.label}
                  </span>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: color.body, lineHeight: 1.6 }}>
                    {aiSummary.refined[step.key]}
                  </p>
                </div>
              ))}
            </div>

            <button onClick={handleReset} style={{
              marginTop: 16, width: "100%", padding: "14px 20px", borderRadius: 10,
              border: `1px solid ${color.line}`, background: "#fff", color: color.body,
              fontFamily: font.sans, fontSize: 14, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Icon name="refresh" size={16} color={color.body} /> Start Another Problem Statement
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <PhaseHeader icon="chat" title="Build Your Problem Statement" subtitle="Use our AI-guided SCIPAB tool to articulate your church's challenge" accent={phaseColors.submit.accent} />
      <SectionArt src={artLightbulb} alt="A lightbulb with a glowing orange filament, representing an insight" max={560} />

      {/* Hackable Problem Reminder */}
      <div style={{
        background: showHackableInfo ? `${color.accent}08` : `${color.accent}04`,
        border: `1px solid ${showHackableInfo ? `${color.accent}25` : `${color.accent}15`}`,
        borderRadius: 14, padding: "18px 20px", marginBottom: 24, transition: "all 0.3s",
      }}>
        <button onClick={() => setShowHackableInfo(!showHackableInfo)} style={{
          background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center",
          gap: 10, width: "100%", padding: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: `${color.accent}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="zap" size={20} color={color.accent} />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontFamily: font.sans, fontSize: 16, fontWeight: 600, color: color.ink }}>
              What Makes a Problem "Hackable"?
            </div>
            <div style={{ fontSize: 13, color: color.muted }}>
              Tap to {showHackableInfo ? "collapse" : "learn what kind of problems work best for a design sprint"}
            </div>
          </div>
          <span style={{ transform: showHackableInfo ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>
            <Icon name="chevronDown" size={18} color={color.accent} />
          </span>
        </button>

        {showHackableInfo && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${color.line}` }}>
            <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.65, color: color.body }}>
              Not every problem is a good fit for a Hack In A Box sprint. The best "hackable" problems have these qualities:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "users", title: "Human-Centered", desc: "The problem is about real people with real needs — not abstract organizational goals. Think about who is affected and what they experience." },
                { icon: "target", title: "Specific & Scoped", desc: "It's narrow enough to make meaningful progress in a single sprint session. \"Fix our church\" is too broad. \"Help newcomers feel welcome in their first month\" is hackable." },
                { icon: "lightbulb", title: "Open to Creative Solutions", desc: "The problem doesn't already have an obvious answer. If you already know the solution, you don't need a sprint — you need an action plan." },
                { icon: "zap", title: "Actionable", desc: "Your church has the ability (or could develop it) to actually implement solutions. Don't hack on things completely outside your control." },
                { icon: "heart", title: "Meaningful & Motivating", desc: "People care about this problem. It touches hearts. When you describe it, team members lean in rather than tune out." },
                { icon: "info", title: "Not Solution-Disguised", desc: "\"We need a new app\" isn't a problem — it's a solution. Ask WHY you think you need that app. The underlying need is the real hackable problem." },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px",
                  borderRadius: 10, background: "#fff", border: `1px solid ${color.line}`,
                }}>
                  <span style={{ flexShrink: 0, marginTop: 2 }}><Icon name={item.icon} size={22} color={color.accent} /></span>
                  <div>
                    <strong style={{ fontSize: 14, color: color.ink }}>{item.title}</strong>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: color.muted, lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 14, padding: "14px 16px", borderRadius: 10,
              background: color.ink, color: "#fff",
            }}>
              <strong style={{ fontSize: 13, color: color.accent }}>Quick Test</strong>
              <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.55, opacity: 0.9 }}>
                Can you finish this sentence? "If we solved this problem, <strong>[specific group of people]</strong> would be able to <strong>[specific positive outcome]</strong>." If yes, it's probably hackable!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SCIPAB Explainer */}
      {currentStep === -1 && (
        <div>
          <div style={{
            background: "#fff", borderRadius: 16, border: `1px solid ${color.line}`, padding: 24,
            marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontFamily: font.sans, fontSize: 20, color: color.ink }}>
              The SCIPAB Framework
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.65, color: color.body }}>
              SCIPAB (pronounced "sigh-pab") is a powerful six-step method for clearly communicating a problem. It helps you link ideas together in a sequence that grabs attention and connects with what matters most. We'll guide you through each step.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
              {SCIPAB_STEPS.map((step) => (
                <div key={step.key} style={{
                  padding: "12px 14px", borderRadius: 10, background: `${step.color}06`,
                  border: `1px solid ${step.color}12`, textAlign: "center",
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", background: step.color, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: font.sans, fontWeight: 700, fontSize: 15,
                    margin: "0 auto 6px",
                  }}>{step.letter}</div>
                  <strong style={{ fontSize: 13, color: step.color }}>{step.label}</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: color.muted, lineHeight: 1.4 }}>{step.guideText}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleStart} style={{
            width: "100%", padding: "16px 24px", borderRadius: 12, border: "none",
            background: color.accent, color: "#fff",
            fontFamily: font.sans, fontSize: 16, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 4px 20px rgba(13,124,95,0.3)",
          }}>
            <Icon name="chat" size={20} color="#fff" /> Start Building Your Problem Statement
          </button>
        </div>
      )}

      {/* Chat area */}
      {currentStep >= 0 && (
        <div style={{
          background: "#fff", borderRadius: 16, border: `1px solid ${color.line}`,
          overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        }}>
          {/* Chat header */}
          <div style={{
            padding: "14px 20px", borderBottom: `1px solid ${color.line}`,
            background: color.surface,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: color.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="sparkle" size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 15, color: color.ink }}>
                  SCIPAB Problem Coach
                </div>
                <div style={{ fontSize: 12, color: color.accent }}>● Online</div>
              </div>
            </div>
            <button onClick={handleReset} style={{
              background: "none", border: `1px solid ${color.line}`, borderRadius: 6, padding: "4px 10px",
              fontSize: 12, color: color.muted, cursor: "pointer",
            }}>Start Over</button>
          </div>

          {renderStepIndicator()}

          {/* Messages */}
          <div style={{ padding: "16px 20px", maxHeight: 400, overflowY: "auto" }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}>
                <div style={{
                  maxWidth: "85%", padding: "12px 16px", borderRadius: 14,
                  background: msg.role === "user" ? color.accent : color.line,
                  color: msg.role === "user" ? "#fff" : color.body,
                  fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line",
                  borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                  borderBottomLeftRadius: msg.role === "user" ? 14 : 4,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {renderCurrentPrompt()}
            {renderReview()}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          {currentStep >= 0 && currentStep <= 5 && !isLoading && (
            <div style={{
              padding: "14px 16px", borderTop: `1px solid ${color.line}`,
              display: "flex", gap: 10, background: color.rail,
            }}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!churchName) handleChurchName();
                    else handleSubmitStep();
                  }
                }}
                placeholder={!churchName ? "Enter your church or organization name..." : `Describe your ${SCIPAB_STEPS[currentStep]?.label.toLowerCase()}...`}
                rows={3}
                style={{
                  flex: 1, padding: "12px 14px", borderRadius: 10, border: `1px solid ${color.line}`,
                  fontFamily: font.sans, fontSize: 14, lineHeight: 1.5, resize: "none",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = color.accent)}
                onBlur={(e) => (e.target.style.borderColor = color.line)}
              />
              <button
                onClick={() => { if (!churchName) handleChurchName(); else handleSubmitStep(); }}
                disabled={!inputValue.trim()}
                style={{
                  width: 44, height: 44, borderRadius: 10, border: "none",
                  background: inputValue.trim() ? color.accent : color.line,
                  cursor: inputValue.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  alignSelf: "flex-end", transition: "background 0.2s",
                }}
              >
                <Icon name="send" size={18} color={inputValue.trim() ? "#fff" : color.muted} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== PROPOSAL GENERATOR STEPS ==========
const PROPOSAL_STEPS = [
  {
    key: "problem",
    label: "The Problem",
    letter: "1",
    color: color.accent,
    prompt: "What problem did your sprint tackle? Share the 'How Might We' question and a brief description of the challenge.",
    helper: "Example: \"How might we help newcomers feel genuinely welcomed in their first month? We found that many first-time visitors never return because they don't form any personal connections on their first visit.\"",
  },
  {
    key: "evidence",
    label: "Evidence & Insights",
    letter: "2",
    color: color.accent,
    prompt: "What did you learn from your empathy mapping and research? What key insights emerged about the people you're trying to serve?",
    helper: "Example: \"From our empathy maps, we discovered that visitors feel overwhelmed by the size of our congregation, don't know how to get involved, and often feel invisible. Many said they wished someone had personally invited them to a small group.\"",
  },
  {
    key: "solution",
    label: "Proposed Solution",
    letter: "3",
    color: color.accent,
    prompt: "What's the idea your team developed? Describe it clearly — what is it, how does it work, and who is it for?",
    helper: "Example: \"We propose a 'Welcome Partner' program where every first-time visitor is paired with a member who contacts them within 48 hours, invites them to coffee, and personally walks them into a small group within their first month.\"",
  },
  {
    key: "impact",
    label: "Expected Impact",
    letter: "4",
    color: color.accent,
    prompt: "What would change if this idea worked? Who benefits, and how? Be as specific as you can about the expected outcomes.",
    helper: "Example: \"We expect to see our visitor return rate increase from ~20% to 50%+ within 6 months. More importantly, newcomers would form real relationships faster, leading to deeper engagement and spiritual growth.\"",
  },
  {
    key: "resources",
    label: "What We Need",
    letter: "5",
    color: color.accent,
    prompt: "What resources, support, or approvals do you need from leadership to move forward? Think about budget, people, time, and permissions.",
    helper: "Example: \"We need: (1) pastoral endorsement to recruit 15 Welcome Partners from existing members, (2) a $300 budget for coffee gift cards and training materials, (3) 10 minutes during a Sunday service to launch the program and recruit partners.\"",
  },
  {
    key: "plan",
    label: "Action Plan",
    letter: "6",
    color: color.accent,
    prompt: "What's your proposed timeline? What happens in the first 30, 60, and 90 days? Who is responsible for each step?",
    helper: "Example: \"Month 1: Recruit and train 15 Welcome Partners (led by Sarah). Month 2: Soft launch with Sunday visitors, gather feedback weekly (led by James). Month 3: Evaluate data, refine process, present results to elder board (led by Maria).\"",
  },
];

// ========== PROPOSAL GENERATOR CHATBOT ==========
function ProposalAccordion() {
  const [open, setOpen] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const ref = useRef(null);
  const handleButtonStart = () => {
    setAutoStart(true);
    setOpen(true);
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };
  return (
    <div ref={ref} style={{
      borderRadius: 14, border: `1px solid ${color.line}`, marginBottom: 12,
      overflow: "hidden", background: "#fff", boxShadow: `0 2px 12px ${color.accent}0F`,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "18px 22px 10px", display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 12, background: open ? `${color.accent}06` : "transparent",
        border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: font.sans, fontSize: 18, fontWeight: 600, color: color.ink }}>
            Build a Proposal for Leadership
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color.accent, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: color.muted, fontFamily: font.sans }}>
              Powered by AI — builds a leadership-ready pitch from your sprint results
            </span>
          </div>
        </div>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", flexShrink: 0, marginTop: 4 }}>
          <Icon name="chevronDown" size={20} color={color.accent} />
        </span>
      </button>
      <div style={{ padding: "6px 22px 18px" }}>
        {!open && (
          <button onClick={handleButtonStart} style={{
            marginTop: 4, width: "100%", padding: "13px 20px", borderRadius: 10, border: "none",
            background: color.accent, color: "#fff",
            fontFamily: font.sans, fontSize: 15, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: `0 4px 16px ${color.accent}40`,
          }}>
            <Icon name="sparkle" size={18} color="#fff" /> Start Building Your Proposal
          </button>
        )}
      </div>
      {open && (
        <div style={{ padding: "0 22px 22px", borderTop: `1px solid ${color.line}` }}>
          <ProposalChatbot autoStart={autoStart} />
        </div>
      )}
    </div>
  );
}

function ProposalChatbot({ autoStart = false }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [responses, setResponses] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiProposal, setAiProposal] = useState(null);
  const [teamName, setTeamName] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasAutoStarted = useRef(false);
  const aiConfigured = isAiConfigured();

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, currentStep]);
  useEffect(() => { if (currentStep >= 0) inputRef.current?.focus(); }, [currentStep]);

  useEffect(() => {
    if (autoStart && !hasAutoStarted.current && currentStep === -1) {
      hasAutoStarted.current = true;
      setCurrentStep(0);
      setChatHistory([{ role: "bot", text: "Let's build a compelling proposal for your church leadership! I'll walk you through 6 sections. First — what's the name of your team or sprint group?" }]);
    }
  }, [autoStart, currentStep]);

  const addBotMessage = (text) => setChatHistory((prev) => [...prev, { role: "bot", text }]);
  const addUserMessage = (text) => setChatHistory((prev) => [...prev, { role: "user", text }]);

  const handleStart = () => {
    setCurrentStep(0);
    addBotMessage("Let's build a compelling proposal for your church leadership! I'll walk you through 6 sections. First — what's the name of your team or sprint group?");
  };

  const handleTeamName = () => {
    if (!inputValue.trim()) return;
    setTeamName(inputValue.trim());
    addUserMessage(inputValue.trim());
    setInputValue("");
    setTimeout(() => addBotMessage(`Great, ${inputValue.trim()}! Let's build your proposal step by step.`), 400);
  };

  const handleSubmitStep = () => {
    if (!inputValue.trim()) return;
    const step = PROPOSAL_STEPS[currentStep];
    addUserMessage(inputValue.trim());
    setResponses((prev) => ({ ...prev, [step.key]: inputValue.trim() }));
    setInputValue("");
    setTimeout(() => {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        addBotMessage(`Excellent — your ${step.label.toLowerCase()} is captured! ✓\n\nOn to the next section.`);
      } else {
        setCurrentStep(6);
        addBotMessage("You've completed all 6 sections! 🎉 Let me put your proposal together...");
      }
    }, 500);
  };

  const handleAIRefine = async () => {
    setIsLoading(true);
    setCurrentStep(7);
    addBotMessage("Refining your proposal into a polished, leadership-ready document... ✨");
    try {
      const data = await requestAiCoach({
        type: "proposal",
        teamName,
        responses,
        steps: PROPOSAL_STEPS.map(({ key, label }) => ({ key, label })),
      });
      setAiProposal(data.result || data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setAiProposal(null);
      setIsLoading(false);
      addBotMessage("I couldn't connect to the AI assistant, but your proposal content is saved above and ready to use!");
    }
  };

  const handleReset = () => {
    setCurrentStep(-1); setResponses({}); setInputValue(""); setChatHistory([]);
    setIsLoading(false); setAiProposal(null); setTeamName("");
  };

  const renderStepIndicator = () => {
    if (currentStep < 0 || currentStep > 5) return null;
    return (
      <div style={{ display: "flex", gap: 4, justifyContent: "center", margin: "16px 0 8px" }}>
        {PROPOSAL_STEPS.map((step, i) => (
          <div key={i} style={{
            width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: font.sans, fontWeight: 700, fontSize: 14,
            background: i < currentStep ? step.color : i === currentStep ? `${step.color}18` : color.line,
            color: i < currentStep ? "#fff" : i === currentStep ? step.color : color.line,
            border: i === currentStep ? `2px solid ${step.color}` : "2px solid transparent",
            transition: "all 0.3s",
          }}>{i < currentStep ? "✓" : step.letter}</div>
        ))}
      </div>
    );
  };

  const renderCurrentPrompt = () => {
    if (currentStep < 0 || currentStep > 5 || !teamName) return null;
    const step = PROPOSAL_STEPS[currentStep];
    return (
      <div style={{ background: `${step.color}08`, border: `1px solid ${step.color}20`, borderRadius: 14, padding: "18px 20px", margin: "12px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: step.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.sans, fontWeight: 700, fontSize: 15 }}>{step.letter}</div>
          <div>
            <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 17, color: step.color }}>Step {currentStep + 1}: {step.label}</div>
          </div>
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.6, color: color.body }}>{step.prompt}</p>
        <div style={{ background: `${step.color}06`, borderRadius: 8, padding: "10px 14px", borderLeft: `3px solid ${step.color}40`, fontSize: 13, color: color.muted, lineHeight: 1.55, fontStyle: "italic" }}>{step.helper}</div>
      </div>
    );
  };

  const renderReview = () => {
    if (currentStep !== 6 && currentStep !== 7) return null;
    return (
      <div style={{ margin: "16px 0" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${color.line}`, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontFamily: font.sans, fontSize: 20, color: color.ink }}>
            {teamName}'s Proposal
          </h3>
          {PROPOSAL_STEPS.map((step) => (
            <div key={step.key} style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: `${step.color}06`, borderLeft: `3px solid ${step.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{step.letter} — {step.label}</div>
              <p style={{ margin: 0, fontSize: 14, color: color.body, lineHeight: 1.6 }}>{responses[step.key]}</p>
            </div>
          ))}
          {currentStep === 6 && !isLoading && (
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => {
                const text = `${teamName}'s Proposal\n\n` + PROPOSAL_STEPS.map(s => `${s.label}: ${responses[s.key]}`).join("\n\n");
                navigator.clipboard?.writeText(text);
              }} style={{
                flex: 1, padding: "14px 20px", borderRadius: 10, border: `1px solid ${color.line}`,
                background: "#fff", color: color.body, fontFamily: font.sans, fontSize: 14,
                fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                Copy to Clipboard
              </button>
              <button onClick={handleAIRefine} disabled={!aiConfigured} title={aiConfigured ? "" : "Configure VITE_HIAB_AI_ENDPOINT to enable AI polishing."} style={{
                flex: 2, padding: "14px 20px", borderRadius: 10, border: "none",
                background: aiConfigured ? color.accent : color.line, color: "#fff",
                fontFamily: font.sans, fontSize: 15, fontWeight: 600, cursor: aiConfigured ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: aiConfigured ? "0 4px 16px rgba(29,78,216,0.3)" : "none",
              }}>{aiConfigured ? "Polish with AI" : "AI Not Configured"}</button>
            </div>
          )}
        </div>

        {isLoading && (
          <div style={{ margin: "16px 0", padding: 20, borderRadius: 12, background: color.rail, border: `1px solid ${color.line}`, textAlign: "center" }}>
            <div style={{ marginBottom: 8 }}><Icon name="sparkle" size={28} color={color.accent} /></div>
            <p style={{ margin: 0, fontSize: 15, color: color.body }}>Crafting your leadership proposal...</p>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
          </div>
        )}

        {aiProposal && (
          <div style={{ marginTop: 16 }}>
            {/* Elevator Pitch */}
            <div style={{ background: color.ink, borderRadius: 16, padding: 24, color: "#fff", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: color.accent, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Elevator Pitch</div>
              <h3 style={{ margin: "0 0 10px", fontFamily: font.sans, fontSize: 20 }}>{aiProposal.title}</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, opacity: 0.9 }}>{aiProposal.elevator_pitch}</p>
            </div>

            {/* Refined Proposal */}
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${color.line}`, padding: 20 }}>
              <h4 style={{ margin: "0 0 14px", fontFamily: font.sans, fontSize: 16, color: color.ink }}>Polished Proposal</h4>
              {PROPOSAL_STEPS.map((step) => (
                <div key={step.key} style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 8, background: `${step.color}04`, borderLeft: `2px solid ${step.color}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{step.label}</span>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: color.body, lineHeight: 1.6 }}>{aiProposal.refined[step.key]}</p>
                </div>
              ))}
            </div>

            <button onClick={handleReset} style={{
              marginTop: 16, width: "100%", padding: "14px 20px", borderRadius: 10,
              border: `1px solid ${color.line}`, background: "#fff", color: color.body,
              fontFamily: font.sans, fontSize: 14, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>Build Another Proposal</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {currentStep === -1 && (
        <div>
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${color.line}`, padding: 24, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.65, color: color.body }}>
              This tool walks you through six sections that together create a compelling case for your sprint idea. It's designed for presenting to pastors, elder boards, and ministry leaders.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
              {PROPOSAL_STEPS.map((step) => (
                <div key={step.key} style={{ padding: "12px 14px", borderRadius: 10, background: `${step.color}06`, border: `1px solid ${step.color}12`, textAlign: "center" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: step.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.sans, fontWeight: 700, fontSize: 15, margin: "0 auto 6px" }}>{step.letter}</div>
                  <strong style={{ fontSize: 13, color: step.color }}>{step.label}</strong>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleStart} style={{
            width: "100%", padding: "16px 24px", borderRadius: 12, border: "none",
            background: color.accent, color: "#fff",
            fontFamily: font.sans, fontSize: 16, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 4px 20px rgba(29,78,216,0.3)",
          }}>Start Building Your Proposal</button>
        </div>
      )}

      {currentStep >= 0 && (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${color.line}`, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${color.line}`, background: color.surface, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: color.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="edit" size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 15, color: color.ink }}>Proposal Builder</div>
                <div style={{ fontSize: 12, color: color.accent }}>● Ready</div>
              </div>
            </div>
            <button onClick={handleReset} style={{ background: "none", border: `1px solid ${color.line}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: color.muted, cursor: "pointer" }}>Start Over</button>
          </div>

          {renderStepIndicator()}

          <div style={{ padding: "16px 20px", maxHeight: 400, overflowY: "auto" }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                <div style={{
                  maxWidth: "85%", padding: "12px 16px", borderRadius: 14,
                  background: msg.role === "user" ? color.accent : color.line,
                  color: msg.role === "user" ? "#fff" : color.body,
                  fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line",
                  borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                  borderBottomLeftRadius: msg.role === "user" ? 14 : 4,
                }}>{msg.text}</div>
              </div>
            ))}
            {renderCurrentPrompt()}
            {renderReview()}
            <div ref={chatEndRef} />
          </div>

          {currentStep >= 0 && currentStep <= 5 && !isLoading && (
            <div style={{ padding: "14px 16px", borderTop: `1px solid ${color.line}`, display: "flex", gap: 10, background: color.rail }}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!teamName) handleTeamName(); else handleSubmitStep(); } }}
                placeholder={!teamName ? "Enter your team or sprint group name..." : `Describe: ${PROPOSAL_STEPS[currentStep]?.label}...`}
                rows={3}
                style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: `1px solid ${color.line}`, fontFamily: font.sans, fontSize: 14, lineHeight: 1.5, resize: "none", outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = color.accent)}
                onBlur={(e) => (e.target.style.borderColor = color.line)}
              />
              <button
                onClick={() => { if (!teamName) handleTeamName(); else handleSubmitStep(); }}
                disabled={!inputValue.trim()}
                style={{ width: 44, height: 44, borderRadius: 10, border: "none", background: inputValue.trim() ? color.accent : color.line, cursor: inputValue.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }}
              >
                <Icon name="send" size={18} color={inputValue.trim() ? "#fff" : color.muted} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ========== SHARED: AI call helper ==========
async function callAI({ system, messages, max_tokens = 800 }) {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages, max_tokens }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "AI request failed");
    return { text: data.content || "", demo: !!data.demo };
  } catch {
    return {
      text: "AI is unavailable right now — please try again in a moment.",
      demo: true,
    };
  }
}

// ========== SHARED: top header for non-picker modes ==========
function ModeTopBar({ title, subtitle, accent, onHome }) {
  return (
    <div style={{
      background: "#fff", borderBottom: `1px solid ${color.line}`, padding: "12px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onHome} title="Back to home" style={{
          background: "#fff", border: `1px solid ${color.line}`, borderRadius: 8,
          width: 36, height: 36, fontSize: 16, cursor: "pointer", fontFamily: "inherit",
        }}>←</button>
        <div>
          <div style={{ fontFamily: font.sans, fontSize: 16, fontWeight: 900, color: color.ink, lineHeight: 1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 10, color: accent, fontWeight: 600, letterSpacing: 0.5, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

// ========== HOME ==========
function Home({ onTryAI, onBrowse }) {
  return (
    <div style={{ minHeight: "100vh", background: color.bg, fontFamily: font.sans, overflowY: "auto" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <BrandMark size={30} /><span style={{ fontWeight: 700, fontSize: 16, color: color.ink }}>Hack In A Box</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: color.accent, fontWeight: 700, marginBottom: 18 }}>For hack champions & first-time facilitators</div>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 52px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.04, color: color.ink, margin: "0 0 18px" }}>Run your own design sprint.</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: color.muted, maxWidth: 520, margin: "0 auto 36px" }}>
          A packaged playbook for leading a short mini-hackathon — 90 minutes to half a day — at your church or organization, even if you've never facilitated one.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onBrowse} style={pill("primary")}>Browse the playbook →</button>
          <button onClick={onTryAI} style={pill("secondary")}>Try the AI Thinking Partner</button>
        </div>
        <SectionArt src={artHeroTable} alt="A team gathered around a table covered in sticky notes during a design sprint" max={620} style={{ margin: "44px auto 0" }} />
        <p style={{ fontSize: 13, color: color.faint, marginTop: 40 }}>Auto-saves to this browser · come back anytime</p>
      </div>
    </div>
  );
}

// ========== MODE: AI THINKING PARTNER ==========
// PCM helpers for Gemini TTS playback (adapted from open-language's AudioManager).
// /api/tts returns base64 16-bit signed little-endian PCM at 24 kHz mono.
function base64ToInt16(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

function int16ToFloat32(int16) {
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
  return float32;
}

// ========== VOICE: speech recognition + synthesis hook ==========
// Speech-to-text uses the browser's SpeechRecognition. Text-to-speech prefers
// Gemini TTS via /api/tts (natural voice) and falls back to the browser's
// speechSynthesis when the endpoint is unavailable (e.g. local dev without a key).
function useVoice({ onTranscript, onSpeakEnd } = {}) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState({ recog: false, synth: false });
  const recogRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    const canPlay = typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext || window.speechSynthesis);
    setSupported({ recog: !!SR, synth: canPlay });
  }, []);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (recogRef.current) { try { recogRef.current.stop(); } catch {} }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false;
    let finalText = "";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      if (onTranscript) onTranscript({ interim, final: finalText, isFinal: !!finalText && interim === "" });
    };
    r.onend = () => {
      setListening(false);
      if (finalText && onTranscript) onTranscript({ interim: "", final: finalText, isFinal: true, ended: true });
    };
    r.onerror = () => setListening(false);
    recogRef.current = r;
    setListening(true);
    try { r.start(); } catch { setListening(false); }
  };

  const stopListening = () => {
    if (recogRef.current) { try { recogRef.current.stop(); } catch {} }
    setListening(false);
  };

  // Stops any in-flight TTS fetch and any playing audio, without firing onSpeakEnd
  // (so a deliberate stop doesn't restart hands-free listening).
  const cancelPlayback = () => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (sourceRef.current) {
      const s = sourceRef.current;
      sourceRef.current = null;
      s.onended = null;
      try { s.stop(); } catch { /* already stopped */ }
    }
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch { /* not speaking */ } }
  };

  // Browser speechSynthesis — fallback when Gemini TTS is unavailable.
  const speakWithBrowser = (clean) => {
    if (!window.speechSynthesis) { setSpeaking(false); if (onSpeakEnd) onSpeakEnd(); return; }
    try {
      const u = new SpeechSynthesisUtterance(clean);
      u.rate = 1.0;
      u.pitch = 1.0;
      u.onend = () => { setSpeaking(false); if (onSpeakEnd) onSpeakEnd(); };
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch {
      setSpeaking(false);
    }
  };

  const playPcm = async (base64, sampleRate) => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") audioCtxRef.current = new AC();
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") await ctx.resume();
    const float32 = int16ToFloat32(base64ToInt16(base64));
    const buffer = ctx.createBuffer(1, float32.length, sampleRate || 24000);
    buffer.getChannelData(0).set(float32);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    sourceRef.current = source;
    source.onended = () => {
      if (sourceRef.current === source) sourceRef.current = null;
      setSpeaking(false);
      if (onSpeakEnd) onSpeakEnd();
    };
    source.start();
  };

  const speak = async (text) => {
    cancelPlayback();
    const clean = String(text || "").replace(/[*_`#]/g, "").replace(/✦|🤖|🎯|💡|👤|❤️|📝|🧩|🧭|💬|📚/g, "");
    if (!clean.trim()) return;
    setSpeaking(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (controller.signal.aborted) return;
      abortRef.current = null;
      if (res.ok && data.audio) {
        await playPcm(data.audio, data.sampleRate);
      } else {
        speakWithBrowser(clean);
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      abortRef.current = null;
      speakWithBrowser(clean);
    }
  };

  const stopSpeaking = () => {
    cancelPlayback();
    setSpeaking(false);
  };

  return { listening, speaking, supported, startListening, stopListening, speak, stopSpeaking };
}

const PARTNER_SYSTEM = `You are a warm, curious thinking partner helping a church lay leader work through a ministry challenge using design thinking. You are NOT a hype machine — you ask sharp follow-up questions, gently push back on vague answers, and help them get specific about the people involved.

Your job in this conversation:
1. Understand who they are and what challenge they're facing (1-2 questions)
2. Get specific about WHO is affected — a real person or group with real characteristics (1-2 questions)
3. Ask what they've already tried and what they noticed (1 question)
4. Ask what they think would actually help (1 question)
5. When you have enough context (usually after 5-7 exchanges), synthesize their thinking into a brief.

Tone: friendly, curious, never preachy. Use short replies (2-4 sentences max per turn). Ask ONE question at a time. If they say something vague like "young people" or "engagement," ask them to get more specific.

When you're ready to synthesize, start your message with "✦ Here's what I'm hearing:" and provide:
- A clear "How might we..." question
- A one-paragraph persona of who they're trying to serve
- 3 specific ideas they could test
- One next step they could take this week

Do NOT synthesize too early. Make sure you have concrete details first.`;

function ThinkingPartner({ setMode }) {
  const STORAGE_KEY = "hiab-partner-v1";
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [
        { role: "assistant", content: "Hi — I'm here to help you think through a challenge your church is facing. No worksheets, no formal process. Just tell me what's on your mind.\n\nWant to talk it out in the car? Tap the mic to speak, or turn on Hands-free mode to have a real conversation.\n\nWhat's a ministry situation you've been turning over in your head lately?" },
      ];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(() => readStoredString("hiab-partner-autospeak", "off") === "on");
  const [handsFree, setHandsFree] = useState(false);
  const scrollRef = useRef(null);
  const lastSpokenRef = useRef(null);

  useEffect(() => { writeStoredString("hiab-partner-autospeak", autoSpeak ? "on" : "off"); }, [autoSpeak]);

  const sendRef = useRef(null);

  const voice = useVoice({
    onTranscript: ({ interim, final, isFinal, ended }) => {
      if (interim) setInput(interim);
      if (isFinal && final) {
        setInput(final);
        if (handsFree && ended) {
          // auto-send when user stops talking in hands-free mode
          setTimeout(() => sendRef.current && sendRef.current(final), 200);
        }
      }
    },
    onSpeakEnd: () => {
      if (handsFree && !loading) {
        // After AI finishes speaking, auto-listen for the next reply
        setTimeout(() => voice.startListening(), 400);
      }
    },
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

    const last = messages[messages.length - 1];
    if (last && last.role === "assistant" && autoSpeak && lastSpokenRef.current !== last.content) {
      lastSpokenRef.current = last.content;
      voice.speak(last.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading, autoSpeak]);

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    if (voice.listening) voice.stopListening();
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const apiMessages = next.map((m) => ({ role: m.role, content: m.content }));
    const result = await callAI({ system: PARTNER_SYSTEM, messages: apiMessages, max_tokens: 600 });
    setDemo(result.demo);
    setMessages((prev) => [...prev, { role: "assistant", content: result.text }]);
    setLoading(false);
  };
  sendRef.current = send;

  const reset = () => {
    if (!confirm("Start a new conversation? This one will be deleted.")) return;
    setMessages([{ role: "assistant", content: "Fresh start. What's a ministry challenge that's been on your mind?" }]);
    voice.stopSpeaking();
  };

  const toggleHandsFree = () => {
    if (handsFree) {
      voice.stopListening();
      voice.stopSpeaking();
      setHandsFree(false);
    } else {
      setHandsFree(true);
      setAutoSpeak(true);
      setTimeout(() => voice.startListening(), 100);
    }
  };

  const micPress = () => {
    if (voice.listening) {
      voice.stopListening();
    } else {
      voice.startListening();
    }
  };

  return (
    <div style={{ minHeight: "100vh", height: "100vh", background: color.rail, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes hiab-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.6; } }`}</style>
      <ModeTopBar title="AI Thinking Partner" subtitle="CHAT-BASED COACH" accent={color.accent} onHome={() => setMode("picker")} />

      {demo && (
        <div style={{ background: color.rail, borderBottom: `1px solid ${color.line}`, padding: "8px 20px", fontSize: 12, color: color.accent, textAlign: "center" }}>
          Running in <strong>demo mode</strong> — responses are example answers, not live AI.
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? color.accent : "#fff",
              color: m.role === "user" ? "#fff" : color.ink,
              padding: "12px 16px", borderRadius: 14,
              border: m.role === "assistant" ? `1px solid ${color.line}` : "none",
              fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}>{m.content}</div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", padding: "12px 16px", background: "#fff", borderRadius: 14, border: `1px solid ${color.line}`, color: color.muted, fontSize: 14 }}>
              Thinking<span className="hiab-dots">...</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "#fff", borderTop: `1px solid ${color.line}`, padding: "12px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Voice control row */}
          {(voice.supported.recog || voice.supported.synth) && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap", fontSize: 12, color: color.muted }}>
              {voice.supported.synth && (
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
                  Auto-speak replies
                </label>
              )}
              {voice.supported.recog && voice.supported.synth && (
                <button onClick={toggleHandsFree} style={{
                  background: handsFree ? color.accent : "#fff",
                  color: handsFree ? "#fff" : color.accent,
                  border: `1px solid ${color.accent}`, borderRadius: 20,
                  padding: "4px 12px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>{handsFree ? "Hands-free ON" : "Hands-free mode"}</button>
              )}
              {voice.speaking && (
                <button onClick={voice.stopSpeaking} style={{ background: "none", border: "none", color: color.accent, cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline", fontFamily: "inherit" }}>Stop speaking</button>
              )}
              {voice.listening && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#DC2626", fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626", animation: "hiab-pulse 1.2s infinite" }} />
                  Listening...
                </span>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {voice.supported.recog && (
              <button onClick={micPress} aria-label={voice.listening ? "Stop listening" : "Speak instead of typing"} title={voice.listening ? "Stop listening" : "Speak instead of typing"} style={{
                background: voice.listening ? "#DC2626" : "#fff",
                color: voice.listening ? "#fff" : color.accent,
                border: `1px solid ${voice.listening ? "#DC2626" : color.accent}`,
                borderRadius: 12, width: 48, height: 48, fontSize: 20,
                cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{voice.listening ? <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff", display: "block" }} /> : <Icon name="mic" size={20} color={color.accent} />}</button>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={voice.listening ? "Listening..." : "Type or tap the mic to speak (Enter to send)"}
              rows={2}
              disabled={loading}
              style={{
                flex: 1, padding: "10px 14px", fontSize: 15, borderRadius: 12,
                border: `1px solid ${color.line}`, fontFamily: "inherit", resize: "none",
                outline: "none", lineHeight: 1.5,
              }}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()} style={{
              background: loading || !input.trim() ? color.line : color.accent,
              color: "#fff", border: "none", borderRadius: 12,
              padding: "12px 20px", fontSize: 15, fontWeight: 600,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>Send</button>
          </div>
        </div>
        <div style={{ maxWidth: 720, margin: "8px auto 0", display: "flex", justifyContent: "space-between", fontSize: 12, color: color.muted }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: color.muted, cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline", fontFamily: "inherit" }}>Start over</button>
          <span>{Math.max(0, Math.floor((messages.length - 1) / 2))} exchanges</span>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activePhase, onNavigate }) {
  return (
    <nav style={{ background: color.rail, borderRight: `1px solid ${color.lineSoft}`, padding: "22px 0", minWidth: 188 }}>
      <button onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 20px", background: "none", border: "none", cursor: "pointer" }}>
        <BrandMark size={26} />
        <span style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 14, color: color.ink }}>Hack In A Box</span>
      </button>
      {PHASES.map((p) => (
        <button key={p.id} onClick={() => onNavigate(p.sections[0])} style={{
          display: "block", width: "100%", textAlign: "left", padding: "9px 20px",
          fontFamily: font.sans, fontSize: 13.5, fontWeight: activePhase === p.id ? 700 : 500,
          color: activePhase === p.id ? color.accent : color.body,
          background: "none", border: "none", cursor: "pointer",
        }}>{p.label}</button>
      ))}
    </nav>
  );
}

function StepBar({ activeSection, onNavigate }) {
  const idx = STEPS.findIndex((s) => (STEP_PAGES[s.id] || [s.id]).includes(activeSection));
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 28px", borderBottom: `1px solid ${color.lineSoft}`, background: color.surface, overflowX: "auto" }}>
      {STEPS.map((s, i) => {
        const state = i < idx ? "done" : i === idx ? "on" : "todo";
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <button onClick={() => onNavigate(s.id)} title={s.label} style={{
              display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer",
              fontFamily: font.sans, fontSize: 12, fontWeight: 700,
              color: state === "on" ? color.accent : color.faint, padding: "2px 4px",
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
                background: state === "on" ? color.accent : state === "done" ? color.ink : "transparent",
                border: state === "todo" ? `1.5px solid ${color.line}` : "none",
                color: state === "todo" ? color.faint : "#fff",
              }}>
                {state === "done" ? "✓" : s.n}
              </span>
              {state === "on" && s.label}
            </button>
            {i < STEPS.length - 1 && <span style={{ width: 18, height: 1.5, background: color.line, margin: "0 4px" }} />}
          </div>
        );
      })}
    </div>
  );
}

// Sticky Prev/Next bar so facilitators can move through the playbook without
// scrolling back up to the sidebar. Sticks to the bottom of the scroll area.
function FlowNav({ view, navigate, isMobile }) {
  const idx = FLOW.indexOf(view);
  if (idx === -1) return null;
  const prev = idx > 0 ? FLOW[idx - 1] : null;
  const next = idx < FLOW.length - 1 ? FLOW[idx + 1] : null;
  const btn = (id, dir) => (
    <button
      onClick={() => navigate(id)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: dir === "next" ? color.accent : "#fff",
        color: dir === "next" ? "#fff" : color.body,
        border: dir === "next" ? "none" : `1px solid ${color.line}`,
        borderRadius: 10, padding: isMobile ? "11px 16px" : "11px 20px",
        fontFamily: font.sans, fontSize: 14, fontWeight: 700, cursor: "pointer",
        maxWidth: "48%", boxShadow: dir === "next" ? "0 2px 12px rgba(124,58,237,0.25)" : "none",
      }}
    >
      {dir === "prev" && <Icon name="arrow" size={16} color={color.muted} style={{ transform: "rotate(180deg)" }} />}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {dir === "prev" ? "Back" : "Next"}
        <span style={{ fontWeight: 500, opacity: dir === "next" ? 0.85 : 0.7 }}>{` · ${SECTION_LABELS[id]}`}</span>
      </span>
      {dir === "next" && <Icon name="arrow" size={16} color="#fff" />}
    </button>
  );
  return (
    <div style={{
      position: "sticky", bottom: 0, marginTop: 40,
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
      padding: isMobile ? "12px 0" : "14px 0",
      background: `linear-gradient(to top, ${color.bg} 70%, ${color.bg}00)`,
    }}>
      {prev ? btn(prev, "prev") : <span />}
      {next ? btn(next, "next") : <span />}
    </div>
  );
}

// Persistent per-page feedback. A small launcher pill always sits in the bottom-right
// corner; it auto-opens once per page, and after dismiss/submit it collapses back to the
// pill (never fully disappears) so testers can always reopen it. Posts to /api/feedback.
const FEEDBACK_DONE_KEY = "hiab-feedback-done";
const FEEDBACK_SNOOZE_KEY = "hiab-feedback-snooze";
const FEEDBACK_NAME_KEY = "hiab-feedback-name";

function FeedbackWidget({ section, isMobile }) {
  const [done, setDone] = useState(() => new Set(readStoredString(FEEDBACK_DONE_KEY, "").split(",").filter(Boolean)));
  const answered = done.has(section);
  const [snoozed, setSnoozed] = useState(() => readStoredString(FEEDBACK_SNOOZE_KEY, "no") === "yes");
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState(null);
  const [wouldUse, setWouldUse] = useState(null);
  const [comment, setComment] = useState("");
  // Remembered across pages so a tester types their name once, not per page.
  const [name, setName] = useState(() => readStoredString(FEEDBACK_NAME_KEY, ""));
  const [status, setStatus] = useState("idle"); // idle | sending | done | error

  // Auto-open at most once per visit: only if the user hasn't snoozed it and hasn't
  // already answered this page. Mounted fresh per section via key={view}, so a snooze
  // set on an earlier page is read here on mount and prevents it re-popping everywhere.
  useEffect(() => {
    if (!section || section === "home" || section === "partner" || answered || snoozed) return;
    const t = setTimeout(() => setExpanded(true), 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistent dismiss — once minimized, it won't auto-pop on later pages.
  const snooze = () => { setSnoozed(true); writeStoredString(FEEDBACK_SNOOZE_KEY, "yes"); };
  const minimize = () => { setExpanded(false); snooze(); };

  const markDone = () => {
    const next = new Set(done); next.add(section);
    setDone(next);
    writeStoredString(FEEDBACK_DONE_KEY, [...next].join(","));
  };

  const submit = async () => {
    if (helpful === null && wouldUse === null && !comment.trim()) return;
    setStatus("sending");
    writeStoredString(FEEDBACK_NAME_KEY, name.trim());
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          page: SECTION_LABELS[section] || section,
          name: name.trim(),
          helpful,
          wouldUse,
          comment: comment.trim(),
        }),
      });
      setStatus("done");
      markDone();
      snooze();
      setTimeout(() => setExpanded(false), 2200);
    } catch {
      setStatus("error");
    }
  };

  if (!section || section === "home") return null;

  const label = SECTION_LABELS[section] || "this page";
  // Sit above the sticky Prev/Next bar (and the partner chat input) so the pill and
  // card never cover the Next button in the bottom-right.
  const corner = { right: isMobile ? 12 : 24, bottom: isMobile ? 80 : 92 };

  // Collapsed launcher pill — always available, and shows which page it's for so it's
  // clear the feedback is page-specific (and which pages you've already answered).
  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} aria-label={`Give feedback on the ${label} page`} style={{
        position: "fixed", zIndex: 60, ...corner,
        display: "flex", alignItems: "center", gap: 7, maxWidth: isMobile ? "72vw" : 280,
        background: answered ? "#fff" : color.accent,
        color: answered ? color.muted : "#fff",
        border: answered ? `1px solid ${color.line}` : "none",
        borderRadius: 999, padding: isMobile ? "9px 13px" : "10px 16px",
        fontFamily: font.sans, fontSize: 13, fontWeight: 700, cursor: "pointer",
        boxShadow: answered ? "0 4px 14px rgba(15,23,42,0.12)" : "0 6px 20px rgba(124,58,237,0.35)",
      }}>
        <Icon name={answered ? "check" : "chat"} size={16} color={answered ? color.accent : "#fff"} />
        <span style={{ flexShrink: 0 }}>{answered ? "Sent" : "Feedback"}</span>
        <span style={{
          fontWeight: 600, fontSize: 12, padding: "2px 8px", borderRadius: 999,
          background: answered ? color.rail : "rgba(255,255,255,0.2)",
          color: answered ? color.muted : "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0,
        }}>{label}</span>
      </button>
    );
  }

  const yesNo = (value, setValue) => (
    <div style={{ display: "flex", gap: 8 }}>
      {[["Yes", true], ["No", false]].map(([txt, val]) => (
        <button key={txt} onClick={() => setValue(value === val ? null : val)} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer",
          fontFamily: font.sans, fontSize: 13, fontWeight: 700,
          border: value === val ? `1.5px solid ${color.accent}` : `1px solid ${color.line}`,
          background: value === val ? `${color.accent}12` : "#fff",
          color: value === val ? color.accent : color.body,
        }}>{txt}</button>
      ))}
    </div>
  );

  return (
    <div style={{
      position: "fixed", zIndex: 60, ...corner,
      left: isMobile ? 12 : "auto",
      width: isMobile ? "auto" : 320,
      background: "#fff", borderRadius: 16, border: `1px solid ${color.line}`,
      boxShadow: "0 12px 40px rgba(15,23,42,0.18)", padding: 18,
      fontFamily: font.sans,
    }}>
      <button onClick={minimize} aria-label="Dismiss feedback" style={{
        position: "absolute", top: 10, right: 10, background: "none", border: "none",
        cursor: "pointer", color: color.muted, padding: 4,
      }}><Icon name="x" size={16} color={color.muted} /></button>

      {status === "done" ? (
        <div style={{ padding: "8px 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Icon name="check" size={18} color={color.accent} />
            <strong style={{ fontSize: 15, color: color.ink }}>Thank you!</strong>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: color.muted, lineHeight: 1.5 }}>Your feedback helps us shape this prototype.</p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: color.accent, marginBottom: 4 }}>Quick feedback · prototype</div>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: color.muted, lineHeight: 1.5 }}>
            On the <strong style={{ color: color.body }}>{SECTION_LABELS[section] || "this"}</strong> page —
          </p>

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: color.ink, marginBottom: 6 }}>Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="So we know who this is from"
            style={{
              width: "100%", padding: "9px 11px", borderRadius: 8, marginBottom: 14,
              border: `1px solid ${color.line}`, fontFamily: font.sans, fontSize: 13,
              outline: "none", boxSizing: "border-box", color: color.ink,
            }}
          />

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: color.ink, marginBottom: 6 }}>Is this helpful?</label>
          {yesNo(helpful, setHelpful)}

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: color.ink, margin: "14px 0 6px" }}>Would you use this tool?</label>
          {yesNo(wouldUse, setWouldUse)}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Anything you'd change? (optional)"
            rows={2}
            style={{
              width: "100%", marginTop: 14, padding: "9px 11px", borderRadius: 8,
              border: `1px solid ${color.line}`, fontFamily: font.sans, fontSize: 13,
              resize: "vertical", outline: "none", boxSizing: "border-box", color: color.ink,
            }}
          />

          {status === "error" && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#dc2626" }}>Couldn't send — please try again.</p>}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={minimize} style={{
              padding: "9px 14px", borderRadius: 8, border: `1px solid ${color.line}`, background: "#fff",
              color: color.muted, fontFamily: font.sans, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Not now</button>
            <button onClick={submit} disabled={status === "sending" || (helpful === null && wouldUse === null && !comment.trim())} style={{
              flex: 1, padding: "9px 14px", borderRadius: 8, border: "none",
              background: (helpful === null && wouldUse === null && !comment.trim()) ? `${color.accent}55` : color.accent,
              color: "#fff", fontFamily: font.sans, fontSize: 13, fontWeight: 700,
              cursor: status === "sending" ? "default" : "pointer",
            }}>{status === "sending" ? "Sending…" : "Send feedback"}</button>
          </div>
        </>
      )}
    </div>
  );
}

// One-time welcome modal shown the first time someone enters the playbook. Explains
// that this is a prototype under test and points to the per-page feedback corner.
const INTRO_SEEN_KEY = "hiab-intro-seen";

function IntroModal({ onClose, isMobile }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 80, background: `${color.ink}66`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 18, maxWidth: 440, width: "100%",
        padding: isMobile ? "26px 22px" : "32px 30px", fontFamily: font.sans,
        boxShadow: "0 24px 60px rgba(15,23,42,0.3)", position: "relative",
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 14, right: 14, background: "none", border: "none",
          cursor: "pointer", color: color.muted, padding: 4,
        }}><Icon name="x" size={18} color={color.muted} /></button>

        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color.accent}14`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Icon name="sparkle" size={24} color={color.accent} />
        </div>

        <h2 style={{ fontFamily: font.sans, fontSize: 22, margin: "0 0 10px", color: color.ink }}>You're testing an early prototype</h2>
        <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.65, color: color.body }}>
          Thanks for trying Hack In A Box! This is a work-in-progress and your feedback genuinely shapes where it goes next.
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: `${color.accent}08`, border: `1px solid ${color.accent}20`, borderRadius: 12, padding: "14px 16px", marginBottom: 22 }}>
          <div style={{ flexShrink: 0, marginTop: 1 }}><Icon name="chat" size={18} color={color.accent} /></div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: color.body }}>
            As you explore, look for the <strong style={{ color: color.accent }}>Feedback</strong> button in the <strong>bottom-right corner</strong> of every page. Each one is specific to the page you're on — tell us what's helpful and what isn't. It only takes a few seconds.
          </p>
        </div>

        <button onClick={onClose} style={{
          width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
          background: color.accent, color: "#fff", fontFamily: font.sans, fontSize: 15, fontWeight: 700,
          cursor: "pointer", boxShadow: `0 4px 16px ${color.accent}4D`,
        }}>Got it — let's go</button>
      </div>
    </div>
  );
}

export default function HackInABox() {
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);

  const [view, setView] = useState(() => readStoredString("hiab-view", "home")); // "home" | "partner" | <sectionId>
  useEffect(() => { writeStoredString("hiab-view", view); }, [view]);
  const [navOpen, setNavOpen] = useState(false);
  const [introSeen, setIntroSeen] = useState(() => readStoredString(INTRO_SEEN_KEY, "no") === "yes");
  const dismissIntro = () => { setIntroSeen(true); writeStoredString(INTRO_SEEN_KEY, "yes"); };
  const navigate = (id) => {
    setView(id);
    setNavOpen(false);
    if (typeof window !== "undefined" && window.history.state?.hiabView !== id) {
      window.history.pushState({ hiabView: id }, "");
    }
  };

  // Reset scroll to the top whenever the page changes, after the new content
  // has rendered (doing it inside navigate runs against the old/unmounted DOM).
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [view]);

  // Make the browser / Android hardware back button move between views.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState({ hiabView: view }, "");
    const onPop = (e) => {
      const next = e.state?.hiabView ?? "home";
      setView(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);


  if (view === "home") return <Home onTryAI={() => navigate("partner")} onBrowse={() => navigate("overview")} />;


  const activePhase = phaseOf(view);
  const inRun = activePhase === "run";


  const renderContent = (active) => {
    switch (active) {
      case "ai": {
        const ai = phaseColors.ai;
        const prompts = [
          {
            title: "Empathy gathering",
            subtitle: "Turn an interview or testimony into an empathy map",
            body: "Paste a transcript of a conversation with the people you serve, then ask AI to sort it into the four quadrants. It surfaces patterns you might miss.",
            prompt: "Here is a transcript of an interview with someone in our community. Sort what you hear into an empathy map with four columns — SAYS, THINKS, DOES, FEELS. Use direct quotes where you can, and flag any tensions between what they say and what they seem to feel.\n\n[paste transcript]",
          },
          {
            title: "Sharper problem statements",
            subtitle: "Go from a vague pain to a focused How Might We",
            body: "Give AI your raw observations and have it draft several How Might We statements at different scopes, so you can pick the one that's hackable in a few hours.",
            prompt: "Based on these observations about our community, draft 5 \"How Might We…\" problem statements. Make them specific and human-centered, not solution-disguised. Range from narrow to broad so we can choose the right scope for a 3-hour sprint.\n\n[paste observations]",
          },
          {
            title: "More ideas, faster",
            subtitle: "Push past the obvious during ideation",
            body: "After your team's first round of Crazy 8s, ask AI to stretch the thinking with angles you haven't tried — then bring the best back to the group.",
            prompt: "We're solving this problem: [problem statement]. We already have these ideas: [list]. Give us 10 more ideas from angles we haven't tried — including a few unconventional ones. Keep each to one sentence.",
          },
          {
            title: "Draft the pitch",
            subtitle: "Shape a prototype and leadership one-pager",
            body: "Hand AI your winning idea and have it draft a clear pitch and a one-page proposal you can hand to your pastor or leadership.",
            prompt: "Turn this idea into (1) a 60-second pitch and (2) a one-page proposal for church leadership with: the problem, who it serves, the proposed solution, what we'd build first, and what we need to start.\n\nIdea: [describe]",
          },
        ];
        return (
          <div>
            <PhaseHeader icon="sparkle" title="AI in Your Sprint" subtitle="Using AI to prep faster and run a better Hack In A Box" accent={ai.accent} />
            <SectionArt src={artAiWhy} alt="A spark of ideas radiating from a simple chat window" max={560} />
            <Lead>
              You don't need to be technical to put AI to work in a sprint. Used well, it's a tireless thinking partner — it helps you prepare faster, hear your community more clearly, and turn rough ideas into plans you can act on. Think of it as a tool that <strong>amplifies</strong> your team's discernment, never replaces it.
            </Lead>

            <SectionHeading>Why use AI in a Hack In A Box?</SectionHeading>
            <FeatureBox accent={ai.accent} items={[
              { title: "Prep in a fraction of the time", desc: "Draft agendas, prompts, and participant invites in minutes so you can focus on the people in the room." },
              { title: "Hear your community more clearly", desc: "Synthesize interviews and survey notes into themes and empathy maps — without losing the human details." },
              { title: "Get unstuck during ideation", desc: "When the room goes quiet, AI can offer fresh angles to react to and build on." },
              { title: "Lower the barrier to building", desc: "Teams can prototype something tangible — a flyer, a page, a script — within the workshop itself." },
            ]} />

            <CtaBanner icon="chat" title="Try it now — the AI Thinking Partner"
              desc="A conversational coach built into this kit. It interviews you about your challenge and organizes your thinking into a ready-to-use brief."
              onClick={() => navigate("partner")} />

            <SectionHeading>Tools you can use</SectionHeading>
            <IllustrationBanner src={artAiTools} />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 16 }}>
              Any general AI assistant works. Most have a free tier that's plenty for a sprint — start with one you already have access to.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 32 }}>
              {[
                { name: "ChatGPT", note: "Great all-rounder for drafting, summarizing, and brainstorming." },
                { name: "Claude", note: "Strong at working through long transcripts and nuanced writing." },
                { name: "Gemini", note: "Built into Google Workspace — handy for Docs, Gmail, and notes." },
              ].map((t) => (
                <div key={t.name} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: `1px solid ${ai.accent}18`, boxShadow: `0 2px 12px ${ai.accent}0a` }}>
                  <div style={{ fontFamily: font.sans, fontSize: 16, fontWeight: 700, color: color.ink, marginBottom: 6 }}>{t.name}</div>
                  <p style={{ margin: 0, fontSize: 13.5, color: color.muted, lineHeight: 1.55 }}>{t.note}</p>
                </div>
              ))}
            </div>

            <SectionHeading>How to use AI at each step</SectionHeading>
            <IllustrationBanner src={artAiEachStep} />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 16 }}>
              Copy a prompt below, swap in your own details, and paste it into your AI tool. Always read the output with your team and keep what rings true.
            </p>
            {prompts.map((p) => (
              <Accordion key={p.title} title={p.title} subtitle={p.subtitle} accent={ai.accent}>
                <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.7, color: color.body }}>{p.body}</p>
                <div style={{ background: color.ink, color: color.accent, borderRadius: 10, padding: "14px 16px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {p.prompt}
                </div>
                <div style={{ fontSize: 12, color: ai.accent, marginTop: 8, fontWeight: 600 }}>↑ Copy, edit the [brackets], and paste into your AI tool</div>
              </Accordion>
            ))}

            <div style={{ marginTop: 24, padding: "18px 22px", borderRadius: 12, background: color.rail, border: `1px dashed ${color.line}` }}>
              <div style={{ marginBottom: 6 }}>
                <strong style={{ fontSize: 14, color: color.accent }}>Keep it human (and prayerful)</strong>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: color.body }}>
                AI is fast, but it doesn't know your people or the Spirit's leading. Use it to get to a first draft quickly — then slow down, pray, and let your team shape the final direction. Don't paste anyone's private or sensitive details into a public AI tool.
              </p>
            </div>
          </div>
        );
      }

      case "overview":
        return (
          <div>
            <PhaseHeader icon="book" title="What is HIAB?" subtitle="Understanding Design Thinking Brainstorm Sprints for faith-based organizations" accent={color.accent} />
            <SectionArt src={artHeroBox} alt="An open box with a lightbulb and tools lifting out, like a sprint kit being unpacked" />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>
              A <strong>Hack In A Box (HIAB)</strong> is a Design Thinking Brainstorm Sprint created by <strong>Indigitous US</strong>, specifically tailored for churches and faith-based organizations. Think of it as a focused retreat where your church's leaders and members come together to pray, brainstorm, and collaborate on solutions to real challenges your ministry faces.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>
              This isn't about technology or complicated tools. It's about guiding your team through creative discussions and hands-on activities to produce clear, actionable plans that work for your unique church family.
            </p>
            <SectionHeading>Where should you start?</SectionHeading>
            <PathList onNavigate={navigate} items={[
              { id: "foundation", title: "I'm new to all of this", desc: "Keep reading in order — Heart of Innovation explains why creativity belongs in ministry, then Prepare walks you through planning your first sprint." },
              { id: "prepare", title: "I'm planning a sprint", desc: "Jump to Prepare: leadership buy-in, recruiting, materials, and printable agendas — including a guide for first-time facilitators." },
              { id: "empathy", title: "My sprint is happening soon", desc: "Go straight to Run the Sprint for step-by-step facilitation of each phase, from empathy maps to the final pitch." },
            ]} />
            <SectionHeading>What Makes HIAB Different?</SectionHeading>
            <SectionArt src={artOverviewDifferent} alt="" max={560} />
            <FeatureBox items={[
              { title: "Faith at the Center", desc: "Every idea explored is rooted in your church's mission and values. We begin and end with prayer." },
              { title: "Custom for Your Church", desc: "Every sprint is designed to reflect your congregation's unique strengths, challenges, and context." },
              { title: "Immediate Impact", desc: "You'll leave with clear, God-inspired plans that you can start implementing right away." },
              { title: "Ongoing Support", desc: "The playbook gives you everything to run sprints repeatedly, building an innovation culture." },
            ]} />
            <SectionHeading>The Design Thinking Process</SectionHeading>
            <SectionArt src={artOverviewProcess} alt="Five stepping stones — empathize, define, ideate, prototype, test — with the middle one highlighted" max={560} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {[
                { phase: "Empathize", desc: "Understand the people and communities you're trying to serve", color: color.accent },
                { phase: "Define", desc: "Clearly articulate the problem you're solving", color: color.accent },
                { phase: "Ideate", desc: "Brainstorm many creative solutions without judgment", color: color.accent },
                { phase: "Prototype", desc: "Build a simple, tangible version of your best idea", color: color.accent },
                { phase: "Test", desc: "Share your prototype, get feedback, and refine", color: color.accent },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: `${p.color}08`, borderRadius: 12, border: `1px solid ${p.color}15` }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${p.color}18`, color: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.sans, fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{i + 1}</div>
                  <div><strong style={{ color: p.color, fontSize: 15 }}>{p.phase}:</strong> <span style={{ color: color.body, fontSize: 15 }}>{p.desc}</span></div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: color.muted, marginTop: -12, marginBottom: 28 }}>
              In this playbook, testing happens as part of Prototyping (see "Getting Feedback"), and the final step is <strong>pitching</strong> your idea to leadership so it lives on after the sprint.
            </p>
          </div>
        );

      case "foundation":
        return (
          <div>
            <PhaseHeader icon="heart" title="Heart of Innovation" subtitle="Why creativity matters in ministry — and the values that guide our approach" accent={phaseColors.foundation.accent} />
            <SectionArt src={artCommunity} alt="Houses and people connected in a community network" />

            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>
              Before we dive into tools and techniques, it's worth pausing to reflect on <em>why</em> we do this. Innovation in the church isn't about chasing trends or copying Silicon Valley. It's rooted in something much deeper — the belief that the God who created the universe invites us to be creative partners in His work.
            </p>

            <FacilitatorNote title="Facilitator Note: How to Present This Section">
              <p>This section works well as an opening devotional or reflection before the sprint begins. You can read the key passages aloud, discuss the reflection questions as a group, or simply share the core ideas in your own words. The goal is to set a tone of humility, curiosity, and faith-driven creativity before the practical work begins.</p>
              <p>If you're short on time, focus on the "Created to Create" section and one reflection question.</p>
            </FacilitatorNote>

            <Accordion spot={artFoundationCreated} title="Created to Create" defaultOpen accent={phaseColors.foundation.accent}>
              <p>The very first thing we learn about God in Scripture is that He creates. He speaks light into darkness, shapes life from dust, and calls it good. And then — remarkably — He invites humanity to join in that creative work. We're given the task of naming, cultivating, building, and caring for the world around us.</p>
              <p>When your church runs a HIAB sprint, you're participating in that same creative tradition. You're looking at the world God loves, seeing what's broken or missing, and asking: "What could we build to make this better?" That's not just problem-solving. That's worship.</p>
              <FacilitatorNote>
                <p><strong>Reflection question for the group:</strong> "When was the last time you saw someone in our church do something creative to serve others? What made it special?"</p>
              </FacilitatorNote>
            </Accordion>

            <Accordion spot={artFoundationHumility} title="Innovation Starts with Humility" accent={phaseColors.foundation.accent}>
              <p>Real innovation requires admitting we don't have all the answers. It means listening before speaking, asking questions before proposing solutions, and being willing to be wrong. In church culture, where we often feel pressure to have everything figured out, this can be uncomfortable.</p>
              <p>But humility is actually our greatest strength. When we approach a challenge with open hands instead of clenched fists, we make room for the Spirit to move, for unexpected voices to be heard, and for ideas we never would have imagined on our own.</p>
              <p>That's why the HIAB process begins with empathy — with genuinely trying to understand someone else's experience before rushing to fix it.</p>
              <FacilitatorNote>
                <p><strong>Discussion prompt:</strong> "What's one assumption about our church or community that we might need to let go of to see things fresh?"</p>
              </FacilitatorNote>
            </Accordion>

            <Accordion spot={artFoundationExperiment} title="Permission to Experiment" accent={phaseColors.foundation.accent}>
              <p>Many churches have an unspoken rule: if you try something and it fails, that's a mark against you. This fear of failure kills creativity before it starts. HIAB works because it creates a safe space where wild ideas are welcome, where "bad" ideas are celebrated as stepping stones, and where experimentation is treated as faithfulness — not recklessness.</p>
              <p>Think about it this way: every ministry your church runs today was once somebody's untested idea. Someone took a risk. HIAB gives your congregation permission to take that same kind of risk — but with structure, support, and prayer behind it.</p>
              <FacilitatorNote>
                <p><strong>Activity idea:</strong> Ask each person to share one idea they've had for the church that they never said out loud because they thought it was "too crazy." Write them all on sticky notes. You'll be amazed at what comes out.</p>
              </FacilitatorNote>
            </Accordion>

            <Accordion spot={artFoundationValues} title="Our Guiding Values" accent={phaseColors.foundation.accent}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {[
                  { value: "People First", desc: "Every idea must serve real people with real needs. We never innovate for innovation's sake." },
                  { value: "Rooted in Prayer", desc: "We invite God into the process from start to finish. The best ideas come from listening — to people and to the Spirit." },
                  { value: "Radical Hospitality", desc: "Every voice matters. We make space for the quiet, the young, the new, and the skeptical." },
                  { value: "Courage Over Comfort", desc: "We'd rather try something imperfect than stay stuck in something that isn't working." },
                  { value: "Faithful Stewardship", desc: "We respect the resources, traditions, and trust our church has built — and we build on them wisely." },
                  { value: "Joy in the Process", desc: "Collaboration should be energizing and fun. If we're not enjoying this, we're doing it wrong." },
                ].map((item) => (
                  <div key={item.value} style={{
                    padding: "16px", borderRadius: 12, background: `${phaseColors.foundation.accent}06`,
                    border: `1px solid ${phaseColors.foundation.accent}12`,
                  }}>
                    <strong style={{ fontSize: 14, color: color.ink, display: "block", marginBottom: 4 }}>{item.value}</strong>
                    <p style={{ margin: 0, fontSize: 13, color: color.muted, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Accordion>

            <FacilitatorNote title="Facilitator Note: Presentation Mode">
              <p>If you want to present this content to your group, walk through each section at a comfortable pace. Pause after each reflection question and give people 2–3 minutes to discuss at their tables. End with the guiding values and ask: "Which of these values resonates most with you? Which one do you think our church needs most right now?"</p>
              <p>Total facilitation time: approximately 20–30 minutes including discussion.</p>
            </FacilitatorNote>
          </div>
        );

      case "prepare":
        return (
          <div>
            <PhaseHeader icon="clipboard" title="Prepare Your Sprint" subtitle="Everything you need to plan and organize a successful HIAB event" accent={phaseColors.prepare.accent} />
            <SectionArt src={artStopwatch} alt="A stopwatch marking a short timeboxed sprint" />

            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>
              Preparation is four steps, and the next four pages walk you through them in order. If you've never facilitated a sprint before, open the first-time facilitator guide right below before diving in.
            </p>

            <FacilitatorNote title="First-Time Facilitator? Start Here">
              <p>If you've never facilitated a sprint before, here's what to know:</p>
              <p><strong>Your job is to guide, not contribute.</strong> You keep time, transition between activities, and make sure every voice is heard. You don't need to be an expert on the topic — the participants are the experts.</p>
              <p><strong>Energy management matters most.</strong> If the room feels flat, call a break, play music, or do a quick energizer. If one person is dominating, gently redirect: "Let's hear from someone who hasn't shared yet."</p>
              <p><strong>Trust the process.</strong> It will feel messy in the middle. That's normal. The best ideas often emerge in the last 30 minutes when things start clicking.</p>
              <p><strong>Take photos of everything.</strong> Sticky notes fall off walls. Whiteboards get erased. Your phone camera is your best friend.</p>
              <p><strong>Celebrate generously.</strong> Clap for presentations, thank people for sharing, affirm wild ideas. A positive atmosphere unlocks creativity.</p>
              <p>If this is your first HIAB, start with the <strong>Quick Sprint (90 minutes)</strong> or <strong>Express Sprint (2 hours)</strong>. You can always run a longer format next time.</p>
            </FacilitatorNote>

            <PathList accent={phaseColors.prepare.accent} onNavigate={navigate} items={[
              { id: "prepare-buyin", title: "Leadership Buy-In", desc: "Lay a spiritual foundation and bring your pastor or leadership on board." },
              { id: "prepare-recruit", title: "Recruit & Plan", desc: "Get the right people in the room and map your countdown to sprint day." },
              { id: "prepare-team", title: "Team & Materials", desc: "Assign roles and gather the supplies you'll need." },
              { id: "prepare-agendas", title: "Sprint Formats", desc: "Pick a ready-to-print agenda (90 minutes to half a day) — and decide whether you're starting from a specific challenge or from empathy work." },
            ]} />
          </div>
        );

      case "prepare-buyin":
        return (
          <div>
            <PhaseHeader icon="heart" title="Get Leadership Buy-In" subtitle="Lay a spiritual foundation and bring your pastor or leadership on board" accent={phaseColors.prepare.accent} />
            <SectionArt src={artPreparePrayer} alt="Open hands lifted in prayer beneath a warm glow" max={560} />
            <Lead>
              Leadership support is the most important first step. Lay a spiritual foundation through prayer, then bring your pastor or leadership on board with a clear, small ask.
            </Lead>

            <Accordion title="Prayer & Spiritual Preparation" defaultOpen accent={phaseColors.prepare.accent}>
              <p>Before any logistics, lay a spiritual foundation. Invite your leadership team and participants into a season of intentional prayer.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {["Pray for God to reveal the right challenge to focus on", "Ask for open hearts and minds among participants", "Pray for creative, Spirit-led ideas to come forward", "Commission the event during a Sunday service to build support"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}><Icon name="check" size={16} color={phaseColors.prepare.accent} /><span style={{ fontSize: 15 }}>{item}</span></div>
                ))}
              </div>            </Accordion>

            <Accordion title="How to Pitch HIAB to Your Pastor or Leadership" accent={phaseColors.prepare.accent}>
              <p>Getting leadership support is the most important first step. Here's a practical approach:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Start with the Why" accent={phaseColors.prepare.accent}
                  description="Don't lead with 'we want to do a hackathon.' Instead, share a specific challenge your church faces and explain that HIAB is a structured way to gather fresh ideas from the congregation. Frame it as a half-day retreat focused on prayer and creative problem-solving." />
                <StepCard number={2} title="Show, Don't Tell" accent={phaseColors.prepare.accent}
                  description="Share a one-page overview of what HIAB looks like (see the 'What is HIAB?' section). If possible, share a story or video from another church that ran one. Concrete examples are more persuasive than abstract descriptions." />
                <StepCard number={3} title="Make a Small Ask" accent={phaseColors.prepare.accent}
                  description="Don't ask for a huge commitment. Ask for permission to run one sprint on one topic with a small group. 'Can we try this with 20 people on a Saturday morning?' is much easier to say yes to than 'Can we overhaul our innovation process?'" />
                <StepCard number={4} title="Address Concerns Upfront" accent={phaseColors.prepare.accent}
                  description="Pastors may worry about: time commitment (it's a single 2–3 hour session for most groups, not weeks), cost (minimal — paper, markers, snacks), or that ideas might bypass leadership (reassure them that ideas go through proper channels). Be ready with honest answers." />
                <StepCard number={5} title="Invite Them to Participate" accent={phaseColors.prepare.accent}
                  description="The best way to get buy-in is to have leadership in the room. Invite your pastor to open with prayer and stay for the first exercise. Once they see the energy and quality of ideas, they'll be your biggest champion." />
              </div>
              <FacilitatorNote>
                <p>If you're having trouble getting a meeting with leadership, try writing a brief email using the SCIPAB framework — a simple six-part outline for communicating a problem and proposal persuasively. You'll find an AI-guided SCIPAB builder at the bottom of the <strong>Define</strong> page.</p>
              </FacilitatorNote>
            </Accordion>
          </div>
        );

      case "prepare-recruit":
        return (
          <div>
            <PhaseHeader icon="users" title="Recruit & Plan" subtitle="Get the right people in the room and map your countdown to sprint day" accent={phaseColors.prepare.accent} />
            <SectionArt src={artPrepareRecruit} alt="A group of people gathering around an invitation" max={560} />
            <Lead>
              The right mix of people makes the sprint. Recruit a diverse group, then work backward from sprint day with a week-by-week plan.
            </Lead>

            <Accordion title="How to Market and Recruit Participants" accent={phaseColors.prepare.accent}>
              <p>Getting the right people in the room matters. Here's how to spread the word effectively:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { title: "Frame It as an Experience, Not a Meeting", desc: "Use language like 'creative workshop,' 'innovation retreat,' or 'brainstorm day' rather than technical terms. People are more likely to show up for something that sounds fun and different." },
                  { title: "Recruit for Diversity", desc: "Actively invite people from different age groups, backgrounds, tenure at the church, and ministry areas. The best ideas come from unexpected combinations of perspectives." },
                  { title: "Use Multiple Channels", desc: "Announce from the pulpit, put it in the bulletin/email, post on social media, and — most importantly — have people personally invite others. Personal invitations are 3x more effective than announcements." },
                  { title: "Highlight What They'll Get", desc: "People want to know: 'What's in it for me?' Emphasize that they'll be heard, that their ideas matter, and that they'll leave with concrete plans — not just talk." },
                  { title: "Set Clear Expectations", desc: "Share the exact time commitment (start and end time), what to bring (just themselves!), and that food will be provided. Remove every possible barrier to showing up." },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "14px 18px", borderRadius: 10, background: "#fff", border: `1px solid ${color.line}` }}>
                    <strong style={{ fontSize: 15, color: color.ink }}>{item.title}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: color.muted, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>            </Accordion>

            <Accordion spot={artPrepareTimeline} title="Week-by-Week Planning Timeline" accent={phaseColors.prepare.accent}>
              <p>Use this countdown to stay on track. Adjust dates based on when your sprint is scheduled.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { week: "6 weeks out", tasks: ["Get leadership approval", "Set the date and book a space", "Identify your lead facilitator and table coaches"] },
                  { week: "4 weeks out", tasks: ["Start recruiting participants (aim for 15–30)", "Decide on a theme or challenge area", "Begin prayer season with your planning team"] },
                  { week: "2 weeks out", tasks: ["Send reminder invitations with logistics", "Finalize materials list and purchase supplies", "Prep printed templates and handouts", "Confirm food/snack arrangements"] },
                  { week: "1 week out", tasks: ["Do a dry run of the agenda with your facilitator team", "Set up any digital tools (Miro, shared docs)", "Send final reminder with parking/room details", "Pray together as a planning team"] },
                  { week: "Day before", tasks: ["Set up the room — tables, chairs, supplies at each station", "Test projector/screen and speakers", "Print any final materials", "Get a good night's sleep!"] },
                  { week: "Day of", tasks: ["Arrive 1 hour early for final setup", "Put on worship music as people arrive", "Set out name tags and snacks", "Breathe, pray, and trust the process"] },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 14, padding: "14px 18px", borderRadius: 10,
                    background: i % 2 === 0 ? `${phaseColors.prepare.accent}05` : "transparent",
                    border: `1px solid ${i % 2 === 0 ? phaseColors.prepare.accent + "10" : "transparent"}`,
                  }}>
                    <div style={{ fontFamily: font.sans, fontSize: 13, fontWeight: 700, color: phaseColors.prepare.accent, minWidth: 90, paddingTop: 2 }}>{item.week}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {item.tasks.map((task, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 14, color: color.body }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: phaseColors.prepare.accent, marginTop: 7, flexShrink: 0 }} />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        );

      case "prepare-team":
        return (
          <div>
            <PhaseHeader icon="clipboard" title="Team & Materials" subtitle="Assemble your facilitator team, gather supplies, and adapt for multi-church sprints" accent={phaseColors.prepare.accent} />
            <SectionArt src={artPrepareTeam} alt="A facilitation team gathered around shared supplies" max={560} />
            <Lead>
              A small facilitation team and a box of simple supplies are all you need. Assign the key roles, run the checklist, and adapt the format if multiple churches are collaborating.
            </Lead>

            <Accordion spot={artPrepareMultiChurch} title="Adapting for Multi-Church or Multi-Org Collaboration" accent={phaseColors.prepare.accent}>
              <p>HIAB is especially powerful when multiple churches or organizations come together around a shared challenge — like serving a neighborhood, reaching a people group, or tackling a community issue. Here's how to adapt:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { title: "Choose a Shared Challenge", desc: "Find a problem that affects all participating groups — homelessness in your area, reaching college students, supporting refugees. The challenge should be big enough that no single church can solve it alone." },
                  { title: "Mix the Tables", desc: "Don't let people sit with their own church. Deliberately mix tables so each group has representatives from multiple organizations. This is where the magic happens." },
                  { title: "Set Ground Rules for Collaboration", desc: "Agree upfront that ideas belong to everyone, that no single church 'owns' the outcomes, and that follow-up will be collaborative. Address politics and turf early." },
                  { title: "Appoint a Neutral Facilitator", desc: "If possible, have someone who isn't from any of the participating churches lead the sprint. This prevents any perception of favoritism." },
                  { title: "Plan for Follow-Through Together", desc: "The biggest risk in multi-org work is nobody taking ownership afterward. Before the sprint ends, agree on who will coordinate next steps and set a follow-up meeting." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Icon name="check" size={16} color={phaseColors.prepare.accent} />
                    <div><strong style={{ fontSize: 14, color: color.ink }}>{item.title}:</strong> <span style={{ fontSize: 14, color: color.muted }}>{item.desc}</span></div>
                  </div>
                ))}
              </div>
              <FacilitatorNote>
                <p>Multi-org sprints work best as full-day events (6+ hours) because you need extra time for introductions, trust-building, and coordinating follow-up. Consider stretching the Full Sprint agenda (see Sprint Formats, under Prepare) into a full-day event.</p>
              </FacilitatorNote>
            </Accordion>

            <Accordion title="Team Assembly" accent={phaseColors.prepare.accent}>
              <p><strong>Ideal group size:</strong> 15–30 people, broken into tables of 4–6.</p>
              <p>Aim for diversity — different ages, roles, backgrounds, and time at your church. Consider inviting people who don't normally attend planning meetings.</p>
              <p><strong>Key roles:</strong> Lead Facilitator, Table Coaches (one per table), Timekeeper, and Notetaker/Photographer.</p>
            </Accordion>

            <Accordion spot={artPrepareMaterials} title="Materials Checklist" accent={phaseColors.prepare.accent}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div>
                  <strong style={{ color: phaseColors.prepare.accent, fontSize: 14 }}>Must-Haves</strong>
                  {["Large poster paper or butcher paper", "Sticky notes (multiple colors)", "Markers and pens", "Dot stickers for voting", "Timer (phone works)", "Printed templates"].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 14 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: color.muted, flexShrink: 0 }} /> {item}</div>
                  ))}
                </div>
                <div>
                  <strong style={{ color: phaseColors.prepare.accent, fontSize: 14 }}>Nice-to-Haves</strong>
                  {["Laptops/tablets for digital whiteboard", "Projector/screen", "Zoom setup for remote guests", "Shared Google Doc for notes", "Background worship music speaker"].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 14 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: color.muted, flexShrink: 0 }} /> {item}</div>
                  ))}
                </div>
              </div>
            </Accordion>
          </div>
        );

      case "prepare-agendas":
        return (
          <div>
            <PhaseHeader icon="clock" title="Choose Your Sprint Format" subtitle="Ready-to-print agendas — pick the one that fits your group's time and energy" accent={phaseColors.prepare.accent} />
            <SectionArt src={artPrepareAgendas} alt="A printed sprint agenda with highlighted time blocks" max={560} />
            <Lead>
              Choose the format that fits your group's time and energy. Each agenda below is ready to print and follow.
            </Lead>

            <div style={{ background: `${phaseColors.prepare.accent}08`, border: `1px solid ${phaseColors.prepare.accent}25`, borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 700, color: color.ink, marginBottom: 10 }}>
                First, pick your starting point: do you already have a specific challenge?
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.6, color: color.body }}>
                <strong>No — start with empathy (Path A, the default).</strong> Begin with empathy mapping, then use those insights to write a focused problem statement. Best when the group doesn't have a specific challenge yet.
              </p>
              <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.6, color: color.body }}>
                <strong>Yes — start with the problem (Path B).</strong> Begin with a rough problem statement, then do empathy work to deepen understanding, and refine the statement afterward. Best when the group already knows their challenge.
              </p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: color.muted }}>
                The agendas below use Path A. To switch to Path B, just swap the Empathy and Problem Definition time blocks.
              </p>
            </div>

            <Accordion title="Quick Sprint Agenda (90 min)" subtitle="Best for: first-time groups, low-capacity teams, or a quick intro" accent={phaseColors.prepare.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { time: "0:00–0:10", title: "Welcome & Prayer", desc: "Quick introductions. Explain the goal: understand a challenge and start generating ideas together." },
                  { time: "0:10–0:40", title: "Empathy Map Exercise", desc: "Pick one person or group to empathize with. Run a focused empathy map as a whole group or in pairs." },
                  { time: "0:40–0:55", title: "Problem Definition", desc: "Based on empathy insights, craft one 'How Might We' question together." },
                  { time: "0:55–1:20", title: "Rapid Ideation", desc: "5 minutes of silent brainstorming on sticky notes, then share and group similar ideas. Dot-vote on top 3." },
                  { time: "1:20–1:30", title: "Wrap-Up & Next Steps", desc: "Capture top ideas. Ask: who wants to keep exploring this? Set one follow-up action. Close in prayer." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "10px 14px", borderRadius: 10, background: i % 2 === 0 ? `${phaseColors.prepare.accent}05` : "transparent" }}>
                    <div style={{ fontFamily: font.sans, fontSize: 12, fontWeight: 600, color: phaseColors.prepare.accent, minWidth: 72, paddingTop: 2 }}>{item.time}</div>
                    <div><strong style={{ fontSize: 14, color: color.ink }}>{item.title}</strong><p style={{ margin: "3px 0 0", fontSize: 13, color: color.muted, lineHeight: 1.5 }}>{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="Express Sprint Agenda (2 hours)" subtitle="Best for: busy teams or Sunday afternoon sessions (if your challenge is already set, switch to Path B)" accent={phaseColors.prepare.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { time: "0:00–0:10", title: "Welcome, Prayer & Intro", desc: "Set the tone. Brief overview of design thinking and what you'll do today." },
                  { time: "0:10–0:35", title: "Empathy Map Exercise", desc: "Present the person/story. Run empathy maps at tables. Share key insights." },
                  { time: "0:35–0:55", title: "Problem Definition", desc: "Cluster empathy insights. Craft 'How Might We' question as a group." },
                  { time: "0:55–1:05", title: "Break", desc: "Snacks. Worship music. Let it breathe." },
                  { time: "1:05–1:30", title: "Crazy 8s + Ideation", desc: "Run Crazy 8s individually. Share top ideas at tables. Dot-vote across all tables." },
                  { time: "1:30–1:50", title: "Group Discussion", desc: "Discuss top-voted ideas. Refine and combine the strongest concepts." },
                  { time: "1:50–2:00", title: "Next Steps & Closing Prayer", desc: "Identify 2–3 concrete actions. Assign owners. Close in prayer." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "10px 14px", borderRadius: 10, background: i % 2 === 0 ? `${phaseColors.prepare.accent}05` : "transparent" }}>
                    <div style={{ fontFamily: font.sans, fontSize: 12, fontWeight: 600, color: phaseColors.prepare.accent, minWidth: 72, paddingTop: 2 }}>{item.time}</div>
                    <div><strong style={{ fontSize: 14, color: color.ink }}>{item.title}</strong><p style={{ margin: "3px 0 0", fontSize: 13, color: color.muted, lineHeight: 1.5 }}>{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="Standard Sprint Agenda (3 hours)" subtitle="Most popular — covers the full core process including prototyping" accent={phaseColors.prepare.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { time: "0:00–0:15", title: "Welcome, Prayer & Intro", desc: "Welcome everyone. Open in prayer. Explain design thinking and today's agenda." },
                  { time: "0:15–0:45", title: "Empathy Map Exercise", desc: "Present the challenge/person. Run empathy maps at tables. Share top insights." },
                  { time: "0:45–1:10", title: "Problem Definition & Personas", desc: "Cluster insights. Craft 'How Might We' statement. Create 1 quick persona." },
                  { time: "1:10–1:20", title: "Break", desc: "Snacks and conversation." },
                  { time: "1:20–1:50", title: "Crazy 8s + Ideation", desc: "Run Crazy 8s. Share at tables. Dot-vote on best ideas." },
                  { time: "1:50–2:20", title: "Quick Prototyping", desc: "Each table picks their top idea and creates a storyboard, flyer, or role-play." },
                  { time: "2:20–2:45", title: "Presentations & Feedback", desc: "Each table presents (3 min). 'I like / I wish / What if' feedback." },
                  { time: "2:45–3:00", title: "Next Steps & Closing Prayer", desc: "Identify concrete actions. Assign owners. Set follow-up date. Close in prayer." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "10px 14px", borderRadius: 10, background: i % 2 === 0 ? `${phaseColors.prepare.accent}05` : "transparent" }}>
                    <div style={{ fontFamily: font.sans, fontSize: 12, fontWeight: 600, color: phaseColors.prepare.accent, minWidth: 72, paddingTop: 2 }}>{item.time}</div>
                    <div><strong style={{ fontSize: 14, color: color.ink }}>{item.title}</strong><p style={{ margin: "3px 0 0", fontSize: 13, color: color.muted, lineHeight: 1.5 }}>{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="Full Sprint Agenda (4–5 hours)" subtitle="The complete experience with deep prototyping and presentations" accent={phaseColors.prepare.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { time: "0:00–0:15", title: "Welcome & Prayer", desc: "Set the tone. Open in prayer. Explain design thinking and today's agenda." },
                  { time: "0:15–0:30", title: "Heart of Innovation (Optional)", desc: "Share foundational content on biblical creativity and HIAB values." },
                  { time: "0:30–1:00", title: "Empathy Map Exercise", desc: "Present the challenge/story. Run empathy maps at tables. Share key insights." },
                  { time: "1:00–1:15", title: "Break + Snacks", desc: "Give people a breather. Play worship music." },
                  { time: "1:15–1:50", title: "Problem Definition", desc: "Cluster empathy insights. Dot-vote on the most important challenge. Craft 'How Might We' statement." },
                  { time: "1:50–2:10", title: "Persona Creation", desc: "Create 1–2 detailed personas from empathy work. Post them visibly." },
                  { time: "2:10–2:50", title: "Crazy 8s + Ideation", desc: "Run Crazy 8s. Share ideas at tables. Dot-vote on best ideas." },
                  { time: "2:50–3:00", title: "Break", desc: "Regroup and refuel." },
                  { time: "3:00–3:35", title: "Prototyping", desc: "Each table builds a prototype — storyboard, flyer, role-play, or landing page sketch." },
                  { time: "3:35–4:05", title: "Presentations & Feedback", desc: "Each table presents (3 min). 'I like / I wish / What if' feedback." },
                  { time: "4:05–4:20", title: "Next Steps & Closing Prayer", desc: "Identify 2–3 next steps. Assign owners. Set follow-up date. Close in prayer." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "10px 14px", borderRadius: 10, background: i % 2 === 0 ? `${phaseColors.prepare.accent}05` : "transparent" }}>
                    <div style={{ fontFamily: font.sans, fontSize: 12, fontWeight: 600, color: phaseColors.prepare.accent, minWidth: 72, paddingTop: 2 }}>{item.time}</div>
                    <div><strong style={{ fontSize: 14, color: color.ink }}>{item.title}</strong><p style={{ margin: "3px 0 0", fontSize: 13, color: color.muted, lineHeight: 1.5 }}>{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <FacilitatorNote title="Adapting for Multi-Org Sprints">
                <p>For multi-church sprints, add 15–20 minutes at the start for introductions and trust-building, and 10 minutes at the end for collaborative follow-up planning.</p>
              </FacilitatorNote>
            </Accordion>
          </div>
        );

      case "problem":
        return (
          <div>
            <PhaseHeader icon="target" title="Writing Problem Statements" subtitle="Clearly define the challenge before you start solving it" accent={phaseColors.problem.accent} />
            <SectionArt src={artDefine} alt="A hand placing one orange sticky note at the center of a cluster, narrowing to one problem" />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>The most common reason innovation efforts fail is that teams solve the <em>wrong problem</em>. A well-crafted problem statement focuses your sprint and makes sure solutions address a real need.</p>            <FacilitatorNote>
              <p><strong>Process order flexibility:</strong> Some facilitators prefer to do empathy mapping <em>before</em> writing problem statements, so the team understands the people involved before defining the challenge. Others prefer to start with a rough problem statement and then refine it after empathy work. Both approaches work — see <strong>Sprint Formats</strong> (under Prepare) for the ready-made agendas and how to swap the order.</p>
            </FacilitatorNote>
            <Accordion spot={artProblemHmw} title='The "How Might We..." Framework' defaultOpen accent={phaseColors.problem.accent}>
              <p>The gold standard for problem statements in design thinking is the <strong>"How Might We" (HMW)</strong> question.</p>
              <div style={{ background: `${phaseColors.problem.accent}08`, borderRadius: 12, padding: "20px 24px", border: `1px solid ${phaseColors.problem.accent}20`, margin: "16px 0", textAlign: "center" }}>
                <div style={{ fontSize: 14, color: phaseColors.problem.accent, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Formula</div>
                <div style={{ fontFamily: font.sans, fontSize: 20, color: color.ink, fontWeight: 700 }}>
                  "How might we <span style={{ color: phaseColors.problem.accent }}>[action]</span> for <span style={{ color: color.accent }}>[who]</span> so that <span style={{ color: color.accent }}>[desired outcome]</span>?"
                </div>
              </div>
              <p><strong>Examples:</strong></p>
              {["How might we create meaningful intergenerational connections so that youth feel mentored and seniors feel valued?", "How might we support working professionals so that they feel spiritually nourished despite busy schedules?"].map((ex, i) => (
                <div key={i} style={{ padding: "10px 14px", borderRadius: 8, background: color.rail, border: `1px solid ${color.line}`, fontSize: 14, lineHeight: 1.6, color: color.body, fontStyle: "italic", marginBottom: 8 }}>"{ex}"</div>
              ))}
            </Accordion>
            <Accordion title="Step-by-Step: Crafting Your Problem Statement" accent={phaseColors.problem.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Identify the Pain" duration="10 min" accent={phaseColors.problem.accent} description="Each person writes on sticky notes: What is the biggest frustration, gap, or unmet need you see? One idea per note. Aim for 3–5 each." />
                <StepCard number={2} title="Cluster & Discuss" duration="10 min" accent={phaseColors.problem.accent} description="Post all sticky notes on the wall. Group similar ones. Look for patterns. Discuss what surprises you." />
                <StepCard number={3} title="Pick a Focus" duration="5 min" accent={phaseColors.problem.accent} description="Use dot-voting (each person gets 3 dot stickers) to vote on the most urgent and actionable cluster." />
                <StepCard number={4} title='Reframe as "How Might We..."' duration="10 min" accent={phaseColors.problem.accent} description='Craft a "How might we..." question that captures the problem. Write several versions and refine until it feels both inspiring and specific.' />
              </div>
            </Accordion>
            <SectionHeading>Watch it narrow to one question</SectionHeading>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: color.body, marginBottom: 16 }}>This is the funnel in action: pains from your empathy work, a dot-voted focus, and three drafts of a How-Might-We — from solution-in-disguise to sharp.</p>
            <WalkthroughDemo key="problem" script={WALKTHROUGHS.problem} accent={phaseColors.problem.accent} />
            <Accordion spot={artProblemPitfalls} title="Common Pitfalls to Avoid" accent={phaseColors.problem.accent}>
              {[
                { bad: "We need a new website.", why: "This jumps to a solution. What's the underlying problem?" },
                { bad: "Young people don't come to church.", why: "Too vague. Which young people? What have you tried?" },
                { bad: "We need more volunteers.", why: "Solution-focused. Why don't people volunteer?" },
              ].map((pitfall, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: color.accent, fontWeight: 700, fontSize: 18 }}>✗</span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>"{pitfall.bad}"</span>
                  </div>
                  <p style={{ margin: "4px 0 0 26px", fontSize: 14, color: color.muted }}>{pitfall.why}</p>
                </div>
              ))}
            </Accordion>

            <hr style={{ border: "none", borderTop: `1px solid ${color.line}`, margin: "32px 0" }} />
            <SectionHeading>Build your problem statement (AI-guided)</SectionHeading>
            <SCIPABChatbot />
          </div>
        );

      case "empathy":
        return (
          <div>
            <PhaseHeader icon="heart" title="Empathy Maps" subtitle="Walk in someone else's shoes to truly understand their experience" accent={phaseColors.empathy.accent} />
            <SectionArt src={artEmpathize} alt="Two people sitting in conversation, one listening closely" />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>An empathy map helps your team build a shared understanding of the people you're trying to serve. It moves you beyond assumptions and into genuine compassion — the kind that leads to solutions that actually work.</p>
            <Accordion spot={artEmpathyExercise} title="How to Run an Empathy Map Exercise" accent={phaseColors.empathy.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Choose Your Subject" duration="5 min" accent={phaseColors.empathy.accent} description="Decide who you're empathizing with — a real person, a type of person, or a community member affected by your challenge." />
                <StepCard number={2} title="Gather Context" duration="15 min" accent={phaseColors.empathy.accent} description="Read a letter or testimony. Watch a video. Or have the person share their story directly. Listen actively." />
                <StepCard number={3} title="Fill the Map Together" duration="15 min" accent={phaseColors.empathy.accent} description="Draw the 4-quadrant map on poster paper. Using sticky notes, each team member adds observations. One thought per note." />
                <StepCard number={4} title="Identify Insights" duration="10 min" accent={phaseColors.empathy.accent} description="Look for tensions, surprises, patterns, and unmet needs. Circle the most important insights." />
              </div>
            </Accordion>
            <SectionHeading>See one being built</SectionHeading>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: color.body, marginBottom: 16 }}>An empathy map has four quadrants — Says, Thinks, Does, and Feels. Step through this worked example (or project it for your group) to see how observations land in each quadrant and how the insight emerges.</p>
            <WalkthroughDemo key="empathy" script={WALKTHROUGHS.empathy} accent={phaseColors.empathy.accent} />
            <TipBox accent={phaseColors.empathy.accent} label="Ministry connection">
              Empathy mapping is a spiritual exercise. It's about genuinely understanding another person's reality — the heart of loving your neighbor. Open with prayer, asking God to help your team see through others' eyes.
            </TipBox>
          </div>
        );

      case "personas":
        return (
          <div>
            <PhaseHeader icon="users" title="Personas" subtitle="Turn your empathy work into a few specific, memorable people your team designs for" accent={phaseColors.personas.accent} />
            <SectionArt src={artPersonaCard} alt="A persona profile card with a portrait, goals, and pain points" max={560} />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>A persona is a fictional but realistic character that represents a key group of people your church serves. Personas make "our community" specific and relatable — and they build directly on the empathy map you just made.</p>
            <Accordion spot={artEmpathyPersonas} title="How to Create Personas" accent={phaseColors.personas.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Review Your Empathy Map" duration="5 min" accent={phaseColors.personas.accent} description="Look at patterns from empathy mapping. Who are the distinct types of people that emerged? You'll typically identify 2–3 key personas." />
                <StepCard number={2} title="Give Them a Name and Story" duration="10 min" accent={phaseColors.personas.accent} description="Give each persona a name, age, occupation, and brief backstory. Think about people you actually know who fit this profile." />
                <StepCard number={3} title="Define Their Inner World" duration="10 min" accent={phaseColors.personas.accent} description="Write down goals, motivations, pain points, frustrations, and faith journey. What do they need from the church?" />
                <StepCard number={4} title="Write a Day-in-the-Life" duration="5 min" accent={phaseColors.personas.accent} description="2–3 sentences describing a typical day or week. This helps your team design solutions that fit their real life." />
              </div>
            </Accordion>
            <SectionHeading>Watch the map become a persona</SectionHeading>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: color.body, marginBottom: 16 }}>Step through how Maria's empathy map from the last step turns into a persona card the whole team can design for.</p>
            <WalkthroughDemo key="personas" script={WALKTHROUGHS.personas} accent={phaseColors.personas.accent} />
            <TipBox accent={phaseColors.personas.accent}>Keep personas visible throughout the sprint. Before every decision, ask: "Would this work for [persona name]?"</TipBox>
          </div>
        );

      case "ideate":
        return (
          <div>
            <PhaseHeader icon="lightbulb" title="Ideation & Brainstorming" subtitle="Generate wild, creative, God-inspired ideas — then refine them" accent={phaseColors.ideate.accent} />
            <SectionArt src={artIdeate} alt="Sketches and arrows radiating outward, representing divergent ideas" />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>Now it's time to generate as many ideas as possible. The goal is <strong>quantity over quality</strong> — wild ideas often lead to breakthroughs.</p>            <Accordion spot={artIdeateRules} title="Ground Rules for Brainstorming" defaultOpen accent={phaseColors.ideate.accent}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {[
                  { rule: "Defer Judgment", desc: "No idea is too crazy. Don't evaluate yet." },
                  { rule: "Go for Quantity", desc: "Aim for 20+ ideas per table." },
                  { rule: "Build on Others' Ideas", desc: "Say 'Yes, and...' to build on what you hear." },
                  { rule: "Think Visually", desc: "Sketch, doodle, and draw." },
                  { rule: "One Conversation", desc: "Listen to each other. Give every voice space." },
                  { rule: "Be Bold", desc: "The best ideas often sound impossible at first." },
                ].map((item) => (
                  <div key={item.rule} style={{ padding: "14px 16px", borderRadius: 10, background: `${phaseColors.ideate.accent}06`, border: `1px solid ${phaseColors.ideate.accent}12` }}>
                    <strong style={{ fontSize: 14, color: phaseColors.ideate.accent }}>{item.rule}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: color.muted }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Accordion>
            <SectionHeading>Watch a wall fill up</SectionHeading>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: color.body, marginBottom: 16 }}>Here's a table brainstorming on Maria's How-Might-We — notice how the best idea only shows up after the obvious ones are out.</p>
            <WalkthroughDemo key="ideate" script={WALKTHROUGHS.ideate} accent={phaseColors.ideate.accent} />
          </div>
        );

      case "crazy8s":
        return (
          <div>
            <PhaseHeader icon="zap" title="Exercise: Crazy 8s" subtitle="The fastest way to push past the obvious — eight ideas in eight minutes" accent={phaseColors.ideate.accent} />
            <SectionArt src={artHandsCards} alt="Hands sketching quick ideas on a folded eight-panel sheet" max={560} />
            <Lead>
              Crazy 8s pushes everyone past their first, obvious idea — eight quick sketches in eight minutes, then share and vote on the most promising ones.
            </Lead>
            <Accordion spot={artIdeateCrazy8s} title="How to Run Crazy 8s" defaultOpen accent={phaseColors.ideate.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                <StepCard number={1} title="Fold your paper into 8 panels" duration="1 min" accent={phaseColors.ideate.accent} description="Fold a blank sheet into 8 equal rectangles." />
                <StepCard number={2} title="Set the timer for 8 minutes" duration="8 min" accent={phaseColors.ideate.accent} description="1 minute per panel. Sketch ONE idea per panel. Don't go back!" />
                <StepCard number={3} title="Share and discuss" duration="10 min" accent={phaseColors.ideate.accent} description="Each person shares their top 2–3 ideas. No critiquing yet." />
                <StepCard number={4} title="Dot-vote on favorites" duration="5 min" accent={phaseColors.ideate.accent} description="3 dot stickers each. Place on the most promising ideas." />
              </div>
            </Accordion>
            <SectionHeading>Watch a round happen</SectionHeading>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: color.body, marginBottom: 16 }}>Eight panels, one a minute. Step through one participant's sheet and see where the dot votes land.</p>
            <WalkthroughDemo key="crazy8s" script={WALKTHROUGHS.crazy8s} accent={phaseColors.ideate.accent} />
          </div>
        );

      case "prototype":
        return (
          <div>
            <PhaseHeader icon="cube" title="Prototyping" subtitle="Make your best ideas tangible so you can test them" accent={phaseColors.prototype.accent} />
            <SectionArt src={artPrototype} alt="Hands building a rough paper-and-tape mockup of a phone screen" />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>A prototype is a quick, rough version of your idea. It doesn't have to be perfect — the goal is to make it concrete enough for feedback.</p>
            <Accordion spot={artPrototypeForms} title="What Can a Prototype Look Like?" defaultOpen accent={phaseColors.prototype.accent}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 12 }}>
                {[
                  { type: "Storyboard", desc: "Draw 6–8 panels showing someone's experience", icon: "film" },
                  { type: "Flyer / Poster", desc: "Mock flyer announcing your idea as if it already exists", icon: "edit" },
                  { type: "Role Play", desc: "Act out a scenario where someone experiences your solution", icon: "users" },
                  { type: "Landing Page", desc: "Sketch a webpage that describes your idea", icon: "cube" },
                  { type: "Schedule / Plan", desc: "Detailed implementation timeline", icon: "clock" },
                  { type: "Physical Model", desc: "Paper/cardboard 3D model of a space or experience", icon: "cube" },
                ].map((item) => (
                  <div key={item.type} style={{ padding: "16px", borderRadius: 10, background: `${phaseColors.prototype.accent}06`, border: `1px solid ${phaseColors.prototype.accent}12`, textAlign: "center" }}>
                    <div style={{ marginBottom: 6 }}><Icon name={item.icon} size={26} color={color.accent} /></div>
                    <strong style={{ fontSize: 14, color: color.ink, display: "block", marginBottom: 4 }}>{item.type}</strong>
                    <p style={{ margin: 0, fontSize: 13, color: color.muted, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Accordion>
            <SectionHeading>Watch a storyboard take shape</SectionHeading>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: color.body, marginBottom: 16 }}>The table storyboards Maria experiencing their winning idea — six frames, thirty minutes, testable.</p>
            <WalkthroughDemo key="prototype" script={WALKTHROUGHS.prototype} accent={phaseColors.prototype.accent} />
            <PrototypePromptBuilder />
            <ProposalAccordion />
          </div>
        );

      case "feedback":
        return (
          <div>
            <PhaseHeader icon="chat" title="Test & Get Feedback" subtitle="Put your prototype in front of people and capture honest reactions" accent={phaseColors.prototype.accent} />
            <SectionArt src={artPrototypeFeedback} alt="Three feedback cards, the middle one marked with a heart" max={560} />
            <Lead>Once a table has something tangible, have them share it and gather structured feedback. This simple three-prompt framework keeps reactions constructive and specific.</Lead>
            <Accordion title="The Feedback Framework" defaultOpen accent={phaseColors.prototype.accent}>
              {[
                { prompt: "I like...", desc: "What's working well?", color: color.accent },
                { prompt: "I wish...", desc: "What would you change?", color: color.accent },
                { prompt: "What if...", desc: "What new possibilities does this spark?", color: color.accent },
              ].map((item) => (
                <div key={item.prompt} style={{ padding: "16px 20px", borderRadius: 12, background: `${item.color}08`, border: `1px solid ${item.color}18`, display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
                  <div><strong style={{ color: item.color, fontSize: 16 }}>{item.prompt}</strong><p style={{ margin: "4px 0 0", fontSize: 14, color: color.body }}>{item.desc}</p></div>
                </div>
              ))}
            </Accordion>
            <SectionHeading>Watch a feedback round</SectionHeading>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: color.body, marginBottom: 16 }}>The three sentence starters in action on a real prototype — and how the wishes and what-ifs pair into next steps.</p>
            <WalkthroughDemo key="feedback" script={WALKTHROUGHS.feedback} accent={phaseColors.prototype.accent} />
            <TipBox accent={phaseColors.prototype.accent}>Assign one person per table to write down the "I wish" and "What if" notes — those are the seeds of your next iteration.</TipBox>
          </div>
        );

      case "templates":
        return (
          <div>
            <PhaseHeader icon="download" title="Templates & Resources" subtitle="Printable templates and quick-reference cards for your sprint" accent={phaseColors.templates.accent} />
            <Lead>
              Print-ready templates for every step of the sprint. Each card lists what's inside and links to the step where you'll use it.
            </Lead>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
              <TemplateCard title="Empathy Map Template" image={artEmpathyMap} accent={color.accent} desc="A 4-quadrant canvas for understanding." items={["Says — Direct quotes", "Thinks — Unspoken thoughts", "Does — Observable actions", "Feels — Emotions"]} onLaunch={() => navigate("empathy")} />
              <TemplateCard title="Persona Card Template" image={artPersonaCard} accent={color.accent} desc="Structured profile card for personas." items={["Name, age, role, backstory", "Goals and motivations", "Pain points", "Faith journey and church needs"]} onLaunch={() => navigate("personas")} />
              <TemplateCard title="Problem Statement Worksheet" image={artProblemStatement} accent={color.accent} desc="Guided worksheet for HMW statements." items={["Observation prompts", "Pain clustering exercise", "HMW formula and examples", "Quality checklist"]} onLaunch={() => navigate("problem")} />
              <TemplateCard title="SCIPAB Submission Template" image={artTemplateScipab} accent={color.accent} desc="The same framework used in our chatbot." items={["Situation — Current state", "Complication — Critical issues", "Implication — Consequences", "Position, Action, Benefit"]} onLaunch={() => navigate("problem")} launchLabel="Open AI-guided chatbot" />
              <TemplateCard title="Crazy 8s Sheet" image={artHandsCards} accent={color.accent} desc="Fold one sheet of paper into 8 panels for rapid idea sketching." items={["8 panels, one sketch per panel", "1 minute per sketch — 8 minutes total", "Write your HMW question at the top", "Circle your top 2 ideas to share"]} onLaunch={() => navigate("crazy8s")} />
              <TemplateCard title="Feedback Cards" accent={color.accent} desc="Structured feedback for prototyping." items={["I like...", "I wish...", "What if...", "Overall notes"]} onLaunch={() => navigate("feedback")} />
            </div>
          </div>
        );

      case "templates-post":
        return (
          <div>
            <PhaseHeader icon="download" title="Post-Sprint Templates" subtitle="Capture results and carry momentum into leadership and follow-up" accent={phaseColors.templates.accent} />
            <Lead>
              Use these after sprint day to capture what happened and carry the momentum into leadership conversations and follow-up.
            </Lead>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
              <TemplateCard title="Sprint Summary One-Pager" image={artSprintSummary} accent={color.accent} desc="A one-page record each table fills out before leaving the room." items={["HMW problem statement", "Top ideas from Crazy 8s", "Three key insights from empathy work", "Immediate next steps and owners"]} onLaunch={() => navigate("after")} />
              <TemplateCard title="Leadership Proposal Card" accent={color.accent} desc="A structured pitch card for presenting ideas to pastors and elder boards." items={["The problem (with evidence)", "The proposed solution", "Who it serves and expected impact", "Resources needed and timeline", "What success looks like"]} onLaunch={() => navigate("after")} />
              <TemplateCard title="Impact Story Template" accent={color.accent} desc="Document what happened 6 months after your sprint for future inspiration." items={["The original challenge", "What the team built/launched", "Measurable outcomes and stories", "Lessons learned and what's next"]} onLaunch={() => navigate("after")} />
            </div>

            <TipBox accent={phaseColors.templates.accent} label="From Indigitous US">
              Want help running your first HIAB? Reach out at <strong>nick@indigitous.org</strong> to schedule yours!
            </TipBox>
          </div>
        );

      case "after":
        return (
          <div>
            <PhaseHeader icon="star" title="After the Sprint" subtitle="How to capture momentum, share results, and keep your ideas alive" accent={phaseColors.after.accent} />
            <SectionArt src={artAfter} alt="A winding path with milestone flags leading toward the horizon" />

            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>
              The sprint is over — but the real work is just beginning. The energy, ideas, and connections from your HIAB are incredibly valuable, but they fade fast without intentional follow-through. This section walks you through three critical phases: capturing what happened, sharing it with leadership, and building a sustainable plan to keep going.
            </p>

            <Accordion spot={artAfterPhase1} title="Phase 1: Capture & Document (Same Day)" defaultOpen accent={phaseColors.after.accent}>
              <p>Do these things <strong>before everyone leaves the room</strong> if possible, or within 24 hours at most:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Photo Everything" duration="10 min" accent={phaseColors.after.accent}
                  description="Photograph every sticky note wall, empathy map, prototype, and whiteboard. These are your raw artifacts. Create a shared Google Photos album or Google Drive folder and have multiple people upload their photos." />
                <StepCard number={2} title="Fill Out the Sprint Summary One-Pager" duration="15 min" accent={phaseColors.after.accent}
                  description="Each table fills out a one-page summary: the HMW question they tackled, their top idea, a photo of their prototype, and 3 key insights. This becomes the sharable record of the sprint. (See Templates section)" />
                <StepCard number={3} title="Record a 60-Second Video Pitch" duration="5 min per team" accent={phaseColors.after.accent}
                  description="Have each team record a quick phone video explaining their idea. This is far more compelling than a written summary when sharing with people who weren't in the room. Keep it casual — energy and authenticity matter more than polish." />
                <StepCard number={4} title="Collect Feedback & Reflections" duration="5 min" accent={phaseColors.after.accent}
                  description="Pass out index cards and ask everyone to write: (1) one thing they learned, (2) one thing that surprised them, and (3) their energy level for continuing this work on a scale of 1–5. This gives you valuable data for planning next steps." />
              </div>
            </Accordion>
          </div>
        );

      case "after-share":
        return (
          <div>
            <PhaseHeader icon="send" title="Share with Leadership" subtitle="Turn sprint energy into buy-in — make a compelling case in week 1–2" accent={phaseColors.after.accent} />
            <SectionArt src={artAfterPhase2} alt="A sprint one-pager being passed across a table" max={560} />
            <Lead>
              Your ideas need champions. In the first week or two after the sprint, make a short, compelling case to your church leadership.
            </Lead>

            <Accordion title="Phase 2: Share with Leadership (Week 1–2)" defaultOpen accent={phaseColors.after.accent}>
              <p>Your ideas need champions and buy-in from church leadership to move forward. Here's how to make a compelling case:</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {[
                  { title: "Request a 15-Minute Slot", desc: "Ask your pastor or elder board for time at their next meeting. Come prepared with the Sprint Summary One-Pager and the video pitches. Less is more — don't overwhelm them with process details." },
                  { title: "Lead with the Problem, Not the Solution", desc: "Start by sharing the empathy work — the real human stories and needs you uncovered. Leadership needs to feel the weight of the problem before they'll invest in a solution." },
                  { title: "Present 1–2 Top Ideas (Not All of Them)", desc: "Pick the strongest ideas with the most energy behind them. Use the Leadership Proposal Card format to structure your pitch clearly. (See Templates section)" },
                  { title: "Ask for a Specific Next Step", desc: "Don't ask for blanket approval. Ask for something concrete: 'Can we pilot this with one small group for 6 weeks?' or 'Can we get $200 to test this idea?' Small asks get faster yeses." },
                  { title: "Offer a Demo Sunday", desc: "Ask for 5 minutes during a Sunday service or town hall for sprint teams to share their ideas with the congregation. Public momentum creates accountability and excitement." },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "14px 18px", borderRadius: 10, background: "#fff", border: `1px solid ${color.line}` }}>
                    <strong style={{ fontSize: 15, color: color.ink }}>{item.title}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: color.muted, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <TipBox accent={phaseColors.after.accent} label="Pro tip">
                Use the <strong onClick={() => navigate("prototype")} style={{ color: phaseColors.after.accent, cursor: "pointer", textDecoration: "underline" }}>Proposal Generator tool</strong> (inside the Prototyping section) to create a polished, AI-refined proposal you can present to leadership.
              </TipBox>
            </Accordion>
          </div>
        );

      case "after-sustain":
        return (
          <div>
            <PhaseHeader icon="star" title="Keep It Alive" subtitle="Sustain momentum over the first months and build a lasting culture of innovation" accent={phaseColors.after.accent} />
            <SectionArt src={artAfterPhase3} alt="A young plant being tended as it grows" max={560} />
            <Lead>
              Momentum fades fast after sprint day. Build a simple rhythm of ownership and check-ins so your best ideas keep moving.
            </Lead>

            <Accordion title="Phase 3: Keep It Alive (Month 1–3)" defaultOpen accent={phaseColors.after.accent}>
              <p>The biggest risk after any sprint is losing momentum. Here's how to build a sustainable path forward:</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Appoint an Innovation Champion" accent={phaseColors.after.accent}
                  description="For each idea moving forward, identify one person who owns it. This person doesn't do all the work — they keep the conversation alive, schedule check-ins, and make sure things don't slip through the cracks. Ideally someone with energy and organizational skills." />
                <StepCard number={2} title="Schedule Bi-Weekly Check-Ins" accent={phaseColors.after.accent}
                  description="Put 30-minute check-ins on the calendar every two weeks. These can be brief — just go around and share: What did you do? What did you learn? What's blocking you? What's next? Consistency matters more than length." />
                <StepCard number={3} title="Run a Follow-Up Mini-Sprint" duration="2 hours at week 6" accent={phaseColors.after.accent}
                  description="Schedule a 2-hour reunion at the 6-week mark. Teams share what they've tried, what they've learned, and what surprised them. Then do a quick ideation round to iterate on the original idea based on real-world feedback. This keeps the design thinking muscle active." />
                <StepCard number={4} title="Document Your Impact Story" accent={phaseColors.after.accent}
                  description="At the 6-month mark, write up what happened. Use the Impact Story Template to document the original challenge, what the team built, measurable outcomes, and lessons learned. These stories inspire future sprints and build a culture of innovation." />
              </div>
            </Accordion>

            <Accordion spot={artAfterCulture} title="Building a Culture of Innovation" accent={phaseColors.after.accent}>
              <p>One sprint is a great start. But the real power of HIAB comes from making innovation a regular practice in your church:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { title: "Run Sprints Regularly", desc: "Aim for 2–4 sprints per year, each focused on a different challenge. Over time, you build a portfolio of ideas at different stages — some are concepts, some are being piloted, some are fully implemented." },
                  { title: "Celebrate Experiments (Even Failed Ones)", desc: "Publicly celebrate teams that tried something, even if it didn't work. Share what was learned. A church that's afraid of failure will never innovate." },
                  { title: "Connect with Other HIAB Churches", desc: "You're not alone in this. Reach out to Indigitous US to connect with other churches running sprints. Share ideas, swap resources, and encourage each other." },
                  { title: "Train New Facilitators", desc: "Don't let one person be the bottleneck. Train 2–3 people to facilitate sprints so the practice can scale and sustain even when leaders transition." },
                  { title: "Tie Innovation to Your Church's Vision", desc: "Frame sprints not as extra programs, but as a way to live out your church's mission more effectively. Innovation isn't separate from ministry — it IS ministry when it serves people better." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Icon name="check" size={16} color={phaseColors.after.accent} />
                    <div><strong style={{ fontSize: 14, color: color.ink }}>{item.title}:</strong> <span style={{ fontSize: 14, color: color.muted, lineHeight: 1.6 }}>{item.desc}</span></div>
                  </div>
                ))}
              </div>
            </Accordion>

            <CtaBanner icon="edit" title="Ready to Pitch Your Idea?"
              desc="Use the Proposal Generator in the Prototyping section to build a polished leadership proposal from your sprint results."
              onClick={() => navigate("prototype")} />
          </div>
        );

      case "pitch":
        return (
          <div>
            <PhaseHeader icon="send" title="Pitch to Leadership" subtitle="Turn your prototype into a one-page proposal you can hand to your pastor or leadership" accent={phaseColors.proposal.accent} />
            <SectionArt src={artPitch} alt="A person presenting at an easel to a small seated group" />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: color.body, marginBottom: 24 }}>
              You've built and tested a prototype — now give it a future. Close the sprint with a quick pitch round in the room, then turn the winning idea into a proposal your leadership can actually say yes to.
            </p>

            <Accordion title="Run the Pitch Round (in the room)" defaultOpen accent={phaseColors.proposal.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                <StepCard number={1} title="Each table presents" duration="3 min per team" accent={phaseColors.proposal.accent}
                  description="One person per table shares the HMW question, the idea, and the prototype. Keep a visible timer — 3 minutes, no exceptions, so every team gets equal airtime." />
                <StepCard number={2} title='"I like / I wish / What if" feedback' duration="3 min per team" accent={phaseColors.proposal.accent}
                  description='After each pitch, the room responds using only three sentence starters: "I like…" (what works), "I wish…" (what could improve), "What if…" (a new possibility). This keeps feedback constructive and fast.' />
                <StepCard number={3} title="Vote on what moves forward" duration="5 min" accent={phaseColors.proposal.accent}
                  description="Dot-vote across all the ideas. The top 1–2 are the ones you'll carry into a leadership proposal — don't try to advance everything." />
              </div>
            </Accordion>

            <SectionHeading>Watch a pitch come together</SectionHeading>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: color.body, marginBottom: 16 }}>Story, problem, idea, evidence, ask — step through a three-minute pitch built from the sprint you just watched.</p>
            <WalkthroughDemo key="pitch" script={WALKTHROUGHS.pitch} accent={phaseColors.proposal.accent} />

            <CtaBanner icon="edit" title="Build Your Leadership Proposal"
              desc="Use the Proposal Generator (on the Prototyping page) to turn your winning idea into a polished one-page proposal."
              onClick={() => navigate("prototype")} />
          </div>
        );

      case "partner":
        return <ThinkingPartner setMode={(m) => navigate(m === "picker" ? "home" : m)} />;

      default: return null;
    }
  };

  const goNav = (id) => { navigate(id); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: color.bg, fontFamily: font.sans }}>
      <style>{`
        @media (max-width: 767px) {
          .hiab-grid-2 { grid-template-columns: 1fr !important; }
        }
        html { -webkit-text-size-adjust: 100%; }
      `}</style>
      {!isMobile && <Sidebar activePhase={activePhase} onNavigate={goNav} />}
      {isMobile && navOpen && (
        <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, background: `${color.ink}55`, zIndex: 40 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 41 }}>
            <Sidebar activePhase={activePhase} onNavigate={goNav} />
          </div>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${color.lineSoft}`, background: color.rail }}>
            <button onClick={() => setNavOpen(true)} aria-label="Open menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <Icon name="menu" size={22} color={color.ink} />
            </button>
            <BrandMark size={24} />
            <span style={{ fontWeight: 700, fontSize: 14, color: color.ink }}>Hack In A Box</span>
          </div>
        )}
        {inRun && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: isMobile ? "8px 18px" : "8px 28px", background: `${color.accent}0c`, borderBottom: `1px solid ${color.lineSoft}`, fontSize: 12.5, color: color.body }}>
            <Icon name="users" size={15} color={color.accent} />
            <span><strong>Facilitator guide</strong> — how to lead each step with your team in the room.</span>
          </div>
        )}
        {inRun && <StepBar activeSection={view} onNavigate={navigate} />}
        <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: isMobile ? "22px 18px" : "34px 38px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            {renderContent(view)}
            {view !== "partner" && <FlowNav view={view} navigate={navigate} isMobile={isMobile} />}
          </div>
        </div>
      </div>
      <FeedbackWidget key={view} section={view} isMobile={isMobile} />
      {!introSeen && view !== "partner" && <IntroModal onClose={dismissIntro} isMobile={isMobile} />}
    </div>
  );
}
