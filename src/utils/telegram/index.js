const TelegramBot = require("node-telegram-bot-api");

export const bot = new TelegramBot(process.env.TELEGRAM_TOKEN_GNSGPTBOT);

export const reply = async (ctx, message) => {
  console.log("replying", message);
  const ret = await bot.sendMessage(ctx.chat.id, message);
  console.log("replying ret", ret);
  return ret;
};

export const replyWithId = async (telegramId, message) => {
  // console.log("replying", message);
  const ret = await bot.sendMessage(telegramId, message);
  // console.log("replying ret", ret);
  return ret;
};

//https://levelup.gitconnected.com/creating-a-conversational-telegram-bot-in-node-js-with-a-finite-state-machine-and-async-await-ca44f03874f9
