const SPREADSHEET_ID = "YOUR_GOOGLE_SHEETS_ID";

/**
 * Serves the HTML file.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

/**
 * Processes the QR code data received from the web app.
 * @param {string} qrCodeValue The value from the scanned QR code.
 * @returns {object} An object containing the status and a message.
 */
function processQRCode(qrCodeValue) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const availableLotSheet = spreadsheet.getSheetByName("AvailableLot");
    const recordSheet = spreadsheet.getSheetByName("บันทึกเบิก");

    if (!availableLotSheet) {
      return { status: "error", message: "ไม่พบชีท 'AvailableLot' ใน Google Sheets" };
    }
    if (!recordSheet) {
      return { status: "error", message: "ไม่พบชีท 'บันทึกเบิก' ใน Google Sheets" };
    }

    const availableLotData = availableLotSheet.getRange("A2:D" + availableLotSheet.getLastRow()).getValues();

    // Loop through the AvailableLot data to find a match
    for (let i = 0; i < availableLotData.length; i++) {
      const row = availableLotData[i];
      const lotNumber = row[0]; // Assuming QR code value matches Column A

      if (String(lotNumber).trim() === String(qrCodeValue).trim()) {
        // Found a match, get data from Column C and D
        const columnCValue = row[2];
        const columnDValue = row[3];

        // Get the current timestamp and date
        const timestamp = new Date();
        const dateString = Utilities.formatDate(timestamp, spreadsheet.getSpreadsheetTimeZone(), "yyyy-MM-dd");

        // Prepare data to be appended to "บันทึกเบิก" sheet
        const newRow = [timestamp, qrCodeValue, dateString];
        recordSheet.appendRow(newRow);

        const message = `บันทึกข้อมูลเรียบร้อยแล้ว!\n
        QR Code: ${qrCodeValue}\n
        ข้อมูลจากคอลัมน์ C: ${columnCValue}\n
        ข้อมูลจากคอลัมน์ D: ${columnDValue}`;

        return { status: "success", message: message };
      }
    }

    // No match found
    const message = `ไม่พบข้อมูลใน AvailableLot! ไม่มีการบันทึก.\n
    QR Code: ${qrCodeValue}`;
    return { status: "error", message: message };

  } catch (e) {
    // Catch any errors and return an error message
    return { status: "error", message: "เกิดข้อผิดพลาด: " + e.message };
  }
}
