import { getAnswer } from "@/utils/openai";
import { reply } from "@/utils/telegram";
import { handleStartSurvey } from "./survey";
import { defaultResponse } from "@/utils/constants";
import { bot } from "@/utils/telegram";
import { MainMenu } from "@/utils/constants";

const path = require("path");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

export async function onCommand(ctx, command, param) {
  const execCommand = commands.find((c) => c.command === command);
  if (execCommand && execCommand.func) {
    return execCommand.func(ctx, param);
  }
  return defaultResponse(ctx, `Sorry, ${command} is not a valid command.`);
}

export const commands = [
  {
    command: "/start",
    description: "Start saving now 📖",
    func: async (ctx, param) => {
      return await handleStartSurvey(ctx);
    },
  },
  {
    command: "/help",
    description: "this is to help you 📖",
    func: async (ctx, param) => {
      return reply(ctx, `Thank you for your message, how can I help you?`);
    },
  },
  {
    command: "/menu",
    description: "this is the main menu",
    func: async (ctx, param) => {
      return await bot.sendMessage(
        ctx.chat.id,
        `Hi ${ctx.from.first_name}! \nPlease chose from the menu below to continue...`,
        MainMenu
      );
    },
  },
  {
    command: "/tell",
    description: "Get a bedtime story 📖",
    func: async (ctx, param) => {
      if (!param || param.length < 3) {
        const gpt = await getAnswer(
          "tell me something interesting about that happened on this date in history starting with Did you know..."
        );
        return reply(
          ctx,
          `Please ask a param with at least 3 characters.  \n\n BTW  ${gpt}`
        );
      } else {
        const answer = await getAnswer("tell me " + param);
        return reply(ctx, answer);
      }
    },
  },
  {
    command: "/poem",
    description: "Receive a beautiful poem 📜",
    func: async (ctx, param) => {
      const poem =
        "Roses are red, violets are blue, here's a beautiful poem just for you!" +
        param;
      reply(ctx, poem);
    },
  },
  {
    command: "/joke",
    description: "Laugh out loud with a joke 😂",
    func: async (ctx, param) => {
      const joke =
        "Why don't scientists trust atoms? Because they make up everything!";
      reply(ctx, joke);
    },
  },
  {
    command: "/fact",
    description: "Learn something new with a fact 🧐",
    func: async (ctx, param) => {
      const fact = "A group of flamingos is called a flamboyance.";
      return reply(ctx, fact);
    },
  },
  {
    command: "/quote",
    description: "Get inspired with a quote 💭",
    func: async (ctx, param) => {
      const quote =
        "The best way to predict your future is to create it. - Abraham Lincoln";
      return reply(ctx, quote);
    },
  },
  {
    command: "/news",
    description: "Stay up-to-date with the latest news 📰",
    func: async (ctx, param) => {
      const news = "Here are the latest headlines: ...";
      return reply(ctx, news);
    },
  },
  {
    command: "/weather",
    description: "Get the current weather forecast 🌤️",
    func: async (ctx, param) => {
      const weather =
        "The weather today is sunny with a high of 25 degrees Celsius.";
      return reply(ctx, weather);
    },
  },
  {
    command: "/horoscope",
    description: "Discover what the stars have in store for you 🔮",
    func: async (ctx, param) => {
      const horoscope = "Here's your horoscope for today: ...";
      return reply(ctx, horoscope);
    },
  },
  {
    command: "/tutorial",
    description: "Learn to do less and save more 🔮",
    func: async (ctx, param) => {
      let form = new FormData();
      // Send the photo to the user
      try {
        const imageUrl =
          "https://firebasestorage.googleapis.com/v0/b/gns-gpt-bot.appspot.com/o/assets%2Fpawlee-2-tutorial.png?alt=media&token=64da5765-8fa9-4dca-bee2-d5fb0f37d77d";
        const imageResponse = await axios.get(imageUrl, {
          responseType: "stream",
        });
        const readStream = imageResponse.data;

        form.append("photo", readStream);
        const re = await axios
          .post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/sendPhoto?chat_id=${ctx.chat.id}`,
            form,
            {
              headers: form.getHeaders(),
            }
          )
          .then((response) => {
            console.log("sent photo already ", response.data);
          })
          .catch((error) => {
            console.log("error in sending file", error);
          });
      } catch (e) {
        console.log(e);
      }
      const weather =
        "Press 👉 /menu to see all the options that I have for you.";
      return reply(ctx, weather);
    },
  },
  {
    command: "/unlock",
    description: "Unlock access to save 🔓",
    func: async (ctx, param) => {
      let readStream = fs.createReadStream(
        "/Users/ashokjaiswal/Downloads/WhatsApp Image 2023-03-14 at 12.20.20 PM.jpeg"
      );
      let form = new FormData();

      // Send the photo to the user
      try {
        const imageUrl =
          "https://firebasestorage.googleapis.com/v0/b/gns-gpt-bot.appspot.com/o/assets%2Fpawlee2-share-receipt.png?alt=media&token=06f2edda-b1af-4ae3-b104-eac2b31869bb";
        const imageResponse = await axios.get(imageUrl, {
          responseType: "stream",
        });
        const readStream = imageResponse.data;

        form.append("photo", readStream);
        const re = await axios
          .post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/sendPhoto?chat_id=${ctx.chat.id}`,
            form,
            {
              headers: form.getHeaders(),
            }
          )
          .then((response) => {
            console.log("sent photo already ", response.data);
          })
          .catch((error) => {
            console.log("error in sending file", error);
          });
      } catch (e) {
        console.log(e);
      }
      const weather =
        "Now, attach the requested pdf file by clicking the 📎 image on your device.";
      return reply(ctx, weather);
    },
  },
];
