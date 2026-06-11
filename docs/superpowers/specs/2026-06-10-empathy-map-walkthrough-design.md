# Empathy Map Walkthrough — Design

**Date:** 2026-06-10
**Status:** Approved

## Purpose

The Empathize page teaches the four-quadrant empathy map (Says / Thinks / Does / Feels) with a static
illustration. Facilitators and participants read about the format but never see one being built.
This feature replaces the static worksheet image with an interactive guided walkthrough: a worked
example that fills itself in, one sticky note per click, so a facilitator can project it and narrate
the exercise before the group runs it on poster paper.

This is a **teaching demo, not a tool**. The real exercise stays on poster paper. No persistence,
no free-form input, no multiplayer.

## Placement

- On the Empathize page (`case "empathy"` in `src/HackInABox.jsx`), the component replaces the
  `SectionArt` that currently shows `worksheet-empathy-map.webp` with its caption.
- The static asset stays in `src/assets/illustrations/` (unused by the page) in case it is wanted
  for print contexts later.

## Content

A scripted story about **Maria, a first-time visitor** — consistent with the worked example already
used in the app (overwhelmed by the size of the congregation, doesn't know how to get involved,
feels invisible, wishes someone had personally invited her).

- ~9 steps. Each step has a one-line **story beat** shown above the map and one **sticky note**
  that lands in a quadrant.
- A final **insight step**: the demo highlights the tension between a SAYS note ("It was nice,
  everyone seems friendly") and a FEELS note (invisible), and shows the takeaway line:
  *"That tension is your insight. It becomes your How-Might-We."*
- Before any clicks, each quadrant shows its label plus a one-line definition, so the resting
  state still works as a reference diagram.

## Interaction

- **Next / Back** buttons and **progress dots**; a **restart** affordance at the end.
- No autoplay, no timers — the facilitator controls pacing.
- Each Next adds one note with a short toss-in animation (transform + opacity only) and a slight
  per-note rotation. Rotation is deterministic (lookup by index — no randomness in render).
- The quadrant receiving a note gets a brief highlight.
- `prefers-reduced-motion: reduce` disables the toss animation; notes appear instantly.

## Visual

- Follows the HIAB design system: card surfaces, hairline dividers, Indigitous orange as the only
  decorative color (`src/theme.js`). Sticky notes use a warm paper tone derived from the existing
  palette; the insight highlight uses the orange accent.
- 2×2 quadrant grid on desktop; stacks usable on narrow screens (quadrants remain a 2×2 grid down
  to ~360px since notes are short; grid collapses to one column below that).

## Code shape

- New file: `src/EmpathyMapDemo.jsx`. Contains:
  - `STORY` — data array of steps `{ quadrant, note, beat }` plus the insight metadata.
  - `EmpathyMapDemo` — a step-index state machine over `STORY` (single `useState`).
- Keyframes injected via an inline `<style>` tag, matching existing codebase idiom, with a
  `prefers-reduced-motion` media query.
- `src/HackInABox.jsx` imports the component and swaps it in for the static `SectionArt`.
  No new dependencies.

## Accessibility

- Next/Back/Restart are real `<button>` elements.
- Notes render as semantic list items inside labeled quadrant regions.
- New notes are announced through a polite `aria-live` region (the story beat + note text).

## Error handling

No external input, network, or storage — the only failure mode is stepping past the ends of the
script, which the component guards by clamping the step index.

## Testing

Manual verification (the repo has no test harness): step through the full script, verify Back and
restart, verify reduced-motion behavior, and check 360px / 768px / 1440px layouts.
