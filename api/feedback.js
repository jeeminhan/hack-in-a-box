// Vercel serverless function. Receives feedback from the in-app widget and
// forwards it to a Google Apps Script web app (bound to a Google Sheet) so
// responses land in a spreadsheet Nick can read during the info session.
//
// Set FEEDBACK_WEBHOOK_URL in Vercel env vars to the Apps Script /exec URL.
// If it isn't set, the endpoint still returns 200 and logs the payload, so the
// widget never errors in front of an audience.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { section, page, name, helpful, wouldUse, comment } = req.body || {};

  // Light validation — never trust the browser, but never block on it either.
  const record = {
    section: typeof section === "string" ? section.slice(0, 80) : "",
    page: typeof page === "string" ? page.slice(0, 120) : "",
    name: typeof name === "string" ? name.slice(0, 120) : "",
    helpful: helpful === true || helpful === false ? helpful : null,
    wouldUse: wouldUse === true || wouldUse === false ? wouldUse : null,
    comment: typeof comment === "string" ? comment.slice(0, 2000) : "",
    timestamp: new Date().toISOString(),
    device: describeDevice(req.headers["user-agent"]),
  };

  const webhook = resolveWebhook(process.env.FEEDBACK_WEBHOOK_URL);
  if (!webhook) {
    // No sheet wired yet — accept it so the UI works, and log for inspection.
    console.log("[feedback] (no FEEDBACK_WEBHOOK_URL set)", JSON.stringify(record));
    res.status(200).json({ ok: true, stored: false });
    return;
  }

  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error("[feedback] webhook error", upstream.status, detail.slice(0, 300));
      res.status(502).json({ ok: false, error: "Could not record feedback", upstreamStatus: upstream.status });
      return;
    }
    res.status(200).json({ ok: true, stored: true });
  } catch (err) {
    console.error("[feedback] forward failed", err?.message);
    res.status(502).json({ ok: false, error: "Could not record feedback" });
  }
}

// Condenses a raw user-agent string into a short human-readable summary like
// "Chrome · iPhone" so the spreadsheet column is skimmable instead of noise.
function describeDevice(rawUa) {
  const ua = String(rawUa || "");
  if (!ua) return "";

  let browser = "Unknown browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/SamsungBrowser\//.test(ua)) browser = "Samsung Internet";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let device = "Unknown device";
  if (/iPhone/.test(ua)) device = "iPhone";
  else if (/iPad/.test(ua)) device = "iPad";
  else if (/Android/.test(ua)) device = "Android";
  else if (/Macintosh/.test(ua)) device = "Mac";
  else if (/Windows/.test(ua)) device = "Windows";
  else if (/Linux/.test(ua)) device = "Linux";

  return `${browser} · ${device}`;
}

// Accepts either a full Apps Script web-app URL or just the bare deployment id
// (the "AKfyc…" string), and normalizes it to a working /exec URL. This makes the
// env var forgiving of the most common paste mistake.
function resolveWebhook(raw) {
  const v = String(raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^AKfyc[A-Za-z0-9_-]+$/.test(v)) return `https://script.google.com/macros/s/${v}/exec`;
  return v;
}
