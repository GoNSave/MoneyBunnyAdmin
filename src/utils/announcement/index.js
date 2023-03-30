import axios from "axios";

import { bot } from "@/utils/telegram";
import { getUsers } from "../firebase";
import { getImageData } from "@/utils/bot";
const FormData = require("form-data");

//line 1 - `announcement grab`
//link 2

export const handleAnnouncement = async (ctx, message) => {
  const title = `Good evening, Grab rider! 🛵 \n
    Happy Monday!`;
  const bottom = `Upload your GRAB payslips from Mar 21 until today that you never previously shared!\n
👉 Press /start and follow the process!`;
  const caption = message.caption.split(" ");
  console.log(caption);

  // Send the photo to the user
  try {
    // const telegramIds = [5924733956, 5684756976, 5645681841, 1863422087];
    const greetingMessage = `Good evening, Grab rider! 🛵\nNew week and new goals are waiting! THIS IS ANNOUNCEMENTS TEST`;
    const photos = message.photo;
    if (photos.length > 0) {
      const users = await getUsers();
      console.log(users.length);
      for (const user of users) {
        const chatId = user.telegramId;
        if (user.questionIndex >= 12) {
          const imageUrl =
            "https://firebasestorage.googleapis.com/v0/b/gns-gpt-bot.appspot.com/o/announcements%2Fphoto_2023-03-30%2015.54.46.jpeg?alt=media&token=ac3358ea-65ad-413b-833e-0e13a231577e";
          const imageResponse = await axios.get(imageUrl, {
            responseType: "stream",
          });
          const photoData = imageResponse.data;

          let form = new FormData();
          form.append("photo", photoData);

          console.log(user.telegramId, user.first_name, user.last_name);
          await bot.sendMessage(chatId, greetingMessage);
          const re = await axios
            .post(
              `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/sendPhoto?chat_id=${chatId}`,
              form,
              {
                headers: form.getHeaders(),
              }
            )
            .then((response) => {
              console.log("sent photo already ", response.data);
            })
            .catch((error) => {
              console.log("error in sending file", error);
            });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  } catch (error) {
    console.log("error in sending file", error);
  }
};
