# Sprint-Wide Walkthrough Demos + AIHelper Removal — Design

**Date:** 2026-06-10
**Status:** Approved (extends 2026-06-10-empathy-map-walkthrough-design.md)

## Purpose

Two changes requested after the empathy map walkthrough shipped:

1. **Remove the "Ask AI for help with this step" widget** (`AIHelper`) from all six step pages
   (problem, empathy, personas, ideate, prototype, pitch) and delete the component. The standalone
   AI Thinking Partner page and the SCIPAB chatbot are untouched; the shared `callAI` helper stays.
2. **Extend the guided-walkthrough treatment to the remaining sprint pages**, so each step page
   shows participants what they're about to do before they do it.

## One continuous worked example

All walkthroughs follow **one story thread — Maria, the first-time visitor** — through the whole
sprint, so each page's demo teaches its format *and* shows how the previous step feeds the next:

| Page | Board layout | What plays out |
|------|--------------|----------------|
| Empathize (shipped) | 4 quadrants, 2-col | Observations land in Says/Thinks/Does/Feels; says/feels tension is the insight |
| Personas | 4 card fields, 2-col | Empathy notes become a persona card (snapshot, backstory, goals, pains) |
| Problem | 3 stacked zones | Pains → dot-voted focus → three HMW drafts (solution-in-disguise ✗, vague △, sharp ✓) |
| Ideate | 1 idea wall | Eight ideas accumulate; the winning "welcome buddy" idea emerges past the obvious ones |
| Crazy 8s | 8 panels, 4-col | One sketch caption per panel; dot votes land on panels 6–7 (second half) |
| Prototype | 6 storyboard frames, 3-col | Maria experiences the Welcome Buddy idea frame by frame |
| Feedback | 3 columns | I like / I wish / What if cards; a wish + its neighboring what-if are the iteration seeds |
| Pitch | 5 stacked beats | Story → problem → idea → evidence → small concrete ask |

## Code shape

- `src/WalkthroughDemo.jsx` — generalization of `EmpathyMapDemo` (which is deleted). Data-driven:
  `{ zones, cols, narrowCols, zoneMinHeight, intro, steps, insightBeat, insightTakeaway, labels }`.
  Same interaction model: Next/Back, progress dots, restart, tension-note highlighting at the
  insight step, deterministic rotations, reduced-motion support, aria-live announcements.
  Steps may omit `beat`; the most recent beat carries forward.
  Responsive: desktop column count from `cols`; below 640px a CSS variable drops to `narrowCols`.
- `src/walkthroughs.js` — all eight scripts as data (`WALKTHROUGHS`), including the existing
  empathy script moved out of the component.
- `src/HackInABox.jsx` — `AIHelper` component and its six call sites removed; each sprint page
  gains a `SectionHeading` + one-line intro + `<WalkthroughDemo script={…} accent={phase accent} />`
  placed after the page's main how-to accordion.

## Testing

Manual: step every script end to end in the browser, verify insight highlighting, spot-check
mobile layout on the 4-col (Crazy 8s) and 3-col (prototype/feedback) boards, confirm no
references to `AIHelper` remain, lint + production build green.
