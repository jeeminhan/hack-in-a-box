# Subsection illustration prompts

Full coverage of every subsection, in the same textured-gouache style as the existing 16.
Generate in ChatGPT, save to `src/assets/illustrations/<filename>`, then we wire them in.

## ⚠️ Density guidance
- **Banner (16:9, ~640px)** — section headers + major `h3` groupings. Already done for the 10 sections.
- **Spot (1:1, render at 64–96px)** — accordion subsections. Small, sits next to the title. Keeps
  the page calm instead of turning every panel into a poster. Most prompts below are SPOTS.
- Don't feel obligated to fill all 34 — start with one section, see the feel, expand.

## STYLE PREAMBLE — paste on top of EVERY prompt
> Textured gouache illustration, contemporary Japanese editorial style. Hand-painted with visible
> brush texture and paper grain, matte, no hard outlines. Muted earthy palette — warm cream/stone
> background, sage and olive green, slate blue-grey, warm brown — with a single vivid vermilion-orange
> (#EF4E25) accent. Calm, lots of negative space, gently naive perspective. No text, no logos, no
> detailed faces. For SPOT icons: single centered subject, minimal, square 1:1. For BANNERS: 16:9.

---

## Already illustrated (do NOT regenerate — 16 done)
Heroes (2), 6 phase headers, 4 worksheet thumbnails, 4 concepts. See `PLACEMENT.md`.

---

## AI in Your Sprint  (`case "ai"`)
| Filename | Ratio | Prompt subject |
|---|---|---|
| `ai-why.webp` | spot | A brain/lightbulb shape with a small orange spark beside a gear — AI assisting thinking |
| `ai-tools.webp` | spot | A small toolbox or palette of simple app tiles, one tile vermilion-orange |
| `ai-each-step.webp` | spot | A short numbered checklist with an orange chat/sparkle mark — AI guiding each step |

## What is HIAB? / overview  (`case "overview"`)
| Filename | Ratio | Prompt subject |
|---|---|---|
| `overview-different.webp` | spot | A single standout orange shape among muted identical shapes — "what makes it different" |
| `overview-process.webp` | banner | Five linked stepping-stones left-to-right (empathize→test), the middle stone orange |

## Heart of Innovation  (`case "foundation"`)
| Filename | Ratio | Prompt subject |
|---|---|---|
| `foundation-created.webp` | spot | Hands shaping clay or a small seedling — "created to create" |
| `foundation-humility.webp` | spot | A small open hand holding a tiny orange seed, low and humble |
| `foundation-experiment.webp` | spot | A simple beaker/flask with one orange bubble — permission to experiment |
| `foundation-values.webp` | spot | A small compass, the needle tip orange — guiding values |

## Prepare Your Sprint  (`case "prepare"`)
| Filename | Ratio | Prompt subject |
|---|---|---|
| `prepare-prayer.webp` | spot | Two cupped hands in quiet prayer, a soft orange glow above them |
| `prepare-pitch-pastor.webp` | spot | One figure speaking to another across a small desk — pitching leadership |
| `prepare-recruit.webp` | spot | A small cluster of people figures, one waving in orange — recruiting |
| `prepare-timeline.webp` | banner | A horizontal timeline with weekly markers, the final marker orange |
| `prepare-multi-church.webp` | spot | Two simple church/house shapes linked by an orange line — collaboration |
| `prepare-team.webp` | spot | Three or four people figures grouped in a circle, one orange |
| `prepare-materials.webp` | spot | Sticky-note pad, marker, and dot stickers, one dot orange — supplies |
| `prepare-agendas.webp` | spot | A simple clock/agenda sheet with time blocks, one block orange |

## Writing Problem Statements  (`case "problem"`)  — header already has phase-2-define
| Filename | Ratio | Prompt subject |
|---|---|---|
| `problem-hmw.webp` | spot | A speech bubble framed as a question, the question mark orange — "How Might We" |
| `problem-pitfalls.webp` | spot | A small warning cone or a fork in a path, one branch dead-ending in orange |

## Empathy Maps  (`case "empathy"`)  — header already has phase-1-empathize
| Filename | Ratio | Prompt subject |
|---|---|---|
| `empathy-exercise.webp` | spot | A 4-quadrant grid with sticky notes being added, one note orange |
| `empathy-personas.webp` | banner | Two or three distinct simple character figures side by side, one in orange tones |

## Ideation & Brainstorming  (`case "ideate"`)  — header already has phase-3-ideate
| Filename | Ratio | Prompt subject |
|---|---|---|
| `ideate-rules.webp` | spot | A "no-judging" symbol softened — an open speech bubble with an orange plus sign |
| `ideate-crazy8s.webp` | spot | A sheet folded into 8 panels with quick sketches, one panel orange (timed sketching) |

## Prototyping  (`case "prototype"`)  — header already has phase-4-prototype
| Filename | Ratio | Prompt subject |
|---|---|---|
| `prototype-forms.webp` | spot | A trio of rough mockups — paper, cardboard, storyboard — one element orange |
| `prototype-feedback.webp` | spot | Three small note cards ("I like / I wish / what if"), the middle one orange |

## After the Sprint  (`case "after"`)  — header already has phase-6-after-sprint
| Filename | Ratio | Prompt subject |
|---|---|---|
| `after-phase1-capture.webp` | spot | A camera/phone photographing sticky notes, shutter mark orange — document same-day |
| `after-phase2-share.webp` | spot | A document being handed from one hand to another, the doc edge orange |
| `after-phase3-alive.webp` | spot | A small plant being watered, a new orange leaf — keeping momentum alive |
| `after-culture.webp` | banner | A grove of small trees at different growth stages, the newest sapling orange — culture of innovation |

## Remaining template cards  (`case "templates"` — 4 cards still missing thumbnails)
| Filename | Ratio | Prompt subject |
|---|---|---|
| `template-scipab.webp` | 16:9 | A 6-row structured form with one row highlighted orange — SCIPAB framework |
| `template-feedback.webp` | 16:9 | Four labeled feedback cards in a 2x2 grid, one orange |
| `template-proposal.webp` | 16:9 | A single one-page pitch card with a header band in orange |
| `template-impact.webp` | 16:9 | A before→after pair of small scenes joined by an orange arrow — impact story |

---

### Batch tips
- Generate each **section group together** so brush weight/palette stay consistent within a section.
- For SPOTS, end the prompt with: *"tiny minimal spot icon, single subject, lots of empty cream space around it."*
- Total new: ~30 (≈26 spots + 4 banners + the 4 template thumbnails).

---

## FINISHED WORKED EXAMPLES — "what a completed one looks like"
For the **Run the sprint** sections, so teams see a filled-in artifact. Render larger (4:3,
~560px). These show the artifact POPULATED — sticky notes placed, sketches drawn, structure
filled — viewed flat/top-down on a warm surface.

> ⚠️ **Text caveat:** AI can't render legible words. Each prompt ends with this so it looks
> filled-in without gibberish letters:
> *"...filled with realistic handwriting-style marks, squiggle lines, and tiny sketches that
> read as content but contain NO legible letters or words. Flat top-down view, soft shadow."*

| Filename | Section | Prompt subject (append the text caveat above) |
|---|---|---|
| `example-empathy-map.webp` | empathy | A completed 4-quadrant empathy map on poster paper, each quadrant filled with several sticky notes (a few orange), a small figure sketch in the center |
| `example-persona-card.webp` | empathy | A finished persona card: avatar circle (orange ring), filled name/detail lines, a small day-in-the-life sketch, goals and pain-point sections populated |
| `example-scipab.webp` | problem | A completed SCIPAB worksheet — six labeled bands (Situation, Complication, Implication, Position, Action, Benefit) each filled with writing marks, one band accented orange |
| `example-hmw-statement.webp` | problem | A large sticky note or card with a finished "How Might We" question written as handwriting squiggles, underlined in orange, surrounded by a few discarded draft notes |
| `example-crazy8s.webp` | ideate | A Crazy 8s sheet folded into 8 panels, each panel holding a quick rough idea sketch, two panels starred in orange |
| `example-prototype.webp` | prototype | A finished low-fi paper prototype on a desk — taped paper phone screens in a row showing a simple flow, sticky-note labels, one screen element orange |
| `example-proposal.webp` | pitch | A completed one-page leadership proposal card: title band (orange), filled problem/solution/impact sections with writing marks, a small chart, laid on a desk |

Total worked examples: 7.
