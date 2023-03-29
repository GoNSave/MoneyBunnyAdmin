// import axios from "axios";
import { onCommand } from "./commands";
import { onAction } from "./actions";
import { getUser } from "@/utils/firebase";
import { parseDocument, handleReceipt } from "@/utils/parser";
import { bot } from "@/utils/telegram";
import { defaultResponse } from "@/utils/constants";
import { handleQuestion } from "@/utils/openai";
import { updateUser } from "@/utils/firebase";
import { surveyResponse } from "./survey";
import { AnswerResponse } from "@/utils/constants";

const validateReceipt = (receipt) => {
  const template = {
    user: {
      telegramId: "insert telegramId here",
      company: "insert company name here",
      vehicle: "insert vehicle type here",
      name: "insert name here",
      zone: "insert zone here",
    },
    time: "insert time here",
    date: "insert date here",
    location: {
      start: "insert start location here",
      end: "insert end location here",
      stops: "insert stops here",
    },
    distance: "insert distance here",
    payment: {
      method: "insert payment method here",
      netEarnings: "insert net earnings here",
      deliveryFee: "insert delivery fee here",
      earningAdjustment: "insert earning adjustment here",
      totalEarning: "insert total earning here",
      tip: "insert tip here",
    },
    status: "added",
    basket: "1.0",
    week: 88,
  };
  if (
    receipt.start === template.start &&
    receipt.end === template.end &&
    receipt.time === template.time
  ) {
    return false;
  }
  return true;
};

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
      await bot.sendMessage(
        ctx.from.id,
        `Please wait, let me check your receipt...`
      );
      console.log("------- photo arrived-------");
      const photos = message.photo;
      if (photos.length > 0) {
        const receiptText = await handleReceipt(
          ctx,
          photos[photos.length - 1].file_id
        );
        // photos.forEach((photo) => {
        //   console.log(photo.file_id, photo);
        // });
        // if (!validateReceipt(receiptText)) {
        //   return await bot.sendMessage(
        //     ctx.from.id,
        //     `Dear ${ctx.user.first_name}, \n Your receipt seems to be invalid, please check and resend. Thanks`
        //   );
        // }
        await bot.sendMessage(
          ctx.from.id,
          `${ctx.user.first_name} \n I found following data in your receipt \n\n ${receiptText} \n\n If above is correct, please hit the like button and will get back to within 24 hours`,
          AnswerResponse
        );
      }
    }
    if (message?.document) {
      console.log("------- document arrived-------", message?.document);

      const docText = await parseDocument(message?.document?.file_id);
      const chunkSize = 4096;
      for (let i = 0; i < docText.length; i += chunkSize) {
        const chunk = docText.substring(i, i + chunkSize);
        await bot.sendMessage(ctx.from.id, chunk);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Pause for 500ms
      }
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
