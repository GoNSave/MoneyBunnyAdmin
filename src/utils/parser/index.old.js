const axios = require("axios");
const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/sendMessage`;
import { promises as fs } from "fs";
import path from "path";
const { TranslationServiceClient } = require("@google-cloud/translate");
const { Translate } = require("@google-cloud/translate").v2;

const vision = require("@google-cloud/vision");

const projectId = "gns-gpt-bot";
const location = "us"; // Format is 'us' or 'eu'
// const processorId = "e7a923443fcb4ffb"; // form parser id
const processorId = "1af71b78f04c04c3"; // form processor trained for surge fee

const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

const client = new DocumentProcessorServiceClient();

export const surgeFeeTableParser = async (documentId) => {
  const { TableExtractionParams } = require("@google-cloud/documentai").v1beta3;

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  const documentUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/getFile?file_id=${documentId}`;
  console.log("documentUrl", documentUrl);
  const urlRes = await axios.get(documentUrl);
  const { file_path } = urlRes.data.result;
  const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${file_path}`;

  console.log("downloadUrl", downloadUrl);
  const imageResponse = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
  });
  const imageData = new Uint8Array(imageResponse.data);

  const imageData64 = Buffer.from(imageData).toString("base64");

  const processRequest = {
    name,
    rawDocument: {
      content: imageData64,
      mimeType: "image/jpeg",
    },
  };
  const [result] = await client.processDocument(processRequest);
  console.log(result);
  // const [page] = result.pages;
  // const [formExtraction] = result.formFields;
  // const [tableExtraction] = result.tables;
  // console.log(tableExtraction);

  // const tableRows = tableExtraction.headerRows.concat(tableExtraction.bodyRows);
  // console.log(tableRows);

  // // Use TableExtractionParams to extract the table data
  // const tableExtractionParams = new TableExtractionParams({
  //   enabled: true,
  //   tableBoundHints: [
  //     {
  //       boundingBox: tableExtraction.boundingBox,
  //     },
  //   ],
  // });
  // const [table] = await client.extractTableSpec({
  //   tableSpec: tableExtractionParams,
  //   parent: `projects/${projectId}/locations/${location}`,
  //   inputValue: {
  //     gcsSource: {
  //       uri: `gs://${result.outputConfig.gcsDestination.uri}/${result.outputConfig.gcsDestination.objects[0].uri}`,
  //     },
  //   },
  // });

  // // Use the table data to create a CSV file
  // const rows = [];
  // for (const r of table.rows) {
  //   const row = [];
  //   for (const c of r.cells) {
  //     row.push(c.content.trim());
  //   }
  //   rows.push(row.join(","));
  // }

  // const csvData = rows.join("\n");

  // console.log("CSV Data:");
  // console.log(csvData);
  // return csvData;
};

export const surgeFeeParser = async (documentId) => {
  try {
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    const documentUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/getFile?file_id=${documentId}`;
    console.log("documentUrl", documentUrl);
    const urlRes = await axios.get(documentUrl);
    const { file_path } = urlRes.data.result;
    const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${file_path}`;

    console.log("downloadUrl", downloadUrl);
    const imageResponse = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });
    const imageData = new Uint8Array(imageResponse.data);

    const imageData64 = Buffer.from(imageData).toString("base64");

    const processRequest = {
      name,
      rawDocument: {
        content: imageData64,
        mimeType: "image/jpeg",
      },
    };
    const [result] = await client.processDocument(processRequest);

    const { text } = result.document;

    const translate = new Translate();
    const detect = await await translate.detect(text);
    const source = detect[0].language;
    const target = "en";

    console.log("translate things", text, source, target);

    return text;
    // let [translations] = await translate.translate(text, target);
    // console.log("Translated text is", translations);
  } catch (e) {
    console.log("error", e);
  }
  response.send("Hello");
};

/*
      try {
        const downloadUrl = await getPhotoUrl(
          photos[photos.length - 1].file_id
        );
        console.log("downloadUrl", downloadUrl);
        const photoData = await getPhotoData(downloadUrl);

        // const photoData8 = new Uint8Array(photoData);

        const photoData64 = Buffer.from(photoData).toString("base64");
        const visionRequest = {
          image: {
            content: Buffer.from(photoData64, "base64"),
          },
        };

        const imageClient = new vision.ImageAnnotatorClient();

        const [visionResult] = await imageClient.textDetection(visionRequest);

        console.log(visionResult.fullTextAnnotation.text);

        await bot.sendMessage(
          ctx.chat.id,
          visionResult.fullTextAnnotation.text
        );

        const processName = `projects/${projectId}/locations/${location}/processors/${processorId}`;
        const processRequest = {
          processName,
          rawDocument: {
            content: photoData64,
            mimeType: "image/jpeg",
          },
        };
        const [result] = await scannerClient.processDocument(processRequest);

        const { text } = result.document;

        console.log("translate things", text);

        await bot.sendMessage(ctx.chat.id, text);
      } catch (e) {
        console.log("error", e);
      }
*/
