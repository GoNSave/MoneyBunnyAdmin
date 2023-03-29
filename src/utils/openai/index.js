import { bot } from "@/utils/telegram";
const { Configuration, OpenAIApi } = require("openai");
import { AnswerResponse } from "@/utils/constants";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY_GNS,
});

export const textToJson = async (json, text) => {
  const openai = new OpenAIApi(configuration);
  const prompt = `Answer the question in simple english \n\nQuestion: ${question}\n\nAnswer:`;

  const r3 = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 100,
    temperature: 0.2,
  });

  return r3.data.choices[0].text;
};

export const getAnswer = async (question) => {
  console.log("get the answer", question);
  const openai = new OpenAIApi(configuration);
  const prompt = `Answer the question in simple english \n\nQuestion: ${question}\n\nAnswer:`;

  const r3 = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 100,
    temperature: 0.2,
  });

  return r3.data.choices[0].text;
};

export const getReceiptData = async (scannedData) => {
  const openai = new OpenAIApi(configuration);

  const prompt = `Convert the following scanned OCR data from food delivery company rider's earning receipt into a JSON structured data:

  ${scannedData}

  {
    user: {
      telegramId: "insert telegramId here",
      company: "insert company name here",
      vehicle: "insert vehicle type here",
      name: "insert name here",
      zone: "insert zone here"
    },
    time: "insert time here",
    date: "insert date here",
    location: {
      start: "insert start location here",
      end: "insert end location here",
      stops: "insert stops here"
    },
    distance: "insert distance here",
    payment: {
      method: "insert payment method here",
      netEarnings: "insert net earnings here",
      deliveryFee: "insert delivery fee here",
      earningAdjustment: "insert earning adjustment here",
      totalEarning: "insert total earning here",
      tip: "insert tip here"
    },
    status: "added",
    basket: "1.0",
    week: 88,
  }

  Answer:`;

  const r3 = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 1024,
    temperature: 0.2,
  });

  const jsonString = r3.data.choices[0].text;
  // const jsonObject = JSON.parse(jsonString);

  return jsonString;
};

export const handleQuestion = async (ctx) => {
  console.log("handleQuestion------", ctx);
  const answer = await getAnswer(ctx.text);
  console.log("handleQuestion------", ctx);
  const telegramId = ctx?.from?.id ? ctx?.from?.id : ctx?.chat?.id;
  // const answer = "The answer is coming for " + param;
  return await bot.sendMessage(telegramId, answer, AnswerResponse);
};
