const TelegramBot = require("node-telegram-bot-api");
import {
  handleMessage,
  handleCommand,
  handleAction,
  handleDocuments,
  handlePhotos,
} from "@/pages/api/bots/riders/handlers";
// import { surveyEnd, surveyStart } from "./survey";
import { getRider } from "@/utils/firebase/riders";

async function handler(request, response) {
  try {
    let ctx = request.body.callback_query || request.body.message;
    ctx.user = await getRider({
      telegramId: ctx.from.id,
    });

    const bot = new TelegramBot(process.env.RIDERS_DEV_TELEGRAM_API_TOKEN);
    ctx.botId = process.env.RIDERS_DEV_TELEGRAM_API_TOKEN;

    let result = false;
    try {
      if (request.body.callback_query) {
        console.log("Action handled and shoud return already");
        result = await handleAction(ctx, bot);
        return response.send(result);
      }
      if (ctx.photo) {
        result = await handlePhotos(ctx, bot);
      }
      if (ctx.document) {
        result = await handleDocuments(ctx, bot);
      }
      if (ctx.entities && ctx.entities[0].type === "bot_command") {
        result = await handleCommand(ctx, bot);
      }
      //if its already been handled, return now
      if (result) {
        console.log(result, " Already handled ");

        return response.send(result);
      }

      //if not handled yet,  handle the normal message
      console.log("handle message: ");
      result = await handleMessage(ctx, bot);
      if (!result) {
        await bot.sendMessage(
          ctx.from.id,
          `${ctx.user.first_name}! Sorry I did not understand your message, please try again.`
        );
      }
      console.log("Result from handlers: ", result);
    } catch (error) {
      console.log("------- ERROR: " + error.message);
    }
    return response.send(result);
  } catch (error) {
    // await bot.sendMessage(ctx.from.id, `huh!! Something went wrong`);
    console.error("--------------------------------");
    console.log(error.message);
    return response.send("OK");
  }
  response.send("ALL GOOD");
}

export default handler;
