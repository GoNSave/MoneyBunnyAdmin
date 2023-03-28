const TelegramBot = require("node-telegram-bot-api");
import axios from "axios";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
process.env.NTBA_FIX_319 = "test";

module.exports = async (request, response) => {
  // export default function handler(req, res) {
  console.log("handler called");
  const bot = new TelegramBot(process.env.TELEGRAM_TOKEN_GNSGPTBOT);
  const { body } = request;
  console.log(body);

  if (body.message) {
    const {
      chat: { id },
      text,
    } = body.message;

    const res = await axios.get("http://webcode.me");
    const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻 ${res.data}`;

    await bot.sendMessage(id, message, { parse_mode: "Markdown" });
  }
  response.status(200).json({ name: "new test Doe" });
};
