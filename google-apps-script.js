// ============================================================
// DRINK TRACKER — Google Apps Script (flerbruker + lag)
// ============================================================
// 1. Opprett et nytt Google Sheet
// 2. Ga til Utvidelser > Apps Script
// 3. Lim inn hele denne filen og erstatt alt innhold
// 4. Klikk "Deploy" > "New deployment"
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Kopier URL-en og lim inn i Drink Tracker-appen
// ============================================================

const SHEET_NAME = 'Drinks';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['id', 'date', 'type', 'lat', 'lng', 'user', 'team']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  }
  return sheet;
}

// GET — return all drinks as JSON
function doGet(e) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return ContentService
    .createTextOutput(JSON.stringify({ drinks: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST — add drinks (append only, no edit/delete)
function doPost(e) {
  const sheet = getOrCreateSheet();
  const payload = JSON.parse(e.postData.contents);
  const drinks = payload.drinks || [];

  // Get existing IDs for dedup
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  const existingIds = new Set(data.slice(1).map(r => String(r[idCol])));

  let added = 0;
  drinks.forEach(d => {
    if (!existingIds.has(String(d.id))) {
      sheet.appendRow([
        d.id,
        d.date,
        d.type,
        d.lat || '',
        d.lng || '',
        d.user || '',
        d.team || ''
      ]);
      added++;
    }
  });

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, added }))
    .setMimeType(ContentService.MimeType.JSON);
}
