import axios from "axios";
import { getReceiptData } from "@/utils/openai";
import { fireDb, fireStorage } from "@/utils/fireConfig";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import {
  userDocName,
  chatDocName,
  filesDocName,
  receiptDocName,
} from "@/utils/constants";
import { doc, setDoc } from "firebase/firestore/lite";
import { updateReceipt } from "@/utils/firebase/receipt";
const pdfParse = require("pdf-parse");
const projectId = "gns-gpt-bot";
const location = "us"; // Format is 'us' or 'eu'
// const processorId = "e7a923443fcb4ffb"; // form parser id
const processorId = "1af71b78f04c04c3"; // form processor trained for surge fee

const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

const client = new DocumentProcessorServiceClient();

export const handleReceipt = async (ctx, photoId) => {
  try {
    const photoUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/getFile?file_id=${photoId}`;
    const urlRes = await axios.get(photoUrl);
    const { file_path } = urlRes.data.result;
    const photoDownloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${file_path}`;
    const downloadRes = await axios.get(photoDownloadUrl, {
      responseType: "arraybuffer",
    });
    const photoData = new Uint8Array(downloadRes.data);

    const photoExtension = file_path.split(".").pop();
    const photoUploadPath = `users/${ctx.user.id}/${photoId}.${photoExtension}`;
    const storageRef = ref(fireStorage, photoUploadPath);

    await uploadBytes(storageRef, photoData);

    const photoFirestoreUrl = await getDownloadURL(storageRef);

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    const request = {
      name,
      rawDocument: {
        content: photoData,
        mimeType: "image/png",
      },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    let { text } = document;

    const receipt = `${text}, telegramId: ${ctx.user.telegramId},
    userId: ${ctx.user.id},
    telegramId: ${ctx.user.telegramId},
    downloadUrl: ${photoFirestoreUrl},
    company: ${ctx.user.company},
    vehicle: ${ctx.user.vehicle},
    name: ${ctx.user.first_name},
    zone: ${ctx.user.zone},`;

    const receiptText = await getReceiptData(receipt);
    if (receiptText === null) {
      return "";
    }

    console.log(
      typeof receiptText,
      receiptText.userId,
      receiptText.downloadUrl
    );

    const ret = await updateReceipt(receiptText);
    return `Date: ${receiptText.date}\n Time:${receiptText.time}\n Start: ${receiptText.location.start}\n End: ${receiptText.location.end}\n Distance: ${receiptText.distance}\n  Earning: ${receiptText.payment.totalEarning}`;
  } catch (error) {
    console.log("Failed to handle the receipt", error.message);
  }
};

export async function parseReceipt(ctx, documentId) {
  try {
    const documentUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/getFile?file_id=${documentId}`;
    console.log("documentUrl", documentUrl);
    const urlRes = await axios.get(documentUrl);
    const { file_path } = urlRes.data.result;
    const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${file_path}`;
    const response = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });
    const imageData = new Uint8Array(response.data);

    // console.log("Raw data", imageData);

    const encodedImage = Buffer.from(imageData).toString("base64");
    // console.log("encodedImage data", imageData);

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    const request = {
      name,
      rawDocument: {
        content: encodedImage,
        mimeType: "image/png",
      },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    let { text } = document;

    return text;
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
