import { useState, useEffect, useRef } from "react";

const sections = [
  { id: "home", label: "Home" },
  { id: "overview", label: "What is HIAB?" },
  { id: "foundation", label: "Heart of Innovation" },
  { id: "prepare", label: "Prepare" },
  { id: "empathy", label: "Empathy Maps" },
  { id: "personas", label: "Personas" },
  { id: "problem", label: "Problem Statements" },
  { id: "submit", label: "✦ Submit a Problem" },
  { id: "ideate", label: "Ideation" },
  { id: "prototype", label: "Prototyping" },
  { id: "after", label: "After the Sprint" },
  { id: "templates", label: "Templates" },
];

const phaseColors = {
  prepare: { bg: "#FFF8F0", accent: "#E8890C", light: "#FEF3E2" },
  problem: { bg: "#F0F4FF", accent: "#4361EE", light: "#E2EAFF" },
  empathy: { bg: "#F5FFF0", accent: "#2D9B3A", light: "#E2FBDF" },
  personas: { bg: "#FFF0F8", accent: "#C2185B", light: "#FFE0EE" },
  ideate: { bg: "#FFFFF0", accent: "#C6A200", light: "#FFF9D6" },
  prototype: { bg: "#F0FFFF", accent: "#0097A7", light: "#D6F7FA" },
  facilitate: { bg: "#F8F0FF", accent: "#7B1FA2", light: "#EFE0FF" },
  templates: { bg: "#FFF5F0", accent: "#D84315", light: "#FFE8DD" },
  submit: { bg: "#F0FFF8", accent: "#0D7C5F", light: "#D6FBF0" },
  after: { bg: "#FFF8F0", accent: "#B45309", light: "#FEF3E2" },
  proposal: { bg: "#F0F8FF", accent: "#1D4ED8", light: "#DBEAFE" },
  foundation: { bg: "#FFFAF0", accent: "#9D174D", light: "#FDE8EF" },
};

const AI_ENDPOINT = import.meta.env.VITE_HIAB_AI_ENDPOINT;

const WORKSHEET_KEYS = {
  empathy: "hiab-empathy-map-v1",
  persona: "hiab-persona-v1",
  problem: "hiab-problem-v1",
  crazy8s: "hiab-crazy8s-v1",
  feedback: "hiab-feedback-v1",
  summary: "hiab-summary-v1",
  proposal: "hiab-proposal-v1",
  plan: "hiab-30-60-90-v1",
  impact: "hiab-impact-v1",
};

function readStoredJson(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

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

function buildHmw(problem) {
  if (!problem?.action && !problem?.who && !problem?.outcome) return "";
  return `How might we ${problem.action || "..."} for ${problem.who || "..."} so that ${problem.outcome || "..."}?`;
}

function loadSprintSummarySources() {
  const problem = readStoredJson(WORKSHEET_KEYS.problem);
  const crazy8s = readStoredJson(WORKSHEET_KEYS.crazy8s, { panels: [] });
  const empathy = readStoredJson(WORKSHEET_KEYS.empathy);
  return {
    hmw: buildHmw(problem),
    topPanels: (crazy8s.panels || []).filter((x) => x.starred && x.text).map((x) => x.text),
    empathySubject: empathy.subject || "",
    insights: empathy.insights || "",
  };
}

function loadWorksheetSnapshot() {
  return {
    empathy: readStoredJson(WORKSHEET_KEYS.empathy, { says: [], thinks: [], does: [], feels: [] }),
    persona: readStoredJson(WORKSHEET_KEYS.persona),
    problem: readStoredJson(WORKSHEET_KEYS.problem, { pains: [], drafts: [] }),
    crazy8s: readStoredJson(WORKSHEET_KEYS.crazy8s, { panels: [] }),
    feedback: readStoredJson(WORKSHEET_KEYS.feedback, { likes: [], wishes: [], whatifs: [] }),
    summary: readStoredJson(WORKSHEET_KEYS.summary),
    proposal: readStoredJson(WORKSHEET_KEYS.proposal),
    plan: readStoredJson(WORKSHEET_KEYS.plan, {
      "30": { tasks: [] },
      "60": { tasks: [] },
      "90": { tasks: [] },
    }),
    impact: readStoredJson(WORKSHEET_KEYS.impact),
  };
}

const SCIPAB_STEPS = [
  {
    key: "situation",
    label: "Situation",
    letter: "S",
    color: "#4361EE",
    prompt: "Tell me about your church or ministry's current situation. What's the context? Think about your community, your congregation, your programs, or the people you're trying to reach.",
    helper: "Example: \"Our church is in a suburban neighborhood with a growing young professional population. We have about 200 members, mostly families, and run a traditional Sunday service with a small group program.\"",
    guideText: "State the current state of affairs — the relevant circumstances of your church or ministry.",
  },
  {
    key: "complication",
    label: "Complication",
    letter: "C",
    color: "#C2185B",
    prompt: "What's the critical issue or challenge that's disrupting your situation? What changes, pressures, or problems have emerged?",
    helper: "Example: \"Over the past two years, we've seen a significant drop in attendance among 20-35 year olds. Our small groups aren't attracting younger members, and we're struggling to connect with the new professionals moving into the area.\"",
    guideText: "Identify the critical issues — changes, pressures, or demands creating problems or opportunities.",
  },
  {
    key: "implication",
    label: "Implication",
    letter: "I",
    color: "#E8890C",
    prompt: "What happens if this problem isn't addressed? What are the consequences for your church, your community, or the people involved?",
    helper: "Example: \"If we don't engage this demographic, we risk becoming an aging congregation that can't sustain itself in 10 years. More importantly, there are hundreds of young professionals in our community who are spiritually hungry but feel disconnected from church.\"",
    guideText: "Show the personal or ministry consequences of failing to act on this problem.",
  },
  {
    key: "position",
    label: "Position",
    letter: "P",
    color: "#2D9B3A",
    prompt: "What do you believe needs to happen? What's your position on how this should be addressed? (It's okay if you're not sure — share your best thinking!)",
    helper: "Example: \"We believe we need to completely reimagine how we create community for young professionals — not just tweaking Sunday services, but creating new entry points and gathering formats that fit their lives.\"",
    guideText: "State clearly what you believe needs to be done to address this challenge.",
  },
  {
    key: "action",
    label: "Action",
    letter: "A",
    color: "#7B1FA2",
    prompt: "What specific action or next step are you hoping to take? What role do you want your church, your team, or a HIAB sprint to play?",
    helper: "Example: \"We want to run a HIAB sprint with a mix of our current young members and church leaders to brainstorm fresh approaches to community building. We'd also love to involve some of the unchurched professionals in the conversation.\"",
    guideText: "Describe the role you want others to play and the steps you'd like to explore.",
  },
  {
    key: "benefit",
    label: "Benefit",
    letter: "B",
    color: "#0097A7",
    prompt: "What would success look like? If this problem were solved, what would be the benefit to your church and community?",
    helper: "Example: \"If we crack this, we'd see a vibrant, multigenerational community where young professionals feel they belong. We'd have sustainable growth, new leaders emerging, and a church that's truly serving our changing neighborhood.\"",
    guideText: "Describe how solving this problem will address your church's specific needs. Be as concrete as possible.",
  },
];

function Icon({ name, size = 24, color = "currentColor" }) {
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

function Accordion({ title, subtitle, children, defaultOpen = false, accent = "#4361EE" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${accent}22`, marginBottom: 12, overflow: "hidden", background: "#fff" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: subtitle ? "14px 20px 12px" : "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: open ? `${accent}08` : "transparent", border: "none", cursor: "pointer",
        fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, fontWeight: 600, color: "#1a1a2e", transition: "background 0.2s",
        textAlign: "left",
      }}>
        <div>
          <span>{title}</span>
          {subtitle && <div style={{ fontSize: 13, fontWeight: 400, color: accent, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{subtitle}</div>}
        </div>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", color: accent, flexShrink: 0, marginLeft: 12 }}>
          <Icon name="chevronDown" size={20} color={accent} />
        </span>
      </button>
      {open && <div style={{ padding: "4px 20px 20px", lineHeight: 1.7, color: "#374151" }}>{children}</div>}
    </div>
  );
}

function StepCard({ number, title, description, duration, accent = "#4361EE" }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "24px 24px 20px", border: `1px solid ${accent}18`, boxShadow: `0 2px 12px ${accent}08`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${accent}12`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{number}</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 6px", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, color: "#1a1a2e" }}>{title}</h4>
          {duration && <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8, color: accent, fontSize: 13, fontWeight: 500 }}><Icon name="clock" size={14} color={accent} /> {duration}</div>}
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "#555" }}>{description}</p>
        </div>
      </div>
    </div>
  );
}

function TipBox({ children, accent = "#E8890C", label = "💡 Tip" }) {
  return (
    <div style={{ background: `${accent}0A`, border: `1px solid ${accent}25`, borderRadius: 12, padding: "16px 20px", marginTop: 16, marginBottom: 8, fontSize: 15, lineHeight: 1.65, color: "#444" }}>
      <strong style={{ color: accent, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</strong>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function PhaseHeader({ icon, title, subtitle, accent }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={26} color={accent} />
        </div>
        <h2 style={{ margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#1a1a2e" }}>{title}</h2>
      </div>
      {subtitle && <p style={{ margin: "8px 0 0 60px", fontSize: 16, color: "#666", lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

function TemplateCard({ title, desc, items, accent, onLaunch, launchLabel = "Open interactive worksheet" }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: `1px solid ${accent}18`, boxShadow: `0 2px 12px ${accent}08`, display: "flex", flexDirection: "column" }}>
      <h4 style={{ margin: "0 0 8px", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, color: "#1a1a2e" }}>{title}</h4>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#666", lineHeight: 1.6 }}>{desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent, marginTop: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
      {onLaunch && (
        <button onClick={onLaunch} style={{
          marginTop: 16, background: accent, color: "#fff", border: "none",
          borderRadius: 8, padding: "10px 14px", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>{launchLabel} →</button>
      )}
    </div>
  );
}

function FacilitatorNote({ children, title = "Facilitator Note" }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 10, border: "1px dashed #7B1FA240", marginTop: 12, marginBottom: 8, overflow: "hidden", background: "#F8F0FF08" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
        background: open ? "#7B1FA208" : "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
        color: "#7B1FA2", fontFamily: "'DM Sans', sans-serif",
      }}>
        <span style={{ fontSize: 15 }}>🎓</span> {title}
        <span style={{ marginLeft: "auto", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>
          <Icon name="chevronDown" size={16} color="#7B1FA2" />
        </span>
      </button>
      {open && <div style={{ padding: "4px 16px 14px", fontSize: 14, lineHeight: 1.6, color: "#555", borderTop: "1px dashed #7B1FA215" }}>{children}</div>}
    </div>
  );
}

function VideoPlaceholder({ title, description, duration }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1a2e, #2d2b55)", borderRadius: 14, padding: "20px 22px",
      color: "#fff", marginBottom: 12, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 10, right: 12, background: "#E8890C", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" }}>
        Coming Soon
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon name="film" size={22} color="rgba(255,255,255,0.5)" />
        </div>
        <div>
          <h4 style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600 }}>{title}</h4>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.6, lineHeight: 1.4 }}>{description}</p>
          {duration && <div style={{ fontSize: 12, opacity: 0.4, marginTop: 4 }}>Estimated: {duration}</div>}
        </div>
      </div>
    </div>
  );
}

function EmpathyMapVisual() {
  const quadrants = [
    { title: "SAYS", color: "#4361EE", prompt: "What does the person say out loud? Direct quotes, key phrases, statements about their experience.", },
    { title: "THINKS", color: "#2D9B3A", prompt: "What might they be thinking but not saying? Worries, aspirations, beliefs about their situation." },
    { title: "DOES", color: "#E8890C", prompt: "What actions and behaviors do you observe? How do they interact with others?" },
    { title: "FEELS", color: "#C2185B", prompt: "What emotions might they experience? Frustrations, joys, fears about the situation." },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, borderRadius: 16, overflow: "hidden", background: "#e5e7eb", maxWidth: 560, margin: "20px auto" }}>
      {quadrants.map((q) => (
        <div key={q.title} style={{ background: `${q.color}08`, padding: "20px 18px", minHeight: 120 }}>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 15, color: q.color, marginBottom: 8, letterSpacing: 1 }}>{q.title}</div>
          <p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.55 }}>{q.prompt}</p>
        </div>
      ))}
    </div>
  );
}

function EmpathyMapWorksheet() {
  const STORAGE_KEY = WORKSHEET_KEYS.empathy;
  const quadrants = [
    { key: "says", title: "SAYS", color: "#4361EE", prompt: "Direct quotes, key phrases" },
    { key: "thinks", title: "THINKS", color: "#2D9B3A", prompt: "Beliefs, worries, hopes" },
    { key: "does", title: "DOES", color: "#E8890C", prompt: "Actions, behaviors" },
    { key: "feels", title: "FEELS", color: "#C2185B", prompt: "Emotions, frustrations, joys" },
  ];

  const empty = { subject: "", says: [], thinks: [], does: [], feels: [], insights: "" };

  const [data, setData] = useState(() => readStoredJson(STORAGE_KEY, empty));

  useEffect(() => {
    writeStoredJson(STORAGE_KEY, data);
  }, [STORAGE_KEY, data]);

  const addNote = (key) => {
    setData((d) => ({ ...d, [key]: [...d[key], { id: Date.now() + Math.random(), text: "" }] }));
  };

  const updateNote = (key, id, text) => {
    setData((d) => ({ ...d, [key]: d[key].map((n) => (n.id === id ? { ...n, text } : n)) }));
  };

  const deleteNote = (key, id) => {
    setData((d) => ({ ...d, [key]: d[key].filter((n) => n.id !== id) }));
  };

  const reset = () => {
    if (confirm("Clear this empathy map? This can't be undone.")) setData(empty);
  };

  const noteCount = quadrants.reduce((sum, q) => sum + data[q.key].length, 0);

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, marginTop: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
            Interactive Empathy Map
          </div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
            {noteCount} note{noteCount === 1 ? "" : "s"} · auto-saves to this browser
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.print()} style={btnStyleSecondary}>🖨️ Print</button>
          <button onClick={reset} style={btnStyleDanger}>Reset</button>
        </div>
      </div>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>
          Who are we empathizing with?
        </span>
        <input
          type="text"
          value={data.subject}
          onChange={(e) => setData((d) => ({ ...d, subject: e.target.value }))}
          placeholder='e.g. "Maria, 28, young professional new to the neighborhood"'
          style={{
            width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8,
            border: "1px solid #d1d5db", fontFamily: "inherit",
          }}
        />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="hiab-empathy-grid">
        {quadrants.map((q) => (
          <div key={q.key} style={{
            background: `${q.color}06`, border: `1px solid ${q.color}25`,
            borderRadius: 12, padding: 14, minHeight: 220, display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 14, color: q.color, letterSpacing: 1 }}>
                {q.title}
              </span>
              <span style={{ fontSize: 11, color: "#999" }}>{data[q.key].length}</span>
            </div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 10 }}>{q.prompt}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              {data[q.key].map((note) => (
                <div key={note.id} style={{
                  background: "#FEF9C3", borderRadius: 6, padding: "6px 8px",
                  display: "flex", alignItems: "flex-start", gap: 6,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}>
                  <textarea
                    autoFocus={note.text === ""}
                    value={note.text}
                    onChange={(e) => updateNote(q.key, note.id, e.target.value)}
                    placeholder="Type observation..."
                    rows={2}
                    style={{
                      flex: 1, border: "none", background: "transparent", resize: "none",
                      fontFamily: "inherit", fontSize: 13, lineHeight: 1.4, color: "#1f2937",
                      outline: "none", padding: 0,
                    }}
                  />
                  <button
                    onClick={() => deleteNote(q.key, note.id)}
                    style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 2 }}
                    aria-label="Delete note"
                  >×</button>
                </div>
              ))}
            </div>

            <button onClick={() => addNote(q.key)} style={{
              marginTop: 10, background: "transparent", border: `1px dashed ${q.color}55`,
              color: q.color, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>+ Add sticky note</button>
          </div>
        ))}
      </div>

      <label style={{ display: "block", marginTop: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>
          Key insights & patterns
        </span>
        <textarea
          value={data.insights}
          onChange={(e) => setData((d) => ({ ...d, insights: e.target.value }))}
          placeholder="What surprised you? What tensions or unmet needs emerged?"
          rows={3}
          style={{
            width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8,
            border: "1px solid #d1d5db", fontFamily: "inherit", resize: "vertical",
          }}
        />
      </label>
    </div>
  );
}

const btnStyleSecondary = {
  background: "#fff", border: "1px solid #d1d5db", borderRadius: 8,
  padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "#374151",
  cursor: "pointer", fontFamily: "inherit",
};

const btnStyleDanger = {
  background: "#fff", border: "1px solid #fca5a5", borderRadius: 8,
  padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "#b91c1c",
  cursor: "pointer", fontFamily: "inherit",
};

const inputStyle = {
  width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8,
  border: "1px solid #d1d5db", fontFamily: "inherit", outline: "none",
};

const textareaStyle = { ...inputStyle, resize: "vertical", lineHeight: 1.55 };

const fieldLabel = { fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 };

function useWorksheet(storageKey, empty) {
  const [data, setData] = useState(() => readStoredJson(storageKey, empty));
  useEffect(() => {
    writeStoredJson(storageKey, data);
  }, [storageKey, data]);
  const reset = (msg = "Clear this worksheet? This can't be undone.") => {
    if (confirm(msg)) setData(empty);
  };
  return [data, setData, reset];
}

function WorksheetHeader({ title, subtitle, onReset, accent = "#1a1a2e" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
      <div>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 700, color: accent }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => window.print()} style={btnStyleSecondary}>🖨️ Print</button>
        {onReset && <button onClick={onReset} style={btnStyleDanger}>Reset</button>}
      </div>
    </div>
  );
}

function WorksheetShell({ children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, marginTop: 24, marginBottom: 24 }}>
      {children}
    </div>
  );
}

// ========== PERSONA CARD WORKSHEET ==========
function PersonaCardWorksheet() {
  const empty = {
    avatar: "👤", name: "", age: "", role: "", backstory: "",
    goals: "", pains: "", faith: "", needs: "", dayInLife: "",
  };
  const [data, setData, reset] = useWorksheet(WORKSHEET_KEYS.persona, empty);
  const avatars = ["👤","👩","👨","🧑","👵","👴","👧","👦","🧕","👳","👨‍🦱","👩‍🦰"];
  const sections = [
    { key: "goals", label: "Goals & Motivations", color: "#2D9B3A", placeholder: "What do they want? What drives them?" },
    { key: "pains", label: "Pain Points & Frustrations", color: "#C2185B", placeholder: "What's hard, frustrating, or unmet?" },
    { key: "faith", label: "Faith Journey", color: "#4361EE", placeholder: "Where are they on their faith journey? What's their history with church?" },
    { key: "needs", label: "Needs from the Church", color: "#E8890C", placeholder: "What would actually help them? What do they wish existed?" },
  ];

  return (
    <WorksheetShell>
      <WorksheetHeader title="Persona Card" subtitle="A vivid picture of someone you're designing for · auto-saves" onReset={reset} />

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #C2185B22, #4361EE22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{data.avatar}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 120, justifyContent: "center" }}>
            {avatars.map((a) => (
              <button key={a} onClick={() => setData((d) => ({ ...d, avatar: a }))} style={{
                background: data.avatar === a ? "#E8890C20" : "transparent", border: "none",
                borderRadius: 6, padding: 2, fontSize: 18, cursor: "pointer",
              }}>{a}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: 10 }}>
          <input value={data.name} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} placeholder="Name (e.g. Maria Chen)" style={{ ...inputStyle, fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 700 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <input value={data.age} onChange={(e) => setData((d) => ({ ...d, age: e.target.value }))} placeholder="Age" style={{ ...inputStyle, width: 80 }} />
            <input value={data.role} onChange={(e) => setData((d) => ({ ...d, role: e.target.value }))} placeholder="Role / occupation" style={inputStyle} />
          </div>
          <textarea value={data.backstory} onChange={(e) => setData((d) => ({ ...d, backstory: e.target.value }))} placeholder="Backstory — 2-3 sentences about who they are" rows={2} style={textareaStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="hiab-grid-2">
        {sections.map((s) => (
          <div key={s.key} style={{ background: `${s.color}06`, border: `1px solid ${s.color}25`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 8, letterSpacing: 0.3 }}>{s.label}</div>
            <textarea value={data[s.key]} onChange={(e) => setData((d) => ({ ...d, [s.key]: e.target.value }))} placeholder={s.placeholder} rows={4} style={{ ...textareaStyle, background: "#fff", border: "none" }} />
          </div>
        ))}
      </div>

      <label style={{ display: "block", marginTop: 16 }}>
        <span style={fieldLabel}>A day in their life</span>
        <textarea value={data.dayInLife} onChange={(e) => setData((d) => ({ ...d, dayInLife: e.target.value }))} placeholder="Walk through a typical day or week — wake up, work, family, church involvement, free time..." rows={3} style={textareaStyle} />
      </label>
    </WorksheetShell>
  );
}

// ========== PROBLEM STATEMENT WORKSHEET ==========
function ProblemStatementWorksheet() {
  const empty = { pains: [], action: "", who: "", outcome: "", drafts: [] };
  const [data, setData, reset] = useWorksheet(WORKSHEET_KEYS.problem, empty);

  const addPain = () => setData((d) => ({ ...d, pains: [...d.pains, { id: Date.now() + Math.random(), text: "", starred: false }] }));
  const updatePain = (id, text) => setData((d) => ({ ...d, pains: d.pains.map((p) => p.id === id ? { ...p, text } : p) }));
  const toggleStar = (id) => setData((d) => ({ ...d, pains: d.pains.map((p) => p.id === id ? { ...p, starred: !p.starred } : p) }));
  const removePain = (id) => setData((d) => ({ ...d, pains: d.pains.filter((p) => p.id !== id) }));

  const hmw = `How might we ${data.action || "[action]"} for ${data.who || "[who]"} so that ${data.outcome || "[desired outcome]"}?`;

  const saveDraft = () => {
    if (!data.action && !data.who && !data.outcome) return;
    setData((d) => ({ ...d, drafts: [...d.drafts, { id: Date.now(), text: hmw }] }));
  };

  return (
    <WorksheetShell>
      <WorksheetHeader title="Problem Statement Worksheet" subtitle="Capture pains → cluster → write a How Might We" onReset={reset} accent="#4361EE" />

      <div style={{ marginBottom: 20 }}>
        <div style={fieldLabel}>1. Capture the pains you observe (one per note)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {data.pains.map((p) => (
            <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", background: p.starred ? "#FEF3C7" : "#F9FAFB", borderRadius: 8, padding: "6px 10px", border: p.starred ? "1px solid #FBBF24" : "1px solid #E5E7EB" }}>
              <button onClick={() => toggleStar(p.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: p.starred ? "#F59E0B" : "#D1D5DB" }}>★</button>
              <input value={p.text} onChange={(e) => updatePain(p.id, e.target.value)} placeholder="What's the frustration or gap?" style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              <button onClick={() => removePain(p.id)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>
        <button onClick={addPain} style={{ background: "transparent", border: "1px dashed #4361EE55", color: "#4361EE", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add pain point</button>
        <div style={{ fontSize: 12, color: "#999", marginTop: 6 }}>Star the most urgent and actionable ones — those drive your HMW question.</div>
      </div>

      <div style={{ background: "#F0F4FF", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #4361EE25" }}>
        <div style={{ fontSize: 12, color: "#4361EE", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>2. Live HMW Preview</div>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, lineHeight: 1.5, color: "#1a1a2e", fontWeight: 600 }}>"{hmw}"</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }} className="hiab-grid-3">
        <label><span style={fieldLabel}>Action</span><input value={data.action} onChange={(e) => setData((d) => ({ ...d, action: e.target.value }))} placeholder="create, help, support..." style={inputStyle} /></label>
        <label><span style={fieldLabel}>Who</span><input value={data.who} onChange={(e) => setData((d) => ({ ...d, who: e.target.value }))} placeholder="young families, new visitors..." style={inputStyle} /></label>
        <label><span style={fieldLabel}>So that</span><input value={data.outcome} onChange={(e) => setData((d) => ({ ...d, outcome: e.target.value }))} placeholder="they feel welcomed..." style={inputStyle} /></label>
      </div>

      <button onClick={saveDraft} style={{ background: "#4361EE", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>💾 Save this version</button>

      {data.drafts.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={fieldLabel}>Saved versions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.drafts.map((d) => (
              <div key={d.id} style={{ fontSize: 14, padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, color: "#374151", fontStyle: "italic" }}>"{d.text}"</div>
            ))}
          </div>
        </div>
      )}
    </WorksheetShell>
  );
}

// ========== CRAZY 8s WORKSHEET ==========
function Crazy8sWorksheet() {
  const empty = { hmw: "", panels: Array.from({ length: 8 }, () => ({ text: "", starred: false })) };
  const [data, setData, reset] = useWorksheet(WORKSHEET_KEYS.crazy8s, empty);
  const [timeLeft, setTimeLeft] = useState(0); // seconds remaining
  const [running, setRunning] = useState(false);
  const currentPanel = running || timeLeft > 0 ? Math.min(7, Math.floor((480 - timeLeft) / 60)) : -1;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WORKSHEET_KEYS.problem);
      if (saved && !data.hmw) {
        const p = JSON.parse(saved);
        const hmw = `How might we ${p.action || "..."} for ${p.who || "..."} so that ${p.outcome || "..."}?`;
        if (p.action || p.who || p.outcome) setData((d) => ({ ...d, hmw }));
      }
    } catch {
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft]);

  const start = () => { setTimeLeft(480); setRunning(true); };
  const pause = () => setRunning(false);
  const resume = () => setRunning(true);
  const stop = () => { setRunning(false); setTimeLeft(0); };

  const updatePanel = (i, patch) => setData((d) => ({
    ...d, panels: d.panels.map((p, j) => j === i ? { ...p, ...patch } : p),
  }));

  const mm = String(Math.floor(timeLeft / 60)).padStart(1, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <WorksheetShell>
      <WorksheetHeader title="Crazy 8s" subtitle="8 ideas in 8 minutes — 1 minute per panel" onReset={reset} accent="#C6A200" />

      <div style={{ marginBottom: 16 }}>
        <span style={fieldLabel}>Your How Might We question</span>
        <input value={data.hmw} onChange={(e) => setData((d) => ({ ...d, hmw: e.target.value }))} placeholder="How might we ... ?" style={{ ...inputStyle, fontFamily: "'Fraunces', Georgia, serif", fontSize: 16 }} />
      </div>

      <div style={{ background: "#FFFBEB", border: "1px solid #FBBF24", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 32, fontWeight: 800, color: "#92400E", lineHeight: 1 }}>{mm}:{ss}</div>
          <div style={{ fontSize: 12, color: "#92400E", marginTop: 4 }}>
            {currentPanel >= 0 && timeLeft > 0 ? `Panel ${currentPanel + 1} of 8` : "Ready to start"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {timeLeft === 0 && <button onClick={start} style={{ ...btnStyleSecondary, background: "#C6A200", color: "#fff", border: "none" }}>▶ Start 8 min</button>}
          {timeLeft > 0 && running && <button onClick={pause} style={btnStyleSecondary}>⏸ Pause</button>}
          {timeLeft > 0 && !running && <button onClick={resume} style={btnStyleSecondary}>▶ Resume</button>}
          {timeLeft > 0 && <button onClick={stop} style={btnStyleDanger}>Stop</button>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {data.panels.map((p, i) => (
          <div key={i} style={{
            border: currentPanel === i ? "2px solid #C6A200" : "1px solid #E5E7EB",
            background: p.starred ? "#FEF3C7" : "#fff", borderRadius: 10, padding: 10, minHeight: 140,
            display: "flex", flexDirection: "column", gap: 6,
            boxShadow: currentPanel === i ? "0 0 0 4px #FDE68A66" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>#{i + 1}</span>
              <button onClick={() => updatePanel(i, { starred: !p.starred })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: p.starred ? "#F59E0B" : "#D1D5DB" }}>★</button>
            </div>
            <textarea value={p.text} onChange={(e) => updatePanel(i, { text: e.target.value })} placeholder="Sketch or write one idea..." rows={5} style={{ ...textareaStyle, flex: 1, border: "none", padding: 0, fontSize: 13, background: "transparent" }} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>Tip: on paper, sketch instead of typing. Star your top 2 when the timer ends.</div>
    </WorksheetShell>
  );
}

// ========== FEEDBACK CARDS WORKSHEET ==========
function FeedbackCardsWorksheet() {
  const empty = { prototype: "", likes: [], wishes: [], whatifs: [], notes: "" };
  const [data, setData, reset] = useWorksheet(WORKSHEET_KEYS.feedback, empty);

  const cols = [
    { key: "likes", label: "I like...", desc: "What's working?", color: "#2D9B3A", emoji: "👍" },
    { key: "wishes", label: "I wish...", desc: "What would you change?", color: "#E8890C", emoji: "🌟" },
    { key: "whatifs", label: "What if...", desc: "New possibilities?", color: "#4361EE", emoji: "💡" },
  ];

  const addNote = (key) => setData((d) => ({ ...d, [key]: [...d[key], { id: Date.now() + Math.random(), text: "" }] }));
  const updateNote = (key, id, text) => setData((d) => ({ ...d, [key]: d[key].map((n) => n.id === id ? { ...n, text } : n) }));
  const removeNote = (key, id) => setData((d) => ({ ...d, [key]: d[key].filter((n) => n.id !== id) }));

  return (
    <WorksheetShell>
      <WorksheetHeader title="Feedback Cards" subtitle="Structured feedback for one prototype" onReset={reset} accent="#0097A7" />

      <input value={data.prototype} onChange={(e) => setData((d) => ({ ...d, prototype: e.target.value }))} placeholder="Which prototype is this feedback for?" style={{ ...inputStyle, marginBottom: 16, fontFamily: "'Fraunces', Georgia, serif", fontSize: 16 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="hiab-grid-3">
        {cols.map((c) => (
          <div key={c.key} style={{ background: `${c.color}08`, border: `1px solid ${c.color}25`, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{c.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, color: c.color, fontSize: 14 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{c.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              {data[c.key].map((n) => (
                <div key={n.id} style={{ background: "#fff", borderRadius: 6, padding: "6px 8px", display: "flex", gap: 4 }}>
                  <textarea value={n.text} onChange={(e) => updateNote(c.key, n.id, e.target.value)} placeholder="..." rows={2} style={{ flex: 1, border: "none", outline: "none", resize: "none", fontSize: 13, fontFamily: "inherit", padding: 0 }} />
                  <button onClick={() => removeNote(c.key, n.id)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer" }}>×</button>
                </div>
              ))}
            </div>
            <button onClick={() => addNote(c.key)} style={{ marginTop: 8, background: "transparent", border: `1px dashed ${c.color}55`, color: c.color, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
          </div>
        ))}
      </div>

      <label style={{ display: "block", marginTop: 16 }}>
        <span style={fieldLabel}>Overall notes</span>
        <textarea value={data.notes} onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))} rows={3} style={textareaStyle} placeholder="Anything else worth capturing?" />
      </label>
    </WorksheetShell>
  );
}

// ========== SPRINT SUMMARY ONE-PAGER ==========
function SprintSummaryWorksheet() {
  const empty = { sprintName: "", date: "", topIdea: "", insights: "", nextSteps: "", owner: "" };
  const [data, setData, reset] = useWorksheet(WORKSHEET_KEYS.summary, empty);
  const [sources] = useState(loadSprintSummarySources);

  return (
    <WorksheetShell>
      <WorksheetHeader title="Sprint Summary One-Pager" subtitle="Auto-pulls from your other worksheets" onReset={reset} accent="#B45309" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }} className="hiab-grid-2">
        <label><span style={fieldLabel}>Sprint name</span><input value={data.sprintName} onChange={(e) => setData((d) => ({ ...d, sprintName: e.target.value }))} placeholder="e.g. Young Adults Sprint" style={inputStyle} /></label>
        <label><span style={fieldLabel}>Date</span><input type="date" value={data.date} onChange={(e) => setData((d) => ({ ...d, date: e.target.value }))} style={inputStyle} /></label>
      </div>

      <div style={{ background: "#FEF3C7", borderRadius: 12, padding: 14, marginBottom: 14, border: "1px solid #FBBF24" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>From your Problem Statement</div>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: "#1a1a2e" }}>{sources.hmw || "— write a problem statement to pull in your HMW —"}</div>
      </div>

      <div style={{ background: "#FEF3C7", borderRadius: 12, padding: 14, marginBottom: 14, border: "1px solid #FBBF24" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Starred ideas from Crazy 8s</div>
        {sources.topPanels.length === 0 ? (
          <div style={{ fontSize: 14, color: "#92400E", fontStyle: "italic" }}>— star your top ideas in Crazy 8s to pull them in —</div>
        ) : (
          <ul style={{ margin: "4px 0 0", paddingLeft: 18, color: "#1a1a2e", fontSize: 14 }}>
            {sources.topPanels.map((t, i) => <li key={i} style={{ marginBottom: 4 }}>{t}</li>)}
          </ul>
        )}
      </div>

      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={fieldLabel}>Top idea (the one you're moving forward with)</span>
        <textarea value={data.topIdea} onChange={(e) => setData((d) => ({ ...d, topIdea: e.target.value }))} rows={3} style={textareaStyle} placeholder="Describe the idea in 2-3 sentences." />
      </label>

      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={fieldLabel}>Three key insights</span>
        <textarea
          value={data.insights}
          onChange={(e) => setData((d) => ({ ...d, insights: e.target.value }))}
          rows={3}
          style={textareaStyle}
          placeholder={sources.insights || "What did you learn? What surprised you?"}
        />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }} className="hiab-grid-2">
        <label><span style={fieldLabel}>Immediate next steps</span><textarea value={data.nextSteps} onChange={(e) => setData((d) => ({ ...d, nextSteps: e.target.value }))} rows={3} style={textareaStyle} placeholder="What happens in the next 2 weeks?" /></label>
        <label><span style={fieldLabel}>Owner</span><input value={data.owner} onChange={(e) => setData((d) => ({ ...d, owner: e.target.value }))} placeholder="Who's driving this?" style={inputStyle} /></label>
      </div>
    </WorksheetShell>
  );
}

// ========== LEADERSHIP PROPOSAL WORKSHEET ==========
function LeadershipProposalWorksheet() {
  const empty = { title: "", problem: "", evidence: "", solution: "", served: "", impact: "", resources: "", timeline: "", success: "", ask: "" };
  const [data, setData, reset] = useWorksheet(WORKSHEET_KEYS.proposal, empty);

  const sections = [
    { key: "problem", label: "The problem", placeholder: "What real human need are we addressing?", color: "#C2185B" },
    { key: "evidence", label: "Evidence", placeholder: "Quotes, stories, observations from your empathy work.", color: "#C2185B" },
    { key: "solution", label: "Proposed solution", placeholder: "What are we proposing to do?", color: "#4361EE" },
    { key: "served", label: "Who it serves", placeholder: "Which people specifically benefit?", color: "#2D9B3A" },
    { key: "impact", label: "Expected impact", placeholder: "If this works, what changes?", color: "#2D9B3A" },
    { key: "resources", label: "Resources needed", placeholder: "Time, money, people, space.", color: "#E8890C" },
    { key: "timeline", label: "Timeline", placeholder: "When would this happen and over what period?", color: "#E8890C" },
    { key: "success", label: "What success looks like", placeholder: "How will we know it's working?", color: "#0097A7" },
    { key: "ask", label: "The specific ask", placeholder: "Be concrete. 'Approve a 6-week pilot with $200 budget.'", color: "#1D4ED8" },
  ];

  return (
    <WorksheetShell>
      <WorksheetHeader title="Leadership Proposal" subtitle="A structured pitch for pastors and elder boards" onReset={reset} accent="#1D4ED8" />

      <input value={data.title} onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))} placeholder="Proposal title" style={{ ...inputStyle, marginBottom: 14, fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 700 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map((s) => (
          <label key={s.key} style={{ display: "block" }}>
            <span style={{ ...fieldLabel, color: s.color }}>{s.label}</span>
            <textarea value={data[s.key]} onChange={(e) => setData((d) => ({ ...d, [s.key]: e.target.value }))} placeholder={s.placeholder} rows={2} style={textareaStyle} />
          </label>
        ))}
      </div>
    </WorksheetShell>
  );
}

// ========== 30-60-90 DAY PLAN WORKSHEET ==========
function ThirtySixtyNinetyWorksheet() {
  const empty = {
    "30": { goal: "", tasks: [], checkIn: "" },
    "60": { goal: "", tasks: [], checkIn: "" },
    "90": { goal: "", tasks: [], checkIn: "" },
  };
  const [data, setData, reset] = useWorksheet(WORKSHEET_KEYS.plan, empty);
  const phases = [
    { key: "30", label: "Day 1–30", subtitle: "Research, plan, assemble team", color: "#7C3AED" },
    { key: "60", label: "Day 31–60", subtitle: "Pilot or prototype in real setting", color: "#9333EA" },
    { key: "90", label: "Day 61–90", subtitle: "Evaluate, refine, decide next", color: "#A855F7" },
  ];

  const updatePhase = (key, patch) => setData((d) => ({ ...d, [key]: { ...d[key], ...patch } }));
  const addTask = (key) => updatePhase(key, { tasks: [...data[key].tasks, { id: Date.now() + Math.random(), text: "", done: false }] });
  const updateTask = (key, id, patch) => updatePhase(key, { tasks: data[key].tasks.map((t) => t.id === id ? { ...t, ...patch } : t) });
  const removeTask = (key, id) => updatePhase(key, { tasks: data[key].tasks.filter((t) => t.id !== id) });

  return (
    <WorksheetShell>
      <WorksheetHeader title="30-60-90 Day Plan" subtitle="Break your idea into monthly milestones" onReset={reset} accent="#7C3AED" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="hiab-grid-3">
        {phases.map((p) => (
          <div key={p.key} style={{ background: `${p.color}06`, border: `1px solid ${p.color}25`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 700, color: p.color, fontSize: 14 }}>{p.label}</div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 10 }}>{p.subtitle}</div>

            <span style={fieldLabel}>Goal</span>
            <textarea value={data[p.key].goal} onChange={(e) => updatePhase(p.key, { goal: e.target.value })} rows={2} style={{ ...textareaStyle, background: "#fff", border: "none", marginBottom: 10 }} placeholder="What does done look like?" />

            <span style={fieldLabel}>Tasks</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 6 }}>
              {data[p.key].tasks.map((t) => (
                <div key={t.id} style={{ display: "flex", gap: 6, alignItems: "center", background: "#fff", borderRadius: 6, padding: "4px 8px", textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.6 : 1 }}>
                  <input type="checkbox" checked={t.done} onChange={(e) => updateTask(p.key, t.id, { done: e.target.checked })} />
                  <input value={t.text} onChange={(e) => updateTask(p.key, t.id, { text: e.target.value })} placeholder="Task..." style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                  <button onClick={() => removeTask(p.key, t.id)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer" }}>×</button>
                </div>
              ))}
            </div>
            <button onClick={() => addTask(p.key)} style={{ background: "transparent", border: `1px dashed ${p.color}55`, color: p.color, borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>+ Add task</button>

            <span style={fieldLabel}>Check-in date</span>
            <input type="date" value={data[p.key].checkIn} onChange={(e) => updatePhase(p.key, { checkIn: e.target.value })} style={inputStyle} />
          </div>
        ))}
      </div>
    </WorksheetShell>
  );
}

// ========== IMPACT STORY WORKSHEET ==========
function ImpactStoryWorksheet() {
  const empty = { title: "", date: "", challenge: "", built: "", outcomes: "", lessons: "", whatNext: "", photoUrl: "" };
  const [data, setData, reset] = useWorksheet(WORKSHEET_KEYS.impact, empty);

  const sections = [
    { key: "challenge", label: "The original challenge", placeholder: "What problem were we trying to solve when we started?" },
    { key: "built", label: "What the team built/launched", placeholder: "Describe what actually happened in the real world." },
    { key: "outcomes", label: "Measurable outcomes & stories", placeholder: "Numbers, quotes, stories. What changed for real people?" },
    { key: "lessons", label: "Lessons learned", placeholder: "What surprised us? What would we do differently?" },
    { key: "whatNext", label: "What's next", placeholder: "Where do we go from here?" },
  ];

  return (
    <WorksheetShell>
      <WorksheetHeader title="Impact Story" subtitle="6-month retrospective for future inspiration" onReset={reset} accent="#059669" />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 14 }} className="hiab-grid-2">
        <label><span style={fieldLabel}>Story title</span><input value={data.title} onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))} placeholder='e.g. "How we built community for young professionals"' style={{ ...inputStyle, fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 700 }} /></label>
        <label><span style={fieldLabel}>Date</span><input type="date" value={data.date} onChange={(e) => setData((d) => ({ ...d, date: e.target.value }))} style={inputStyle} /></label>
      </div>

      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={fieldLabel}>Photo URL (optional)</span>
        <input value={data.photoUrl} onChange={(e) => setData((d) => ({ ...d, photoUrl: e.target.value }))} placeholder="Paste a link to a photo from the work" style={inputStyle} />
        {data.photoUrl && <img src={data.photoUrl} alt="" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, marginTop: 8, objectFit: "cover" }} onError={(e) => e.currentTarget.style.display = "none"} />}
      </label>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map((s) => (
          <label key={s.key}>
            <span style={{ ...fieldLabel, color: "#059669" }}>{s.label}</span>
            <textarea value={data[s.key]} onChange={(e) => setData((d) => ({ ...d, [s.key]: e.target.value }))} placeholder={s.placeholder} rows={3} style={textareaStyle} />
          </label>
        ))}
      </div>
    </WorksheetShell>
  );
}

function PersonaVisual() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24, maxWidth: 480, margin: "20px auto", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #C2185B33, #4361EE33)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
        <div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>[Persona Name]</div>
          <div style={{ fontSize: 14, color: "#888" }}>Age • Role • Background</div>
        </div>
      </div>
      {[
        { label: "Goals & Motivations", color: "#2D9B3A" },
        { label: "Pain Points & Frustrations", color: "#C2185B" },
        { label: "Faith Journey", color: "#4361EE" },
        { label: "Needs from the Church", color: "#E8890C" },
      ].map((field) => (
        <div key={field.label} style={{ padding: "10px 14px", marginBottom: 8, borderRadius: 8, background: `${field.color}08`, borderLeft: `3px solid ${field.color}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: field.color }}>{field.label}</span>
        </div>
      ))}
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
            fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 14,
            background: i < currentStep ? step.color : i === currentStep ? `${step.color}18` : "#f3f4f6",
            color: i < currentStep ? "#fff" : i === currentStep ? step.color : "#ccc",
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
            fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 15,
          }}>{step.letter}</div>
          <div>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 17, color: step.color }}>
              Step {currentStep + 1}: {step.label}
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>{step.guideText}</div>
          </div>
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.6, color: "#444" }}>{step.prompt}</p>
        <div style={{
          background: `${step.color}06`, borderRadius: 8, padding: "10px 14px",
          borderLeft: `3px solid ${step.color}40`, fontSize: 13, color: "#777", lineHeight: 1.55, fontStyle: "italic",
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
          background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Icon name="clipboard" size={22} color="#0D7C5F" />
            <h3 style={{ margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: "#1a1a2e" }}>
              {churchName}'s SCIPAB Submission
            </h3>
          </div>
          {SCIPAB_STEPS.map((step) => (
            <div key={step.key} style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: `${step.color}06`, borderLeft: `3px solid ${step.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                {step.letter} — {step.label}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#444", lineHeight: 1.6 }}>{responses[step.key]}</p>
            </div>
          ))}

          {currentStep === 6 && !isLoading && (
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => {
                const text = `${churchName}'s SCIPAB Submission\n\n` + SCIPAB_STEPS.map(s => `${s.label}: ${responses[s.key]}`).join("\n\n");
                navigator.clipboard?.writeText(text);
              }} style={{
                flex: 1, padding: "14px 20px", borderRadius: 10, border: "1px solid #e5e7eb",
                background: "#fff", color: "#555", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                📋 Copy to Clipboard
              </button>
              <button onClick={handleAIRefine} disabled={!aiConfigured} title={aiConfigured ? "" : "Configure VITE_HIAB_AI_ENDPOINT to enable AI coaching."} style={{
                flex: 2, padding: "14px 20px", borderRadius: 10, border: "none",
                background: aiConfigured ? "linear-gradient(135deg, #0D7C5F, #2D9B3A)" : "#d1d5db", color: "#fff",
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: aiConfigured ? "pointer" : "not-allowed",
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
            margin: "16px 0", padding: 20, borderRadius: 12, background: "#f0fdf4",
            border: "1px solid #bbf7d0", textAlign: "center",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }}>✨</div>
            <p style={{ margin: 0, fontSize: 15, color: "#555" }}>AI coach is reviewing your submission...</p>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
          </div>
        )}

        {aiSummary && (
          <div style={{ marginTop: 16 }}>
            {/* Hackability Score */}
            <div style={{
              background: "linear-gradient(135deg, #1a1a2e, #2d2b55)", borderRadius: 16, padding: 24,
              color: "#fff", marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Icon name="zap" size={22} color="#E8890C" />
                <h4 style={{ margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontSize: 18 }}>Hackability Score</h4>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: n <= aiSummary.hackability.score ? "#E8890C" : "rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 16,
                    color: n <= aiSummary.hackability.score ? "#fff" : "rgba(255,255,255,0.3)",
                  }}>{n}</div>
                ))}
                <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>/ 5</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>{aiSummary.hackability.feedback}</p>
            </div>

            {/* HMW Question */}
            <div style={{
              background: "#4361EE08", border: "1px solid #4361EE20", borderRadius: 14,
              padding: "20px 24px", textAlign: "center", marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: "#4361EE", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
                Your "How Might We" Question
              </div>
              <p style={{ margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.4 }}>
                {aiSummary.hmw}
              </p>
            </div>

            {/* Refined SCIPAB */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name="sparkle" size={18} color="#0D7C5F" />
                <h4 style={{ margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, color: "#1a1a2e" }}>
                  Refined SCIPAB Statement
                </h4>
              </div>
              {SCIPAB_STEPS.map((step) => (
                <div key={step.key} style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 8, background: `${step.color}04`, borderLeft: `2px solid ${step.color}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {step.label}
                  </span>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "#444", lineHeight: 1.6 }}>
                    {aiSummary.refined[step.key]}
                  </p>
                </div>
              ))}
            </div>

            <button onClick={handleReset} style={{
              marginTop: 16, width: "100%", padding: "14px 20px", borderRadius: 10,
              border: "1px solid #e5e7eb", background: "#fff", color: "#555",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Icon name="refresh" size={16} color="#555" /> Submit Another Problem
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <PhaseHeader icon="chat" title="Submit a Problem" subtitle="Use our AI-guided SCIPAB tool to articulate your church's challenge" accent={phaseColors.submit.accent} />

      {/* Hackable Problem Reminder */}
      <div style={{
        background: showHackableInfo ? "#0D7C5F08" : "linear-gradient(135deg, #0D7C5F08, #E8890C08)",
        border: `1px solid ${showHackableInfo ? "#0D7C5F25" : "#0D7C5F15"}`,
        borderRadius: 14, padding: "18px 20px", marginBottom: 24, transition: "all 0.3s",
      }}>
        <button onClick={() => setShowHackableInfo(!showHackableInfo)} style={{
          background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center",
          gap: 10, width: "100%", padding: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#E8890C15",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="zap" size={20} color="#E8890C" />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>
              What Makes a Problem "Hackable"?
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>
              Tap to {showHackableInfo ? "collapse" : "learn what kind of problems work best for a design sprint"}
            </div>
          </div>
          <span style={{ transform: showHackableInfo ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>
            <Icon name="chevronDown" size={18} color="#0D7C5F" />
          </span>
        </button>

        {showHackableInfo && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #0D7C5F15" }}>
            <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.65, color: "#444" }}>
              Not every problem is a good fit for a Hack In A Box sprint. The best "hackable" problems have these qualities:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "👤", title: "Human-Centered", desc: "The problem is about real people with real needs — not abstract organizational goals. Think about who is affected and what they experience." },
                { icon: "🎯", title: "Specific & Scoped", desc: "It's narrow enough to make meaningful progress in 3–6 hours. \"Fix our church\" is too broad. \"Help newcomers feel welcome in their first month\" is hackable." },
                { icon: "💡", title: "Open to Creative Solutions", desc: "The problem doesn't already have an obvious answer. If you already know the solution, you don't need a sprint — you need an action plan." },
                { icon: "⚡", title: "Actionable", desc: "Your church has the ability (or could develop it) to actually implement solutions. Don't hack on things completely outside your control." },
                { icon: "❤️", title: "Meaningful & Motivating", desc: "People care about this problem. It touches hearts. When you describe it, team members lean in rather than tune out." },
                { icon: "🚫", title: "Not Solution-Disguised", desc: "\"We need a new app\" isn't a problem — it's a solution. Ask WHY you think you need that app. The underlying need is the real hackable problem." },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px",
                  borderRadius: 10, background: "#fff", border: "1px solid #e5e7eb",
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  <div>
                    <strong style={{ fontSize: 14, color: "#1a1a2e" }}>{item.title}</strong>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#666", lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 14, padding: "14px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, #1a1a2e, #2d2b55)", color: "#fff",
            }}>
              <strong style={{ fontSize: 13, color: "#E8890C" }}>Quick Test ✦</strong>
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
            background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24,
            marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: "#1a1a2e" }}>
              The SCIPAB Framework
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.65, color: "#555" }}>
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
                    fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 15,
                    margin: "0 auto 6px",
                  }}>{step.letter}</div>
                  <strong style={{ fontSize: 13, color: step.color }}>{step.label}</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888", lineHeight: 1.4 }}>{step.guideText}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleStart} style={{
            width: "100%", padding: "16px 24px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #0D7C5F, #2D9B3A)", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, cursor: "pointer",
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
          background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
          overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        }}>
          {/* Chat header */}
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid #f0f0ec",
            background: "linear-gradient(135deg, #0D7C5F08, #fff)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #0D7C5F, #2D9B3A)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="sparkle" size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: 15, color: "#1a1a2e" }}>
                  SCIPAB Problem Coach
                </div>
                <div style={{ fontSize: 12, color: "#0D7C5F" }}>● Online</div>
              </div>
            </div>
            <button onClick={handleReset} style={{
              background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px",
              fontSize: 12, color: "#888", cursor: "pointer",
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
                  background: msg.role === "user" ? "#0D7C5F" : "#f3f4f6",
                  color: msg.role === "user" ? "#fff" : "#333",
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
              padding: "14px 16px", borderTop: "1px solid #f0f0ec",
              display: "flex", gap: 10, background: "#fafafa",
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
                  flex: 1, padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.5, resize: "none",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0D7C5F")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                onClick={() => { if (!churchName) handleChurchName(); else handleSubmitStep(); }}
                disabled={!inputValue.trim()}
                style={{
                  width: 44, height: 44, borderRadius: 10, border: "none",
                  background: inputValue.trim() ? "#0D7C5F" : "#e5e7eb",
                  cursor: inputValue.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  alignSelf: "flex-end", transition: "background 0.2s",
                }}
              >
                <Icon name="send" size={18} color={inputValue.trim() ? "#fff" : "#999"} />
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
    color: "#4361EE",
    prompt: "What problem did your sprint tackle? Share the 'How Might We' question and a brief description of the challenge.",
    helper: "Example: \"How might we help newcomers feel genuinely welcomed in their first month? We found that many first-time visitors never return because they don't form any personal connections on their first visit.\"",
  },
  {
    key: "evidence",
    label: "Evidence & Insights",
    letter: "2",
    color: "#C2185B",
    prompt: "What did you learn from your empathy mapping and research? What key insights emerged about the people you're trying to serve?",
    helper: "Example: \"From our empathy maps, we discovered that visitors feel overwhelmed by the size of our congregation, don't know how to get involved, and often feel invisible. Many said they wished someone had personally invited them to a small group.\"",
  },
  {
    key: "solution",
    label: "Proposed Solution",
    letter: "3",
    color: "#2D9B3A",
    prompt: "What's the idea your team developed? Describe it clearly — what is it, how does it work, and who is it for?",
    helper: "Example: \"We propose a 'Welcome Partner' program where every first-time visitor is paired with a member who contacts them within 48 hours, invites them to coffee, and personally walks them into a small group within their first month.\"",
  },
  {
    key: "impact",
    label: "Expected Impact",
    letter: "4",
    color: "#E8890C",
    prompt: "What would change if this idea worked? Who benefits, and how? Be as specific as you can about the expected outcomes.",
    helper: "Example: \"We expect to see our visitor return rate increase from ~20% to 50%+ within 6 months. More importantly, newcomers would form real relationships faster, leading to deeper engagement and spiritual growth.\"",
  },
  {
    key: "resources",
    label: "What We Need",
    letter: "5",
    color: "#7B1FA2",
    prompt: "What resources, support, or approvals do you need from leadership to move forward? Think about budget, people, time, and permissions.",
    helper: "Example: \"We need: (1) pastoral endorsement to recruit 15 Welcome Partners from existing members, (2) a $300 budget for coffee gift cards and training materials, (3) 10 minutes during a Sunday service to launch the program and recruit partners.\"",
  },
  {
    key: "plan",
    label: "Action Plan",
    letter: "6",
    color: "#0097A7",
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
      borderRadius: 14, border: "1px solid #4361EE22", marginBottom: 12,
      overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(67,97,238,0.06)",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "18px 22px 10px", display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 12, background: open ? "#4361EE06" : "transparent",
        border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 600, color: "#1a1a2e" }}>
            📝 Build a Proposal for Leadership
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4361EE", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>
              Powered by AI — builds a leadership-ready pitch from your sprint results
            </span>
          </div>
        </div>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", flexShrink: 0, marginTop: 4 }}>
          <Icon name="chevronDown" size={20} color="#4361EE" />
        </span>
      </button>
      <div style={{ padding: "6px 22px 18px" }}>
        {!open && (
          <button onClick={handleButtonStart} style={{
            marginTop: 4, width: "100%", padding: "13px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #1D4ED8, #4361EE)", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 16px rgba(29,78,216,0.25)",
          }}>
            <Icon name="sparkle" size={18} color="#fff" /> Start Building Your Proposal
          </button>
        )}
      </div>
      {open && (
        <div style={{ padding: "0 22px 22px", borderTop: "1px solid #f0f0ec" }}>
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
            fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 14,
            background: i < currentStep ? step.color : i === currentStep ? `${step.color}18` : "#f3f4f6",
            color: i < currentStep ? "#fff" : i === currentStep ? step.color : "#ccc",
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
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: step.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 15 }}>{step.letter}</div>
          <div>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 17, color: step.color }}>Step {currentStep + 1}: {step.label}</div>
          </div>
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.6, color: "#444" }}>{step.prompt}</p>
        <div style={{ background: `${step.color}06`, borderRadius: 8, padding: "10px 14px", borderLeft: `3px solid ${step.color}40`, fontSize: 13, color: "#777", lineHeight: 1.55, fontStyle: "italic" }}>{step.helper}</div>
      </div>
    );
  };

  const renderReview = () => {
    if (currentStep !== 6 && currentStep !== 7) return null;
    return (
      <div style={{ margin: "16px 0" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: "#1a1a2e" }}>
            {teamName}'s Proposal
          </h3>
          {PROPOSAL_STEPS.map((step) => (
            <div key={step.key} style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: `${step.color}06`, borderLeft: `3px solid ${step.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{step.letter} — {step.label}</div>
              <p style={{ margin: 0, fontSize: 14, color: "#444", lineHeight: 1.6 }}>{responses[step.key]}</p>
            </div>
          ))}
          {currentStep === 6 && !isLoading && (
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => {
                const text = `${teamName}'s Proposal\n\n` + PROPOSAL_STEPS.map(s => `${s.label}: ${responses[s.key]}`).join("\n\n");
                navigator.clipboard?.writeText(text);
              }} style={{
                flex: 1, padding: "14px 20px", borderRadius: 10, border: "1px solid #e5e7eb",
                background: "#fff", color: "#555", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                📋 Copy to Clipboard
              </button>
              <button onClick={handleAIRefine} disabled={!aiConfigured} title={aiConfigured ? "" : "Configure VITE_HIAB_AI_ENDPOINT to enable AI polishing."} style={{
                flex: 2, padding: "14px 20px", borderRadius: 10, border: "none",
                background: aiConfigured ? "linear-gradient(135deg, #1D4ED8, #4361EE)" : "#d1d5db", color: "#fff",
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: aiConfigured ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: aiConfigured ? "0 4px 16px rgba(29,78,216,0.3)" : "none",
              }}>✨ {aiConfigured ? "Polish with AI" : "AI Not Configured"}</button>
            </div>
          )}
        </div>

        {isLoading && (
          <div style={{ margin: "16px 0", padding: 20, borderRadius: 12, background: "#EFF6FF", border: "1px solid #BFDBFE", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }}>✨</div>
            <p style={{ margin: 0, fontSize: 15, color: "#555" }}>Crafting your leadership proposal...</p>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
          </div>
        )}

        {aiProposal && (
          <div style={{ marginTop: 16 }}>
            {/* Elevator Pitch */}
            <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d2b55)", borderRadius: 16, padding: 24, color: "#fff", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#93C5FD", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Elevator Pitch</div>
              <h3 style={{ margin: "0 0 10px", fontFamily: "'Fraunces', Georgia, serif", fontSize: 20 }}>{aiProposal.title}</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, opacity: 0.9 }}>{aiProposal.elevator_pitch}</p>
            </div>

            {/* Refined Proposal */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20 }}>
              <h4 style={{ margin: "0 0 14px", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, color: "#1a1a2e" }}>✨ Polished Proposal</h4>
              {PROPOSAL_STEPS.map((step) => (
                <div key={step.key} style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 8, background: `${step.color}04`, borderLeft: `2px solid ${step.color}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{step.label}</span>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "#444", lineHeight: 1.6 }}>{aiProposal.refined[step.key]}</p>
                </div>
              ))}
            </div>

            <button onClick={handleReset} style={{
              marginTop: 16, width: "100%", padding: "14px 20px", borderRadius: 10,
              border: "1px solid #e5e7eb", background: "#fff", color: "#555",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>🔄 Build Another Proposal</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {currentStep === -1 && (
        <div>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.65, color: "#555" }}>
              This tool walks you through six sections that together create a compelling case for your sprint idea. It's designed for presenting to pastors, elder boards, and ministry leaders.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
              {PROPOSAL_STEPS.map((step) => (
                <div key={step.key} style={{ padding: "12px 14px", borderRadius: 10, background: `${step.color}06`, border: `1px solid ${step.color}12`, textAlign: "center" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: step.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 15, margin: "0 auto 6px" }}>{step.letter}</div>
                  <strong style={{ fontSize: 13, color: step.color }}>{step.label}</strong>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleStart} style={{
            width: "100%", padding: "16px 24px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #1D4ED8, #4361EE)", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 4px 20px rgba(29,78,216,0.3)",
          }}>📝 Start Building Your Proposal</button>
        </div>
      )}

      {currentStep >= 0 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0ec", background: "linear-gradient(135deg, #1D4ED808, #fff)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #1D4ED8, #4361EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="edit" size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: 15, color: "#1a1a2e" }}>Proposal Builder</div>
                <div style={{ fontSize: 12, color: "#1D4ED8" }}>● Ready</div>
              </div>
            </div>
            <button onClick={handleReset} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#888", cursor: "pointer" }}>Start Over</button>
          </div>

          {renderStepIndicator()}

          <div style={{ padding: "16px 20px", maxHeight: 400, overflowY: "auto" }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                <div style={{
                  maxWidth: "85%", padding: "12px 16px", borderRadius: 14,
                  background: msg.role === "user" ? "#1D4ED8" : "#f3f4f6",
                  color: msg.role === "user" ? "#fff" : "#333",
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
            <div style={{ padding: "14px 16px", borderTop: "1px solid #f0f0ec", display: "flex", gap: 10, background: "#fafafa" }}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!teamName) handleTeamName(); else handleSubmitStep(); } }}
                placeholder={!teamName ? "Enter your team or sprint group name..." : `Describe: ${PROPOSAL_STEPS[currentStep]?.label}...`}
                rows={3}
                style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.5, resize: "none", outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                onClick={() => { if (!teamName) handleTeamName(); else handleSubmitStep(); }}
                disabled={!inputValue.trim()}
                style={{ width: 44, height: 44, borderRadius: 10, border: "none", background: inputValue.trim() ? "#1D4ED8" : "#e5e7eb", cursor: inputValue.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }}
              >
                <Icon name="send" size={18} color={inputValue.trim() ? "#fff" : "#999"} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== MAIN APP ==========
const GUIDED_STEPS = [
  {
    key: "welcome",
    title: "Welcome",
    time: "1 min",
    accent: "#E8890C",
  },
  {
    key: "empathize",
    title: "Empathize",
    time: "~8 min",
    accent: "#2D9B3A",
    intro: "Before you can solve a problem, you need to understand the person living it. Pick one real person in your community and capture what they say, think, do, and feel.",
    Worksheet: EmpathyMapWorksheet,
    deeper: [
      "Choose someone specific, not a category. 'Maria, age 28, new to the neighborhood' beats 'young professionals.'",
      "Listen first, write second. If you have a quote or story, capture exact words.",
      "Look for tensions — places where what they say and what they do don't match. That's where insight lives.",
    ],
  },
  {
    key: "persona",
    title: "Persona",
    time: "~5 min",
    accent: "#C2185B",
    intro: "Now turn what you learned into a vivid character. A persona makes 'the people we serve' specific enough that you can ask 'would this work for them?' before every decision.",
    Worksheet: PersonaCardWorksheet,
    deeper: [
      "Give them a name, age, and one detail that makes them real (their job, where they live, their week).",
      "Goals and pain points come from your empathy work — don't invent new ones.",
      "Keep this card visible during the rest of the sprint.",
    ],
    optional: true,
  },
  {
    key: "define",
    title: "Define",
    time: "~5 min",
    accent: "#4361EE",
    intro: "The most common reason innovation fails is solving the wrong problem. Capture the pains you observed, then reframe them as one 'How might we' question.",
    Worksheet: ProblemStatementWorksheet,
    deeper: [
      "Add pain points first, one per sticky note. Star the most urgent and actionable.",
      "Your HMW should be specific enough to act on but open enough to allow creative solutions.",
      "Bad: 'How might we leverage intergenerational mentorship frameworks…' Good: 'How might we help new visitors build real friendships in their first month?'",
    ],
  },
  {
    key: "ideate",
    title: "Ideate",
    time: "~10 min",
    accent: "#C6A200",
    intro: "Quantity over quality. Wild ideas often lead to breakthroughs. Hit the timer and sketch one idea per minute — don't go back, don't judge.",
    Worksheet: Crazy8sWorksheet,
    deeper: [
      "On paper, sketch with stick figures and arrows. On screen, type fast and short.",
      "Defer judgment. The 'bad' ideas often become stepping stones to the breakthrough.",
      "When the timer ends, star your top 2 — those carry forward to the next step.",
    ],
  },
  {
    key: "prototype",
    title: "Prototype",
    time: "~10 min",
    accent: "#0097A7",
    intro: "Pick one starred idea and make it tangible. A prototype isn't perfect — it's just real enough that someone can react to it. Then collect honest feedback in three columns.",
    Worksheet: FeedbackCardsWorksheet,
    deeper: [
      "Prototype formats: storyboard (6 panels), mock flyer, role-play, sketched landing page, schedule, or paper model.",
      "'I like' affirms what's working. 'I wish' surfaces what's not. 'What if' opens new doors.",
      "Show it to at least 2-3 people outside the team.",
    ],
  },
  {
    key: "pitch",
    title: "Pitch",
    time: "~5 min",
    accent: "#1D4ED8",
    intro: "Your idea needs a champion. This page pulls everything together into a one-pager you can hand to your pastor — and a structured proposal you can present.",
    Worksheet: SprintSummaryWorksheet,
    secondaryWorksheet: LeadershipProposalWorksheet,
    deeper: [
      "Lead with the problem and a human story, not the solution.",
      "Ask for something small and concrete: 'a 6-week pilot,' '$200 to test this,' '5 minutes on Sunday.'",
      "Small asks get faster yeses.",
    ],
  },
  {
    key: "done",
    title: "Done!",
    time: "",
    accent: "#0D7C5F",
  },
];

function StepIntro({ accent, intro }) {
  return (
    <p style={{ fontSize: 17, lineHeight: 1.7, color: "#444", margin: "0 0 24px", borderLeft: `3px solid ${accent}`, paddingLeft: 16 }}>
      {intro}
    </p>
  );
}

function readWorksheet(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}

function AIHelper({ stepKey, accent }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);

  const presets = {
    empathize: [
      { label: "Critique my empathy map", build: () => {
        const e = readWorksheet("hiab-empathy-map-v1");
        return `Here's my empathy map for "${e.subject || "an unnamed subject"}":\n\nSAYS: ${(e.says || []).map((n) => n.text).join("; ") || "(empty)"}\nTHINKS: ${(e.thinks || []).map((n) => n.text).join("; ") || "(empty)"}\nDOES: ${(e.does || []).map((n) => n.text).join("; ") || "(empty)"}\nFEELS: ${(e.feels || []).map((n) => n.text).join("; ") || "(empty)"}\n\nAct as a design thinking coach. Tell me where I'm making assumptions vs. genuinely observing. What's missing? What surprises do I see?`;
      }},
      { label: "Process an interview transcript", build: () => "Paste an interview or testimony below, then ask AI to break it into the Says/Thinks/Does/Feels quadrants for an empathy map.\n\n(Replace this with your actual transcript and edit the request.)" },
    ],
    persona: [
      { label: "Generate 2 alternative personas", build: () => {
        const e = readWorksheet("hiab-empathy-map-v1");
        const p = readWorksheet("hiab-persona-v1");
        return `Based on this empathy map and persona, generate 2 alternative personas that represent different segments I might be missing:\n\nEMPATHY: subject=${e.subject || "(none)"}; insights=${e.insights || "(none)"}\nMY PERSONA: ${p.name || "(unnamed)"}, ${p.age || "?"} — ${p.role || "no role"}. Goals: ${p.goals || "(none)"}; Pains: ${p.pains || "(none)"}\n\nGive each alternative a name, age, role, top goal, top pain, and one concrete habit that would surprise me.`;
      }},
    ],
    define: [
      { label: "Sharpen my How Might We", build: () => {
        const p = readWorksheet("hiab-problem-v1");
        const hmw = `How might we ${p.action || "..."} for ${p.who || "..."} so that ${p.outcome || "..."}?`;
        return `My current HMW: "${hmw}"\n\nGive me 3 sharper variations. Make each one specific enough to act on in a 3-hour sprint but open enough for creative solutions. Avoid jargon. Then tell me which of the 3 you'd pick and why.`;
      }},
      { label: "Is this a good problem to solve?", build: () => {
        const p = readWorksheet("hiab-problem-v1");
        const hmw = `How might we ${p.action || "..."} for ${p.who || "..."} so that ${p.outcome || "..."}?`;
        const pains = (p.pains || []).map((x) => x.text).filter(Boolean).join("; ");
        return `Evaluate my problem statement for a church design thinking sprint:\n\nHMW: "${hmw}"\nPains observed: ${pains || "(none listed)"}\n\nIs this a problem worth a 3-hour sprint? Score it 1-5 on: specificity, actionability, human-centeredness, and whether it leaves room for creative solutions. Be honest. If it's weak, tell me how to sharpen it.`;
      }},
    ],
    ideate: [
      { label: "Generate 10 more ideas", build: () => {
        const p = readWorksheet("hiab-problem-v1");
        const c = readWorksheet("hiab-crazy8s-v1");
        const hmw = c.hmw || `How might we ${p.action || "..."} for ${p.who || "..."} so that ${p.outcome || "..."}?`;
        const mine = (c.panels || []).map((x) => x.text).filter(Boolean);
        return `HMW: "${hmw}"\n\nMy current ideas:\n${mine.length ? mine.map((x, i) => `${i + 1}. ${x}`).join("\n") : "(none yet)"}\n\nGenerate 10 NEW ideas I haven't thought of. Push for wild, unexpected combinations. Include at least 2 that sound impossible at first.`;
      }},
      { label: "Combine ideas in fresh ways", build: () => {
        const c = readWorksheet("hiab-crazy8s-v1");
        const starred = (c.panels || []).filter((x) => x.starred && x.text).map((x) => x.text);
        return `My starred Crazy 8s ideas:\n${starred.length ? starred.map((x, i) => `${i + 1}. ${x}`).join("\n") : "(none starred yet — star some first)"}\n\nSuggest 3 hybrid ideas that combine elements of two or more of mine. What's the strongest combination, and why?`;
      }},
    ],
    prototype: [
      { label: "Suggest a prototype format", build: () => {
        const c = readWorksheet("hiab-crazy8s-v1");
        const starred = (c.panels || []).filter((x) => x.starred && x.text).map((x) => x.text);
        const top = starred[0] || "(nothing starred yet)";
        return `My top idea: "${top}"\n\nWhich prototype format would I learn the most from in 30 minutes? Options: storyboard, mock flyer, role-play, sketched landing page, schedule plan, or paper model. Recommend one and tell me exactly what to build.`;
      }},
      { label: "Stress-test the idea", build: () => {
        const c = readWorksheet("hiab-crazy8s-v1");
        const starred = (c.panels || []).filter((x) => x.starred && x.text).map((x) => x.text);
        const top = starred[0] || "(nothing starred yet)";
        return `My top idea: "${top}"\n\nAct as a skeptical 60-year-old long-time member of my church. What concerns would you raise? What's likely to go wrong? Where might this fail? Be specific and respectful.`;
      }},
    ],
    pitch: [
      { label: "Critique my proposal", build: () => {
        const prop = readWorksheet("hiab-proposal-v1");
        return `Critique my leadership proposal as if you were a pastor with limited time and a healthy skepticism toward new programs:\n\nTitle: ${prop.title || "(none)"}\nProblem: ${prop.problem || "(empty)"}\nEvidence: ${prop.evidence || "(empty)"}\nSolution: ${prop.solution || "(empty)"}\nThe ask: ${prop.ask || "(empty)"}\n\nWhere is this weak? What would make me say yes faster? Be direct.`;
      }},
      { label: "Write the elevator pitch", build: () => {
        const sum = readWorksheet("hiab-summary-v1");
        const prop = readWorksheet("hiab-proposal-v1");
        return `Based on this sprint summary, write a 60-second elevator pitch I could deliver to my pastor in the hallway:\n\nTop idea: ${sum.topIdea || "(empty)"}\nProblem: ${prop.problem || "(empty)"}\nAsk: ${prop.ask || "(empty)"}\n\nFormat as something a normal person would say out loud. No jargon. Lead with a human story or concrete observation.`;
      }},
    ],
  };

  const stepPresets = presets[stepKey] || [];
  if (stepPresets.length === 0) return null;

  const ask = async (build) => {
    const userMessage = build();
    setLoading(true);
    const result = await callAI({
      system: "You are a sharp, kind design thinking coach for church lay leaders. Be concrete, specific, and brief. Use plain English. Never preachy. Bullet points and short paragraphs only.",
      messages: [{ role: "user", content: userMessage }],
      max_tokens: 700,
    });
    setDemo(result.demo);
    setResponses((prev) => [...prev, { q: userMessage, a: result.text }]);
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 24, marginBottom: 16, borderRadius: 12, border: `1px solid ${accent}30`, background: `${accent}05`, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>🤖</span>
        <div style={{ fontWeight: 700, color: accent, fontSize: 14 }}>AI Thinking Partner</div>
        {demo && <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>DEMO</span>}
      </div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
        Stuck or want a second perspective? Click a prompt — AI uses what you've written so far.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {stepPresets.map((p, i) => (
          <button key={i} onClick={() => ask(p.build)} disabled={loading} style={{
            background: "#fff", border: `1px solid ${accent}40`, color: accent,
            borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 500,
            cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
          }}>✨ {p.label}</button>
        ))}
      </div>
      {loading && <div style={{ marginTop: 12, fontSize: 13, color: "#999" }}>Thinking...</div>}
      {responses.map((r, i) => (
        <div key={i} style={{ marginTop: 14, padding: "12px 14px", background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, color: "#999", marginBottom: 6, fontStyle: "italic" }}>You asked AI to help with this step.</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "#1a1a2e", whiteSpace: "pre-wrap" }}>{r.a}</div>
        </div>
      ))}
    </div>
  );
}

function DeeperGuidance({ items, accent }) {
  const [open, setOpen] = useState(false);
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 24, marginBottom: 16, borderRadius: 12, border: `1px dashed ${accent}55`, background: `${accent}06`, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "12px 18px", background: "transparent", border: "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", fontFamily: "inherit", color: accent, fontWeight: 600, fontSize: 14,
      }}>
        <span>💡 Need more guidance?</span>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && (
        <ul style={{ margin: 0, padding: "0 18px 16px 36px", color: "#444", fontSize: 14, lineHeight: 1.7 }}>
          {items.map((it, i) => <li key={i} style={{ marginBottom: 6 }}>{it}</li>)}
        </ul>
      )}
    </div>
  );
}

function PrintableSection({ title, children }) {
  return (
    <section style={{ breakInside: "avoid", marginBottom: 24 }}>
      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: "0 0 10px", color: "#1a1a2e" }}>{title}</h2>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, background: "#fff" }}>{children}</div>
    </section>
  );
}

function PrintableValue({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: "#1f2937", whiteSpace: "pre-wrap" }}>{value || "Not captured yet."}</div>
    </div>
  );
}

function PrintableLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
      {children}
    </div>
  );
}

function PrintableList({ items }) {
  const visible = (items || []).filter(Boolean);
  if (visible.length === 0) return <div style={{ fontSize: 14, color: "#6b7280" }}>Not captured yet.</div>;
  return (
    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: "#1f2937" }}>
      {visible.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function PrintPacket({ onClose }) {
  const [snapshot] = useState(loadWorksheetSnapshot);
  const hmw = buildHmw(snapshot.problem);
  const starredIdeas = (snapshot.crazy8s.panels || []).filter((p) => p.starred && p.text).map((p) => p.text);
  const painPoints = (snapshot.problem.pains || []).filter((p) => p.text).map((p) => `${p.starred ? "★ " : ""}${p.text}`);
  const planPhases = ["30", "60", "90"];

  useEffect(() => {
    document.body.classList.add("hiab-printing");
    return () => document.body.classList.remove("hiab-printing");
  }, []);

  return (
    <div className="hiab-print-packet" style={{
      position: "fixed", inset: 0, zIndex: 200, overflowY: "auto",
      background: "#f8f8f6", padding: "24px 20px 48px",
    }}>
      <style>{`
        @media print {
          body.hiab-printing * { visibility: hidden !important; }
          body.hiab-printing .hiab-print-packet,
          body.hiab-printing .hiab-print-packet * { visibility: visible !important; }
          body.hiab-printing .hiab-print-packet {
            position: absolute !important;
            inset: 0 !important;
            overflow: visible !important;
            background: #fff !important;
            padding: 0 !important;
          }
          .hiab-print-actions { display: none !important; }
        }
      `}</style>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div className="hiab-print-actions" style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={onClose} style={btnStyleSecondary}>Close</button>
          <button onClick={() => window.print()} style={{ ...btnStyleSecondary, background: "#0D7C5F", color: "#fff", border: "none" }}>Print packet</button>
        </div>

        <header style={{ marginBottom: 24, borderBottom: "2px solid #1a1a2e", paddingBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#E8890C", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Hack In A Box Sprint Packet</div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, margin: "4px 0", color: "#1a1a2e" }}>
            {snapshot.summary.sprintName || "Sprint Summary"}
          </h1>
          <div style={{ fontSize: 14, color: "#6b7280" }}>{snapshot.summary.date || "Date not captured"}</div>
        </header>

        <PrintableSection title="Problem Definition">
          <PrintableValue label="How Might We" value={hmw} />
          <PrintableLabel>Pain Points</PrintableLabel>
          <PrintableList items={painPoints} />
        </PrintableSection>

        <PrintableSection title="Empathy Map">
          <PrintableValue label="Subject" value={snapshot.empathy.subject} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["says", "thinks", "does", "feels"].map((key) => (
              <div key={key}>
                <PrintableLabel>{key}</PrintableLabel>
                <PrintableList items={(snapshot.empathy[key] || []).map((n) => n.text).filter(Boolean)} />
              </div>
            ))}
          </div>
          <PrintableValue label="Insights" value={snapshot.empathy.insights} />
        </PrintableSection>

        <PrintableSection title="Persona">
          <PrintableValue label="Name" value={snapshot.persona.name} />
          <PrintableValue label="Role / Age" value={[snapshot.persona.role, snapshot.persona.age].filter(Boolean).join(" · ")} />
          <PrintableValue label="Backstory" value={snapshot.persona.backstory} />
          <PrintableValue label="Goals" value={snapshot.persona.goals} />
          <PrintableValue label="Pain Points" value={snapshot.persona.pains} />
          <PrintableValue label="Needs from the Church" value={snapshot.persona.needs} />
        </PrintableSection>

        <PrintableSection title="Ideas & Feedback">
          <PrintableLabel>Starred Crazy 8s Ideas</PrintableLabel>
          <PrintableList items={starredIdeas} />
          <PrintableValue label="Prototype" value={snapshot.feedback.prototype} />
          <PrintableLabel>I Like</PrintableLabel>
          <PrintableList items={(snapshot.feedback.likes || []).map((n) => n.text).filter(Boolean)} />
          <PrintableLabel>I Wish</PrintableLabel>
          <PrintableList items={(snapshot.feedback.wishes || []).map((n) => n.text).filter(Boolean)} />
          <PrintableLabel>What If</PrintableLabel>
          <PrintableList items={(snapshot.feedback.whatifs || []).map((n) => n.text).filter(Boolean)} />
        </PrintableSection>

        <PrintableSection title="Pitch & Next Steps">
          <PrintableValue label="Top Idea" value={snapshot.summary.topIdea} />
          <PrintableValue label="Key Insights" value={snapshot.summary.insights || snapshot.empathy.insights} />
          <PrintableValue label="Immediate Next Steps" value={snapshot.summary.nextSteps} />
          <PrintableValue label="Owner" value={snapshot.summary.owner} />
          <PrintableValue label="Leadership Ask" value={snapshot.proposal.ask} />
        </PrintableSection>

        <PrintableSection title="30-60-90 Day Plan">
          {planPhases.map((phase) => (
            <div key={phase} style={{ marginBottom: 14 }}>
              <PrintableValue label={`Day ${phase}`} value={snapshot.plan[phase]?.goal} />
              <PrintableList items={(snapshot.plan[phase]?.tasks || []).map((task) => `${task.done ? "[x]" : "[ ]"} ${task.text}`).filter((text) => text.trim() !== "[ ]" && text.trim() !== "[x]")} />
            </div>
          ))}
        </PrintableSection>

        <PrintableSection title="Impact Story">
          <PrintableValue label="Title" value={snapshot.impact.title} />
          <PrintableValue label="Challenge" value={snapshot.impact.challenge} />
          <PrintableValue label="What We Built" value={snapshot.impact.built} />
          <PrintableValue label="Outcomes" value={snapshot.impact.outcomes} />
          <PrintableValue label="Lessons" value={snapshot.impact.lessons} />
          <PrintableValue label="What's Next" value={snapshot.impact.whatNext} />
        </PrintableSection>
      </div>
    </div>
  );
}

function GuidedFlow({ setMode }) {
  const [stepIdx, setStepIdx] = useState(() => {
    const saved = parseInt(readStoredString("hiab-guided-step", "0"), 10);
    return Number.isNaN(saved) ? 0 : saved;
  });
  const [printPacketOpen, setPrintPacketOpen] = useState(false);
  useEffect(() => {
    writeStoredString("hiab-guided-step", String(stepIdx));
  }, [stepIdx]);

  const step = GUIDED_STEPS[stepIdx];
  const scrollRef = useRef(null);
  const goTo = (i) => {
    setStepIdx(i);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };
  const next = () => stepIdx < GUIDED_STEPS.length - 1 && goTo(stepIdx + 1);
  const back = () => stepIdx > 0 && goTo(stepIdx - 1);

  const isWelcome = step.key === "welcome";
  const isDone = step.key === "done";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8f8f6" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e8e8e4", padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setMode("picker")} title="Back to mode picker" style={{
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
            width: 36, height: 36, fontSize: 16, cursor: "pointer", fontFamily: "inherit",
          }}>←</button>
          <div>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 900, color: "#1a1a2e", lineHeight: 1 }}>Hack In A Box</div>
            <div style={{ fontSize: 10, color: "#E8890C", fontWeight: 600, letterSpacing: 0.5, marginTop: 2 }}>SOLO SPRINT</div>
          </div>
        </div>
        <button onClick={() => setMode("reference")} style={{
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
          padding: "6px 12px", fontSize: 12, color: "#666", cursor: "pointer", fontFamily: "inherit",
        }}>Switch to Reference Mode ↗</button>
      </div>

      {/* Stepper */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e4", padding: "16px 20px", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: "max-content" }}>
          {GUIDED_STEPS.map((s, i) => {
            const active = i === stepIdx;
            const done = i < stepIdx;
            const dotColor = active ? s.accent : done ? "#9CA3AF" : "#E5E7EB";
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => goTo(i)} style={{
                  display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: active ? s.accent : done ? "#9CA3AF" : "#fff",
                    border: `2px solid ${dotColor}`,
                    color: active || done ? "#fff" : "#9CA3AF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif",
                    transition: "all 0.2s",
                  }}>{done ? "✓" : i + 1}</div>
                  <span style={{
                    fontSize: 13, fontWeight: active ? 700 : 500,
                    color: active ? s.accent : done ? "#6B7280" : "#9CA3AF",
                    whiteSpace: "nowrap",
                  }}>{s.title}</span>
                </button>
                {i < GUIDED_STEPS.length - 1 && <div style={{ width: 24, height: 2, background: done ? "#9CA3AF" : "#E5E7EB" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "32px 20px 100px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          {isWelcome && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E8890C12", padding: "6px 16px", borderRadius: 40, color: "#E8890C", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, marginBottom: 20, textTransform: "uppercase" }}>
                ✦ A 40-minute journey
              </div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "#1a1a2e", lineHeight: 1.1, margin: "0 0 16px" }}>
                Let's run your sprint, together.
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "#555", maxWidth: 560, margin: "0 auto 32px" }}>
                We'll walk through six steps. Each one has a short intro and a worksheet you fill out as you go. Everything auto-saves — close the tab and come back anytime. By the end, you'll have a pitch ready to hand to your pastor.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, maxWidth: 640, margin: "0 auto 32px", textAlign: "left" }}>
                {GUIDED_STEPS.slice(1, -1).map((s, i) => (
                  <div key={s.key} style={{ padding: "12px 14px", background: "#fff", borderRadius: 10, borderLeft: `3px solid ${s.accent}` }}>
                    <div style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>STEP {i + 1}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginTop: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: s.accent, marginTop: 2 }}>{s.time}</div>
                  </div>
                ))}
              </div>

              <button onClick={next} style={{
                background: "#E8890C", color: "#fff", border: "none", borderRadius: 12,
                padding: "14px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", boxShadow: "0 4px 16px rgba(232, 137, 12, 0.3)",
              }}>Start with Empathize →</button>
              <div style={{ fontSize: 12, color: "#999", marginTop: 12 }}>
                Prefer to browse the full playbook? <button onClick={() => setMode("reference")} style={{ background: "none", border: "none", color: "#E8890C", textDecoration: "underline", cursor: "pointer", fontSize: 12, padding: 0, fontFamily: "inherit" }}>Switch to Reference Mode</button>
              </div>
            </div>
          )}

          {isDone && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 900, color: "#1a1a2e", margin: "0 0 12px" }}>
                You did it.
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "#555", maxWidth: 520, margin: "0 auto 32px" }}>
                You just ran a complete design thinking sprint. Your pitch, plan, and worksheets are all saved. Print your Sprint Summary, share it with leadership, and start the real work.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                <button onClick={() => setPrintPacketOpen(true)} style={{ background: "#0D7C5F", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>🖨️ Print everything</button>
                <button onClick={() => goTo(0)} style={{ background: "#fff", color: "#1a1a2e", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Start over</button>
              </div>
              <div style={{ fontSize: 14, color: "#666", marginTop: 24 }}>
                Want to revisit a step? <button onClick={() => setMode("reference")} style={{ background: "none", border: "none", color: "#E8890C", textDecoration: "underline", cursor: "pointer", fontSize: 14, padding: 0, fontFamily: "inherit" }}>Open the full Reference</button>
              </div>
            </div>
          )}

          {!isWelcome && !isDone && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: step.accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                    Step {stepIdx} of {GUIDED_STEPS.length - 2}{step.optional && " · optional"}
                  </div>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 800, color: "#1a1a2e", margin: "4px 0 0" }}>{step.title}</h1>
                </div>
                <div style={{ fontSize: 13, color: "#999" }}>{step.time}</div>
              </div>

              <StepIntro accent={step.accent} intro={step.intro} />

              {step.Worksheet && <step.Worksheet />}
              {step.secondaryWorksheet && <step.secondaryWorksheet />}

              <AIHelper stepKey={step.key} accent={step.accent} />
              <DeeperGuidance items={step.deeper} accent={step.accent} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      {!isWelcome && (
        <div style={{
          background: "#fff", borderTop: "1px solid #e8e8e4", padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <button onClick={back} style={{
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
            padding: "10px 18px", fontSize: 14, color: "#555", cursor: "pointer", fontFamily: "inherit",
          }}>← Back</button>
          <div style={{ fontSize: 12, color: "#999" }}>
            {step.optional && <button onClick={next} style={{ background: "none", border: "none", color: "#999", textDecoration: "underline", cursor: "pointer", fontSize: 12, padding: 0, fontFamily: "inherit" }}>Skip this step</button>}
          </div>
          {!isDone ? (
            <button onClick={next} style={{
              background: step.accent, color: "#fff", border: "none", borderRadius: 10,
              padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>
              {stepIdx === GUIDED_STEPS.length - 2 ? "Finish" : "Next"} →
            </button>
          ) : <div />}
        </div>
      )}
      {printPacketOpen && <PrintPacket onClose={() => setPrintPacketOpen(false)} />}
    </div>
  );
}

// ========== SHARED: AI call helper ==========
async function callAI({ system, messages, max_tokens = 800 }) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages, max_tokens }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "AI request failed");
    return { text: data.content || "", demo: !!data.demo };
  } catch (err) {
    return {
      text: `_AI is unavailable right now (${err.message}). Once you deploy this to Vercel and set GEMINI_API_KEY, this will return live responses._`,
      demo: true,
    };
  }
}

// ========== SHARED: top header for non-picker modes ==========
function ModeTopBar({ title, subtitle, accent, onHome }) {
  return (
    <div style={{
      background: "#fff", borderBottom: "1px solid #e8e8e4", padding: "12px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onHome} title="Back to mode picker" style={{
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
          width: 36, height: 36, fontSize: 16, cursor: "pointer", fontFamily: "inherit",
        }}>←</button>
        <div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 900, color: "#1a1a2e", lineHeight: 1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 10, color: accent, fontWeight: 600, letterSpacing: 0.5, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

// ========== MODE PICKER LANDING ==========
function ModePicker({ setMode }) {
  const cards = [
    {
      key: "solo",
      label: "Solo Sprint",
      time: "~40 min · structured",
      accent: "#E8890C",
      desc: "Walk through all 6 steps for your specific challenge. Save multiple challenges. AI thinking-partner nudges at each step.",
      bestFor: "I want the full design thinking experience for one focused challenge.",
      icon: "🧭",
    },
    {
      key: "mini",
      label: "Mini-Modules",
      time: "10–20 min each",
      accent: "#0097A7",
      desc: "Pick the one tool you need today. Sharpen a problem statement, brainstorm ideas, or write a pitch — independent of the full sprint.",
      bestFor: "I have 15 minutes and want to work on one specific thing.",
      icon: "🧩",
    },
    {
      key: "partner",
      label: "AI Thinking Partner",
      time: "~15 min · chat",
      accent: "#7C3AED",
      desc: "Skip the worksheets. A conversational AI coach interviews you, asks follow-up questions, and synthesizes everything into a ready-to-use brief.",
      bestFor: "I want to talk it out and have AI organize my thinking.",
      icon: "💬",
    },
    {
      key: "reference",
      label: "Playbook & Resource Kit for Facilitators",
      time: "browse anytime",
      accent: "#1a1a2e",
      desc: "The full playbook with every section, accordion, and facilitator note. Best for people running a HIAB with a group.",
      bestFor: "I'm facilitating a sprint and need the complete guide.",
      icon: "📚",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f6", fontFamily: "'DM Sans', sans-serif", overflowY: "auto" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E8890C12", padding: "8px 18px", borderRadius: 40, color: "#E8890C", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, marginBottom: 20, textTransform: "uppercase" }}>
            ✦ By Indigitous US
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 900, color: "#1a1a2e", lineHeight: 1.05, margin: "0 0 12px" }}>Hack In A Box</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "#555", maxWidth: 560, margin: "0 auto 8px" }}>
            Design thinking sprints for churches and faith-based organizations.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#888", maxWidth: 560, margin: "0 auto" }}>
            Choose how you want to work — alone or with a team, in 15 minutes or 40.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {cards.map((c) => (
            <button key={c.key} onClick={() => setMode(c.key)} style={{
              background: "#fff", border: `1px solid ${c.accent}25`,
              borderRadius: 16, padding: "24px 22px", textAlign: "left",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: `0 2px 12px ${c.accent}10`, transition: "all 0.2s",
              display: "flex", flexDirection: "column", gap: 10,
            }} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${c.accent}25`; }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 2px 12px ${c.accent}10`; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.accent}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: c.accent, fontWeight: 600, marginTop: 2 }}>{c.time}</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#555" }}>{c.desc}</p>
              <div style={{ fontSize: 13, color: c.accent, fontStyle: "italic", marginTop: "auto", paddingTop: 8 }}>
                "{c.bestFor}"
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.accent, fontWeight: 600, fontSize: 14, marginTop: 4 }}>
                Start {c.label} →
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40, fontSize: 13, color: "#999" }}>
          Auto-saves to this browser · Switch modes anytime
        </div>
      </div>
    </div>
  );
}

// ========== MODE: MINI-MODULES ==========
const MINI_MODULES = [
  {
    key: "problem",
    title: "Sharpen Your Problem",
    time: "10 min",
    accent: "#4361EE",
    icon: "🎯",
    desc: "Turn a vague frustration into a clear 'How might we' question your team can act on.",
    Worksheet: ProblemStatementWorksheet,
    intro: "The most common reason innovation fails is solving the wrong problem. Capture the pains you observe, star the most urgent, then reframe them as one focused question.",
  },
  {
    key: "empathy",
    title: "Build Empathy",
    time: "15 min",
    accent: "#2D9B3A",
    icon: "❤️",
    desc: "Walk in someone's shoes. Capture what they say, think, do, and feel — then surface insights.",
    Worksheet: EmpathyMapWorksheet,
    intro: "Pick one specific person in your community. Listen to them, read what they've written, or recall what you know. Then map their world.",
  },
  {
    key: "persona",
    title: "Build a Persona",
    time: "10 min",
    accent: "#C2185B",
    icon: "👤",
    desc: "Make 'the people we serve' specific enough that you can ask 'would this work for them?'",
    Worksheet: PersonaCardWorksheet,
    intro: "Give them a name, age, and one detail that makes them real. Pull goals and pains from your empathy work. Keep this card visible.",
  },
  {
    key: "ideate",
    title: "Brainstorm Ideas",
    time: "15 min",
    accent: "#C6A200",
    icon: "💡",
    desc: "Quantity over quality. Run a timed 8-minute sprint with one idea per minute.",
    Worksheet: Crazy8sWorksheet,
    intro: "Wild ideas often lead to breakthroughs. The timer auto-advances every minute. Don't go back, don't judge. Star your top 2 at the end.",
  },
  {
    key: "pitch",
    title: "Pitch to Leadership",
    time: "20 min",
    accent: "#1D4ED8",
    icon: "📝",
    desc: "Turn your idea into a structured proposal pastors and elder boards can say yes to.",
    Worksheet: LeadershipProposalWorksheet,
    intro: "Lead with the problem and a human story. Ask for something small and concrete — 'a 6-week pilot,' '$200 to test,' '5 minutes on Sunday.'",
  },
];

function MiniModules({ setMode }) {
  const [active, setActive] = useState(null);
  const mod = MINI_MODULES.find((m) => m.key === active);

  if (mod) {
    const W = mod.Worksheet;
    return (
      <div style={{ minHeight: "100vh", background: "#f8f8f6", display: "flex", flexDirection: "column" }}>
        <ModeTopBar title="Mini-Modules" subtitle={mod.title.toUpperCase()} accent={mod.accent} onHome={() => setMode("picker")} />
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 80px" }}>
          <div style={{ maxWidth: 740, margin: "0 auto" }}>
            <button onClick={() => setActive(null)} style={{ background: "none", border: "none", color: mod.accent, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 16 }}>← All modules</button>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 32, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>{mod.icon} {mod.title}</h1>
              <div style={{ fontSize: 13, color: "#999" }}>{mod.time}</div>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#555", margin: "12px 0 0", borderLeft: `3px solid ${mod.accent}`, paddingLeft: 16 }}>{mod.intro}</p>
            <W />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f6", display: "flex", flexDirection: "column" }}>
      <ModeTopBar title="Mini-Modules" subtitle="PICK A TOOL" accent="#0097A7" onHome={() => setMode("picker")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 20px 80px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 800, color: "#1a1a2e", margin: "0 0 8px" }}>What do you need today?</h1>
          <p style={{ fontSize: 16, color: "#666", marginBottom: 28 }}>Pick one standalone tool. Each one is self-contained and saves automatically. Mix and match across visits.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MINI_MODULES.map((m) => (
              <button key={m.key} onClick={() => setActive(m.key)} style={{
                background: "#fff", border: `1px solid ${m.accent}22`, borderRadius: 14,
                padding: "18px 20px", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                display: "flex", alignItems: "center", gap: 16, boxShadow: `0 1px 6px ${m.accent}08`,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${m.accent}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>{m.title}</span>
                    <span style={{ fontSize: 12, color: m.accent, fontWeight: 600 }}>{m.time}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666", lineHeight: 1.55 }}>{m.desc}</p>
                </div>
                <div style={{ color: m.accent, fontSize: 20 }}>→</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 28, padding: "16px 20px", background: "#fff", border: "1px dashed #d1d5db", borderRadius: 12, fontSize: 14, color: "#666" }}>
            Want the full structured experience instead? <button onClick={() => setMode("solo")} style={{ background: "none", border: "none", color: "#E8890C", textDecoration: "underline", cursor: "pointer", fontFamily: "inherit", fontSize: 14, padding: 0 }}>Try Solo Sprint →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MODE: AI THINKING PARTNER ==========
// ========== VOICE: speech recognition + synthesis hook ==========
function useVoice({ onTranscript, onSpeakEnd } = {}) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState({ recog: false, synth: false });
  const recogRef = useRef(null);

  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    const synth = typeof window !== "undefined" && window.speechSynthesis;
    setSupported({ recog: !!SR, synth: !!synth });
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

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = String(text || "").replace(/[*_`#]/g, "").replace(/✦|🤖|🎯|💡|👤|❤️|📝|🧩|🧭|💬|📚/g, "");
      const u = new SpeechSynthesisUtterance(clean);
      u.rate = 1.0;
      u.pitch = 1.0;
      u.onstart = () => setSpeaking(true);
      u.onend = () => { setSpeaking(false); if (onSpeakEnd) onSpeakEnd(); };
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch {
      setSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
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
        { role: "assistant", content: "Hi — I'm here to help you think through a challenge your church is facing. No worksheets, no formal process. Just tell me what's on your mind.\n\nWant to talk it out in the car? Tap 🎤 to speak, or turn on 🚗 Hands-free mode to have a real conversation.\n\nWhat's a ministry situation you've been turning over in your head lately?" },
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
    <div style={{ minHeight: "100vh", height: "100vh", background: "#f8f8f6", display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes hiab-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.6; } }`}</style>
      <ModeTopBar title="AI Thinking Partner" subtitle="CHAT-BASED COACH" accent="#7C3AED" onHome={() => setMode("picker")} />

      {demo && (
        <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FBBF24", padding: "8px 20px", fontSize: 12, color: "#92400E", textAlign: "center" }}>
          Running in <strong>demo mode</strong> — responses are canned examples. Deploy to Vercel with <code>GEMINI_API_KEY</code> for live AI.
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? "#7C3AED" : "#fff",
              color: m.role === "user" ? "#fff" : "#1a1a2e",
              padding: "12px 16px", borderRadius: 14,
              border: m.role === "assistant" ? "1px solid #e5e7eb" : "none",
              fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}>{m.content}</div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", padding: "12px 16px", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", color: "#999", fontSize: 14 }}>
              Thinking<span className="hiab-dots">...</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "#fff", borderTop: "1px solid #e8e8e4", padding: "12px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Voice control row */}
          {(voice.supported.recog || voice.supported.synth) && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap", fontSize: 12, color: "#666" }}>
              {voice.supported.synth && (
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
                  🔊 Auto-speak replies
                </label>
              )}
              {voice.supported.recog && voice.supported.synth && (
                <button onClick={toggleHandsFree} style={{
                  background: handsFree ? "#7C3AED" : "#fff",
                  color: handsFree ? "#fff" : "#7C3AED",
                  border: "1px solid #7C3AED", borderRadius: 20,
                  padding: "4px 12px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>{handsFree ? "🚗 Hands-free ON" : "🚗 Hands-free mode"}</button>
              )}
              {voice.speaking && (
                <button onClick={voice.stopSpeaking} style={{ background: "none", border: "none", color: "#7C3AED", cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline", fontFamily: "inherit" }}>⏹ Stop speaking</button>
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
              <button onClick={micPress} title={voice.listening ? "Stop listening" : "Speak instead of type"} style={{
                background: voice.listening ? "#DC2626" : "#fff",
                color: voice.listening ? "#fff" : "#7C3AED",
                border: `1px solid ${voice.listening ? "#DC2626" : "#7C3AED"}`,
                borderRadius: 12, width: 48, height: 48, fontSize: 20,
                cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
              }}>{voice.listening ? "⏺" : "🎤"}</button>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={voice.listening ? "Listening..." : "Type or tap 🎤 to speak (Enter to send)"}
              rows={2}
              disabled={loading}
              style={{
                flex: 1, padding: "10px 14px", fontSize: 15, borderRadius: 12,
                border: "1px solid #d1d5db", fontFamily: "inherit", resize: "none",
                outline: "none", lineHeight: 1.5,
              }}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()} style={{
              background: loading || !input.trim() ? "#d1d5db" : "#7C3AED",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "12px 20px", fontSize: 15, fontWeight: 600,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>Send</button>
          </div>
        </div>
        <div style={{ maxWidth: 720, margin: "8px auto 0", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#999" }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline", fontFamily: "inherit" }}>Start over</button>
          <span>{messages.length - 1} exchanges</span>
        </div>
      </div>
    </div>
  );
}

export default function HackInABox() {
  const [mode, setMode] = useState(() => {
    const stored = readStoredString("hiab-mode", "picker");
    if (stored === "guided") return "solo"; // migrate legacy key
    if (["picker", "solo", "mini", "partner", "reference"].includes(stored)) return stored;
    return "picker";
  });
  useEffect(() => {
    writeStoredString("hiab-mode", mode);
  }, [mode]);

  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navigate = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  if (mode === "picker") return <ModePicker setMode={setMode} />;
  if (mode === "solo") return <GuidedFlow setMode={setMode} />;
  if (mode === "mini") return <MiniModules setMode={setMode} />;
  if (mode === "partner") return <ThinkingPartner setMode={setMode} />;

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E8890C12", padding: "8px 18px", borderRadius: 40, color: "#E8890C", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, marginBottom: 24, textTransform: "uppercase" }}>
              ✦ By Indigitous US
            </div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 900, color: "#1a1a2e", lineHeight: 1.1, margin: "0 0 8px" }}>Hack In A Box</h1>
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 300, color: "#E8890C", margin: "0 0 24px", fontStyle: "italic" }}>Playbook &amp; Resource Kit</p>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "#555", maxWidth: 580, margin: "0 auto 40px" }}>
              Everything your church needs to run a Design Thinking Brainstorm Sprint. Discover fresh, faith-driven strategies to foster unity, engage your community, and create lasting kingdom impact.
            </p>

            {/* Submit CTA */}
            <div style={{
              background: "linear-gradient(135deg, #0D7C5F, #2D9B3A)", borderRadius: 16, padding: "24px 28px",
              color: "#fff", maxWidth: 580, margin: "0 auto 32px", textAlign: "left",
              display: "flex", alignItems: "center", gap: 20, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(13,124,95,0.25)",
            }} onClick={() => navigate("submit")}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon name="chat" size={28} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontFamily: "'Fraunces', Georgia, serif", fontSize: 19 }}>
                  Ready to Submit a Problem?
                </h3>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>
                  Use our AI-guided SCIPAB tool to articulate your church's challenge and get instant feedback on whether it's ready for a design sprint.
                </p>
              </div>
              <Icon name="arrow" size={22} color="#fff" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, maxWidth: 720, margin: "0 auto 48px", textAlign: "left" }}>
              {[
                { icon: "target", title: "Define Real Problems", desc: "Learn to identify and articulate the challenges your church and community truly face.", color: "#4361EE" },
                { icon: "heart", title: "Build Deep Empathy", desc: "Understand the people you serve through empathy maps and persona creation.", color: "#C2185B" },
                { icon: "lightbulb", title: "Generate Bold Ideas", desc: "Use structured brainstorming to unlock creative, God-inspired solutions.", color: "#E8890C" },
                { icon: "cube", title: "Prototype & Test", desc: "Turn ideas into tangible plans your church can implement immediately.", color: "#0097A7" },
              ].map((card) => (
                <div key={card.title} style={{ background: "#fff", borderRadius: 14, padding: "22px 20px", border: `1px solid ${card.color}15`, boxShadow: `0 2px 16px ${card.color}08` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${card.color}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Icon name={card.icon} size={22} color={card.color} />
                  </div>
                  <h3 style={{ margin: "0 0 6px", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, color: "#1a1a2e" }}>{card.title}</h3>
                  <p style={{ margin: 0, fontSize: 14, color: "#777", lineHeight: 1.55 }}>{card.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d2b55)", borderRadius: 20, padding: "36px 32px", color: "#fff", maxWidth: 640, margin: "0 auto 32px" }}>
              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: "0 0 12px", fontWeight: 700 }}>How to Use This Playbook</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
                {[
                  "Start with \"What is HIAB?\" to understand the heart behind Design Thinking Sprints",
                  "Explore \"Heart of Innovation\" for the values and vision behind the process",
                  "Work through \"Prepare\" to plan logistics, recruit participants, and choose your sprint format",
                  "Learn each tool — Problem Statements, Empathy Maps, Personas, Ideation, and Prototyping",
                  "Use \"After the Sprint\" to keep momentum alive and share results with leadership",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 700, flexShrink: 0, color: "#E8890C" }}>{i + 1}</div>
                    <span style={{ fontSize: 15, lineHeight: 1.55, opacity: 0.9 }}>{step}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(123,31,162,0.4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>🎓</span>
                  <strong style={{ fontSize: 14, color: "#C4B5FD" }}>About Facilitator Notes</strong>
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, opacity: 0.75 }}>
                  Throughout this playbook, you'll see collapsible <strong style={{ color: "#C4B5FD" }}>Facilitator Notes</strong> with a 🎓 icon. These contain extra guidance for the person leading the sprint — discussion prompts, timing tips, presentation advice, and things to watch for. If you're a participant just working through the exercises, you can skip these. If you're facilitating, they're gold.
                </p>
              </div>
            </div>

            <button onClick={() => navigate("overview")} style={{ background: "#E8890C", color: "#fff", border: "none", borderRadius: 12, padding: "16px 36px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(232, 137, 12, 0.3)" }}>
              Get Started <Icon name="arrow" size={18} color="#fff" />
            </button>
          </div>
        );

      case "submit":
        return <SCIPABChatbot />;

      case "overview":
        return (
          <div>
            <PhaseHeader icon="book" title="What is HIAB?" subtitle="Understanding Design Thinking Brainstorm Sprints for faith-based organizations" accent="#E8890C" />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 20 }}>
              A <strong>Hack In A Box (HIAB)</strong> is a Design Thinking Brainstorm Sprint created by <strong>Indigitous US</strong>, specifically tailored for churches and faith-based organizations. Think of it as a focused retreat where your church's leaders and members come together to pray, brainstorm, and collaborate on solutions to real challenges your ministry faces.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 24 }}>
              This isn't about technology or complicated tools. It's about guiding your team through creative discussions and hands-on activities to produce clear, actionable plans that work for your unique church family.
            </p>
            <div style={{ background: "linear-gradient(135deg, #FEF3E2, #fff)", borderRadius: 16, padding: 28, border: "1px solid #E8890C20", marginBottom: 28 }}>
              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, margin: "0 0 16px", color: "#1a1a2e" }}>What Makes HIAB Different?</h3>
              {[
                { title: "Faith at the Center", desc: "Every idea explored is rooted in your church's mission and values. We begin and end with prayer." },
                { title: "Custom for Your Church", desc: "Every sprint is designed to reflect your congregation's unique strengths, challenges, and context." },
                { title: "Immediate Impact", desc: "You'll leave with clear, God-inspired plans that you can start implementing right away." },
                { title: "Ongoing Support", desc: "The playbook gives you everything to run sprints repeatedly, building an innovation culture." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 3 ? 14 : 0 }}>
                  <div style={{ color: "#E8890C", fontSize: 18, marginTop: 1 }}>✦</div>
                  <div><strong style={{ color: "#1a1a2e", fontSize: 15 }}>{item.title}:</strong> <span style={{ color: "#555", fontSize: 15, lineHeight: 1.6 }}>{item.desc}</span></div>
                </div>
              ))}
            </div>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, margin: "0 0 16px", color: "#1a1a2e" }}>The Design Thinking Process</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {[
                { phase: "Empathize", desc: "Understand the people and communities you're trying to serve", color: "#2D9B3A" },
                { phase: "Define", desc: "Clearly articulate the problem you're solving", color: "#4361EE" },
                { phase: "Ideate", desc: "Brainstorm many creative solutions without judgment", color: "#C6A200" },
                { phase: "Prototype", desc: "Build a simple, tangible version of your best idea", color: "#0097A7" },
                { phase: "Test", desc: "Share your prototype, get feedback, and refine", color: "#C2185B" },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: `${p.color}08`, borderRadius: 12, border: `1px solid ${p.color}15` }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${p.color}18`, color: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{i + 1}</div>
                  <div><strong style={{ color: p.color, fontSize: 15 }}>{p.phase}:</strong> <span style={{ color: "#555", fontSize: 15 }}>{p.desc}</span></div>
                </div>
              ))}
            </div>
          </div>
        );

      case "foundation":
        return (
          <div>
            <PhaseHeader icon="heart" title="Heart of Innovation" subtitle="Why creativity matters in ministry — and the values that guide our approach" accent={phaseColors.foundation.accent} />

            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 24 }}>
              Before we dive into tools and techniques, it's worth pausing to reflect on <em>why</em> we do this. Innovation in the church isn't about chasing trends or copying Silicon Valley. It's rooted in something much deeper — the belief that the God who created the universe invites us to be creative partners in His work.
            </p>

            <VideoPlaceholder title="Introduction: The Heart of Innovation" description="A short film on why creativity matters in ministry and what drives the HIAB approach." duration="5–8 min" />

            <FacilitatorNote title="Facilitator Note: How to Present This Section">
              <p>This section works well as an opening devotional or reflection before the sprint begins. You can read the key passages aloud, discuss the reflection questions as a group, or simply share the core ideas in your own words. The goal is to set a tone of humility, curiosity, and faith-driven creativity before the practical work begins.</p>
              <p>If you're short on time, focus on the "Created to Create" section and one reflection question.</p>
            </FacilitatorNote>

            <Accordion title="Created to Create" defaultOpen accent={phaseColors.foundation.accent}>
              <p>The very first thing we learn about God in Scripture is that He creates. He speaks light into darkness, shapes life from dust, and calls it good. And then — remarkably — He invites humanity to join in that creative work. We're given the task of naming, cultivating, building, and caring for the world around us.</p>
              <p>When your church runs a HIAB sprint, you're participating in that same creative tradition. You're looking at the world God loves, seeing what's broken or missing, and asking: "What could we build to make this better?" That's not just problem-solving. That's worship.</p>
              <FacilitatorNote>
                <p><strong>Reflection question for the group:</strong> "When was the last time you saw someone in our church do something creative to serve others? What made it special?"</p>
              </FacilitatorNote>
            </Accordion>

            <Accordion title="Innovation Starts with Humility" accent={phaseColors.foundation.accent}>
              <p>Real innovation requires admitting we don't have all the answers. It means listening before speaking, asking questions before proposing solutions, and being willing to be wrong. In church culture, where we often feel pressure to have everything figured out, this can be uncomfortable.</p>
              <p>But humility is actually our greatest strength. When we approach a challenge with open hands instead of clenched fists, we make room for the Spirit to move, for unexpected voices to be heard, and for ideas we never would have imagined on our own.</p>
              <p>That's why the HIAB process begins with empathy — with genuinely trying to understand someone else's experience before rushing to fix it.</p>
              <FacilitatorNote>
                <p><strong>Discussion prompt:</strong> "What's one assumption about our church or community that we might need to let go of to see things fresh?"</p>
              </FacilitatorNote>
            </Accordion>

            <Accordion title="Permission to Experiment" accent={phaseColors.foundation.accent}>
              <p>Many churches have an unspoken rule: if you try something and it fails, that's a mark against you. This fear of failure kills creativity before it starts. HIAB works because it creates a safe space where wild ideas are welcome, where "bad" ideas are celebrated as stepping stones, and where experimentation is treated as faithfulness — not recklessness.</p>
              <p>Think about it this way: every ministry your church runs today was once somebody's untested idea. Someone took a risk. HIAB gives your congregation permission to take that same kind of risk — but with structure, support, and prayer behind it.</p>
              <FacilitatorNote>
                <p><strong>Activity idea:</strong> Ask each person to share one idea they've had for the church that they never said out loud because they thought it was "too crazy." Write them all on sticky notes. You'll be amazed at what comes out.</p>
              </FacilitatorNote>
            </Accordion>

            <Accordion title="Our Guiding Values" accent={phaseColors.foundation.accent}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {[
                  { value: "People First", desc: "Every idea must serve real people with real needs. We never innovate for innovation's sake.", icon: "❤️" },
                  { value: "Rooted in Prayer", desc: "We invite God into the process from start to finish. The best ideas come from listening — to people and to the Spirit.", icon: "🙏" },
                  { value: "Radical Hospitality", desc: "Every voice matters. We make space for the quiet, the young, the new, and the skeptical.", icon: "🤝" },
                  { value: "Courage Over Comfort", desc: "We'd rather try something imperfect than stay stuck in something that isn't working.", icon: "💪" },
                  { value: "Faithful Stewardship", desc: "We respect the resources, traditions, and trust our church has built — and we build on them wisely.", icon: "🌱" },
                  { value: "Joy in the Process", desc: "Collaboration should be energizing and fun. If we're not enjoying this, we're doing it wrong.", icon: "✨" },
                ].map((item) => (
                  <div key={item.value} style={{
                    padding: "16px", borderRadius: 12, background: `${phaseColors.foundation.accent}06`,
                    border: `1px solid ${phaseColors.foundation.accent}12`,
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                    <strong style={{ fontSize: 14, color: "#1a1a2e", display: "block", marginBottom: 4 }}>{item.value}</strong>
                    <p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Accordion>

            <VideoPlaceholder title="Stories of Innovation in the Church" description="Real examples of churches that ran HIAB sprints and what happened next." duration="10 min" />

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

            <FacilitatorNote title="First-Time Facilitator? Start Here">
              <p>If you've never facilitated a sprint before, here's what to know:</p>
              <p><strong>Your job is to guide, not contribute.</strong> You keep time, transition between activities, and make sure every voice is heard. You don't need to be an expert on the topic — the participants are the experts.</p>
              <p><strong>Energy management matters most.</strong> If the room feels flat, call a break, play music, or do a quick energizer. If one person is dominating, gently redirect: "Let's hear from someone who hasn't shared yet."</p>
              <p><strong>Trust the process.</strong> It will feel messy in the middle. That's normal. The best ideas often emerge in the last 30 minutes when things start clicking.</p>
              <p><strong>Take photos of everything.</strong> Sticky notes fall off walls. Whiteboards get erased. Your phone camera is your best friend.</p>
              <p><strong>Celebrate generously.</strong> Clap for presentations, thank people for sharing, affirm wild ideas. A positive atmosphere unlocks creativity.</p>
              <p>If this is your first HIAB, start with the <strong>Express Sprint (2 hours)</strong> or <strong>Standard Sprint (3 hours)</strong>. You can always run a longer format next time.</p>
            </FacilitatorNote>

            <Accordion title="🙏 Prayer & Spiritual Preparation" defaultOpen accent={phaseColors.prepare.accent}>
              <p>Before any logistics, lay a spiritual foundation. Invite your leadership team and participants into a season of intentional prayer.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {["Pray for God to reveal the right challenge to focus on", "Ask for open hearts and minds among participants", "Pray for creative, Spirit-led ideas to come forward", "Commission the event during a Sunday service to build support"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}><Icon name="check" size={16} color={phaseColors.prepare.accent} /><span style={{ fontSize: 15 }}>{item}</span></div>
                ))}
              </div>
              <VideoPlaceholder title="Prayer Guide for Innovation Sprints" description="A guided prayer exercise you can use with your team before the event." duration="5 min" />
            </Accordion>

            <Accordion title="💬 How to Pitch HIAB to Your Pastor or Leadership" accent={phaseColors.prepare.accent}>
              <p>Getting leadership support is the most important first step. Here's a practical approach:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Start with the Why" accent={phaseColors.prepare.accent}
                  description="Don't lead with 'we want to do a hackathon.' Instead, share a specific challenge your church faces and explain that HIAB is a structured way to gather fresh ideas from the congregation. Frame it as a half-day retreat focused on prayer and creative problem-solving." />
                <StepCard number={2} title="Show, Don't Tell" accent={phaseColors.prepare.accent}
                  description="Share a one-page overview of what HIAB looks like (see the 'What is HIAB?' section). If possible, share a story or video from another church that ran one. Concrete examples are more persuasive than abstract descriptions." />
                <StepCard number={3} title="Make a Small Ask" accent={phaseColors.prepare.accent}
                  description="Don't ask for a huge commitment. Ask for permission to run one sprint on one topic with a small group. 'Can we try this with 20 people on a Saturday morning?' is much easier to say yes to than 'Can we overhaul our innovation process?'" />
                <StepCard number={4} title="Address Concerns Upfront" accent={phaseColors.prepare.accent}
                  description="Pastors may worry about: time commitment (it's 3–5 hours, not weeks), cost (minimal — paper, markers, snacks), or that ideas might bypass leadership (reassure them that ideas go through proper channels). Be ready with honest answers." />
                <StepCard number={5} title="Invite Them to Participate" accent={phaseColors.prepare.accent}
                  description="The best way to get buy-in is to have leadership in the room. Invite your pastor to open with prayer and stay for the first exercise. Once they see the energy and quality of ideas, they'll be your biggest champion." />
              </div>
              <FacilitatorNote>
                <p>If you're having trouble getting a meeting with leadership, try writing a brief email using the SCIPAB framework from this playbook. It's designed to communicate problems and proposals clearly and persuasively.</p>
              </FacilitatorNote>
            </Accordion>

            <Accordion title="📣 How to Market and Recruit Participants" accent={phaseColors.prepare.accent}>
              <p>Getting the right people in the room matters. Here's how to spread the word effectively:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { title: "Frame It as an Experience, Not a Meeting", desc: "Use language like 'creative workshop,' 'innovation retreat,' or 'brainstorm day' rather than technical terms. People are more likely to show up for something that sounds fun and different." },
                  { title: "Recruit for Diversity", desc: "Actively invite people from different age groups, backgrounds, tenure at the church, and ministry areas. The best ideas come from unexpected combinations of perspectives." },
                  { title: "Use Multiple Channels", desc: "Announce from the pulpit, put it in the bulletin/email, post on social media, and — most importantly — have people personally invite others. Personal invitations are 3x more effective than announcements." },
                  { title: "Highlight What They'll Get", desc: "People want to know: 'What's in it for me?' Emphasize that they'll be heard, that their ideas matter, and that they'll leave with concrete plans — not just talk." },
                  { title: "Set Clear Expectations", desc: "Share the exact time commitment (start and end time), what to bring (just themselves!), and that food will be provided. Remove every possible barrier to showing up." },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "14px 18px", borderRadius: 10, background: "#fff", border: "1px solid #e5e7eb" }}>
                    <strong style={{ fontSize: 15, color: "#1a1a2e" }}>{item.title}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666", lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
              <VideoPlaceholder title="Sample Recruitment Video" description="A customizable promo video template you can adapt for your church." duration="2 min" />
            </Accordion>

            <Accordion title="📅 Week-by-Week Planning Timeline" accent={phaseColors.prepare.accent}>
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
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 13, fontWeight: 700, color: phaseColors.prepare.accent, minWidth: 90, paddingTop: 2 }}>{item.week}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {item.tasks.map((task, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 14, color: "#555" }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: phaseColors.prepare.accent, marginTop: 7, flexShrink: 0 }} />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="🌍 Adapting for Multi-Church or Multi-Org Collaboration" accent={phaseColors.prepare.accent}>
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
                    <div><strong style={{ fontSize: 14, color: "#1a1a2e" }}>{item.title}:</strong> <span style={{ fontSize: 14, color: "#666" }}>{item.desc}</span></div>
                  </div>
                ))}
              </div>
              <FacilitatorNote>
                <p>Multi-org sprints work best as full-day events (6+ hours) because you need extra time for introductions, trust-building, and coordinating follow-up. Consider the Extended Retreat format from the Facilitation Guide.</p>
              </FacilitatorNote>
            </Accordion>

            <Accordion title="👥 Team Assembly" accent={phaseColors.prepare.accent}>
              <p><strong>Ideal group size:</strong> 15–30 people, broken into tables of 4–6.</p>
              <p>Aim for diversity — different ages, roles, backgrounds, and time at your church. Consider inviting people who don't normally attend planning meetings.</p>
              <p><strong>Key roles:</strong> Lead Facilitator, Table Coaches (one per table), Timekeeper, and Notetaker/Photographer.</p>
            </Accordion>

            <Accordion title="📋 Materials Checklist" accent={phaseColors.prepare.accent}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div>
                  <strong style={{ color: phaseColors.prepare.accent, fontSize: 14 }}>Must-Haves</strong>
                  {["Large poster paper or butcher paper", "Sticky notes (multiple colors)", "Markers and pens", "Dot stickers for voting", "Timer (phone works)", "Printed templates"].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 14 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: "#999", flexShrink: 0 }} /> {item}</div>
                  ))}
                </div>
                <div>
                  <strong style={{ color: phaseColors.prepare.accent, fontSize: 14 }}>Nice-to-Haves</strong>
                  {["Laptops/tablets for digital whiteboard", "Projector/screen", "Zoom setup for remote guests", "Shared Google Doc for notes", "Background worship music speaker"].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 14 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: "#999", flexShrink: 0 }} /> {item}</div>
                  ))}
                </div>
              </div>
            </Accordion>

            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: "28px 0 8px", color: "#1a1a2e" }}>Sprint Formats & Agendas</h3>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#555", marginBottom: 16 }}>
              Choose the format that fits your group's time and energy. Each agenda below is ready to print and follow. All use an "Empathy First" flow by default — to swap to "Problem First," just switch those two time blocks.
            </p>

            <FacilitatorNote title="Choosing Your Process Path">
              <p>There are two valid orderings for the core exercises:</p>
              <p><strong>Path A — Empathy First (default):</strong> Start with empathy mapping, then use those insights to write a focused problem statement. Best when the group doesn't have a specific challenge yet.</p>
              <p><strong>Path B — Problem First:</strong> Start with a rough problem statement, then do empathy work to deepen understanding, and refine the statement afterward. Best when the group already knows their challenge.</p>
              <p>The agendas below use Path A. To switch, just swap the Empathy and Problem Definition time blocks.</p>
            </FacilitatorNote>

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
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: phaseColors.prepare.accent, minWidth: 72, paddingTop: 2 }}>{item.time}</div>
                    <div><strong style={{ fontSize: 14, color: "#1a1a2e" }}>{item.title}</strong><p style={{ margin: "3px 0 0", fontSize: 13, color: "#666", lineHeight: 1.5 }}>{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </Accordion>

            <Accordion title="Express Sprint Agenda (2 hours)" subtitle="Best for: busy teams, Sunday afternoon sessions, or groups with a known challenge" accent={phaseColors.prepare.accent}>
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
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: phaseColors.prepare.accent, minWidth: 72, paddingTop: 2 }}>{item.time}</div>
                    <div><strong style={{ fontSize: 14, color: "#1a1a2e" }}>{item.title}</strong><p style={{ margin: "3px 0 0", fontSize: 13, color: "#666", lineHeight: 1.5 }}>{item.desc}</p></div>
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
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: phaseColors.prepare.accent, minWidth: 72, paddingTop: 2 }}>{item.time}</div>
                    <div><strong style={{ fontSize: 14, color: "#1a1a2e" }}>{item.title}</strong><p style={{ margin: "3px 0 0", fontSize: 13, color: "#666", lineHeight: 1.5 }}>{item.desc}</p></div>
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
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: phaseColors.prepare.accent, minWidth: 72, paddingTop: 2 }}>{item.time}</div>
                    <div><strong style={{ fontSize: 14, color: "#1a1a2e" }}>{item.title}</strong><p style={{ margin: "3px 0 0", fontSize: 13, color: "#666", lineHeight: 1.5 }}>{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <FacilitatorNote title="Adapting for Multi-Org Sprints">
                <p>For multi-church sprints, add 15–20 minutes at the start for introductions and trust-building, and 10 minutes at the end for collaborative follow-up planning.</p>
              </FacilitatorNote>
            </Accordion>

            <VideoPlaceholder title="Watch a Real HIAB Sprint" description="A behind-the-scenes look at a church running a full sprint from start to finish." duration="15 min" />
          </div>
        );

      case "problem":
        return (
          <div>
            <PhaseHeader icon="target" title="Writing Problem Statements" subtitle="Clearly define the challenge before you start solving it" accent={phaseColors.problem.accent} />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 24 }}>The most common reason innovation efforts fail is that teams solve the <em>wrong problem</em>. A well-crafted problem statement focuses your sprint and makes sure solutions address a real need.</p>
            <VideoPlaceholder title="How to Write a Great Problem Statement" description="A walkthrough of the HMW framework with real church examples." duration="8 min" />
            <FacilitatorNote>
              <p><strong>Process order flexibility:</strong> Some facilitators prefer to do empathy mapping <em>before</em> writing problem statements, so the team understands the people involved before defining the challenge. Others prefer to start with a rough problem statement and then refine it after empathy work. Both approaches work — see the Facilitation Guide for detailed agendas for each path.</p>
            </FacilitatorNote>
            <Accordion title='The "How Might We..." Framework' defaultOpen accent={phaseColors.problem.accent}>
              <p>The gold standard for problem statements in design thinking is the <strong>"How Might We" (HMW)</strong> question.</p>
              <div style={{ background: `${phaseColors.problem.accent}08`, borderRadius: 12, padding: "20px 24px", border: `1px solid ${phaseColors.problem.accent}20`, margin: "16px 0", textAlign: "center" }}>
                <div style={{ fontSize: 14, color: phaseColors.problem.accent, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Formula</div>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: "#1a1a2e", fontWeight: 700 }}>
                  "How might we <span style={{ color: phaseColors.problem.accent }}>[action]</span> for <span style={{ color: "#C2185B" }}>[who]</span> so that <span style={{ color: "#2D9B3A" }}>[desired outcome]</span>?"
                </div>
              </div>
              <p><strong>Examples:</strong></p>
              {["How might we create meaningful intergenerational connections so that youth feel mentored and seniors feel valued?", "How might we support working professionals so that they feel spiritually nourished despite busy schedules?"].map((ex, i) => (
                <div key={i} style={{ padding: "10px 14px", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb", fontSize: 14, lineHeight: 1.6, color: "#444", fontStyle: "italic", marginBottom: 8 }}>"{ex}"</div>
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
            <ProblemStatementWorksheet />
            <Accordion title="Common Pitfalls to Avoid" accent={phaseColors.problem.accent}>
              {[
                { bad: "We need a new website.", why: "This jumps to a solution. What's the underlying problem?" },
                { bad: "Young people don't come to church.", why: "Too vague. Which young people? What have you tried?" },
                { bad: "We need more volunteers.", why: "Solution-focused. Why don't people volunteer?" },
              ].map((pitfall, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#DC2626", fontWeight: 700, fontSize: 18 }}>✗</span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>"{pitfall.bad}"</span>
                  </div>
                  <p style={{ margin: "4px 0 0 26px", fontSize: 14, color: "#666" }}>{pitfall.why}</p>
                </div>
              ))}
            </Accordion>
          </div>
        );

      case "empathy":
        return (
          <div>
            <PhaseHeader icon="heart" title="Empathy Maps" subtitle="Walk in someone else's shoes to truly understand their experience" accent={phaseColors.empathy.accent} />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 20 }}>An empathy map helps your team build a shared understanding of the people you're trying to serve. It moves you beyond assumptions and into genuine compassion — the kind that leads to solutions that actually work.</p>
            <VideoPlaceholder title="Empathy Mapping in Action" description="Watch a team run through a full empathy map exercise with a real missionary story." duration="10 min" />
            <EmpathyMapVisual />
            <EmpathyMapWorksheet />
            <Accordion title="How to Run an Empathy Map Exercise" defaultOpen accent={phaseColors.empathy.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Choose Your Subject" duration="5 min" accent={phaseColors.empathy.accent} description="Decide who you're empathizing with — a real person, a type of person, or a community member affected by your challenge." />
                <StepCard number={2} title="Gather Context" duration="15 min" accent={phaseColors.empathy.accent} description="Read a letter or testimony. Watch a video. Or have the person share their story directly. Listen actively." />
                <StepCard number={3} title="Fill the Map Together" duration="15 min" accent={phaseColors.empathy.accent} description="Draw the 4-quadrant map on poster paper. Using sticky notes, each team member adds observations. One thought per note." />
                <StepCard number={4} title="Identify Insights" duration="10 min" accent={phaseColors.empathy.accent} description="Look for tensions, surprises, patterns, and unmet needs. Circle the most important insights." />
              </div>
            </Accordion>
            <TipBox accent={phaseColors.empathy.accent} label="🙏 Ministry connection">
              Empathy mapping is a spiritual exercise. It's about genuinely understanding another person's reality — the heart of loving your neighbor. Open with prayer, asking God to help your team see through others' eyes.
            </TipBox>
          </div>
        );

      case "personas":
        return (
          <div>
            <PhaseHeader icon="users" title="Creating Personas" subtitle="Build a vivid picture of who you're designing for" accent={phaseColors.personas.accent} />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 20 }}>A persona is a fictional but realistic character that represents a key group of people your church serves. Personas make "our community" specific and relatable.</p>
            <PersonaVisual />
            <PersonaCardWorksheet />
            <Accordion title="How to Create Personas" defaultOpen accent={phaseColors.personas.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Review Your Empathy Map" duration="5 min" accent={phaseColors.personas.accent} description="Look at patterns from empathy mapping. Who are the distinct types of people that emerged? You'll typically identify 2–3 key personas." />
                <StepCard number={2} title="Give Them a Name and Story" duration="10 min" accent={phaseColors.personas.accent} description="Give each persona a name, age, occupation, and brief backstory. Think about people you actually know who fit this profile." />
                <StepCard number={3} title="Define Their Inner World" duration="10 min" accent={phaseColors.personas.accent} description="Write down goals, motivations, pain points, frustrations, and faith journey. What do they need from the church?" />
                <StepCard number={4} title="Write a Day-in-the-Life" duration="5 min" accent={phaseColors.personas.accent} description="2–3 sentences describing a typical day or week. This helps your team design solutions that fit their real life." />
              </div>
            </Accordion>
            <TipBox accent={phaseColors.personas.accent}>Keep personas visible throughout the sprint. Before every decision, ask: "Would this work for [persona name]?"</TipBox>
          </div>
        );

      case "ideate":
        return (
          <div>
            <PhaseHeader icon="lightbulb" title="Ideation & Brainstorming" subtitle="Generate wild, creative, God-inspired ideas — then refine them" accent={phaseColors.ideate.accent} />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 24 }}>Now it's time to generate as many ideas as possible. The goal is <strong>quantity over quality</strong> — wild ideas often lead to breakthroughs.</p>
            <VideoPlaceholder title="How to Run Crazy 8s" description="A quick demo of the Crazy 8s exercise so you know exactly what to expect." duration="4 min" />
            <Accordion title="Ground Rules for Brainstorming" defaultOpen accent={phaseColors.ideate.accent}>
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
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Accordion>
            <Crazy8sWorksheet />
            <Accordion title="Exercise: Crazy 8s (Recommended!)" accent={phaseColors.ideate.accent}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                <StepCard number={1} title="Fold your paper into 8 panels" duration="1 min" accent={phaseColors.ideate.accent} description="Fold a blank sheet into 8 equal rectangles." />
                <StepCard number={2} title="Set the timer for 8 minutes" duration="8 min" accent={phaseColors.ideate.accent} description="1 minute per panel. Sketch ONE idea per panel. Don't go back!" />
                <StepCard number={3} title="Share and discuss" duration="10 min" accent={phaseColors.ideate.accent} description="Each person shares their top 2–3 ideas. No critiquing yet." />
                <StepCard number={4} title="Dot-vote on favorites" duration="5 min" accent={phaseColors.ideate.accent} description="3 dot stickers each. Place on the most promising ideas." />
              </div>
            </Accordion>
          </div>
        );

      case "prototype":
        return (
          <div>
            <PhaseHeader icon="cube" title="Prototyping" subtitle="Make your best ideas tangible so you can test them" accent={phaseColors.prototype.accent} />
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 24 }}>A prototype is a quick, rough version of your idea. It doesn't have to be perfect — the goal is to make it concrete enough for feedback.</p>
            <Accordion title="What Can a Prototype Look Like?" defaultOpen accent={phaseColors.prototype.accent}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 12 }}>
                {[
                  { type: "Storyboard", desc: "Draw 6–8 panels showing someone's experience", emoji: "🎬" },
                  { type: "Flyer / Poster", desc: "Mock flyer announcing your idea as if it already exists", emoji: "📄" },
                  { type: "Role Play", desc: "Act out a scenario where someone experiences your solution", emoji: "🎭" },
                  { type: "Landing Page", desc: "Sketch a webpage that describes your idea", emoji: "💻" },
                  { type: "Schedule / Plan", desc: "Detailed implementation timeline", emoji: "📅" },
                  { type: "Physical Model", desc: "Paper/cardboard 3D model of a space or experience", emoji: "🏗️" },
                ].map((item) => (
                  <div key={item.type} style={{ padding: "16px", borderRadius: 10, background: `${phaseColors.prototype.accent}06`, border: `1px solid ${phaseColors.prototype.accent}12`, textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
                    <strong style={{ fontSize: 14, color: "#1a1a2e", display: "block", marginBottom: 4 }}>{item.type}</strong>
                    <p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Accordion>
            <Accordion title="The Feedback Framework" accent={phaseColors.prototype.accent}>
              {[
                { prompt: "I like...", desc: "What's working well?", color: "#2D9B3A", emoji: "👍" },
                { prompt: "I wish...", desc: "What would you change?", color: "#E8890C", emoji: "🌟" },
                { prompt: "What if...", desc: "What new possibilities does this spark?", color: "#4361EE", emoji: "💡" },
              ].map((item) => (
                <div key={item.prompt} style={{ padding: "16px 20px", borderRadius: 12, background: `${item.color}08`, border: `1px solid ${item.color}18`, display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{item.emoji}</span>
                  <div><strong style={{ color: item.color, fontSize: 16 }}>{item.prompt}</strong><p style={{ margin: "4px 0 0", fontSize: 14, color: "#555" }}>{item.desc}</p></div>
                </div>
              ))}
            </Accordion>

            <FeedbackCardsWorksheet />
            <ProposalAccordion />
          </div>
        );

      case "templates":
        return (
          <div>
            <PhaseHeader icon="download" title="Templates & Resources" subtitle="Printable templates and quick-reference cards for your sprint" accent={phaseColors.templates.accent} />
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, margin: "0 0 14px", color: "#1a1a2e" }}>Sprint Templates</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
              <TemplateCard title="Empathy Map Template" accent="#2D9B3A" desc="A 4-quadrant canvas for understanding." items={["Says — Direct quotes", "Thinks — Unspoken thoughts", "Does — Observable actions", "Feels — Emotions"]} onLaunch={() => navigate("empathy")} />
              <TemplateCard title="Persona Card Template" accent="#C2185B" desc="Structured profile card for personas." items={["Name, age, role, backstory", "Goals and motivations", "Pain points", "Faith journey and church needs"]} onLaunch={() => navigate("personas")} />
              <TemplateCard title="Problem Statement Worksheet" accent="#4361EE" desc="Guided worksheet for HMW statements." items={["Observation prompts", "Pain clustering exercise", "HMW formula and examples", "Quality checklist"]} onLaunch={() => navigate("problem")} />
              <TemplateCard title="SCIPAB Submission Template" accent="#0D7C5F" desc="The same framework used in our chatbot." items={["Situation — Current state", "Complication — Critical issues", "Implication — Consequences", "Position, Action, Benefit"]} onLaunch={() => navigate("submit")} launchLabel="Open AI-guided chatbot" />
              <TemplateCard title="Crazy 8s Sheet" accent="#C6A200" desc="Pre-folded 8-panel rapid ideation sheet with built-in timer." items={["8 panels for 1-minute sketches", "Auto-advancing 8-minute timer", "HMW question pulled from your problem", "Star your top 2 ideas"]} onLaunch={() => navigate("ideate")} />
              <TemplateCard title="Feedback Cards" accent="#0097A7" desc="Structured feedback for prototyping." items={["I like...", "I wish...", "What if...", "Overall notes"]} onLaunch={() => navigate("prototype")} />
            </div>

            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, margin: "0 0 14px", color: "#1a1a2e" }}>Post-Sprint Templates</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
              <TemplateCard title="Sprint Summary One-Pager" accent="#B45309" desc="Auto-pulls from your other worksheets so the summary writes itself." items={["HMW problem statement", "Starred ideas from Crazy 8s", "Three key insights from empathy work", "Immediate next steps and owners"]} onLaunch={() => navigate("after")} />
              <TemplateCard title="Leadership Proposal Card" accent="#1D4ED8" desc="A structured pitch card for presenting ideas to pastors and elder boards." items={["The problem (with evidence)", "The proposed solution", "Who it serves and expected impact", "Resources needed and timeline", "What success looks like"]} onLaunch={() => navigate("after")} />
              <TemplateCard title="30-60-90 Day Action Plan" accent="#7C3AED" desc="Break your idea into achievable monthly milestones." items={["Day 1–30: Research, plan, and assemble team", "Day 31–60: Pilot or prototype in real setting", "Day 61–90: Evaluate, refine, and expand", "Key metrics and check-in dates"]} onLaunch={() => navigate("after")} />
              <TemplateCard title="Impact Story Template" accent="#059669" desc="Document what happened 6 months after your sprint for future inspiration." items={["The original challenge", "What the team built/launched", "Measurable outcomes and stories", "Lessons learned and what's next"]} onLaunch={() => navigate("after")} />
            </div>

            <TipBox accent={phaseColors.templates.accent} label="📣 From Indigitous US">
              Want help running your first HIAB? Reach out at <strong>nick@indigitous.org</strong> to schedule yours!
            </TipBox>
          </div>
        );

      case "after":
        return (
          <div>
            <PhaseHeader icon="star" title="After the Sprint" subtitle="How to capture momentum, share results, and keep your ideas alive" accent={phaseColors.after.accent} />

            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 24 }}>
              The sprint is over — but the real work is just beginning. The energy, ideas, and connections from your HIAB are incredibly valuable, but they fade fast without intentional follow-through. This section walks you through three critical phases: capturing what happened, sharing it with leadership, and building a sustainable plan to keep going.
            </p>

            <Accordion title="📸 Phase 1: Capture & Document (Same Day)" defaultOpen accent={phaseColors.after.accent}>
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

            <SprintSummaryWorksheet />
            <Accordion title="📢 Phase 2: Share with Leadership (Week 1–2)" accent={phaseColors.after.accent}>
              <p>Your ideas need champions and buy-in from church leadership to move forward. Here's how to make a compelling case:</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {[
                  { title: "Request a 15-Minute Slot", desc: "Ask your pastor or elder board for time at their next meeting. Come prepared with the Sprint Summary One-Pager and the video pitches. Less is more — don't overwhelm them with process details." },
                  { title: "Lead with the Problem, Not the Solution", desc: "Start by sharing the empathy work — the real human stories and needs you uncovered. Leadership needs to feel the weight of the problem before they'll invest in a solution." },
                  { title: "Present 1–2 Top Ideas (Not All of Them)", desc: "Pick the strongest ideas with the most energy behind them. Use the Leadership Proposal Card format to structure your pitch clearly. (See Templates section)" },
                  { title: "Ask for a Specific Next Step", desc: "Don't ask for blanket approval. Ask for something concrete: 'Can we pilot this with one small group for 6 weeks?' or 'Can we get $200 to test this idea?' Small asks get faster yeses." },
                  { title: "Offer a Demo Sunday", desc: "Ask for 5 minutes during a Sunday service or town hall for sprint teams to share their ideas with the congregation. Public momentum creates accountability and excitement." },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "14px 18px", borderRadius: 10, background: "#fff", border: "1px solid #e5e7eb" }}>
                    <strong style={{ fontSize: 15, color: "#1a1a2e" }}>{item.title}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666", lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <TipBox accent={phaseColors.after.accent} label="💡 Pro tip">
                Use the <strong onClick={() => navigate("prototype")} style={{ color: phaseColors.after.accent, cursor: "pointer", textDecoration: "underline" }}>Proposal Generator tool</strong> (inside the Prototyping section) to create a polished, AI-refined proposal you can present to leadership.
              </TipBox>
            </Accordion>

            <LeadershipProposalWorksheet />
            <Accordion title="🚀 Phase 3: Keep It Alive (Month 1–3)" accent={phaseColors.after.accent}>
              <p>The biggest risk after any sprint is losing momentum. Here's how to build a sustainable path forward:</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StepCard number={1} title="Appoint an Innovation Champion" accent={phaseColors.after.accent}
                  description="For each idea moving forward, identify one person who owns it. This person doesn't do all the work — they keep the conversation alive, schedule check-ins, and make sure things don't slip through the cracks. Ideally someone with energy and organizational skills." />
                <StepCard number={2} title="Create a 30-60-90 Day Plan" accent={phaseColors.after.accent}
                  description="Break the idea into three monthly phases. Month 1: research, plan, and assemble your team. Month 2: pilot or prototype in a real setting with real people. Month 3: evaluate results, refine, and decide whether to expand, pivot, or pause. (See Templates section for the template)" />
                <StepCard number={3} title="Schedule Bi-Weekly Check-Ins" accent={phaseColors.after.accent}
                  description="Put 30-minute check-ins on the calendar every two weeks. These can be brief — just go around and share: What did you do? What did you learn? What's blocking you? What's next? Consistency matters more than length." />
                <StepCard number={4} title="Run a Follow-Up Mini-Sprint" duration="2 hours at week 6" accent={phaseColors.after.accent}
                  description="Schedule a 2-hour reunion at the 6-week mark. Teams share what they've tried, what they've learned, and what surprised them. Then do a quick ideation round to iterate on the original idea based on real-world feedback. This keeps the design thinking muscle active." />
                <StepCard number={5} title="Document Your Impact Story" accent={phaseColors.after.accent}
                  description="At the 6-month mark, write up what happened. Use the Impact Story Template to document the original challenge, what the team built, measurable outcomes, and lessons learned. These stories inspire future sprints and build a culture of innovation." />
              </div>
            </Accordion>

            <ThirtySixtyNinetyWorksheet />
            <ImpactStoryWorksheet />
            <Accordion title="🌱 Building a Culture of Innovation" accent={phaseColors.after.accent}>
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
                    <div><strong style={{ fontSize: 14, color: "#1a1a2e" }}>{item.title}:</strong> <span style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{item.desc}</span></div>
                  </div>
                ))}
              </div>
            </Accordion>

            <div style={{
              background: "linear-gradient(135deg, #1a1a2e, #2d2b55)", borderRadius: 16, padding: "24px 24px",
              color: "#fff", marginTop: 20, display: "flex", alignItems: "center", gap: 20,
              cursor: "pointer",
            }} onClick={() => navigate("prototype")}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="edit" size={24} color="#93C5FD" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontFamily: "'Fraunces', Georgia, serif", fontSize: 18 }}>Ready to Pitch Your Idea?</h3>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>Use the Proposal Generator in the Prototyping section to build a polished leadership proposal from your sprint results.</p>
              </div>
              <Icon name="chevronRight" size={20} color="rgba(255,255,255,0.5)" />
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", height: "100vh", background: "#f8f8f6", color: "#333", overflow: "hidden" }}>

      {/* Mobile-responsive styles */}
      <style>{`
        @media (max-width: 767px) {
          .hiab-grid-2 { grid-template-columns: 1fr !important; }
          .hiab-grid-3 { grid-template-columns: 1fr !important; }
          .hiab-empathy-grid { grid-template-columns: 1fr !important; }
        }
        html { -webkit-text-size-adjust: 100%; }
      `}</style>

      {/* Mobile menu button */}
      {isMobile && (
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
          position: "fixed", top: 12, left: 12, zIndex: 100, width: 44, height: 44,
          borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          <Icon name={mobileMenuOpen ? "x" : "menu"} size={22} color="#1a1a2e" />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 98,
        }} />
      )}

      {/* Sidebar */}
      <nav style={{
        width: 260, background: "#fff", borderRight: "1px solid #e8e8e4", padding: "24px 0",
        display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto",
        ...(isMobile ? {
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 99,
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          boxShadow: mobileMenuOpen ? "4px 0 24px rgba(0,0,0,0.12)" : "none",
        } : {}),
      }}>
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #f0f0ec" }}>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 900, color: "#1a1a2e", lineHeight: 1.2 }}>Hack In<br />A Box</div>
          <div style={{ fontSize: 12, color: "#E8890C", fontWeight: 600, marginTop: 4, letterSpacing: 0.5 }}>REFERENCE MODE</div>
          <button onClick={() => setMode("picker")} style={{
            marginTop: 10, background: "#0D7C5F", color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", width: "100%",
          }}>↩ Back to Mode Picker</button>
        </div>
        <div style={{ padding: "16px 12px", flex: 1 }}>
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const isSubmit = section.id === "submit";
            return (
              <button key={section.id} onClick={() => navigate(section.id)} style={{
                width: "100%", padding: "10px 14px", borderRadius: 8, border: "none",
                background: isSubmit && !isActive ? "#0D7C5F08" : isActive ? (isSubmit ? "#0D7C5F12" : "#E8890C10") : "transparent",
                color: isSubmit ? "#0D7C5F" : isActive ? "#E8890C" : "#555",
                fontWeight: isActive || isSubmit ? 600 : 400, fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s", marginBottom: 2,
              }}>
                {isActive && <div style={{ width: 3, height: 18, borderRadius: 2, background: isSubmit ? "#0D7C5F" : "#E8890C" }} />}
                {section.label}
              </button>
            );
          })}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #f0f0ec", fontSize: 12, color: "#999" }}>
          By Indigitous US<br /><span style={{ fontSize: 11, color: "#bbb" }}>indigitous.org</span>
        </div>
      </nav>

      {/* Main content */}
      <main ref={contentRef} style={{
        flex: 1, overflowY: "auto",
        padding: isMobile ? "60px 16px 32px" : "32px clamp(20px, 4vw, 48px)",
      }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          {renderContent()}
          {activeSection !== "home" && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "24px 0", marginTop: 32, borderTop: "1px solid #e8e8e4",
              gap: 12, flexWrap: "wrap",
            }}>
              {(() => {
                const idx = sections.findIndex((s) => s.id === activeSection);
                const prev = idx > 0 ? sections[idx - 1] : null;
                const next = idx < sections.length - 1 ? sections[idx + 1] : null;
                return (
                  <>
                    {prev ? (
                      <button onClick={() => navigate(prev.id)} style={{
                        background: "none", border: "1px solid #e5e7eb", borderRadius: 8,
                        padding: isMobile ? "10px 14px" : "10px 18px", cursor: "pointer",
                        fontSize: isMobile ? 13 : 14, color: "#555", fontFamily: "'DM Sans', sans-serif",
                        flex: isMobile ? 1 : "none", minWidth: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>← {prev.label}</button>
                    ) : <div style={{ flex: isMobile ? 1 : "none" }} />}
                    {next ? (
                      <button onClick={() => navigate(next.id)} style={{
                        background: "#E8890C", color: "#fff", border: "none", borderRadius: 8,
                        padding: isMobile ? "10px 14px" : "10px 18px", cursor: "pointer",
                        fontSize: isMobile ? 13 : 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                        flex: isMobile ? 1 : "none", minWidth: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{next.label} →</button>
                    ) : <div style={{ flex: isMobile ? 1 : "none" }} />}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
