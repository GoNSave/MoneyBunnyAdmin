import { updateRider } from "@/utils/firebase/riders";
import { getQuestionsFromSheet } from "@/utils/gsheet";
import { handleSurvey } from "./survey";
import { showMainMenu } from "@/utils/constants";

const handleMessage = async (ctx, bot) => {
  console.log("------ handleMessage----", ctx);
  const questions = await getQuestionsFromSheet(
    process.env.GOOGLE_SHEET_MAID_SURVEY,
    ctx.from.language_code
  );
  if (ctx.user?.lastCommand === "/start") {
    console.log("handle the start", ctx.user?.lastCommand);
    if (ctx.user.questionIndex >= questions.length) {
      await updateRider({
        telegramId: ctx.from.id,
        lastCommand: "none",
      });
      return await bot.sendMessage(
        ctx.from.id,
        "You already finished the survey. Thank you!"
      );
    }

    await handleSurvey(ctx, bot);
    return true;
  }

  return true;
};

export default handleMessage;
