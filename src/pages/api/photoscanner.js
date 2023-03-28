process.env.NTBA_FIX_319 = "test";
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

module.exports = async (request, response) => {
  const { message } = request.body;
  if (!message) return response.send("Hello");

  const photos = message.photo;

  try {
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const documentId = photos[photos.length - 1].file_id;
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

    // let [translations] = await translate.translate(text, target);
    // console.log("Translated text is", translations);
  } catch (e) {
    console.log("error", e);
  }
  response.send("Hello");
};
