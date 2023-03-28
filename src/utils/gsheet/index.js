const { GoogleSpreadsheet } = require("google-spreadsheet");

export const getRows = async (sheetId, sheetIndex) => {
  try {
    const private_key = process.env.GOOGLE_PRIVATE_KEY;
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_SURGE_DATA_ID);
    await doc.useServiceAccountAuth({
      client_email: sheetId,
      private_key: private_key.replace(/\\n/gm, "\n"),
    });
    await doc.getInfo();
    const sheet = doc.sheetsByIndex[sheetIndex];
    const rows = await sheet.getRows();
    return rows;
  } catch (e) {
    console.log(e.message);
  }
};

export const getRowsBySheetName = async (sheetId, sheetName) => {
  try {
    const private_key = process.env.GOOGLE_PRIVATE_KEY;
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: private_key.replace(/\\n/gm, "\n"),
    });
    await doc.getInfo();
    const sheet = doc.sheetsByTitle[sheetName];
    // const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    return rows;
  } catch (e) {
    console.log(e.message);
  }
};

export const getQuestionsFromSheet = async (sheetId, sheetName) => {
  const rows = await getRowsBySheetName(sheetId, sheetName);

  const survey = [];

  rows.forEach((row) => {
    const question = row["Question"];
    const key = row["Key"];
    const labels = row._rawData.slice(2);
    const answers = [];

    labels.forEach((answer, i) => {
      const groupIndex = Math.floor(i / 3);
      if (!answers[groupIndex]) {
        answers[groupIndex] = [];
      }
      answers[groupIndex].push({ text: answer });
    });
    survey.push({ question, answers, key });
  });

  return survey;
};
