# Playbook-only, AI-first — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the guided Solo Sprint and all interactive worksheets; make the Browse Playbook the single self-contained experience with embedded per-step AI help.

**Architecture:** All work is in `src/HackInABox.jsx` (~4,000-line single-file React app, inline styles, no router — view state is a string in `HackInABox`). We first make the AI pieces self-contained (so they no longer depend on worksheet `localStorage`), rehome them into Playbook sections, then delete the Solo Sprint + worksheet layer in dependency order, rebuilding after each group to catch dangling references.

**Tech Stack:** React 19, Vite, inline styles, `callAI` → `/api/chat.js` (serverless, with demo fallback). No unit-test framework — verification is `npm run build`, `npx eslint src/HackInABox.jsx`, `grep` residue checks, and a manual browser walk.

**Spec:** `docs/superpowers/specs/2026-06-03-playbook-ai-first-design.md`

---

## Verification baseline (read before starting)

`npx eslint src/HackInABox.jsx` already reports **pre-existing** errors unrelated to this work, in the voice/speech code (`useVoice`) and chat refs — e.g. `set-state-in-effect` (~line 2804), several `no-empty` catch blocks, `Cannot access refs during render` (~line 2956), and one `no-unused-vars` (`accent`, ~line 2341). These are the baseline. The bar for each task: **`npm run build` succeeds**, and ESLint introduces **no new `no-unused-vars` / `no-undef`** beyond that baseline. Line numbers shift as code is removed — judge by error type/identifier, not line.

---

## Task 1: Make `AIHelper` self-contained (inline context instead of worksheet reads)

**Files:**
- Modify: `src/HackInABox.jsx` — `AIHelper` (currently lines ~2202-2339)

- [ ] **Step 1: Replace the whole `AIHelper` component** with the version below. Changes: adds a `context` textarea state; every preset `build` now takes the typed context `c` instead of calling `readWorksheet(...)`; the textarea renders above the quick-action buttons.

```jsx
function AIHelper({ stepKey, accent }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState("");

  const presets = {
    empathize: [
      { label: "Critique my empathy notes", build: (c) => `Here are my empathy notes about the person/group I'm designing for:\n\n${c}\n\nAct as a design thinking coach. Tell me where I'm making assumptions vs. genuinely observing. What's missing? What surprises should I dig into?` },
      { label: "Turn a transcript into Says/Thinks/Does/Feels", build: (c) => `Here is an interview or testimony:\n\n${c}\n\nBreak it into an empathy map with four quadrants — Says, Thinks, Does, Feels. Short bullet points under each.` },
    ],
    persona: [
      { label: "Draft a persona", build: (c) => `Based on what I know about the people I'm designing for:\n\n${c}\n\nDraft a vivid persona: name, age, role, a 2-sentence backstory, top goals, top pain points, and their likely relationship with church. Then suggest one detail I probably haven't considered.` },
      { label: "Generate alternative personas", build: (c) => `Here's my current persona / audience:\n\n${c}\n\nGenerate 2 alternative personas representing different segments I might be missing. Give each a name, age, role, top goal, top pain, and one concrete habit that would surprise me.` },
    ],
    define: [
      { label: "Sharpen my How Might We", build: (c) => `Here's my situation and rough problem:\n\n${c}\n\nWrite 3 sharper "How might we..." statements. Each specific enough to act on in a short sprint but open enough for creative solutions. Avoid jargon. Then tell me which one you'd pick and why.` },
      { label: "Is this a good problem to solve?", build: (c) => `Here's my problem statement and what I've observed:\n\n${c}\n\nScore it 1-5 on specificity, actionability, human-centeredness, and room for creative solutions. Be honest. If weak, tell me how to sharpen it.` },
    ],
    ideate: [
      { label: "Generate 10 more ideas", build: (c) => `Here's my challenge and the ideas I have so far:\n\n${c}\n\nGenerate 10 NEW ideas I haven't thought of. Push for wild, unexpected combinations. Include at least 2 that sound impossible at first.` },
      { label: "Combine ideas in fresh ways", build: (c) => `Here are my favorite ideas:\n\n${c}\n\nSuggest 3 hybrid ideas that combine elements of two or more. Tell me the strongest combination and why.` },
    ],
    prototype: [
      { label: "Suggest a prototype format", build: (c) => `Here's my top idea:\n\n${c}\n\nWhich prototype format would I learn the most from in 30 minutes? Options: storyboard, mock flyer, role-play, sketched landing page, schedule plan, paper model. Recommend one and tell me exactly what to build.` },
      { label: "Stress-test the idea", build: (c) => `Here's my idea:\n\n${c}\n\nAct as a skeptical long-time member of my church. What concerns would you raise? Where might this fail? Be specific and respectful.` },
    ],
    pitch: [
      { label: "Critique my proposal", build: (c) => `Here's my proposal to leadership:\n\n${c}\n\nCritique it as a busy pastor with healthy skepticism toward new programs. Where is it weak? What would make me say yes faster? Be direct.` },
      { label: "Write the elevator pitch", build: (c) => `Here's my idea and the ask:\n\n${c}\n\nWrite a 60-second elevator pitch for my pastor in the hallway. Plain spoken, no jargon, lead with a human story or concrete observation.` },
    ],
  };

  const stepPresets = presets[stepKey] || [];
  if (stepPresets.length === 0) return null;

  const hasResponses = responses.length > 0;
  const expanded = open || hasResponses;

  const ask = async (build) => {
    const c = context.trim() || "(I haven't written my notes yet — give me general guidance for this step.)";
    const userMessage = build(c);
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

  if (!expanded) {
    return (
      <div style={{ marginTop: 20, marginBottom: 8 }}>
        <button onClick={() => setOpen(true)} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "transparent", border: `1px dashed ${accent}55`, color: accent,
          borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <Icon name="chat" size={14} color={accent} />
          Ask AI for help with this step
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 12, borderRadius: 12, border: `1px solid ${accent}30`, background: `${accent}05`, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon name="chat" size={16} color={color.accent} />
        <div style={{ fontWeight: 700, color: accent, fontSize: 13 }}>AI Thinking Partner</div>
        {demo && <span style={{ background: color.rail, color: color.accent, fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>DEMO</span>}
        {!hasResponses && (
          <button onClick={() => setOpen(false)} aria-label="Close" style={{ marginLeft: "auto", background: "none", border: "none", color: color.muted, cursor: "pointer", fontSize: 16, lineHeight: 1, fontFamily: "inherit" }}>×</button>
        )}
      </div>
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Tell the AI about your situation for this step — your notes, your audience, your idea…"
        rows={3}
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${color.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", resize: "vertical", marginBottom: 10, background: "#fff" }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {stepPresets.map((p, i) => (
          <button key={i} onClick={() => ask(p.build)} disabled={loading} style={{
            background: "#fff", border: `1px solid ${accent}40`, color: accent,
            borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 500,
            cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
          }}>{p.label}</button>
        ))}
      </div>
      {loading && <div style={{ marginTop: 12, fontSize: 13, color: color.muted }}>Thinking…</div>}
      {responses.map((r, i) => (
        <div key={i} style={{ marginTop: 14, padding: "12px 14px", background: "#fff", borderRadius: 10, border: `1px solid ${color.line}` }}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: color.ink, whiteSpace: "pre-wrap" }}>{r.a}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Build.** Run `npm run build`. Expected: succeeds. (`readWorksheet` may now be unused — that's fine, it is removed in Task 6.)
- [ ] **Step 3: Commit.**

```bash
git add src/HackInABox.jsx
git commit -m "refactor: make AIHelper self-contained with inline context"
```

---

## Task 2: Decouple `PrototypePromptBuilder` from worksheet props

`PrototypePromptBuilder` (lines ~862-957) currently takes `hmw` and `idea` props supplied by `FeedbackCardsWorksheet` (the call site at ~line 1020). Make it self-contained with its own inline inputs so it can live in the Prototype section without worksheet data.

**Files:**
- Modify: `src/HackInABox.jsx` — `PrototypePromptBuilder` signature + add inline inputs

- [ ] **Step 1: Change the signature and add local state for `hmw`/`idea`.** Replace the component's first lines:

Find:
```jsx
function PrototypePromptBuilder({ hmw, idea }) {
```
Replace with:
```jsx
function PrototypePromptBuilder({ hmw: hmwProp = "", idea: ideaProp = "" }) {
  const [hmw, setHmw] = useState(hmwProp);
  const [idea, setIdea] = useState(ideaProp);
```

- [ ] **Step 2: Add two inline inputs** at the top of the component's returned JSX (just inside its outer container, before the format picker). Use the existing `inputStyle`/`fieldLabel` tokens already used elsewhere in the file:

```jsx
      <label style={{ display: "block", marginBottom: 10 }}>
        <span style={fieldLabel}>Your "How might we…" question</span>
        <input value={hmw} onChange={(e) => setHmw(e.target.value)} placeholder="How might we …?" style={inputStyle} />
      </label>
      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={fieldLabel}>The idea you want to prototype</span>
        <input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Describe your starred idea" style={inputStyle} />
      </label>
```

- [ ] **Step 3: Build.** Run `npm run build`. Expected: succeeds (the existing call site at ~1020 still passes props, now optional — harmless until removed in Task 5).
- [ ] **Step 4: Commit.**

```bash
git add src/HackInABox.jsx
git commit -m "refactor: make PrototypePromptBuilder self-contained"
```

---

## Task 3: Rehome AI tools into Playbook sections; remove `OpenInSprint` usages

Each Playbook section `case` (in the section `switch` ~lines 3360-3970) currently ends with an `<OpenInSprint .../>` block. Replace each with the inline `<AIHelper .../>` for that step, and add the two specialized tools to their sections.

`AIHelper` `stepKey` values map to sections: empathy→`"empathize"`, persona→`"persona"`, problem→`"define"`, ideate→`"ideate"`, prototype→`"prototype"`, pitch→`"pitch"`.

**Files:**
- Modify: `src/HackInABox.jsx` — section render `switch`

- [ ] **Step 1: Empathy section** — replace its `<OpenInSprint stepLabel="Empathize" … onOpen={() => openSoloAt(1)} />` with:
```jsx
            <AIHelper stepKey="empathize" accent={phaseColors.empathy.accent} />
```
- [ ] **Step 2: Persona section** — replace its `OpenInSprint` (`openSoloAt(2)`) with:
```jsx
            <AIHelper stepKey="persona" accent={phaseColors.personas.accent} />
```
- [ ] **Step 3: Problem section** — replace its `OpenInSprint` (`openSoloAt(3)`) with the AI helper. The SCIPAB chatbot already renders in the Problem/"submit" area (`PhaseHeader icon="chat" title="Submit a Problem"`, ~line 1475 / section render ~3696); leave it in place. Add:
```jsx
            <AIHelper stepKey="define" accent={phaseColors.problem.accent} />
```
  Confirm the SCIPAB chatbot is reachable in this section after the change (it is AI and stays per spec).
- [ ] **Step 4: Ideate section** — replace its `OpenInSprint` (`openSoloAt(4)`) with:
```jsx
            <AIHelper stepKey="ideate" accent={phaseColors.ideate.accent} />
```
- [ ] **Step 5: Prototype section** — replace its `OpenInSprint` (`openSoloAt(5)`) with the prompt generator **and** the AI helper:
```jsx
            <PrototypePromptBuilder />
            <AIHelper stepKey="prototype" accent={phaseColors.prototype.accent} />
```
- [ ] **Step 6: Pitch section(s)** — there are up to three `OpenInSprint` blocks pointing to `openSoloAt(6)` (pitch summary, leadership proposal, and the "after" pitch link). Replace the first pitch one with:
```jsx
            <AIHelper stepKey="pitch" accent={phaseColors.after.accent} />
```
  Remove the other `openSoloAt(6)` `OpenInSprint` blocks outright (their guidance text referenced filling worksheets that no longer exist). If `PROPOSAL_STEPS` drives an in-section AI proposal generator, leave that generator rendered; if it only fed the removed `LeadershipProposalWorksheet`, it is removed in Task 6 — note which during this step.
- [ ] **Step 7: Verify no `OpenInSprint` usages remain.** Run:
```bash
grep -n "OpenInSprint\|openSoloAt" src/HackInABox.jsx
```
Expected: only the `function OpenInSprint(` definition (~line 362) and the `const openSoloAt =` definition (~line 3175) remain — **zero call sites**. (Both definitions are deleted in Task 4.)
- [ ] **Step 8: Build + lint.** `npm run build` succeeds; `npx eslint src/HackInABox.jsx` shows no new `no-undef`.
- [ ] **Step 9: Commit.**

```bash
git add src/HackInABox.jsx
git commit -m "feat: embed per-step AI helpers in playbook; drop Open-in-Sprint links"
```

---

## Task 4: Repoint Home; remove the `"solo"` route

**Files:**
- Modify: `src/HackInABox.jsx` — `Home` (~2771), `HackInABox` view routing (~3146-3180)

- [ ] **Step 1: Home button.** In `Home`, change the signature `function Home({ onStartSprint, onBrowse })` → `function Home({ onTryAI, onBrowse })`, and replace the secondary button:
```jsx
          <button onClick={onTryAI} style={pill("secondary")}>Try the AI Thinking Partner</button>
```
- [ ] **Step 2: Home render call.** Where `Home` is rendered (~3169), change:
```jsx
  if (view === "home") return <Home onTryAI={() => setView("partner")} onBrowse={() => navigate("overview")} />;
```
- [ ] **Step 3: Remove the `"solo"` view and guided plumbing.** Delete these lines/blocks in `HackInABox`:
  - `if (view === "solo") return <GuidedFlow setMode={fromGuided} />;` (~3170)
  - the `fromGuided` definition (~3167)
  - the `openSoloAt` definition (~3175-3177)
  - any other `setView("solo")` references (search and remove).
- [ ] **Step 4: Verify.** Run:
```bash
grep -n "\"solo\"\|GuidedFlow\|fromGuided\|openSoloAt\|onStartSprint" src/HackInABox.jsx
```
Expected: only the `function GuidedFlow(` definition remains (deleted in Task 5). No `onStartSprint`, `fromGuided`, `openSoloAt`, or `"solo"` references.
- [ ] **Step 5: Build.** `npm run build` succeeds.
- [ ] **Step 6: Commit.**

```bash
git add src/HackInABox.jsx
git commit -m "feat: home points to AI Thinking Partner; remove solo route"
```

---

## Task 5: Remove `GuidedFlow`, `GUIDED_STEPS`, and the printable packet

**Files:**
- Modify: `src/HackInABox.jsx`

- [ ] **Step 1: Delete `GuidedFlow`** (the whole `function GuidedFlow(` … `}` block, ~2547-2770).
- [ ] **Step 2: Delete `GUIDED_STEPS`** (the `const GUIDED_STEPS = [ … ];` array, ~2093-2180).
- [ ] **Step 3: Delete the printable sprint packet** — the component(s) that call `PrintableSection` with worksheet data (`PrintableSection title="Empathy Map"`/`"Persona"`, ~2444-2457) and any wrapper that renders the packet. Also delete `PrintableSection` (~2363) and `loadWorksheetSnapshot` (~160) if now unused (confirm with grep).
- [ ] **Step 4: Verify.** Run:
```bash
grep -n "GuidedFlow\|GUIDED_STEPS\|ActiveWorksheet\|PrintableSection\|loadWorksheetSnapshot" src/HackInABox.jsx
```
Expected: zero matches.
- [ ] **Step 5: Build + lint.** `npm run build` succeeds; ESLint no new `no-undef`/`no-unused-vars`.
- [ ] **Step 6: Commit.**

```bash
git add src/HackInABox.jsx
git commit -m "refactor: remove GuidedFlow, guided steps, and printable packet"
```

---

## Task 6: Remove worksheet components and infrastructure; prune dead helpers

**Files:**
- Modify: `src/HackInABox.jsx`

- [ ] **Step 1: Delete the worksheet components:** `EmpathyMapWorksheet` (~454), `PersonaCardWorksheet` (~648), `ProblemStatementWorksheet` (~706), `Crazy8sWorksheet` (~769), `FeedbackCardsWorksheet` (~959), `SprintSummaryWorksheet` (~1054), `LeadershipProposalWorksheet` (~1109), `ImpactStoryWorksheet` (~1144). Also remove the `<ImpactStoryWorksheet />` render still present in the "after" section (~3928).
- [ ] **Step 2: Delete worksheet infra:** `useWorksheet` (~613), `WorksheetHeader` (~624), `WorksheetShell` (~639), `readWorksheet` (~2198), and the `WORKSHEET_KEYS` map (~35-43).
- [ ] **Step 3: Decide on `OpenInSprint` + `VideoPlaceholder` + `LeadershipProposal` generator.** Delete `function OpenInSprint` (~362) — now unused. Keep `VideoPlaceholder` (still used by the 3 church-specific slots). For `PROPOSAL_STEPS` (~1699): keep if it drives a surviving in-section AI generator; delete if it only fed `LeadershipProposalWorksheet`.
- [ ] **Step 4: Prune now-dead utilities.** Check `readStoredString` / `writeStoredString` and any `WORKSHEET_KEYS`-only helpers:
```bash
grep -n "readStoredString\|writeStoredString\|WORKSHEET_KEYS\|useWorksheet\|WorksheetShell\|WorksheetHeader" src/HackInABox.jsx
```
Remove any definition with zero remaining call sites. (`readStoredString`/`writeStoredString` may still be used for `hiab-view` persistence — keep if so.)
- [ ] **Step 5: Verify no worksheet residue.** Run:
```bash
grep -n "Worksheet\|WORKSHEET_KEYS\|readWorksheet" src/HackInABox.jsx
```
Expected: zero matches (no component names, no key map).
- [ ] **Step 6: Build + lint.** `npm run build` succeeds; ESLint reports **no new** `no-unused-vars`/`no-undef` vs. the baseline.
- [ ] **Step 7: Commit.**

```bash
git add src/HackInABox.jsx
git commit -m "refactor: remove all interactive worksheets and persistence layer"
```

---

## Task 7: Final verification + manual walk

**Files:** none (verification only)

- [ ] **Step 1: Full build.** `npm run build` — succeeds, bundle emitted.
- [ ] **Step 2: Residue sweep.** Run:
```bash
grep -nE "GuidedFlow|GUIDED_STEPS|OpenInSprint|openSoloAt|Worksheet|WORKSHEET_KEYS|onStartSprint|\"solo\"" src/HackInABox.jsx
```
Expected: zero matches.
- [ ] **Step 3: Manual browser walk.** `npm run dev`, then in the browser:
  - Home shows two buttons: "Browse the playbook →" (primary orange) and "Try the AI Thinking Partner" (secondary). No "Solo Sprint" button.
  - "Try the AI Thinking Partner" opens the chat coach; sending a message returns a response (DEMO badge is fine).
  - Browse the playbook → open each method section (Empathize, Persona, Problem, Ideate, Prototype, Pitch). Each shows "Ask AI for help with this step"; expanding it reveals the context textarea + quick-actions; clicking a quick-action returns a response.
  - Prototype section shows the prompt generator with its own HMW/idea inputs and "Copy prompt".
  - No "Open in Solo Sprint" buttons anywhere; no dead links.
- [ ] **Step 4: Lint check.** `npx eslint src/HackInABox.jsx` — only the known baseline errors (voice/refs), no new unused/undef from this work.
- [ ] **Step 5: Final commit (if the walk required any fixes).**

```bash
git add -A
git commit -m "chore: verify playbook-ai-first; manual walk fixes"
```

---

## Self-review notes

- **Spec coverage:** Remove list → Tasks 3-6; AIHelper rewrite → Task 1; PrototypePromptBuilder decouple → Task 2; SCIPAB kept → Task 3 Step 3; Home button → Task 4; per-step AI model → Task 1 + Task 3; verification → Task 7. All spec sections mapped.
- **`PROPOSAL_STEPS` ambiguity** is the one deliberate implementation-time decision (Task 3 Step 6 / Task 6 Step 3): keep if it drives a surviving AI generator, delete if it only fed the removed worksheet. Resolve by grepping its render site during that task.
- **No new tests:** project has no unit-test harness; verification is build + lint + grep + manual walk by design.
