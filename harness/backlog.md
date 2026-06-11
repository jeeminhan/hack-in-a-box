# Backlog — Hack In A Box harness

Items are worked top-to-bottom, one contract each. Out-of-contract QA findings get appended here, not fixed mid-loop.

## 1. Pre-share-out QA sweep
Source: TODO.md — "Commit + deploy to Vercel, spot-check the live site" (blocks Nick's share-out).
Full evaluator sweep of the local app before deploy: all journeys in HARNESS.md, all viewports, console clean. Contract criteria = the app's core journeys working. Generator only acts if the sweep finds failures.

## 2. Split HackInABox.jsx into per-page modules
Source: structural debt — src/HackInABox.jsx is 3,301 lines (limit: 800/file).
Extract phase pages and shared components (FeatureBox, CtaBanner, SectionArt, Lead/SectionHeading) into src/components/ with zero behavior change. Criteria should be regression-shaped: every journey still works, build output unchanged in function.

## 3. Mobile overlay fixes (from QA sweep 001, out-of-contract)
Source: harness/qa-report-001-01.md.
At 375px the feedback card covers the nav area, and an SVG rect intercepts pointer events over the "Open menu" button. Both make mobile nav interactions unreliable.

## 4. Feedback-round fixes (placeholder)
Source: TODO.md — 1:1 feedback meetings (Priscilla, Jonah, Greta, Kyle, Sherman, Roy, Sharon, Michelle, Nelson).
As feedback arrives, add one item per concrete change here with the person's name attached.
