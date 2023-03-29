import axios from "axios";
import { getReceiptData } from "../openai";
const projectId = "gns-gpt-bot";
const location = "us"; // Format is 'us' or 'eu'
// const processorId = "e7a923443fcb4ffb"; // form parser id
const processorId = "1af71b78f04c04c3"; // form processor trained for surge fee

const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

const client = new DocumentProcessorServiceClient();

const { googleapi } = require("googleapis");

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
    // console.log(document.pages[0].tables[0]);
    // document.pages[0].lines.map((line) => {
    //   const words = text
    //     .substring(
    //       line.layout.textAnchor.textSegments.startIndex,
    //       line.layout.textAnchor.textSegments.endIndex
    //     )
    //     .split(" ");

    //   console.log(words);
    //   console.log("\n\n");
    // });
    // console.log(document.pages[0].formFields[0]);
    //#	Status	rider_id	timestamp	date	green_dot	stops	red_dot	Motobike	GrabPay	type	km	delivery_fee-Base	earning_adjustment	total_earned	tip	estimated_earnings-NET	hour_value	timestamp_value	date_value	total_income	Total_delivery_fee	Total_earning_adjustment	Total_tip	zone	fp_zone	green_dot2	red_dot2	green_dot3	red_dot3	green_dot4	red_dot4	Basket	Week
    /*    const receiptData = {
      user: {
        telegramId: ctx.user.telegramId,
        company: ctx.user.company,
        vehicle: ctx.user.vehicle,
        name: ctx.user.first_name,
        zone: ctx.user.zone,
      },
      time: getTime(text),
      date: getDate(text),
      location: {
        start: getStart(text),
        end: getEnd(text),
        stops: getStops(text),
      },
      distance: getDistance(text),
      payment: {
        method: getPaymentMethod(text),
        netEarnings: getNetEarnings(text),
        deliveryFee: getDeliverFee(text),
        earningAdjustment: getEarningAdjustment(text),
        totalEarning: getTotalEarning(text),
        tip: getTip(text),
      },
    };*/
    // const receiptData = {
    //   user: {
    //     telegramId: ctx.user.telegramId,
    //     company: ctx.user.company,
    //     vehicle: ctx.user.vehicle,
    //     name: ctx.user.first_name,
    //     zone: ctx.user.zone,
    //   },
    //   time: "time from receipt data",
    //   date: "date from receipt data",
    //   location: {
    //     start: "start location from receipt data",
    //     end: "end location from receipt data",
    //     stops: "stops  from receipt data",
    //   },
    //   distance: "distance from receipt data",
    //   payment: {
    //     method: "payment method from receipt data",
    //     netEarnings: "net Earnings from receipt data",
    //     deliveryFee: "delivery fee from receipt data",
    //     earningAdjustment: "earning adjustment from receipt data",
    //     totalEarning: "total earning from receipt data",
    //     tip: "tip from receipt data",
    //   },
    // };

    const receiptData = `${text} \n telegramId: ${ctx.user.telegramId}\n
    company: ${ctx.user.company}\n
    vehicle: ${ctx.user.vehicle}\n
    name: ${ctx.user.first_name}\n
    zone: ${ctx.user.zone}\n,`;
    console.log(receiptData);

    const formattedReceipt = await getReceiptData(receiptData);
    console.log(formattedReceipt, formattedReceipt);
    return formattedReceipt;
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
  return "Come back later, I can't read pdf documents yet";
  // const pdf = message.document;
  // // const documentId = pdf.file_id;
  // const documentUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/getFile?file_id=${documentId}`;
  // console.log("documentUrl", documentUrl);
  // const urlRes = await axios.get(documentUrl);
  // const { file_path } = urlRes.data.result;
  // const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${file_path}`;

  // console.log("downloadUrl", downloadUrl);
  // const response = await axios.get(downloadUrl, {
  //   responseType: "arraybuffer",
  // });
  // const imageData = new Uint8Array(response.data);

  // console.log("Raw data", imageData);

  // const encodedImage = Buffer.from(imageData).toString("base64");
  // console.log("encodedImage data", imageData);
  // const pdfData = await pdfParse(imageData);
  // console.log("actual data", pdfData.text);
  // return pdfData;
}
