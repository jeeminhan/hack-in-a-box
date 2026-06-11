# HARNESS.md — harness manifest for Hack In A Box

> Read by the /harness skill and its generator/evaluator agents. Keep every line current — the loop trusts this file.

## App
Interactive React prototype of the Indigitous US Hack In A Box playbook — phase content (prepare → run → follow up), AI-assisted tools, per-page feedback widget. Audience: hackathon facilitators in Nick's network.

## Run
- Dev server: `npm run dev` → http://localhost:5173
- Env/stubs: none. `api/*.js` are Vercel functions and do NOT run under `vite dev` — the client falls back to canned demo responses for chat/SCIPAB/proposal and browser speechSynthesis for voice. Locally, AI tools are in demo mode by design; test the demo-mode UX, don't report the missing live API as a bug.

## Gates (deterministic, must pass before any QA round)
- `npm run lint`
- `npm run build`

## Backlog
- `harness/backlog.md` — seeded from TODO.md (Jun 9 call with Nick) + structural debt

## Evaluate
- Mode: browser (Playwright)
- Journeys (always walk all of these):
  1. Overview → "Where should you start?" paths → each phase page (Prepare, Run, Follow Up)
  2. Guided walkthroughs (empathy map on Empathize; sprint-wide walkthroughs)
  3. AI tools in demo mode: thinking-partner chat, SCIPAB builder, proposal generator
  4. Feedback widget: open, fill (incl. name field), submit
- Viewports: 375 / 768 / 1440
- **Safety (absolute):** intercept `POST /api/feedback` with Playwright route interception BEFORE touching the widget — it forwards to a Google Apps Script webhook bound to the real feedback Sheet. No test submission may ever reach it.

## Models
- generator: inherit
- evaluator: sonnet (default)

## Conventions
- Main app is a single large component file `src/HackInABox.jsx` with `theme.js` design tokens — match its existing inline patterns; do not introduce CSS frameworks or new styling systems.
- Long-term goal (backlog): split HackInABox.jsx toward ≤800-line files; until that item is worked, keep edits in place.
