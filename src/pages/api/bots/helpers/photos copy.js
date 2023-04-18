import { bot } from "@/utils/telegram";
import axios from "axios";
import { fireStorage } from "@/utils/fireConfig";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
const FormData = require("form-data");

import { updateMaid } from "@/utils/firebase/maids";

const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

const client = new DocumentProcessorServiceClient();

const ashokTelegramId = "1863422087";

export const handlePhotos = async (ctx, bot) => {
  console.log("handlePhotos", ctx);
  if (ctx.user.wallet_qr_code) {
    await bot.sendMessage(
      ctx.from.id,
      `${ctx.user.first_name} ! Your ${ctx.user.wallet_type} QR is already received, your reward will soon arrive. [photo]`
    );
    return true;
  }
  const photos = ctx.photo;
  const qrText = await handleQrCode(ctx, photos[photos.length - 1].file_id);
  return true;
};

const handleQrCode = async (ctx, photoId) => {
  if (ctx.user.wallet_qr_code) {
    return await bot.sendMessage(
      ctx.from.id,
      `${ctx.user.first_name}! Your ${ctx.user.wallet_type} QR is already received, your reward will soon arrive. [photo]`
    );
  }
  try {
    const photoUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/getFile?file_id=${photoId}`;
    const urlRes = await axios.get(photoUrl);
    console.log(photoUrl);
    const { file_path } = urlRes.data.result;
    const photoDownloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_TOKEN}/${file_path}`;
    const downloadRes = await axios.get(photoDownloadUrl, {
      responseType: "arraybuffer",
    });

    const photoData = new Uint8Array(downloadRes.data);

    const photoExtension = file_path.split(".").pop();
    const photoUploadPath = `maids/${ctx.user.id}/${photoId}.${photoExtension}`;
    const storageRef = ref(fireStorage, photoUploadPath);

    await uploadBytes(storageRef, photoData);

    const photoFirestoreUrl = await getDownloadURL(storageRef);
    console.log(photoFirestoreUrl);

    await updateMaid({
      telegramId: ctx.from.id,
      wallet_qr_code: photoDownloadUrl,
      reward_paid: "no",
      lastCommand: "none",
    });
    bot.sendMessage(
      ctx.chat.id,
      `🎉Thank you ${ctx.user.first_name}, Your reward is on its way. 🤑`
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    bot.sendMessage(
      ctx.chat.id,
      `💭Don't forget, this reward is for the first 💯 responses, so act fast! You'll receive your $10 within 24 hours.🤔`
    );

    const moneyMaidQrCodeUrl =
      "https://firebasestorage.googleapis.com/v0/b/gns-gpt-bot.appspot.com/o/maids%2FScreenshot%202023-04-01%20at%201.10.44%20PM.png?alt=media&token=ef25de53-ed23-4254-be33-ea8a8598f422";

    const imageResponse = await axios.get(moneyMaidQrCodeUrl, {
      responseType: "stream",
    });
    const readStream = imageResponse.data;
    let form = new FormData();
    form.append("photo", readStream);
    const re = await axios
      .post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendPhoto?chat_id=${ctx.from.id}`,
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
    bot.sendMessage(
      ctx.chat.id,
      `Sharing is caring! Share my QR code or this link https://t.me/MoneyMaidBot with your friends so they can save time and win a reward too. 🤝`
    );
    await bot.sendMessage(
      ashokTelegramId,
      `New survey completed ${JSON.stringify(ctx.user)}`
    );
    await bot.sendMessage(
      ashokTelegramId,
      `Pay respondent \n ${photoDownloadUrl}`
    );
  } catch (e) {
    console.log("Handle survey end", e.message);
  }
};
export default handlePhotos;
