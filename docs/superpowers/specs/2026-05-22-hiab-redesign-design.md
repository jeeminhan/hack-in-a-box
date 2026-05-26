# Hack In A Box — Visual & IA Redesign

**Date:** 2026-05-22
**Status:** Approved design, ready for implementation plan
**Deadline driver:** Usable by **June 4** (Indigitous North America hackathon info session)

## Problem

The current prototype has two problems, in the user's words: the look is **"very tacky"** and **"the flow of the information is hard to follow."**

Concretely:
- **Tacky:** many bright accent colors at once, emoji icons, gradient boxes everywhere, mixed fonts with no discipline.
- **Hard to follow:** 13 flat nav items mix three different kinds of thing (concepts, process steps, tools), and four parallel "modes" (Solo Sprint / Mini-Modules / AI Thinking Partner / Reference Library) overlap confusingly.

## Audience (unchanged, from meetings)

**Hack champions / lay leaders** — people with an affinity for design thinking but **no prior experience facilitating** a sprint, who want to run a **2–6 hour mini-hackathon** at their church or organization. The product must work **self-serve**, without Nick or Jeemin in the room. North star: *a clear, self-serve prototype in a hack champion's hands by June 4.*

## Design decisions (all locked with the user)

### 1. Visual direction — "Quiet Premium," on Indigitous brand
Calm, spacious, disciplined. One accent, real type hierarchy, no emoji, generous whitespace, pill buttons, hairline dividers.

### 2. Brand tokens (from `Indigitous_Branding_Guidelines.pdf`)
- **Accent (primary):** `#EF4E25` (Indigitous orange) — the *only* decorative color
- **Ink:** `#131313` (headings), `#262626` / greys for body. **Never `#000000`.**
- **Surfaces:** warm stone `#F4F2EC` (app bg) / `#FAF8F3` (rails) / `#FFFFFF` (cards); brand neutral grey `#D9D9D6`; hairlines ~`#E7E3D9`/`#EEEAE0`
- **Secondary palette (sparingly, e.g. tags/states only):** `#A5D9E7`, `#8DC8E8`, `#EFE974`, `#B86B78`, `#C4BCB7`, `#CBD3EB`
- **Typeface:** **Noto Sans** only (brand font). Hierarchy comes from weight (400–800) + size, not from a second family. No serif.
- **Logo:** Indigitous square mark (orange tile + stone cutout) in the top bar.

### 3. Information architecture — phase-grouped single spine
Five top-level phases, in journey order:

1. **Get started** — What is HIAB?, Heart of Innovation
2. **Prepare** — logistics, recruiting, choosing the 2–6 hr format
3. **Run the sprint** — five numbered steps:
   - 1 **Empathize** (Empathy Maps + Personas)
   - 2 **Define** (Problem Statements + the SCIPAB "Submit a Problem" tool)
   - 3 **Ideate** (Crazy 8s)
   - 4 **Prototype** (Prototyping + feedback)
   - 5 **Pitch** (leadership one-pager)
4. **After the sprint** — keep momentum, Impact Story, 30/60/90
5. **Resources** — Templates, "AI in Your Sprint", AI Thinking Partner

### 4. Navigation execution — "Take B": slim sidebar + top step bar
- **Slim left sidebar:** the 5 phases only (one accent on the active phase). Calm, short.
- **Top horizontal step bar:** appears in the "Run the sprint" phase — the 5 steps as a numbered progress bar with connectors, a check ✓ for completed steps, orange for current. Gives a first-time facilitator an obvious "where am I / how much is left."
- Only the active section is emphasized; no showing all 13 items at once.

### 5. Mode consolidation — 4 modes → 1 app
Collapse the four parallel modes into a **single app** with **two ways in** from the homepage:
- **Start a Solo Sprint** → guided path through the 5 "Run the sprint" steps, with worksheets and AI nudges inline.
- **Browse the playbook** → free navigation of the same spine.

The standalone Mini-Modules / AI Thinking Partner / Reference Library modes are removed as top-level concepts; their content is rehomed into the spine (see IA) and the Resources phase.

## What's reused vs rebuilt

**Reused as-is (rehomed, not rewritten):**
- All worksheet components (Empathy Map, Persona, Problem Statement, Crazy 8s, Feedback, Sprint Summary, Leadership Proposal, 30/60/90, Impact Story)
- SCIPAB "Submit a Problem" chatbot
- AI Thinking Partner (chat + voice)
- The "AI in Your Sprint" section content (built 2026-05-22)
- The serverless AI proxy (`api/chat.js`); `AI_ENDPOINT` already defaults to `/api/chat`

**Rebuilt:**
- App shell + routing/state (replaces the `mode` picker + flat `sections` model)
- Navigation (slim sidebar + top step bar)
- Homepage (two-way entry, brand-accurate hero)
- Design tokens / global styling (the restyle that removes the tackiness)

## Out of scope (explicitly not June 4)

- New Indigitous marketing website (separate, "end of month" track)
- Challenge-intake chatbot (Nick: finish basic HIAB first)
- Earlier wishlist: Heart-of-Innovation animation, live phone-submit empathy map
- Pre-existing lint errors in the voice-mode code (don't touch voice logic)

## Success criteria

- A hack champion can land on the home, understand what HIAB is, and either start a guided sprint or browse — without external help.
- The nav reads as one clear journey (5 phases), not 13 flat items.
- Visuals are disciplined: one accent, Noto Sans, stone/ink palette, no emoji — recognizably Indigitous.
- Clean at 375 / 768 / 1440 widths; no console errors; `npm run build` passes.
- Existing worksheets, SCIPAB, AI Partner, and AI section still function in their new homes.

## Constraints / notes

- Single large file today: `src/HackInABox.jsx` (~4,000 lines). The redesign is a good moment to split the shell/nav/home into focused modules, but keep worksheet/AI components intact to limit risk before June 4.
- Deploy path: push → Cloudflare/Vercel auto-deploy. `GEMINI_API_KEY` must be set in Vercel for live AI (else demo mode).
