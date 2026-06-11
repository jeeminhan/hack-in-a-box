# Contract 001 — Pre-share-out QA sweep

Backlog item: "Pre-share-out QA sweep — Source: TODO.md — 'Commit + deploy to Vercel, spot-check the live site' (blocks Nick's share-out). Full evaluator sweep of the local app before deploy: all journeys in HARNESS.md, all viewports, console clean. Contract criteria = the app's core journeys working. Generator only acts if the sweep finds failures."

Scope: **No code changes unless QA fails.** This is a verification sweep of existing functionality on the local dev server (`npm run dev` → http://localhost:5173). If the evaluator reports FAILs, the generator fixes them in place (edits stay inside `src/HackInABox.jsx` / `src/walkthroughs.js` / `src/WalkthroughDemo.jsx` per HARNESS.md conventions).

Out of scope: the Vercel deploy itself; spot-checking the live site; splitting `HackInABox.jsx` (backlog item 2); any content/copy changes; testing live AI responses (locally `api/*.js` does not run — demo mode is by design, do not report it as a bug).

## Setup (do these before any criterion, in this order)

1. **Safety intercept (absolute, HARNESS.md rule):** before the first `page.goto`, register Playwright route interception for `POST /api/feedback` — it forwards to a Google Apps Script webhook bound to the real feedback Sheet; no test submission may ever reach it. **The stub must fulfill with HTTP 200 and body `{}`** so the widget's `fetch` resolves and it reaches its `done` ("Thank you!") state. A 500 or aborted route would push the widget into its error state and spuriously fail C10.
2. **Fresh state:** use a fresh browser context (or run `localStorage.clear()` then reload before starting). The app persists `hiab-view` (current page — stale state skips the Home page entirely), `hiab-intro-seen`, `hiab-feedback-done`, `hiab-feedback-snooze`, and `hiab-feedback-name`. All criteria assume pristine state.
3. **Intro modal:** the intro modal does not appear on Home; it appears on first arrival at any content page. C1 covers dismissing it. All later criteria assume it is gone.
4. Default viewport 1440×900 except where C11 says otherwise. Demo mode is expected: under `vite dev`, `/api/chat` and `/api/tts` are unavailable by design.

## Criteria (each must be mechanically checkable by a browser-driving evaluator)

- [ ] C1 — Home → playbook entry, and intro modal dismissal: at 1440px the home page shows the h1 "Run your own design sprint." and two buttons labeled "Browse the playbook →" and "Try the AI Thinking Partner". Clicking "Browse the playbook →" lands on Overview: the h2 "What is HIAB?" and the heading "Where should you start?" are both visible. On this first arrival a modal with heading "You're testing an early prototype" appears; clicking its "Got it — let's go" button removes the modal from the DOM.

- [ ] C2 — "Where should you start?" paths: on Overview, the three numbered path rows navigate by swapping the rendered view (this is a client-side SPA with no URL routing — do **not** assert on `page.url()`, it never changes). For each row, assert the destination page's h2 heading text becomes visible: "I'm new to all of this" → h2 "Heart of Innovation"; "I'm planning a sprint" → h2 "Prepare Your Sprint"; "My sprint is happening soon" → h2 "Empathy Maps". After each navigation also assert the left nav rail highlights the destination's phase group: the matching phase button ("Get started" / "Prepare" / "Run the sprint" respectively) has computed `font-weight: 700` while the other four phase buttons have `font-weight: 500`. Return to Overview between rows via the "Get started" rail button.

- [ ] C3 — Full page walk via Prev/Next: starting from Overview, click the sticky bottom bar's Next button (its text is "Next · <page label>"; there is no "→") repeatedly — 20 clicks — and after each click assert the destination page's h2 (PhaseHeader title) is present in the DOM with non-zero height. Assert the first two hops explicitly as proof the bar advances: Overview → "Heart of Innovation", then → "Prepare Your Sprint". The full expected sequence of h2 titles, in Prev/Next order:
  | # | Nav label (Next button) | h2 title to assert |
  |---|---|---|
  | 1 | Overview (start) | What is HIAB? |
  | 2 | Foundation | Heart of Innovation |
  | 3 | Before You Start | Prepare Your Sprint |
  | 4 | Leadership Buy-In | Get Leadership Buy-In |
  | 5 | Recruit & Plan | Recruit & Plan |
  | 6 | Team & Materials | Team & Materials |
  | 7 | Sprint Formats | Choose Your Sprint Format |
  | 8 | Empathy Maps | Empathy Maps |
  | 9 | Personas | Personas |
  | 10 | Define | Writing Problem Statements |
  | 11 | Ideation | Ideation & Brainstorming |
  | 12 | Crazy 8s | Exercise: Crazy 8s |
  | 13 | Prototyping | Prototyping |
  | 14 | Getting Feedback | Test & Get Feedback |
  | 15 | Pitch | Pitch to Leadership |
  | 16 | Capture & Document | After the Sprint |
  | 17 | Share with Leadership | Share with Leadership |
  | 18 | Keep It Alive | Keep It Alive |
  | 19 | Sprint Templates | Templates & Resources |
  | 20 | Post-Sprint Templates | Post-Sprint Templates |
  | 21 | AI in Your Sprint | AI in Your Sprint |

- [ ] C4 — 5-step bar on Run pages: on each of the 8 Run pages (rows 8–15 above) a step bar renders below the facilitator banner. Only the active step renders its label text inline (inactive steps render only a number or "✓"), so the zero-judgment check is: within the step bar, exactly one of the five label strings "Empathize" / "Define" / "Ideate" / "Prototype" / "Pitch" is visible, and it is the one matching the current page — Empathy Maps & Personas → "Empathize"; Writing Problem Statements → "Define"; Ideation & Crazy 8s → "Ideate"; Prototyping & Test & Get Feedback → "Prototype"; Pitch to Leadership → "Pitch". Scope the text query to the step bar element, not the whole page.

- [ ] C5 — Guided walkthrough (empathy map), count-based: on the Empathy Maps page the walkthrough shows four zone `<section>` elements with aria-labels (and visible headings) Says / Thinks / Does / Feels. Click "Start the story" → exactly 1 note card (`li.hiab-wt-note`) is in the grid. Click "Next note" 8 more times → after the k-th advancing click the total `li.hiab-wt-note` count equals k, ending at 9. The advance button then reads "Reveal the insight"; clicking it shows a banner containing the text "The insight:" and "That tension is your insight".

- [ ] C6 — Walkthrough spot-check beyond empathy (shared component): on the Pitch to Leadership page, click "Start the pitch" → 1 note card; click "Next beat" 4 more times → 5 note cards total; the button then reads "Why this works"; clicking it shows the insight banner containing "Open with the story, close with a small ask".

- [ ] C7 — AI Thinking Partner (demo mode): from Home, "Try the AI Thinking Partner" opens the full-screen chat with top-bar title "AI Thinking Partner". Type a message and send: the assistant message count increases by one, and the banner whose text contains "Running in demo mode" becomes visible (the banner appears only after the first send — do not assert it before sending). Clicking the "←" button (title "Back to home") returns to Home: the h1 "Run your own design sprint." is visible again.

- [ ] C8 — SCIPAB builder (demo mode): on the Writing Problem Statements page (Define), under the heading "Build your problem statement (AI-guided)", the intro card titled "The SCIPAB Framework" shows a button "Start Building Your Problem Statement". The chat (including its "SCIPAB Problem Coach" header) renders only after clicking that button — do not assert it before. After clicking: the header "SCIPAB Problem Coach" is visible with non-zero dimensions, a bot message contains "what's the name of your church or organization?", and the textarea placeholder is "Enter your church or organization name...". Enter a name and send → the placeholder becomes "Describe your situation...". The 6-circle step indicator is present; the current step's circle (letter "S") has computed `border: 2px solid` in the step color, while the five other circles' computed `border-color` is `transparent`.

- [ ] C9 — Proposal generator (demo mode): on the Prototyping page, the accordion "Build a Proposal for Leadership" is visible with the button "Start Building Your Proposal". Clicking it opens the chat with a bot message containing "what's the name of your team or sprint group?". Entering a name (e.g. "Team Maria") and sending produces the acknowledgment message "Great, Team Maria! Let's build your proposal step by step."

- [ ] C10 — Feedback widget end-to-end (stub from Setup step 1 must already be active): precondition — `hiab-feedback-snooze` is absent or "no" and "overview" is not in `hiab-feedback-done` (if a prior criterion minimized the widget, remove those keys and reload). On Overview, the launcher pill (button with aria-label starting "Give feedback on") is `position: fixed` in the bottom-right and contains the text "Feedback" plus the page label "Overview". The card auto-opens within 5 s of landing (timer is 1.4 s). Disabled-state check: with both "Is this helpful?" and "Would you use this tool?" unanswered and the comment empty, the "Send feedback" button has the HTML `disabled` attribute regardless of the name field's value. Then fill "Your name", click "Yes" on both questions, add a comment, and click "Send feedback" → the card shows "Thank you!" and within ~3 s collapses to a pill whose text reads "Sent". The intercepted request body JSON must contain the entered `name` and `"page": "Overview"`.

- [ ] C11 — Responsive 375 / 768 / 1440: at 375px, on Home, Overview, Choose Your Sprint Format, and Empathy Maps, `document.documentElement.scrollWidth <= 375`. Mobile nav: clicking the button with aria-label "Open menu" opens an overlay containing the five phase buttons; clicking "Prepare" closes it and the h2 "Prepare Your Sprint" is visible (the rail lists phase groups, not individual pages — do not look for page names in it). At 375px on Empathy Maps, all four walkthrough zone `<section>` elements (aria-labels Says/Thinks/Does/Feels) report the same `offsetLeft` (single column). At all three widths (375/768/1440), on a content page, `getBoundingClientRect()` of the feedback launcher pill and of the Prev/Next bar's Next button (the button whose text starts with "Next ·") must not intersect.

- [ ] C12 — Console cleanliness: across the entire walk (C1–C11, all three viewports), the browser console contains no uncaught exceptions, no React warnings (keys, invalid DOM nesting, act, etc.), and no error-level logs — excluding network 404/failure logs for `/api/chat`, `/api/tts`, or `/api/feedback`-interception artifacts, which are expected under local vite dev (demo mode by design).

## Evaluator review — round 2: ACCEPTED
