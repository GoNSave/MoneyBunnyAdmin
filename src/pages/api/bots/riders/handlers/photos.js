import axios from "axios";
import { savePhoto } from "@/utils/firestore";
import { updateMaid } from "@/utils/firebase/maids";

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
  const qrText = await handleQrCode(
    ctx,
    photos[photos.length - 1].file_id,
    bot
  );
  return true;
};

const handleQrCode = async (ctx, photoId, bot) => {
  if (ctx.user.wallet_qr_code) {
    return await bot.sendMessage(
      ctx.from.id,
      `${ctx.user.first_name}! Your ${ctx.user.wallet_type} QR is already received, your reward will soon arrive.`
    );
  }
  try {
    const { data, type, url } = await bot.getPhoto(photoId);
    const photoPath = `maids/${ctx.user.id}/${photoId}.${type}`;
    const photoUrl = savePhoto(photoPath, data);

    await updateMaid({
      telegramId: ctx.from.id,
      wallet_qr_code: photoUrl,
      reward_paid: "no",
      lastCommand: "none",
    });

    bot.sendMessages(ctx.from.id, [
      `🎉Thank you ${ctx.user.first_name}, Your reward is on its way. 🤑`,
      `💭Don't forget, this reward is for the first 💯 responses, so act fast! You'll receive your $10 within 24 hours.🤔`,
    ]);

    await bot.sendPhoto(
      ctx.from.id,
      "https://firebasestorage.googleapis.com/v0/b/gns-gpt-bot.appspot.com/o/maids%2FScreenshot%202023-04-01%20at%201.10.44%20PM.png?alt=media&token=ef25de53-ed23-4254-be33-ea8a8598f422"
    );

    bot.sendMessages(ctx.chat.id, [
      `Sharing is caring! Share my QR code or this link https://t.me/MoneyMaidBot with your friends so they can save time and win a reward too. 🤝`,
    ]);

    bot.sendMessages(ashokTelegramId, [
      `New survey completed ${JSON.stringify(ctx.user)}`,
      `Pay respondent \n ${photoDownloadUrl}`,
    ]);
  } catch (e) {
    console.log("Handle survey end", e.message);
  }
};
export default handlePhotos;
