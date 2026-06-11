// Vercel serverless function. Proxies text-to-speech requests to Gemini's
// speech-generation model so the API key never reaches the browser. Returns
// base64 PCM audio (16-bit signed LE, 24 kHz, mono) that the client plays
// through an AudioContext — far more natural than browser speechSynthesis.
//
// If GEMINI_API_KEY isn't set, responds with { demo: true } and the client
// falls back to the built-in browser voice.

const DEFAULT_TTS_MODEL = "gemini-3.1-flash-tts-preview";
// "Sulafat" is one of Gemini's warmer prebuilt voices — fits the Thinking
// Partner's tone. Override with GEMINI_TTS_VOICE (e.g. "Kore", "Puck").
const DEFAULT_VOICE = "Sulafat";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text } = req.body || {};
  const input = typeof text === "string" ? text.trim().slice(0, 4000) : "";
  if (!input) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(200).json({ demo: true });
    return;
  }

  const model = process.env.GEMINI_TTS_MODEL || DEFAULT_TTS_MODEL;
  const voiceName = process.env.GEMINI_TTS_VOICE || DEFAULT_VOICE;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: input }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      console.error("[tts] upstream error", upstream.status, data?.error?.message);
      res.status(upstream.status).json({ error: data?.error?.message || "Upstream error" });
      return;
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const audioPart = parts.find((p) => p?.inlineData?.data);
    if (!audioPart) {
      res.status(502).json({ error: "No audio in response" });
      return;
    }

    res.status(200).json({ audio: audioPart.inlineData.data, sampleRate: 24000 });
  } catch (err) {
    console.error("[tts] request failed", err?.message);
    res.status(502).json({ error: "TTS request failed" });
  }
}
