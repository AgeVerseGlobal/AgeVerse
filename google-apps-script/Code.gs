/**
 * AgeVerseGlobal Feedback — Google Apps Script
 *
 * Run setupFeedback() once from the Google account that should own the
 * feedback Sheet. It creates the Google Form + response Sheet automatically.
 * Then deploy this script as a Web App (Execute as: Me; access: Anyone).
 */
function setupFeedback() {
  const form = FormApp.create('AgeVerseGlobal Feedback');
  form.setDescription('AgeVerseGlobal feedback form. Visitor IP address, name, email, phone number and OTP are not requested by this form.');
  form.setCollectEmail(false);
  form.addTextItem().setTitle('Date & Time').setRequired(true);
  form.addTextItem().setTitle('Country').setRequired(true);
  form.addTextItem().setTitle('City').setRequired(true);
  form.addTextItem().setTitle('Page').setRequired(true);
  form.addScaleItem().setTitle('Rating').setBounds(1, 5).setLabels('Poor', 'Excellent').setRequired(true);
  form.addParagraphTextItem().setTitle('Feedback').setRequired(true);

  const sheet = SpreadsheetApp.create('AgeVerseGlobal Feedback Responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  PropertiesService.getScriptProperties().setProperties({
    FORM_ID: form.getId(),
    SHEET_ID: sheet.getId(),
    FORM_URL: form.getPublishedUrl(),
    SHEET_URL: sheet.getUrl()
  });

  Logger.log('Form URL: ' + form.getPublishedUrl());
  Logger.log('Sheet URL: ' + sheet.getUrl());
}


function setupContact() {
  const sheet = SpreadsheetApp.create('AgeVerseGlobal Contact Responses');

  sheet.getSheets()[0].getRange(1, 1, 1, 7).setValues([[
    'Date & Time',
    'Name',
    'Email',
    'Subject',
    'Message',
    'Page',
    'Status'
  ]]);

  PropertiesService.getScriptProperties().setProperties({
    CONTACT_SHEET_ID: sheet.getId(),
    CONTACT_SHEET_URL: sheet.getUrl()
  });

  Logger.log('Contact Sheet URL: ' + sheet.getUrl());
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: 'AgeVerseGlobal Feedback' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const properties = PropertiesService.getScriptProperties();

    if (data.action === 'contact') {
      const contactSheetId = properties.getProperty('CONTACT_SHEET_ID');
      if (!contactSheetId) throw new Error('Run setupContact() first.');

      const contactSheet = SpreadsheetApp.openById(contactSheetId).getSheets()[0];
      contactSheet.appendRow([
        new Date(),
        String(data.name || '').slice(0, 120),
        String(data.email || '').slice(0, 200),
        String(data.subject || '').slice(0, 200),
        String(data.message || '').slice(0, 4000),
        String(data.page || 'Website').slice(0, 200),
        'New'
      ]);

      return ContentService.createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheetId = properties.getProperty('SHEET_ID');
    if (!sheetId) throw new Error('Run setupFeedback() first.');

    const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
    sheet.appendRow([
      new Date(),
      String(data.country || 'Unknown').slice(0, 100),
      String(data.city || 'Unknown').slice(0, 100),
      String(data.page || 'Website').slice(0, 200),
      Number(data.rating || 0),
      String(data.feedback || '').slice(0, 2000)
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(error.message || error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

