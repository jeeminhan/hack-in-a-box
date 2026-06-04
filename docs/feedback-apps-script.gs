/**
 * HIAB feedback collector — Google Apps Script web app.
 *
 * Receives JSON POSTs from /api/feedback and appends one row per response to the
 * bound Google Sheet. See docs/feedback-sheet-setup.md for deploy instructions.
 *
 * Paste this whole file into Extensions → Apps Script, then Deploy → Web app
 * (Execute as: Me, Who has access: Anyone). Copy the /exec URL into the Vercel
 * env var FEEDBACK_WEBHOOK_URL.
 */

var HEADERS = ['timestamp', 'section', 'helpful', 'wouldUse', 'comment', 'userAgent'];

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write the header row once, on an empty sheet.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      String(data.section || ''),
      toBool(data.helpful),
      toBool(data.wouldUse),
      String(data.comment || ''),
      String(data.userAgent || ''),
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Health check — open the /exec URL in a browser to confirm it's deployed.
function doGet() {
  return json({ ok: true, service: 'hiab-feedback' });
}

// Keep true/false as real booleans, but leave "not answered" (null/undefined) blank.
function toBool(v) {
  if (v === true) return true;
  if (v === false) return false;
  return '';
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
