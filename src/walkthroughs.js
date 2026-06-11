// src/walkthroughs.js — scripts for the guided walkthrough demos on each
// sprint step page. One continuous worked example (Maria, a first-time
// visitor) threads through the whole sprint so each page shows both its own
// format and how the previous step feeds the next.
//
// Script shape (consumed by WalkthroughDemo):
//   zones            regions notes land in: { key, label, hint? }
//   cols             desktop column count for the zone grid
//   narrowCols       column count below 640px (1 or 2)
//   zoneMinHeight    min height per zone in px (default 130)
//   intro            beat line shown before any clicks
//   steps            { zone, note, beat?, tension? } — beat carries forward
//                    when omitted; tension notes get highlighted at the end
//   insightBeat      beat line for the final step
//   insightTakeaway  the lesson, shown in the insight banner
//   labels           { start, next, reveal } button text overrides

export const WALKTHROUGHS = {
  empathy: {
    cols: 2,
    narrowCols: 1,
    zones: [
      { key: "says",   label: "Says",   hint: "What they say out loud — direct quotes." },
      { key: "thinks", label: "Thinks", hint: "What's going through their mind — often unspoken." },
      { key: "does",   label: "Does",   hint: "What you observe them actually doing." },
      { key: "feels",  label: "Feels",  hint: "Their emotional state — name the feelings." },
    ],
    intro: "Meet Maria. Your team just watched her first visit — step through what they observed.",
    steps: [
      { zone: "says",   tension: true, beat: "Maria, 34, visited last Sunday. Afterward, a greeter asks how it was.", note: "“It was nice — everyone seems really friendly.”" },
      { zone: "does",   beat: "Rewind to 9:58 that morning.", note: "Arrives two minutes late and slips into the back row." },
      { zone: "thinks", beat: "She looks around at the full sanctuary.", note: "“Everyone here already knows each other.”" },
      { zone: "feels",  beat: "The room is warm — but she's alone in it.", note: "Overwhelmed by how big it all is." },
      { zone: "does",   beat: "During the welcome time…", note: "Checks her phone instead of greeting anyone." },
      { zone: "says",   beat: "On her way out, she tells the greeter:", note: "“Maybe I'll check out a small group sometime.”" },
      { zone: "thinks", beat: "But on the drive home she wonders…", note: "“How would I even get involved? Where do I start?”" },
      { zone: "feels",  tension: true, beat: "Nobody asked her name.", note: "Invisible — like no one would notice if she never came back." },
      { zone: "feels",  beat: "And still…", note: "Wishes someone would personally invite her to something." },
    ],
    insightBeat: "Now look across the quadrants. What doesn't line up?",
    insightTakeaway: "She says it was nice — but feels invisible. That tension is your insight, and it becomes your How-Might-We.",
    labels: { start: "Start the story" },
  },

  personas: {
    cols: 2,
    narrowCols: 1,
    zoneMinHeight: 110,
    zones: [
      { key: "snapshot", label: "Snapshot",   hint: "Name, age, life stage — make them feel real." },
      { key: "story",    label: "Backstory",  hint: "Their life and faith context, in two sentences." },
      { key: "goals",    label: "Goals",      hint: "What are they hoping for?" },
      { key: "pains",    label: "Pain points", hint: "What gets in their way?" },
    ],
    intro: "Your empathy map is full of observations about Maria. Watch them become a persona your whole team can design for.",
    steps: [
      { zone: "snapshot", beat: "Start with who she is — specific beats general.", note: "Maria Santos, 34 — new to the city, works in healthcare." },
      { zone: "story",    beat: "Add the context behind what you observed.", note: "Moved here eight months ago; knows almost no one outside work." },
      { zone: "story",    beat: "Include her faith journey — where is she now?", note: "Grew up church-adjacent; quietly exploring faith again." },
      { zone: "goals",    tension: true, beat: "Goals come straight from the Thinks and Feels quadrants.", note: "Find a community where she's known by name." },
      { zone: "goals",    note: "Grow spiritually without feeling judged for being new." },
      { zone: "pains",    beat: "Pain points are the barriers you observed.", note: "Big-room events feel anonymous and overwhelming." },
      { zone: "pains",    tension: true, beat: "And the one that hurt most…", note: "No one has personally invited her to anything." },
    ],
    insightBeat: "Look at her top goal next to her sharpest pain.",
    insightTakeaway: "Maria wants to be known by name, but nothing in her experience personally connects her. Your team now designs for her — not for “visitors in general.”",
    labels: { start: "Build the persona", next: "Next detail" },
  },

  problem: {
    cols: 1,
    narrowCols: 1,
    zoneMinHeight: 70,
    zones: [
      { key: "pains", label: "Pains we heard", hint: "One observation per note — straight from empathy work." },
      { key: "focus", label: "Our focus (dot-voted)", hint: "The cluster your team voted most urgent." },
      { key: "hmw",   label: "How might we…", hint: "Reframe the focus as an open, specific question." },
    ],
    intro: "Your team has empathy insights and a persona. Watch them narrow into one sharp How-Might-We question.",
    steps: [
      { zone: "pains", beat: "Each person posts the pains they noticed — one per note.", note: "Visitors leave without talking to anyone." },
      { zone: "pains", note: "People don't know how to get involved." },
      { zone: "pains", note: "Newcomers rarely come back a second time." },
      { zone: "focus", beat: "Cluster similar notes, then dot-vote. One cluster wins.", note: "● ● ●  Newcomers stay anonymous and drift away." },
      { zone: "hmw",   beat: "First draft — careful, there's a solution hiding in it.", note: "✗  “We need a better welcome team.”" },
      { zone: "hmw",   beat: "Second draft — open, but too vague to act on.", note: "△  “How might we make people feel welcome?”" },
      { zone: "hmw",   tension: true, beat: "Third draft — a specific person, a specific change, still open to any solution.", note: "✓  “How might we help first-time visitors like Maria feel personally known within their first month?”" },
    ],
    insightBeat: "Compare the three drafts.",
    insightTakeaway: "The first hides a solution. The second is too vague to act on. The third names a person, a change, and a timeframe — and still leaves room for any idea. That's your HMW.",
    labels: { start: "Start narrowing", next: "Next step", reveal: "Compare the drafts" },
  },

  ideate: {
    cols: 1,
    narrowCols: 1,
    zoneMinHeight: 90,
    zones: [
      { key: "wall", label: "The idea wall", hint: "Every idea goes up — quantity over quality, no judging yet." },
    ],
    intro: "The HMW is on the wall: how might we help visitors like Maria feel personally known? Watch a table brainstorm.",
    steps: [
      { zone: "wall", beat: "Start with the obvious — get it out of your system.", note: "Better signage and a welcome desk." },
      { zone: "wall", note: "Name tags for everyone on Sundays." },
      { zone: "wall", beat: "Build on each other — “yes, and…”", note: "A newcomers' brunch once a month." },
      { zone: "wall", note: "A QR-code card with clear next steps." },
      { zone: "wall", tension: true, beat: "Now push past sensible.", note: "Match every visitor with a personal “welcome buddy.”" },
      { zone: "wall", beat: "Wilder is fine — wild ideas unlock doors.", note: "Pastor records a personal video for every single visitor." },
      { zone: "wall", note: "A “bring someone new” dinner challenge for members." },
      { zone: "wall", tension: true, beat: "Keep going even when it feels done — idea #20 beats idea #2.", note: "Welcome buddy texts her midweek and brings her to small group." },
    ],
    insightBeat: "Nobody judged along the way — and look what emerged.",
    insightTakeaway: "The buddy idea only appeared after the obvious ones were out, and a later idea sharpened it. Quantity creates quality — that's why you defer judgment.",
    labels: { start: "Start brainstorming", next: "Next idea", reveal: "What emerged?" },
  },

  crazy8s: {
    cols: 4,
    narrowCols: 2,
    zoneMinHeight: 64,
    zones: [
      { key: "p1", label: "Panel 1" }, { key: "p2", label: "Panel 2" },
      { key: "p3", label: "Panel 3" }, { key: "p4", label: "Panel 4" },
      { key: "p5", label: "Panel 5" }, { key: "p6", label: "Panel 6" },
      { key: "p7", label: "Panel 7" }, { key: "p8", label: "Panel 8" },
    ],
    intro: "One participant, one folded sheet, eight minutes. Watch her panels fill — one sketch per minute.",
    steps: [
      { zone: "p1", beat: "Minute one — the first idea is usually the obvious one.", note: "Welcome desk sign" },
      { zone: "p2", note: "Name tags" },
      { zone: "p3", beat: "Keep the pen moving — no going back.", note: "Welcome email" },
      { zone: "p4", note: "Free coffee voucher" },
      { zone: "p5", beat: "Halfway — now it gets interesting.", note: "Buddy meets her at the door" },
      { zone: "p6", tension: true, note: "Buddy texts her on Tuesday" },
      { zone: "p7", tension: true, beat: "Past the obvious — this is where Crazy 8s earns its name.", note: "Buddy walks her into small group" },
      { zone: "p8", note: "Newcomer dinner hosted by buddies" },
    ],
    insightBeat: "The dot votes landed on panels 6 and 7.",
    insightTakeaway: "The winning sketches came in the second half — after the obvious ideas ran out. That's the whole point of eight panels.",
    labels: { start: "Start the timer", next: "Next sketch", reveal: "See the votes" },
  },

  prototype: {
    cols: 3,
    narrowCols: 1,
    zoneMinHeight: 80,
    zones: [
      { key: "f1", label: "Frame 1" }, { key: "f2", label: "Frame 2" }, { key: "f3", label: "Frame 3" },
      { key: "f4", label: "Frame 4" }, { key: "f5", label: "Frame 5" }, { key: "f6", label: "Frame 6" },
    ],
    intro: "The table picked “Welcome Buddies.” Watch them storyboard Maria experiencing it — stick figures are plenty.",
    steps: [
      { zone: "f1", beat: "Open where the story starts today.", note: "Maria arrives; a greeter spots a new face." },
      { zone: "f2", note: "Greeter introduces her to Sarah — her welcome buddy." },
      { zone: "f3", beat: "Show the small moments — that's where ideas live or die.", note: "They swap numbers over coffee after the service." },
      { zone: "f4", tension: true, note: "Tuesday: Sarah texts — “thinking of you, want to grab lunch?”" },
      { zone: "f5", note: "Sarah invites her to Thursday small group — and picks her up." },
      { zone: "f6", tension: true, beat: "End with the change you're designing for.", note: "Maria walks in and is greeted by name." },
    ],
    insightBeat: "Thirty minutes of sketching — and the idea is testable.",
    insightTakeaway: "Frames 4 and 6 are the moments that answer Maria's pain. A prototype doesn't have to work — it has to be concrete enough that someone can react to it.",
    labels: { start: "Start the storyboard", next: "Next frame", reveal: "Why it works" },
  },

  feedback: {
    cols: 3,
    narrowCols: 1,
    zoneMinHeight: 110,
    zones: [
      { key: "like",   label: "I like…",  hint: "What's working well?" },
      { key: "wish",   label: "I wish…",  hint: "What would you change?" },
      { key: "whatif", label: "What if…", hint: "What new possibilities does this spark?" },
    ],
    intro: "The table shares the Welcome Buddy storyboard. Watch the room respond with the three sentence starters.",
    steps: [
      { zone: "like",   beat: "Start with what's working — it earns the harder notes.", note: "The Tuesday text feels genuinely personal." },
      { zone: "like",   note: "Costs nothing — we could start this Sunday." },
      { zone: "wish",   tension: true, beat: "“I wish” surfaces the gaps kindly.", note: "I wish it didn't depend on one volunteer remembering." },
      { zone: "wish",   note: "I wish buddies knew what they're actually supposed to do." },
      { zone: "whatif", tension: true, beat: "“What if” turns critique into the next idea.", note: "What if buddies got a simple four-week checklist?" },
      { zone: "whatif", note: "What if we matched buddies by life stage?" },
    ],
    insightBeat: "Now read the wishes and what-ifs together.",
    insightTakeaway: "The “I wish” names the risk, and the “what if” beside it is the fix. Feedback isn't a verdict — it's the start of your next iteration.",
    labels: { start: "Start the feedback round", next: "Next card", reveal: "Find the seeds" },
  },

  pitch: {
    cols: 1,
    narrowCols: 1,
    zoneMinHeight: 56,
    zones: [
      { key: "story",   label: "The story",   hint: "Open with a human, not a program." },
      { key: "problem", label: "The problem", hint: "Your How-Might-We question." },
      { key: "idea",    label: "The idea",    hint: "One sentence." },
      { key: "learned", label: "What we learned", hint: "Evidence you didn't just guess." },
      { key: "ask",     label: "The ask",     hint: "Small, concrete, easy to say yes to." },
    ],
    intro: "Three minutes in front of leadership. Watch a pitch assemble, beat by beat.",
    steps: [
      { zone: "story",   tension: true, beat: "Lead with the human story — not the program.", note: "“Maria visited three times. Nobody learned her name.”" },
      { zone: "problem", beat: "Then the question your team chose.", note: "How might we help first-time visitors feel personally known within their first month?" },
      { zone: "idea",    beat: "One sentence — what you're proposing.", note: "Welcome Buddies: every visitor matched with one person who checks in for a month." },
      { zone: "learned", beat: "Show your work — it builds trust.", note: "We storyboarded it and tested it for feedback: the midweek text is the moment that matters, and buddies need a simple checklist." },
      { zone: "ask",     tension: true, beat: "End with an ask that's easy to say yes to.", note: "Pilot with five buddies for one month. Budget: $0. We'll report back what we learn." },
    ],
    insightBeat: "Three minutes, five beats.",
    insightTakeaway: "Open with the story, close with a small ask — that's what makes leadership lean in. A pitch isn't a performance; it's making “yes” easy.",
    labels: { start: "Start the pitch", next: "Next beat", reveal: "Why this works" },
  },
};
