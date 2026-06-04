# Illustration placement guide

Textured-gouache illustration set (Indigitous orange `#EF4E25` accent). Import from
`src/assets/illustrations/` so Vite bundles + hashes them. **Not yet wired into code.**

> ✅ Optimized: resized for 2× retina and converted to WebP (q80). All under 90 KB,
> 820 KB total. Full-res PNG originals remain in `~/Downloads` if you ever need them.

## Heroes / banners (16:9)
| File | What it shows | Suggested placement |
|------|---------------|---------------------|
| `hero-sprint-table.webp` | Group around a table covering it in sticky notes | Landing / Start hero, or "Run the sprint" intro |
| `hero-kit-box.webp` | Open box with lightbulb + tools lifting out | Alt hero — pairs with the "Hack in a Box" name |

## The 5 sprint phases (16:9) — section headers
Maps to `SECTIONS` / `phaseOf` ids in `theme.js`.
| File | Phase id | Section header |
|------|----------|----------------|
| `phase-1-empathize.webp` | `empathy` | Empathize (two people talking, orange speech bubble) |
| `phase-2-define.webp` | `problem` | Define (hand placing the one orange note) |
| `phase-3-ideate.webp` | `ideate` | Ideate (divergent arrows / idea map) |
| `phase-4-prototype.webp` | `prototype` | Prototype (hands building a paper phone) |
| `phase-5-pitch.webp` | `pitch` | Pitch (presenting at an easel) |
| `phase-6-after-sprint.webp` | `after` | After the sprint (path with milestone flags) |

## Worksheet / template thumbnails (1:1 square)
| File | What it shows | Suggested placement |
|------|---------------|---------------------|
| `worksheet-empathy-map.webp` | 4 quadrants: ear / thought / footstep / heart | Empathy Map worksheet (SAYS·THINKS·DOES·FEELS) card |
| `worksheet-persona-card.webp` | Profile card with orange avatar ring | `PersonaCardWorksheet` card/header |
| `worksheet-problem-statement.webp` | Magnifier over one highlighted line | Submit a Problem / SCIPAB card |
| `worksheet-sprint-summary.webp` | Document with an orange bar | `SprintSummaryWorksheet` / one-pager card |

## Concept accents (mixed ratio) — decorative, use anywhere
| File | What it shows | Suggested placement |
|------|---------------|---------------------|
| `concept-community-network.webp` | Houses + people linked, orange nodes | Community / church section, "why a sprint" |
| `concept-insight-lightbulb.webp` | Lightbulb, orange filament | "Open to creative solutions", insight callouts |
| `concept-stopwatch.webp` | Stopwatch, orange arc | "3–6 hour" / timeboxing copy |
| `concept-hands-cards.webp` | Many hands arranging cards | Affinity-mapping / hands-on collaboration |

## Note on shipping
A reusable `<SectionArt src alt />` component (warm-cream frame, rounded corners,
`loading="lazy"`, explicit width/height to avoid CLS) is the clean way to drop these in.
Hold until the in-progress `HackInABox.jsx` edits land to avoid a merge conflict.
