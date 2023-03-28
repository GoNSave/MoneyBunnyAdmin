import { reply, bot } from "../telegram";
const { Configuration, OpenAIApi } = require("openai");
import { AnswerResponse } from "../constants";

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

  const prompt = `Convert the following scanned OCR data from food delivery company rider's earning receipt into a json structured data \n\ ${scannedData}\n\nAnswer:`;
  // Extract text from OCR scanned data using OCR tool
  const r3 = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 1024,
    temperature: 0.5,
  });

  return r3.data.choices[0].text;
};

export const handleQuestion = async (ctx) => {
  console.log("handleQuestion------", ctx);
  const answer = await getAnswer(ctx.text);
  console.log("handleQuestion------", ctx);
  const telegramId = ctx?.from?.id ? ctx?.from?.id : ctx?.chat?.id;
  // const answer = "The answer is coming for " + param;
  return await bot.sendMessage(telegramId, answer, AnswerResponse);
};
