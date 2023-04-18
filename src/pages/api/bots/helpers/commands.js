import { handleSurveyStart } from "./survey";
import { updateRider } from "@/utils/firebase/riders";

const axios = require("axios");
const FormData = require("form-data");

const handleCommands = async (ctx, bot) => {
  console.log("------ handleCommands----");
  updateRider({
    telegramId: ctx.from.id,
    lastCommand: ctx.text,
  });

  const command = ctx.text;
  const param = ctx.text.slice(ctx.entities[0].length).toLowerCase();

  const execCommand = commands.find((c) => c.command === command);
  if (execCommand && execCommand.func) {
    return execCommand.func(ctx, param, bot);
  }
  await bot.sendMessage(
    ctx.from.id,
    `Sorry, ${command} is not a valid command.`
  );
  return true;
};

export const commands = [
  {
    command: "/start",
    func: async (ctx, param, bot) => {
      return await handleSurveyStart(ctx, bot);
    },
  },
  {
    command: "/reset",
    func: async (ctx, param, bot) => {
      console.log("reset the survey");
      await updateRider({
        telegramId: ctx.from.id,
        lastCommand: "none",
        questionIndex: "0",
      });
      await bot.sendMessage(
        ctx.from.id,
        `${ctx.from.first_name}, Your survey has been reset, /start to take the survey again!!`
      );
      return true;
    },
  },
  {
    command: "/paid",
    description: "set the status to paid",
    func: async (ctx, param, bot) => {
      console.log("pay the user");
      await updateRider({
        telegramId: param,
        reward_paid: "yes",
      });

      await bot.sendMessage(ctx.from.id, `User is paid`);
      return true;
    },
  },
  {
    command: "/tutorial",
    description: "Learn to do less and save more 🔮",
    func: async (ctx, param, bot) => {
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
            `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendPhoto?chat_id=${ctx.chat.id}`,
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
      const message =
        "Press 👉 /menu to see all the options that I have for you.";
      await bot.sendMessage(ctx.from.id, message);
      return true;
    },
  },
  {
    command: "/unlock",
    description: "Unlock access to save 🔓",
    func: async (ctx, param, bot) => {
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
            `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendPhoto?chat_id=${ctx.chat.id}`,
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
      const message =
        "Now, attach the requested pdf file by clicking the 📎 image on your device.";
      await bot.sendMessage(ctx.from.id, message);
      return true;
    },
  },
];

export default handleCommands;
