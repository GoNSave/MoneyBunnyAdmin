import { fireStorage } from "../fireConfig";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { telegramBot } from "../telegram";
import axios from "axios";
import { getReceiptData } from "../openai";
import { addReceipt } from "../firebase";
const pdfParse = require("pdf-parse");
const projectId = "gns-gpt-bot";
const location = "us"; // Format is 'us' or 'eu'
// const processorId = "e7a923443fcb4ffb"; // form parser id
const processorId = "1af71b78f04c04c3"; // form processor trained for surge fee

const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

const client = new DocumentProcessorServiceClient();

export async function handleReceipt(ctx, photoId) {
  try {
    const photoUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/getFile?file_id=${photoId}`;
    const urlRes = await axios.get(photoUrl);
    const { file_path } = urlRes.data.result;
    console.log("photoUrl", file_path);
    const extn = file_path.split(".").pop();

    const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${file_path}`;
    const response = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });
    const photoData = new Uint8Array(response.data);
    // const encodedImage = Buffer.from(imageData).toString("base64");
    // const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    // const request = {
    //   name,
    //   rawDocument: {
    //     content: photoData,
    //     mimeType: "image/png",
    //   },
    // };

    // const [result] = await client.processDocument(request);
    // const { document } = result;

    // let { text } = document;
    const uploadPhotoName = `reciepts/${ctx.user.id}/${photoId}.${extn}`;

    console.log("uploadPhotoName", uploadPhotoName);
    const storageRef = ref(fireStorage, uploadPhotoName);

    await uploadBytes(storageRef, photoData);

    const url = await getDownloadURL(storageRef);
    console.log("Uploaded on google at ", url);

    // const recDec = await addReceipt(ctx, url);

    return "text";
    const receiptData = `${text} \n telegramId: ${ctx.user.telegramId}\n
    company: ${ctx.user.company}\n
    vehicle: ${ctx.user.vehicle}\n
    name: ${ctx.user.first_name}\n
    zone: ${ctx.user.zone}\n,`;
    // console.log(receiptData);

    return await getReceiptData(receiptData);
  } catch (e) {
    console.error(e.message);
    return "Failed to parse the receipt" + e.message;
  }
  return "Receipt parsed";

  //   const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  //   const filePath = "./assets/receipts/file_26656.jpg";
  //   const fs = require("fs").promises;
  //   const imageFile = await fs.readFile(filePath);

  //   const encodedImage = Buffer.from(imageFile).toString("base64");

  //   console.log("------------------ document start -------------");
  //   console.log(text);
  //   console.log("------------------ document end -------------");
}

export async function parseDocument(documentId) {
  // return "Come back later, I can't read pdf documents yet";
  // const documentId = pdf.file_id;
  const documentUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/getFile?file_id=${documentId}`;
  console.log("documentUrl", documentUrl);
  const urlRes = await axios.get(documentUrl);
  const { file_path } = urlRes.data.result;
  const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${file_path}`;

  console.log("downloadUrl", downloadUrl);
  const response = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
  });
  const imageData = new Uint8Array(response.data);

  console.log("Raw data", imageData);

  const encodedImage = Buffer.from(imageData).toString("base64");
  console.log("encodedImage data", imageData);
  const pdfData = await pdfParse(imageData);
  // console.log("----------Start pdf----------------------");
  // console.log("actual data", pdfData.text);
  // console.log("-----------End pdf---------------------");
  return pdfData.text;
}
