// import axios from "axios";
import { onCommand } from "./commands";
import { onAction } from "./actions";
import { getUser } from "@/utils/firebase";
import { parseDocument, parseReceipt } from "@/utils/parser";
import { bot } from "@/utils/telegram";
import { defaultResponse } from "@/utils/constants";
import { handleQuestion } from "@/utils/openai";
import { updateUser } from "@/utils/firebase";
import { surveyResponse } from "./survey";
async function handler(request, response) {
  try {
    let ctx = request.body.callback_query;
    if (request.body.callback_query) {
      ctx.user = await getUser({
        telegramId: ctx.from.id,
      });
      await onAction(request.body.callback_query);
      return response.send("OK");
    }

    ctx = request.body.message;

    ctx.user = await getUser({
      telegramId: ctx.from.id,
    });

    const { message } = request.body;

    console.log(message);

    if (message?.photo) {
      console.log("------- photo arrived-------");
      const photos = message.photo;
      if (photos.length > 0) {
        const receiptText = await parseReceipt(
          ctx,
          photos[photos.length - 1].file_id
        );
        await bot.sendMessage(ctx.from.id, receiptText);
      }
    }
    if (message?.document) {
      console.log("------- document arrived-------");
      const pdf = message.document;
      const documentId = pdf.file_id;
      const docText = await parseDocument(documentId);
      await bot.sendMessage(ctx.from.id, docText);
    }

    if (!request?.body?.message?.text) {
      return response.json({
        body: request.body,
        query: request.query,
        cookies: request.cookies,
      });
    }

    if (ctx.user?.lastCommand === "/start") {
      console.log("handle the start", ctx.user?.lastCommand);
      await surveyResponse(ctx);
      return response.send("OK");
    }
    if (ctx.user?.lastCommand === "talk") {
      await handleQuestion(ctx);
      return response.send("OK");
    }

    if (ctx.entities) {
      if (ctx.entities[0]?.type === "bot_command") {
        console.log("updated the last command", ctx.text);
        updateUser({
          telegramId: ctx.from.id,
          lastCommand: ctx.text,
        });
        console.log("handle command: " + ctx.entities[0]);
        await onCommand(
          ctx,
          ctx.text,
          ctx.text.slice(ctx.entities[0].length).toLowerCase()
        );
      }
      return response.send("OK");
    }
    //if not a command or action, go back to main menu
    await defaultResponse(ctx, "Sorry, I did not understand your request.");
    return response.send("OK");
  } catch (error) {
    console.log("Error: " + error);
  }
  // console.log(request);
  response.status(200).json({ message: "Hello World" });
}

export default handler;
