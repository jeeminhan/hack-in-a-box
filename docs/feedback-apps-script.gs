/**
 * HIAB feedback collector — Google Apps Script web app.
 *
 * Receives JSON POSTs from /api/feedback and appends one row per response to the
 * bound Google Sheet. See docs/feedback-sheet-setup.md for deploy instructions.
 *
 * Paste this whole file into Extensions → Apps Script, then Deploy → Web app
 * (Execute as: Me, Who has access: Anyone). Copy the /exec URL into the Vercel
 * env var FEEDBACK_WEBHOOK_URL.
 *
 * NOTE: after updating this script you must create a NEW deployment version
 * (Deploy → Manage deployments → Edit → New version) for changes to go live.
 */

var HEADERS = ['Time', 'Page', 'Name', 'Helpful?', 'Would use?', 'Comment', 'Device'];

// Header row used by the original deployment, kept so we can upgrade old sheets in place.
var LEGACY_HEADERS = ['timestamp', 'section', 'helpful', 'wouldUse', 'comment', 'userAgent'];

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    ensureHeaders(sheet);

    sheet.appendRow([
      formatTime(data.timestamp),
      String(data.page || data.section || ''),
      String(data.name || ''),
      toYesNo(data.helpful),
      toYesNo(data.wouldUse),
      String(data.comment || ''),
      String(data.device || data.userAgent || ''),
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

// Writes the header row on an empty sheet, and upgrades a sheet created by the
// previous script version (inserts the Name column so old rows stay aligned).
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    styleHeaders(sheet);
    return;
  }
  var first = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  if (String(first[0]) === LEGACY_HEADERS[0]) {
    // Old layout: timestamp, section, helpful, wouldUse, comment, userAgent.
    // Insert a blank Name column at position 3 so existing rows line up with
    // the new headers, then overwrite the header row.
    sheet.insertColumnBefore(3);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    styleHeaders(sheet);
  }
}

function styleHeaders(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 150);  // Time
  sheet.setColumnWidth(2, 170);  // Page
  sheet.setColumnWidth(3, 130);  // Name
  sheet.setColumnWidth(6, 360);  // Comment
  // Wrap long comments instead of overflowing into the Device column.
  sheet.getRange(1, 6, sheet.getMaxRows(), 1).setWrap(true);
}

// "Jun 10, 2026 9:41 AM" in the spreadsheet's own timezone — readable at a
// glance, unlike the raw ISO string the API sends.
function formatTime(iso) {
  var d = iso ? new Date(iso) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  return Utilities.formatDate(d, tz, 'MMM d, yyyy h:mm a');
}

// "Yes" / "No", leaving "not answered" (null/undefined) blank.
function toYesNo(v) {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return '';
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
