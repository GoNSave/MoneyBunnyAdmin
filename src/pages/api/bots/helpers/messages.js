import { getQuestionsFromSheet } from "@/utils/gsheet";
import { handleSurvey } from "./survey";
import { showMainMenu } from "@/utils/constants";

const handleMessage = async (ctx, bot) => {
  console.log("------ handleMessage----");
  const questions = await getQuestionsFromSheet(
    process.env.GOOGLE_SHEET_MAID_SURVEY,
    ctx.from.language_code
  );
  if (ctx.user?.lastCommand === "/start") {
    console.log("handle the start", ctx.user?.lastCommand);
    await handleSurvey(ctx, bot);
    return true;
  }

  if (ctx.user.questionIndex >= questions.length) {
    return showMainMenu(ctx, bot, "You already finished the survey");
  }
  return true;
};

export default handleMessage;
