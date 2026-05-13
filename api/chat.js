// Vercel serverless function. Proxies chat requests to Anthropic so the
// API key never reaches the browser. If no key is configured, returns a
// canned demo response so the UI is still useful for show-and-tell.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const { system, messages, max_tokens = 800, model = "claude-sonnet-4-5-20250929" } = req.body || {};

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
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, system, messages }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data?.error?.message || "Upstream error", detail: data });
      return;
    }

    const text = data?.content?.[0]?.text || "";
    res.status(200).json({ content: text, demo: false });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
}

function demoResponse(system, messages) {
  const last = messages[messages.length - 1]?.content || "";
  const lower = String(last).toLowerCase();

  if (lower.includes("empathy") || lower.includes("transcript") || lower.includes("interview")) {
    return [
      "**Demo mode** — set ANTHROPIC_API_KEY for live responses.",
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
      "**Demo mode** — set ANTHROPIC_API_KEY for live responses.",
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
      "**Demo mode** — set ANTHROPIC_API_KEY for live responses.",
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
      "**Demo mode** — set ANTHROPIC_API_KEY for live responses.",
      "",
      "**Maria Chen**, 32 — software engineer, mom of two under 5",
      "",
      "**Goals:** Real friendships at church; spiritual growth that fits her life.",
      "**Pain points:** Weeknights are sacred family time; small groups feel like another obligation.",
      "**Faith journey:** Grew up Catholic, came to evangelical faith in college, now wants to raise kids in the church.",
      "**Needs:** Connection that doesn't require leaving the house at 7pm.",
    ].join("\n");
  }

  // Generic conversational reply
  return [
    "**Demo mode** — set ANTHROPIC_API_KEY in Vercel env vars for live AI.",
    "",
    "I hear you. Tell me more — what specifically have you tried so far, and what did you notice?",
  ].join("\n");
}
