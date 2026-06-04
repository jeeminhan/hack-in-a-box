# Hack in a Box — Playbook-only, AI-first redesign

**Date:** 2026-06-03
**Status:** Approved design, pending spec review

## Summary

Remove the guided **Solo Sprint** flow and all its interactive worksheets. Make the
**Browse Playbook** (reference mode) the single, self-contained experience, with
**embedded per-step AI help** replacing the worksheets' role. The app's value prop
shifts from "guided solo workbook" to "facilitator's reference playbook + AI thinking
partner."

This is a deliberate, partly-destructive change to `src/HackInABox.jsx` (~4,000 lines):
it removes roughly half the app's interactivity (the worksheet layer) and rewires the
remaining AI tooling to be self-contained.

## Motivation

The two modes (Playbook reference vs. Solo Sprint guided) were two layers of the same
five-step method, cross-linked via "Open in Solo Sprint" buttons and shared
`localStorage`. The seam was confusing, and the team decided the solo guided flow is not
the direction. The Playbook should stand alone and lean on AI for the interactive,
"do it" part instead of static fill-in worksheets.

## Decisions (locked)

1. **Drop the Solo Sprint and all worksheets.** Not "keep a few" — all of them.
2. **AI-first.** Each Playbook step gets an embedded AI helper. Since there is no
   worksheet to seed prompts, the user supplies context directly (inline text), then
   picks a tailored quick-action.
3. **Keep both specialized AI tools:** the prototype prompt generator (rehomed into the
   Prototype section) and the SCIPAB problem chatbot (rehomed into the Problem section).
4. **Home page:** "Browse the Playbook" stays the primary (orange) button; the secondary
   "Start a Solo Sprint" button is replaced by "Try the AI Thinking Partner."

## Scope

### Remove

Components (in `src/HackInABox.jsx`):
- `OpenInSprint` (the deep-link button) and all 9 usages across Playbook sections
- Worksheet components: `EmpathyMapWorksheet`, `PersonaCardWorksheet`,
  `ProblemStatementWorksheet`, `Crazy8sWorksheet`, `FeedbackCardsWorksheet`,
  `SprintSummaryWorksheet`, `LeadershipProposalWorksheet`, `ImpactStoryWorksheet`
- Worksheet infrastructure: `useWorksheet`, `WorksheetHeader`, `WorksheetShell`,
  `loadWorksheetSnapshot`, `readWorksheet`, the `WORKSHEET_KEYS` map
- The guided flow: `GuidedFlow`, `GUIDED_STEPS`, the active-worksheet/step machinery,
  and the printable sprint packet that reads worksheet data
- Routing: the `"solo"` view, `openSoloAt`, and the `fromGuided` mode-mapping
- Home: the `onStartSprint` path and the "Start a Solo Sprint" button

### Keep / rehome

- `AIHelper` — **rewrite** so prompt presets take inline user-provided context instead
  of `readWorksheet(...)`. Rehome an instance into each Playbook step where
  `OpenInSprint` used to be. Quick-action lenses are preserved per step:
  - Empathize: "Critique my empathy notes", "Process an interview transcript"
  - Persona: "Generate alternative personas"
  - Problem: "Sharpen my How Might We", "Is this a good problem to solve?"
  - Ideate: "Generate 10 more ideas", "Combine ideas in fresh ways"
  - Prototype: "Suggest a prototype format", "Stress-test the idea"
  - Pitch: "Critique my proposal", "Write the elevator pitch"
- `ThinkingPartner` — keep as the standalone, open-ended chat coach (`"partner"` view)
- `callAI` + `api/chat.js` — keep (serverless call with demo fallback)
- `PrototypePromptBuilder` — keep; **decouple** from worksheet data (currently rendered
  inside `FeedbackCardsWorksheet`). User supplies the HMW + idea inline. Rehome into the
  Prototype section.
- SCIPAB problem chatbot (`SCIPAB_STEPS` + its flow) — keep; rehome into the Problem
  section.
- `PROPOSAL_STEPS` proposal generator — keep if it is an AI/generator tool (confirm
  during implementation); rehome into the Pitch section.

### Modify

- Home page: swap the secondary button to "Try the AI Thinking Partner" → `setView("partner")`.
- Each Playbook section: remove the `OpenInSprint` block; render an inline `AIHelper`
  (and, for Problem/Prototype/Pitch, the rehomed specialized tool).
- View routing: drop `"solo"`; keep `"home"`, `"partner"`, and section ids.

## AI interaction model (per step)

Each section renders an inline AI helper:

1. A short prompt: "Tell the AI about your situation for this step" with a small textarea.
2. The tailored quick-action buttons for that step (the lenses above).
3. Clicking a quick-action sends `{ system: coach persona, messages: [user context +
   lens instruction] }` to `callAI`, and renders the response inline (with the existing
   DEMO badge when the API key is absent).

The standalone `ThinkingPartner` remains available for deeper, multi-turn conversation.

## Data flow

- No more `localStorage` worksheet persistence. The AI helper is stateless per request;
  the user re-supplies context (or carries it from the open chat). The `ThinkingPartner`
  may keep its own conversation state as it does today.
- Removing worksheet persistence means stale `hiab-*-v1` keys may remain in users'
  browsers. Acceptable (orphaned, unread). No migration needed.

## Risks & mitigations

- **Large blast radius in one file.** Mitigate by removing in dependency order
  (usages first, then components, then infra) and rebuilding (`npm run build`) +
  linting after each removal group to catch dangling references early.
- **Decoupling `PrototypePromptBuilder` and `AIHelper` from worksheet reads** is the
  trickiest part — these are the two pieces that change behavior rather than just being
  deleted. Verify each rewritten prompt still produces a sensible message with only
  inline input.
- **Dead helpers:** after removal, check for now-unused imports/utilities (e.g.
  `readStoredString`/`writeStoredString` if only the guided flow used them) and prune.

## Testing / verification

- `npm run build` clean and `npx eslint src/HackInABox.jsx` with no new errors after each
  removal group and after the AI rewrites.
- Manual walk in the browser: Home → Browse Playbook → each of the 6 method sections →
  trigger the inline AI helper (DEMO mode is fine) → confirm a response renders.
- Home → "Try the AI Thinking Partner" → chat works.
- Confirm no "Open in Solo Sprint" buttons remain and no route reaches a removed view.

## Out of scope

- The example/worked-sprint feature discussed earlier (separate effort).
- Replacing the 3 church-specific video placeholders with real assets (blocked on Canva).
- Any backend/`api/chat.js` changes.
