// import { bot } from "@/utils/telegram";

const AccountQrCode = {
  PayMe:
    "https://firebasestorage.googleapis.com/v0/b/gns-gpt-bot.appspot.com/o/maids%2FPAYME.PNG?alt=media&token=fd72251d-1589-4053-801c-e1e4fe76c809",
  FPS: "https://firebasestorage.googleapis.com/v0/b/gns-gpt-bot.appspot.com/o/maids%2FFPS.PNG?alt=media&token=35882792-477b-4034-a439-ab8f3fcb450b",
  AliPay:
    "https://firebasestorage.googleapis.com/v0/b/gns-gpt-bot.appspot.com/o/maids%2FALIPAY.PNG?alt=media&token=327f944d-da23-4215-a52b-dd8d612da8d4",
};

import { updateRider } from "@/utils/firebase/riders";
import { getQuestionsFromSheet } from "@/utils/gsheet";

const handleQuestion = async (
  ctx,
  bot,
  question,
  msg = "",
  show_keyboard = false
) => {
  let { question: text, answers } = question;
  // text = msg ? msg + "\n" + text : text;
  //   reply_to_message_id: ctx.message_id,
  if (msg) await bot.sendMessage(ctx.chat.id, msg);

  return await bot.sendMessage(ctx.chat.id, text, {
    reply_markup: {
      // force_reply: true,
      resize_keyboard: true,
      one_time_keyboard: show_keyboard,
      keyboard: answers,
    },
  });
};

export async function handleSurvey(ctx, bot) {
  let qIndex = ctx.user.questionIndex ? ctx.user.questionIndex : 0;

  const questions = await getQuestionsFromSheet(
    process.env.GOOGLE_SHEET_MAID_SURVEY,
    ctx.from.language_code
  );

  //its the let's go message, nothing to be done
  if (qIndex === 0) {
    await updateRider({
      telegramId: ctx.from.id,
      questionIndex: qIndex + 1,
    });
    return handleQuestion(
      ctx,
      bot,
      questions[qIndex],
      "",
      qIndex >= questions.length - 1
    );
  }
  console.log("Handling question ", questions.length, qIndex);

  console.log(
    "surveyResponse question is ",
    [questions[qIndex - 1].key],
    " answer is ",
    ctx.text
  );
  const isAnswerCorrect = questions[qIndex - 1].answers.some((answerGroup) =>
    answerGroup.some((answer) => answer.text === ctx.text)
  );

  if (!isAnswerCorrect) {
    return handleQuestion(
      ctx,
      bot,
      questions[qIndex - 1],
      `"${ctx.text}" is invalid answer, please chose one of the following... \n\n`,
      qIndex >= questions.length - 1
    );
  }

  console.log(`--- update ${questions[qIndex - 1].key}: ${ctx.text}`);
  await updateRider({
    telegramId: ctx.from.id,
    questionIndex: qIndex + 1,
    [questions[qIndex - 1].key]: ctx.text,
  });

  if (qIndex >= questions.length) {
    return handleSurveyEnd(ctx, bot, ctx.text);
  }
  return handleQuestion(
    ctx,
    bot,
    questions[qIndex],
    "",
    qIndex >= questions.length - 1
  );
}

export const handleSurveyEnd = async (ctx, bot, lastAnswer) => {
  await updateRider({
    telegramId: ctx.from.id,
    lastCommand: "none",
  });

  await bot.sendMessage(
    ctx.chat.id,
    `Hi ${ctx.from.first_name}! \n\n🎉👏 Hooray! Your answers have been received and will help us personalize your experience. Thanks for taking the time! 🙌🤝 `
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    const imageUrl =
      "https://firebasestorage.googleapis.com/v0/b/gns-gpt-bot.appspot.com/o/assets%2Fpawlee-2-tutorial.png?alt=media&token=64da5765-8fa9-4dca-bee2-d5fb0f37d77d";
    const imageResponse = await axios.get(imageUrl, {
      responseType: "stream",
    });
    const readStream = imageResponse.data;

    let form = new FormData();

    form.append("photo", readStream);
    const re = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/sendPhoto?chat_id=${ctx.chat.id}`,
      form,
      {
        headers: form.getHeaders(),
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const ret = await bot.sendMessage(
      ctx.chat.id,
      `Hi ${ctx.from.first_name}! \n ${text} Please choose one of the following to continue? \n\n`,
      MainMenu
    );
  } catch (error) {}
  return showMainMenu(ctx, "");
};

export async function handleSurveyStart(ctx, bot) {
  console.log("handleStartSurvey");
  let qIndex = ctx.user.questionIndex ? ctx.user.questionIndex : 0;

  const questions = await getQuestionsFromSheet(
    process.env.GOOGLE_SHEET_MAID_SURVEY,
    ctx.from.language_code
  );

  if (qIndex >= questions.length) return true;

  try {
    console.log("start the survey ", ctx.from.id);
    const userData = {
      telegramId: ctx.from.id,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
      language_code: ctx.from.language_code,
      questionIndex: 0,
    };

    console.log("update user in handleStartSurvey");
    const user = await updateRider(userData);
    //   reply_to_message_id: ctx.message_id,
    await bot.sendMessage(ctx.chat.id, `👋 Hey ${ctx.from.first_name}!`);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await bot.sendMessage(
      ctx.chat.id,
      `Hi ${ctx.from.first_name}! \nReady to answer a few quick questions and earn $6 SGD of extra money? 💰💰`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await bot.sendMessage(
      ctx.chat.id,
      `If you help me answer few simple questions, you can earn $10. 💰💰`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await bot.sendMessage(
      ctx.chat.id,
      `🏁 Tap on the Let's Go button below to get started 🏁`,
      {
        reply_markup: {
          force_reply: true,
          resize_keyboard: true,
          one_time_keyboard: false,
          keyboard: [[{ text: "🏁 " }, { text: "Let's Go " }, { text: "🏁 " }]],
        },
      }
    );
  } catch (e) {
    console.log("handleStartSurvey", e);
  }
}
