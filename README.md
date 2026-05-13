# Hack In A Box

Interactive React prototype for the Indigitous US Hack In A Box playbook. It includes a guided sprint journey, reference-mode playbook content, autosaved worksheets, and a printable sprint packet.

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

## AI Coach Configuration

The prototype does not call model providers directly from the browser. To enable AI coaching, provide a backend or serverless endpoint and expose it as:

```bash
VITE_HIAB_AI_ENDPOINT=/api/hiab-ai
```

The endpoint should accept JSON payloads with `type`, form responses, and step metadata, then return the structured JSON used by the UI.

## Notes

Worksheet data is stored in the browser via `localStorage`. The guided journey's final print packet renders the saved worksheet data into a printable handoff packet.
