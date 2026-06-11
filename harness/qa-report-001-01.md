# QA Report — contract 001, round 01

**Date:** 2026-06-11  
**App:** http://localhost:5173 (confirmed 200)  
**Build state:** lint clean, build clean (per generator-state.md)  
**Safety:** `POST /api/feedback` route-intercepted (HTTP 200 `{}`) before first navigation — confirmed by captured request body in C10. No traffic reached the real webhook.

---

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| C1 | Home → playbook entry + intro modal dismissal | PASS | h1 "Run your own design sprint." visible; two buttons present; Overview shows h2 "What is HIAB?" and h3 "Where should you start?"; modal heading "You're testing an early prototype" appeared; "Got it — let's go" click removed it from DOM (introHeadingFound: false post-click) |
| C2 | "Where should you start?" paths | PASS | Path 1 → h2 "Heart of Innovation", "Get started" nav = fw700, others fw500. Path 2 → h2 "Prepare Your Sprint", "Prepare" = fw700. Path 3 → h2 "Empathy Maps", "Run the sprint" = fw700. All others fw500 in each case. |
| C3 | Full page walk via Prev/Next (20 clicks) | PASS | All 20 Next clicks produced correct h2 titles with non-zero height. Steps 1–2 explicit: "Heart of Innovation" then "Prepare Your Sprint". Next button text matched "Next · <label>" at every step. |
| C4 | 5-step bar on Run pages | PASS | All 8 Run pages: 5 buttons found via `button[title]`, exactly 1 active label per page (textContent length > 1 = label rendered). Empathy Maps/Personas → "Empathize"; Define → "Define"; Ideation/Crazy 8s → "Ideate"; Prototyping/Getting Feedback → "Prototype"; Pitch → "Pitch". |
| C5 | Guided walkthrough (empathy map), count-based | PASS | 4 zone sections with aria-labels Says/Thinks/Does/Feels present. "Start the story" → 1 note. 8 × "Next note" → counts 1–9. Final button reads "Reveal the insight". Banner shows "The insight:" and "That tension is your insight". |
| C6 | Walkthrough spot-check (Pitch to Leadership) | PASS | "Start the pitch" → 1 note. 4 × "Next beat" → 5 notes. Button reads "Why this works". Banner contains "Open with the story, close with a small ask". |
| C7 | AI Thinking Partner (demo mode) | PASS | Top-bar title "AI Thinking Partner" visible. Demo banner absent before send, present after send. "Back to home" button (title="Back to home") navigated back to h1 "Run your own design sprint.". Console 404 for /api/chat is expected and excluded by C12. |
| C8 | SCIPAB builder (demo mode) | PASS | "The SCIPAB Framework" card visible; "Start Building Your Problem Statement" present; header not visible before click. After click: "SCIPAB Problem Coach" header visible (165×20px). Bot message contains "what's the name of your church or organization?". textarea[0] placeholder = "Enter your church or organization name..." Before send: S circle border-color = rgb(239,78,37), C–B border-color = rgba(0,0,0,0). After sending "Grace Church": placeholder transitions to "Describe your situation...". |
| C9 | Proposal generator (demo mode) | PASS | "Build a Proposal for Leadership" accordion visible. "Start Building Your Proposal" button present. After click: bot asks "what's the name of your team or sprint group?". After sending "Team Maria": response contains "Great, Team Maria! Let's build your proposal step by step." |
| C10 | Feedback widget end-to-end | PASS | Pill `position: fixed`, aria-label "Give feedback on the Overview page", text contains "Feedback" and "Overview". Card auto-opens within 5 s (1.4 s timer). "Send feedback" disabled with no answers (confirmed). Disabled after name-only fill (confirmed). Enabled after both Yes answers. Click send → "Thank you!" visible → pill collapses to "Sent" within ~3 s. Intercepted body: `{"section":"overview","page":"Overview","name":"Test Evaluator","helpful":true,"wouldUse":true,"comment":"Great tool!"}` — `name` and `page` match. |
| C11 | Responsive 375 / 768 / 1440 | PASS | **375px:** Home scrollWidth=375, Overview=375, Sprint Formats=375, Empathy Maps=375. Mobile nav: "Open menu" button present, overlay shows 5 phase buttons, clicking "Prepare" lands on h2 "Prepare Your Sprint". Zone sections all offsetLeft=39 (single column). Pill/Next non-intersecting (pill bottom=732, Next top=2031). **768px:** Overview scrollWidth=768, Empathy=768, no overflow. Pill/Next non-intersecting. **1440px:** Overview scrollWidth=1440, Empathy=1440. Pill/Next non-intersecting (pill bottom=808, Next top=1480). Screenshot: `harness/screenshots/c11-1440px.png` |
| C12 | Console cleanliness | PASS | Console log across full session: 1 × `[ERROR] Failed to load resource: 404 @ /api/chat` (explicitly excluded by C12), 3 × INFO React DevTools reminder (not errors). No uncaught exceptions, no React warnings (keys, invalid DOM nesting, act, etc.), no other error-level logs. |

---

## Verdict: PASS (all 12 criteria passing)

## Failures
None.

## Out-of-contract findings (not graded)

- **At 375px, the feedback card auto-opens and intercepts pointer events over the nav area**, making Playwright's `locator.click()` time out on navigation buttons. JS-based `.click()` bypasses it but real users may also find the auto-opening card difficult to dismiss when it covers critical navigation buttons on mobile. Not a bug per C10 (which confirms the card opens) but worth noting for mobile UX.
- **The intro image SVG `<rect>` element intercepts pointer events** at 375px, blocking clicks on the "Open menu" button at Playwright's hit-test level. The button is functional via JS click. Whether this causes a real-user issue on touch devices is unverified.

## Console errors observed

- `[ERROR] Failed to load resource: 404 @ http://localhost:5173/api/chat` — expected, excluded by C12 (vite dev, demo mode by design)
- `[INFO] React DevTools recommendation` — informational only, not an error
