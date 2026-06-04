# Feedback → Google Sheet setup

The in-app feedback widget POSTs to `/api/feedback`, which forwards each response to a
Google Apps Script web app bound to a Google Sheet. Responses then land as rows you can
read live during an info session.

## One-time setup (~3 minutes)

1. Create a new Google Sheet (any name, e.g. **HIAB Feedback**).
2. In the Sheet: **Extensions → Apps Script**.
3. Delete the placeholder `myFunction` and paste the entire script from
   [`feedback-apps-script.gs`](./feedback-apps-script.gs) below.
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, authorize when prompted, and **copy the Web app `/exec` URL**.
5. In **Vercel → the HIAB project → Settings → Environment Variables**, add:
   - Key: `FEEDBACK_WEBHOOK_URL`
   - Value: the `/exec` URL you copied
   - Environments: Production (and Preview if you want test data)
6. **Redeploy** the Vercel project so the function picks up the new env var.

That's it. The widget already works without this (responses are accepted and logged in
Vercel function logs); this step is only what makes them land in the spreadsheet.

## Verify it works

- Open the deployed site, sit on any page ~5s, answer the popup, hit **Send feedback**.
- A new row should appear in the Sheet within a second or two.
- The first row is auto-created as a header: `timestamp | section | helpful | wouldUse | comment | userAgent`.

## Fields each row stores

| Column | Meaning |
|--------|---------|
| `timestamp` | ISO time the response was received (server-side) |
| `section` | Which page the feedback was about (e.g. `empathy`, `prepare`) |
| `helpful` | `TRUE` / `FALSE` / blank — "Is this helpful?" |
| `wouldUse` | `TRUE` / `FALSE` / blank — "Would you use this tool?" |
| `comment` | Optional free-text "Anything you'd change?" |
| `userAgent` | Browser/device string, for rough desktop-vs-mobile context |
