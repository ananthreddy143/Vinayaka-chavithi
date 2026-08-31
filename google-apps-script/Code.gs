/**
 * ============================================================
 * Google Apps Script Web App for
 * Vinayaka Chavithi 2026 — Donation & Expense Management
 * ============================================================
 *
 * SETUP (one-time, ~3 minutes):
 *
 * 1. Create a new Google Sheet.
 * 2. Open Extensions → Apps Script.
 * 3. Delete any code in the editor and paste this entire file.
 * 4. Click Deploy → New deployment.
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Authorize when prompted.
 * 6. Copy the Web App URL (ends in /exec).
 * 7. In your app, go to Settings → Google Sheets Integration,
 *    paste the URL, click "Test & Connect".
 *
 * The script auto-creates three sheets (Donations, Expenses,
 * Settings) with headers on first run. All data is stored as
 * rows; the app reads/writes via JSON over POST.
 * ============================================================
 */

const SHEETS = {
  DONATIONS: 'Donations',
  EXPENSES: 'Expenses',
  SETTINGS: 'Settings',
};

const HEADERS = {
  Donations: ['id', 'receiptNo', 'donorName', 'amount', 'date', 'paymentMethod', 'purpose', 'transactionId', 'phone', 'notes'],
  Expenses: ['id', 'description', 'category', 'amount', 'date', 'paidTo', 'paymentMethod', 'notes', 'bill'],
  Settings: ['key', 'value'],
};

function doGet(e) {
  return jsonOut({ ok: true, message: 'Vinayaka Chavithi API is running' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'get') {
      return jsonOut({ ok: true, data: getAllData() });
    }

    if (action === 'sync') {
      syncAllData(body.donations || [], body.expenses || [], body.settings || {});
      return jsonOut({ ok: true });
    }

    return jsonOut({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

// --- Helpers ---

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      const h = headers[j];
      const v = values[i][j];
      obj[h] = (v instanceof Date) ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd') : v;
    }
    if (obj.id) rows.push(obj);
  }
  return rows;
}

function getAllData() {
  return {
    donations: sheetToObjects(getSheet(SHEETS.DONATIONS)),
    expenses: sheetToObjects(getSheet(SHEETS.EXPENSES)),
    settings: settingsToObject(getSheet(SHEETS.SETTINGS)),
  };
}

function syncAllData(donations, expenses, settings) {
  // Donations
  const dSheet = getSheet(SHEETS.DONATIONS);
  dSheet.getRange(2, 1, dSheet.getLastRow() || 1, HEADERS.Donations.length).clearContent();
  if (donations.length > 0) {
    const dRows = donations.map(d => HEADERS.Donations.map(h => d[h] !== undefined ? d[h] : ''));
    dSheet.getRange(2, 1, dRows.length, HEADERS.Donations.length).setValues(dRows);
  }

  // Expenses
  const eSheet = getSheet(SHEETS.EXPENSES);
  eSheet.getRange(2, 1, eSheet.getLastRow() || 1, HEADERS.Expenses.length).clearContent();
  if (expenses.length > 0) {
    const eRows = expenses.map(e => HEADERS.Expenses.map(h => e[h] !== undefined ? e[h] : ''));
    eSheet.getRange(2, 1, eRows.length, HEADERS.Expenses.length).setValues(eRows);
  }

  // Settings
  const sSheet = getSheet(SHEETS.SETTINGS);
  sSheet.getRange(2, 1, sSheet.getLastRow() || 1, 2).clearContent();
  const sKeys = Object.keys(settings);
  if (sKeys.length > 0) {
    const sRows = sKeys.map(k => [k, settings[k]]);
    sSheet.getRange(2, 1, sRows.length, 2).setValues(sRows);
  }
}

function settingsToObject(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return {};
  const obj = {};
  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) obj[values[i][0]] = values[i][1];
  }
  return obj;
}
