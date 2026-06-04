// Vercel serverless function. Proxies chat requests to Google Gemini so
// the API key never reaches the browser. If GEMINI_API_KEY isn't set,
// returns canned demo responses so the UI is still useful for show-and-tell.

const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const body = req.body || {};

  // Structured AI-Coach requests from the SCIPAB problem builder and the proposal
  // generator. These send { type, responses, steps } and expect { result: {...} }.
  if (body.type === "scipab" || body.type === "proposal") {
    return handleStructured(body, apiKey, res);
  }

  const { system, messages, max_tokens = 800, model = DEFAULT_MODEL } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  if (!apiKey) {
    res.status(200).json({
      content: demoResponse(system, messages),
      demo: true,
    });
    return;
  }

  try {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }],
    }));

    const body = {
      contents,
      generationConfig: { maxOutputTokens: max_tokens, temperature: 0.7 },
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data?.error?.message || "Upstream error", detail: data });
      return;
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    res.status(200).json({ content: text, demo: false });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
}

// Handles the structured "AI Coach" requests (SCIPAB refine + proposal generator).
// Returns { result: <object the UI renders> }. Falls back to a usable demo result
// when GEMINI_API_KEY isn't set or the model response can't be parsed.
async function handleStructured(body, apiKey, res) {
  const steps = Array.isArray(body.steps) ? body.steps : [];
  const responses = body.responses || {};
  const stepKeys = steps.map((s) => s.key).filter(Boolean);
  const answersText = steps
    .map((s) => `${s.label || s.key}: ${responses[s.key] || "(not provided)"}`)
    .join("\n");

  if (!apiKey) {
    res.status(200).json({ result: demoStructured(body.type, stepKeys, responses), demo: true });
    return;
  }

  const prompt = body.type === "scipab"
    ? `You are an expert design-sprint facilitator helping a church called "${body.churchName || "the church"}" sharpen a problem statement using the SCIPAB framework.\n\nTheir notes:\n${answersText}\n\nReturn ONLY a JSON object with this exact shape:\n{\n  "hackability": { "score": <integer 1-5 for how focused and solvable-in-one-sprint this is>, "feedback": "<2-3 sentences assessing the problem and how to sharpen it>" },\n  "hmw": "<one strong 'How might we…' statement>",\n  "refined": { ${stepKeys.map((k) => `"${k}": "<a polished one-paragraph version>"`).join(", ")} }\n}`
    : `You are helping a church team "${body.teamName || ""}" turn sprint results into a clear, leadership-ready proposal.\n\nTheir notes:\n${answersText}\n\nReturn ONLY a JSON object with this exact shape:\n{\n  "title": "<short, compelling proposal title>",\n  "elevator_pitch": "<2-3 sentence pitch a pastor would grasp instantly>",\n  "refined": { ${stepKeys.map((k) => `"${k}": "<a polished, persuasive paragraph>"`).join(", ")} }\n}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 1200, responseMimeType: "application/json" },
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      res.status(200).json({ result: demoStructured(body.type, stepKeys, responses), demo: true, fallback: true });
      return;
    }
    const raw = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    const parsed = safeParseJson(raw);
    if (!parsed) {
      res.status(200).json({ result: demoStructured(body.type, stepKeys, responses), demo: true, fallback: true });
      return;
    }
    res.status(200).json({ result: parsed, demo: false });
  } catch {
    res.status(200).json({ result: demoStructured(body.type, stepKeys, responses), demo: true, fallback: true });
  }
}

function safeParseJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch { /* try to recover */ }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
  }
  return null;
}

// Built from the user's own answers so it's still useful without a model key.
function demoStructured(type, stepKeys, responses) {
  const refined = {};
  stepKeys.forEach((k) => { refined[k] = responses[k] || "Add detail here for a stronger statement."; });
  if (type === "proposal") {
    return {
      title: "Proposal (demo mode — set GEMINI_API_KEY for AI polish)",
      elevator_pitch: "Your proposal content is saved below. Set GEMINI_API_KEY in Vercel to have AI refine it into a polished, leadership-ready pitch.",
      refined,
    };
  }
  return {
    hackability: { score: 3, feedback: "Demo mode — set GEMINI_API_KEY in Vercel for a real AI assessment. Your inputs are preserved below." },
    hmw: responses.position || responses.complication || "How might we address this challenge in a focused sprint?",
    refined,
  };
}

function demoResponse(system, messages) {
  const last = messages[messages.length - 1]?.content || "";
  const lower = String(last).toLowerCase();

  if (lower.includes("empathy") || lower.includes("transcript") || lower.includes("interview")) {
    return [
      "**Demo mode** — set GEMINI_API_KEY for live responses.",
      "",
      "Here's what I'd pull from a real transcript:",
      "",
      "**Says:** \"I keep meaning to come to small group, but I just can't make it work with my schedule.\"",
      "**Thinks:** Probably feels guilty about not showing up; wonders if anyone notices.",
      "**Does:** Attends Sunday service most weeks; skips midweek events.",
      "**Feels:** Disconnected from the community despite attending regularly.",
      "",
      "**Insight:** The gap isn't motivation — it's the format. Weeknight evenings don't fit young parents.",
    ].join("\n");
  }

  if (lower.includes("how might we") || lower.includes("hmw") || lower.includes("problem statement")) {
    return [
      "**Demo mode** — set GEMINI_API_KEY for live responses.",
      "",
      "Three sharper HMW variations:",
      "",
      "1. How might we help young parents stay connected to community without adding another weeknight commitment?",
      "2. How might we make Sunday morning carry the weight of a small group for parents of young kids?",
      "3. How might we create asynchronous community moments that fit around busy family life?",
      "",
      "Pick the one that feels most actionable for your sprint.",
    ].join("\n");
  }

  if (lower.includes("crazy") || lower.includes("brainstorm") || lower.includes("ideas")) {
    return [
      "**Demo mode** — set GEMINI_API_KEY for live responses.",
      "",
      "Five additional ideas:",
      "",
      "1. **Parent pods** — assigned groups of 4 families that text each other one prayer request per week.",
      "2. **Walking small group** — Saturday morning park meetup with kids playing while parents talk.",
      "3. **Voice memo prayer chain** — record a 2-min prayer for the week, drop in a group chat.",
      "4. **15-min lobby check-in** — pre-service, intentional pairings, no homework.",
      "5. **Sunday-only community** — restructure the service itself to include 10 min of structured small-group time.",
    ].join("\n");
  }

  if (lower.includes("persona")) {
    return [
      "**Demo mode** — set GEMINI_API_KEY for live responses.",
      "",
      "**Maria Chen**, 32 — software engineer, mom of two under 5",
      "",
      "**Goals:** Real friendships at church; spiritual growth that fits her life.",
      "**Pain points:** Weeknights are sacred family time; small groups feel like another obligation.",
      "**Faith journey:** Grew up Catholic, came to evangelical faith in college, now wants to raise kids in the church.",
      "**Needs:** Connection that doesn't require leaving the house at 7pm.",
    ].join("\n");
  }

  return [
    "**Demo mode** — set GEMINI_API_KEY in Vercel env vars for live AI.",
    "",
    "I hear you. Tell me more — what specifically have you tried so far, and what did you notice?",
  ].join("\n");
}
