# Hack In A Box

Interactive React prototype for the Indigitous US Hack In A Box playbook. It includes playbook content for every phase (prepare → run → follow up), AI-assisted tools (problem statements, prototyping prompts, leadership proposals, a thinking-partner chat), and a per-page feedback widget that posts responses to a Google Sheet.

## Run Locally

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run build
```

## AI Configuration

All AI features call Vercel serverless functions that proxy to Google Gemini so the API key never reaches the browser:

- `api/chat.js` — chat, SCIPAB builder, proposal generator (`gemini-2.5-flash`)
- `api/tts.js` — natural text-to-speech for the Thinking Partner's voice mode (`gemini-3.1-flash-tts-preview`)

Set `GEMINI_API_KEY` in the Vercel project's environment variables (one key covers both). Without it, chat returns canned demo responses and voice mode falls back to the browser's built-in speechSynthesis. Optional overrides: `GEMINI_TTS_VOICE` (default `Sulafat`, a warm voice — try `Kore` or `Puck`) and `GEMINI_TTS_MODEL`.

## Feedback Widget

The per-page feedback widget posts to `api/feedback.js`, which forwards responses to a Google Apps Script web app bound to a Google Sheet. See [docs/feedback-sheet-setup.md](docs/feedback-sheet-setup.md) for setup. Set `FEEDBACK_WEBHOOK_URL` in Vercel env vars.

## Notes

Light user state (feedback name, which pages were answered, widget snooze) is stored in the browser via `localStorage`.
