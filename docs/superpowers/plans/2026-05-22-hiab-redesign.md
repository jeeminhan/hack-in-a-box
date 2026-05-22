# Hack In A Box Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Hack In A Box prototype's look and information architecture — Indigitous-brand visuals (orange `#EF4E25`, ink, stone, Noto Sans, no emoji) and a single phase-grouped app (slim sidebar + top step bar) replacing the four overlapping modes — usable by June 4.

**Architecture:** Reuse all existing content components (worksheets, SCIPAB chatbot, AI Thinking Partner, AI section) but rehome them under a new 5-phase spine. Replace the `mode` picker + flat `sections` model with: a `theme.js` token module, a `PHASES`/`STEPS` nav model, new `Sidebar` + `StepBar` + `Home` components, and a rewritten shell in `HackInABox.jsx`. Work in-place in `HackInABox.jsx` to limit risk before the deadline; extract only the genuinely new, self-contained pieces into small modules.

**Tech Stack:** Vite + React 19 (JSX), inline-style components, Google Fonts (Noto Sans), serverless `api/chat.js` (Gemini). No test runner — verification is `npm run build` + `/browse` screenshots + console-error checks.

**Spec:** `docs/superpowers/specs/2026-05-22-hiab-redesign-design.md`

**Verification helper (used in every task):** with the dev server running (`npm run dev`, port 5173) and `B=~/.claude/skills/gstack/browse/dist/browse`:
```bash
$B viewport 1440x900 && $B goto http://localhost:5173/ && $B wait --load && $B screenshot /tmp/v.png && $B console --errors
```
Then Read `/tmp/v.png`. Repeat at `375x812` for mobile where layout matters.

---

## Task 1: Design tokens module

**Files:**
- Create: `src/theme.js`

- [ ] **Step 1: Create the token module**

```js
// src/theme.js — single source of truth for Indigitous-brand visuals.
export const color = {
  accent: "#EF4E25",      // Indigitous orange — the ONLY decorative color
  accentSoft: "#EF4E2510",
  ink: "#131313",         // headings (never #000)
  body: "#3A3833",
  muted: "#6A665D",
  faint: "#9A968C",
  bg: "#F4F2EC",          // app background (warm stone)
  rail: "#FAF8F3",        // sidebar / panels
  surface: "#FFFFFF",     // cards
  panel: "#ECE8DE",       // secondary panel
  line: "#E7E3D9",        // hairline dividers
  lineSoft: "#EEEAE0",
};

export const font = {
  sans: "'Noto Sans', system-ui, sans-serif",
};

export const radius = { sm: 6, md: 10, lg: 14, pill: 40 };

// Standard pill button style (primary = orange, secondary = ghost).
export const pill = (variant = "primary") => ({
  display: "inline-flex", alignItems: "center", gap: 8,
  fontFamily: font.sans, fontWeight: 600, fontSize: 15,
  padding: "13px 26px", borderRadius: radius.pill, cursor: "pointer",
  border: variant === "secondary" ? `1px solid ${color.line}` : "none",
  background: variant === "secondary" ? "transparent" : color.accent,
  color: variant === "secondary" ? color.ink : "#fff",
});
```

- [ ] **Step 2: Verify it imports**

Run: `node -e "import('./src/theme.js').then(m=>console.log(Object.keys(m)))"` is not valid for JSX project; instead verify via build in a later task. For now just confirm the file has no syntax error:
Run: `npx eslint src/theme.js`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/theme.js
git commit -m "feat: add Indigitous brand design tokens"
```

---

## Task 2: Load Noto Sans, drop the old font stack

**Files:**
- Modify: `src/HackInABox.jsx` (the `useEffect` that injects the Google Fonts `<link>`, ~line 3121-3127)

- [ ] **Step 1: Replace the font link href**

Find the `link.href = "https://fonts.googleapis.com/css2?family=Fraunces...&family=Source+Serif+4...&family=DM+Sans..."` line and replace the URL with:

```js
link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap";
```

- [ ] **Step 2: Build to confirm nothing breaks**

Run: `npm run build`
Expected: `✓ built` with no errors. (Old `'Fraunces'`/`'DM Sans'` references still resolve to system fallback until restyled in later tasks — acceptable mid-refactor.)

- [ ] **Step 3: Commit**

```bash
git add src/HackInABox.jsx
git commit -m "feat: load Noto Sans brand font"
```

---

## Task 3: Phase / step navigation model

**Files:**
- Modify: `src/HackInABox.jsx` (replace the `sections` array at lines 3-16)

- [ ] **Step 1: Replace `sections` with `PHASES` + `STEPS`**

```js
// Five-phase spine. Each phase has an id, label, and the section ids it contains.
export const PHASES = [
  { id: "start",     label: "Get started",      sections: ["overview", "foundation"] },
  { id: "prepare",   label: "Prepare",          sections: ["prepare"] },
  { id: "run",       label: "Run the sprint",   sections: ["empathy", "problem", "ideate", "prototype", "pitch"] },
  { id: "after",     label: "After the sprint", sections: ["after"] },
  { id: "resources", label: "Resources",        sections: ["templates", "ai", "partner"] },
];

// The 5 numbered steps shown in the top step bar during the "run" phase.
export const STEPS = [
  { id: "empathy",   n: 1, label: "Empathize" },
  { id: "problem",   n: 2, label: "Define" },
  { id: "ideate",    n: 3, label: "Ideate" },
  { id: "prototype", n: 4, label: "Prototype" },
  { id: "pitch",     n: 5, label: "Pitch" },
];

// Flat lookup: which phase a section belongs to.
export const phaseOf = (sectionId) =>
  PHASES.find((p) => p.sections.includes(sectionId))?.id ?? "start";
```

Note: `personas` content folds into the `empathy` section; the `submit` (SCIPAB) tool folds into `problem`; `pitch` is the existing `proposal`/leadership content. These merges happen in Task 8.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build fails IF other code still references the removed `sections` const. Note each failing reference location for Task 6. If it builds, proceed.

- [ ] **Step 3: Commit**

```bash
git add src/HackInABox.jsx
git commit -m "feat: phase/step nav model replacing flat sections"
```

---

## Task 4: Sidebar component (slim, 5 phases)

**Files:**
- Modify: `src/HackInABox.jsx` (add new component near the other shell components, before `export default function HackInABox`)

- [ ] **Step 1: Add the `Sidebar` component**

```jsx
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
```

- [ ] **Step 2: Add the `BrandMark` logo component** (Indigitous square mark, orange tile + stone cutout)

```jsx
function BrandMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 261.9 261.9" style={{ borderRadius: 5, display: "block" }}>
      <rect width="261.9" height="262.13" fill={color.accent} />
      <path d="M142.85,87.3H87.3v55.55h55.55ZM127,127H103.17V103.17H127Zm31.74-14.29v30.16H174.6V112.69ZM87.3,174.6h87.3V158.73H87.3Z" fill={color.rail} />
    </svg>
  );
}
```

- [ ] **Step 3: Add the import at top of file**

```js
import { color, font, radius, pill } from "./theme.js";
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ built` (components unused yet is fine).

- [ ] **Step 5: Commit**

```bash
git add src/HackInABox.jsx
git commit -m "feat: slim phase sidebar + brand mark"
```

---

## Task 5: StepBar component (top progress for Run phase)

**Files:**
- Modify: `src/HackInABox.jsx`

- [ ] **Step 1: Add the `StepBar` component**

```jsx
function StepBar({ activeSection, onNavigate }) {
  const idx = STEPS.findIndex((s) => s.id === activeSection);
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "18px 28px", borderBottom: `1px solid ${color.lineSoft}`, background: color.surface, overflowX: "auto" }}>
      {STEPS.map((s, i) => {
        const state = i < idx ? "done" : i === idx ? "on" : "todo";
        const dotBg = state === "todo" ? "transparent" : color.ink;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <button onClick={() => onNavigate(s.id)} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer", fontFamily: font.sans, fontSize: 12.5, fontWeight: state === "on" ? 700 : 500, color: state === "on" ? color.ink : color.faint }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                background: state === "on" ? color.accent : state === "done" ? color.ink : "transparent",
                border: state === "todo" ? `1.5px solid ${color.line}` : "none",
                color: state === "todo" ? color.faint : "#fff" }}>
                {state === "done" ? "✓" : s.n}
              </span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && <span style={{ width: 34, height: 1.5, background: color.line, margin: "0 6px" }} />}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ built`.

- [ ] **Step 3: Commit**

```bash
git add src/HackInABox.jsx
git commit -m "feat: top step bar for run-the-sprint phase"
```

---

## Task 6: Rewrite the app shell

**Files:**
- Modify: `src/HackInABox.jsx` — the default `HackInABox()` component (state at ~3092-3133 and the surrounding layout/nav markup that renders `sections`)

- [ ] **Step 1: Replace mode/section state with a single view model**

Replace the `mode` useState block and the `["picker","solo","mini","partner","reference"]` logic with:

```jsx
const [view, setView] = useState(() => readStoredString("hiab-view", "home")); // "home" | "solo" | <sectionId>
useEffect(() => { writeStoredString("hiab-view", view); }, [view]);
const navigate = (id) => { setView(id); if (contentRef.current) contentRef.current.scrollTop = 0; };
```

Keep `contentRef`, `isMobile`, and the font `useEffect`.

- [ ] **Step 2: Replace the top-level render branches**

```jsx
if (view === "home") return <Home onStartSprint={() => setView("solo")} onBrowse={() => navigate("overview")} onNavigate={navigate} />;
if (view === "solo") return <GuidedFlow setMode={(m) => setView(m === "picker" ? "home" : m)} />;

const activePhase = phaseOf(view);
const inRun = activePhase === "run";
```

- [ ] **Step 3: Replace the layout JSX (sidebar + content) with the new shell**

```jsx
return (
  <div style={{ display: "flex", minHeight: "100vh", background: color.bg, fontFamily: font.sans }}>
    <Sidebar activePhase={activePhase} onNavigate={(id) => (id === "home" ? setView("home") : navigate(id))} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      {inRun && <StepBar activeSection={view} onNavigate={navigate} />}
      <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "34px 38px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>{renderContent(view)}</div>
      </div>
    </div>
  </div>
);
```

- [ ] **Step 4: Make `renderContent` take the section id**

Change `const renderContent = () => { switch (activeSection) {` to `const renderContent = (active) => { switch (active) {`. Remove the now-unused `activeSection`/`mobileMenuOpen` state and any old `<nav>` markup that mapped `sections`.

- [ ] **Step 5: Build + screenshot**

Run: `npm run build` then start dev server and run the verification helper at 1440 and 375.
Expected: build passes; home renders; clicking a phase shows the sidebar highlight; the run phase shows the step bar; no console errors. Read `/tmp/v.png`.

- [ ] **Step 6: Commit**

```bash
git add src/HackInABox.jsx
git commit -m "feat: new app shell (sidebar + stepbar + single view model)"
```

---

## Task 7: New Home (brand hero, two ways in)

**Files:**
- Modify: `src/HackInABox.jsx` — replace `ModePicker` with `Home`

- [ ] **Step 1: Replace `ModePicker` with `Home`**

```jsx
function Home({ onStartSprint, onBrowse }) {
  return (
    <div style={{ minHeight: "100vh", background: color.bg, fontFamily: font.sans, overflowY: "auto" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <BrandMark size={30} /><span style={{ fontWeight: 700, fontSize: 16, color: color.ink }}>Hack In A Box</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: color.accent, fontWeight: 700, marginBottom: 18 }}>For hack champions</div>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 52px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.04, color: color.ink, margin: "0 0 18px" }}>Run your own design sprint.</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: color.muted, maxWidth: 520, margin: "0 auto 36px" }}>
          A packaged playbook for leading a 2–6 hour mini-hackathon at your church or organization — even if you've never facilitated one.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onStartSprint} style={pill("primary")}>Start a Solo Sprint →</button>
          <button onClick={onBrowse} style={pill("secondary")}>Browse the playbook</button>
        </div>
        <p style={{ fontSize: 13, color: color.faint, marginTop: 40 }}>Auto-saves to this browser · come back anytime</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build + screenshot at 1440 and 375**

Expected: brand hero, orange primary + ghost secondary buttons, Noto Sans, stone bg, no emoji. Read `/tmp/v.png`.

- [ ] **Step 3: Commit**

```bash
git add src/HackInABox.jsx
git commit -m "feat: brand-accurate home with guided/browse entry"
```

---

## Task 8: Rehome + merge section content

**Files:**
- Modify: `src/HackInABox.jsx` — `renderContent` switch cases

- [ ] **Step 1: Merge `personas` into the `empathy` case**

In the `empathy` case, append the Personas content (the `PersonaCardWorksheet` and persona explanation currently under `case "personas"`). Delete the standalone `personas` case. Add a sub-heading "Personas" above the persona block.

- [ ] **Step 2: Merge `submit` (SCIPAB) into the `problem` case**

In the `problem` case, after the problem-statement worksheet, add a divider and the `<SCIPABChatbot />` (from `case "submit"`) under a sub-heading "Submit your problem (AI-guided)". Delete the standalone `submit` case.

- [ ] **Step 3: Add a `pitch` case**

Create `case "pitch":` rendering the existing leadership proposal content (currently `PROPOSAL_STEPS`/`LeadershipProposalWorksheet`). If that content lived under a removed id, move it here verbatim.

- [ ] **Step 4: Confirm every section id in PHASES/STEPS has a case**

Ids needed: `overview`, `foundation`, `prepare`, `empathy`, `problem`, `ideate`, `prototype`, `pitch`, `after`, `templates`, `ai`, `partner`. For `partner`, render `<ThinkingPartner setMode={() => {}} />` inline (or a button that sets view to a partner section). Add any missing case; remove orphan cases (`home`, `personas`, `submit`).

- [ ] **Step 5: Build + click through every phase via screenshots**

For each phase, set `localStorage.hiab-view` to a section id, reload, screenshot, Read it, and confirm content renders with no console errors. Check `empathy` (has personas), `problem` (has SCIPAB), `pitch`.

- [ ] **Step 6: Commit**

```bash
git add src/HackInABox.jsx
git commit -m "feat: rehome and merge sections into 5-phase spine"
```

---

## Task 9: Restyle to brand (kill the tackiness)

**Files:**
- Modify: `src/HackInABox.jsx` — `PhaseHeader`, `phaseColors`, section bodies, worksheet shells

- [ ] **Step 1: Collapse `phaseColors` to a single accent**

Replace every `phaseColors.<x>.accent` usage with `color.accent`, and every `phaseColors.<x>.bg`/`.light` gradient background with `color.surface` or `color.rail` (flat, no gradient). Simplest: redefine `phaseColors` as a Proxy/object whose every key returns `{ bg: color.rail, accent: color.accent, light: color.accentSoft }`.

```js
const phaseColors = new Proxy({}, { get: () => ({ bg: color.rail, accent: color.accent, light: color.accentSoft }) });
```

- [ ] **Step 2: Restyle `PhaseHeader`**

Update `PhaseHeader` to: Noto Sans, `color.ink` title (no serif), `color.muted` subtitle, orange eyebrow/rule, no gradient. Remove its `icon` emoji usage or swap to the `Icon` SVG component.

- [ ] **Step 3: Remove emoji + gradients from home-card content and section bodies**

Search the file for emoji (🧭🧩💬📚🎓🙏✦ etc.) and `linear-gradient(`. Replace decorative emoji with either nothing or an `Icon` SVG; replace gradient backgrounds with flat `color.surface`/`color.panel`. Keep the orange `✦` accent sparingly only if it reads as brand, else remove.

- [ ] **Step 4: Restyle worksheet shells**

In `WorksheetShell` / `WorksheetHeader` and each worksheet's column colors, replace the multi-color quadrant accents with `color.accent` + neutral `color.line` borders on `color.surface`. (Empathy map quadrants may keep subtle differentiation using the brand secondary palette tints from `theme.js` if needed — add `color.secondary = [...]` only if used.)

- [ ] **Step 5: Build + screenshot home, a Run step, and a worksheet at 1440 + 375**

Expected: one accent color throughout, Noto Sans, stone/ink, no emoji, no gradients. Read each `/tmp/v.png`.

- [ ] **Step 6: Commit**

```bash
git add src/HackInABox.jsx src/theme.js
git commit -m "feat: restyle to single-accent Indigitous brand, remove emoji/gradients"
```

---

## Task 10: Wire Solo Sprint to the 5 steps

**Files:**
- Modify: `src/HackInABox.jsx` — `GUIDED_STEPS` / `GuidedFlow`

- [ ] **Step 1: Align guided steps with the spine**

Ensure `GUIDED_STEPS` order matches `STEPS` (Empathize → Define → Ideate → Prototype → Pitch) plus Welcome/Done bookends. Restyle `GuidedFlow`'s header/progress to the new tokens (orange accent, Noto Sans, stone) and the "SOLO SPRINT" label.

- [ ] **Step 2: Make "exit/home" return to Home**

Confirm the `GuidedFlow` home/exit control calls `setMode("picker")` which Task 6 maps to `setView("home")`. Update label/icon to brand.

- [ ] **Step 3: Build + screenshot the guided flow at 1440 + 375**

Walk Welcome → step 1 → done via the browser; screenshot 2-3 steps; confirm no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/HackInABox.jsx
git commit -m "feat: align + restyle Solo Sprint guided flow"
```

---

## Task 11: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Build + lint**

Run: `npm run build` (expect `✓ built`) and `npm run lint` (expect only the pre-existing voice-mode errors at lines ~2849-2999; no NEW errors from redesigned code).

- [ ] **Step 2: Responsive screenshots**

For Home, a Run step (with step bar), a worksheet, and the Solo Sprint flow: screenshot at 1440, 768, and 375. Read each. Confirm: no horizontal overflow, sidebar/stepbar usable, hierarchy intact.

- [ ] **Step 3: Console + AI smoke check**

`$B console --errors` on Home and on the `partner`/`problem` sections → no errors. If `GEMINI_API_KEY` is set in Vercel, AI returns live text; otherwise it shows demo-mode copy (acceptable for local).

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: redesign verification fixes"
```

---

## Task 12: Ship

**Files:** none

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/hiab-champion-polish
```

- [ ] **Step 2: Confirm deploy**

Cloudflare/Vercel auto-deploys from the push. Open the preview URL, screenshot Home, confirm it matches local. Share the link for feedback (the May 19 "distribute" task) ahead of the June 4 info session.

---

## Notes / risk

- `HackInABox.jsx` stays large (~4k lines). Further splitting (extracting worksheets/sections into modules) is a worthwhile follow-up but is **out of scope** here to limit risk before June 4.
- Do **not** touch the voice-mode code (`useVoice`/`ThinkingPartner` internals, ~2797-3060) beyond restyling its visible surface — it carries pre-existing lint errors and is fragile.
- If a restyle step risks breaking a worksheet's behavior, prefer changing only colors/fonts/spacing, never logic.
