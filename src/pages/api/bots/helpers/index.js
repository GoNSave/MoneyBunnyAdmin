const TelegramBot = require("node-telegram-bot-api");
import {
  handleMessage,
  handleCommand,
  handleAction,
  handleDocuments,
  handlePhotos,
} from "@/pages/api/bots/riders/handlers";
// import { surveyEnd, surveyStart } from "./survey";
import { getHelper, updateHelper } from "@/utils/firebase/helpers";

const onStart = async (ctx, bot) => {
  await bot.sendMessage("onStart");
  console.log("onstart");
};

async function handler(request, response) {
  try {
    console.log("bot webhook handler 3");
    as;
    let ctx = request.body.callback_query || request.body.message;
    console.log("bot webhook handler 4", ctx);
    ctx.user = await getHelper({
      telegramId: ctx.from.id,
    });

    const bot = new TelegramBot(process.env.HELPER_TELEGRAM_API_TOKEN);
    ctx.botId = process.env.HELPER_TELEGRAM_API_TOKEN;

    let result = false;
    try {
      if (request.body.callback_query) {
        result = await handleAction(ctx, bot);
      }
      if (ctx.photo) {
        result = await handlePhotos(ctx, bot);
      }
      if (ctx.document) {
        result = await handleDocuments(ctx, bot);
      }
      if (ctx.entities && ctx.entities[0].type === "bot_command") {
        result = await handleCommand(ctx, bot, onStart);
      }
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

  // try {
  //   console.log("bot handler");
  //   // Create our new bot handler with the token
  //   // that the Botfather gave us
  //   // Use an environment variable so we don't expose it in our code
  //   const bot = new TelegramBot(process.env.HELPER_TELEGRAM_API_TOKEN);

  //   // Retrieve the POST request body that gets sent from Telegram
  //   const { body } = request;

  //   // Ensure that this is a message being sent
  //   if (body.message) {
  //     // Retrieve the ID for this chat
  //     // and the text that the user sent
  //     const {
  //       chat: { id },
  //       text,
  //     } = body.message;

  //     // Create a message to send back
  //     // We can use Markdown inside this
  //     const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻`;

  //     // Send our new message back in Markdown and
  //     // wait for the request to finish
  //     await bot.sendMessage(id, message, { parse_mode: "Markdown" });
  //   }
  // } catch (error) {
  //   // If there was an error sending our message then we
  //   // can log it into the Vercel console
  //   console.error("Error sending message");
  //   console.log(error.toString());
  // }

  // Acknowledge the message with Telegram
  // by sending a 200 HTTP status code
  // The message here doesn't matter.
  response.send("ALL GOOD");
}

export default handler;
