import axios from "axios";
import { telegramBot } from "./telegram";

export const get = async (url, params) => {
  return `https://api.telegram.org/bot${tgbot}/sendMessage?chat_id=${id}&text=${answer}&parse_mode=HTML`;
};

export const reply = async (id, answer) => {
  return telegramBot.sendMessage(id, answer, { parse_mode: "Markdown" });

  return axios.get(
    `https://api.telegram.org/bot${tgbot}/sendMessage?chat_id=${id}&text=${answer}&parse_mode=HTML`
  );
};
