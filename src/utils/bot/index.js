import axios from "axios";

export const getImageData = async (photoId) => {
  try {
    const photoUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/getFile?file_id=${photoId}`;
    const urlRes = await axios.get(photoUrl);
    const { file_path } = urlRes.data.result;
    const photoDownloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${file_path}`;
    const downloadRes = await axios.get(photoDownloadUrl, {
      responseType: "arraybuffer",
    });
    return new Uint8Array(downloadRes.data);
  } catch (error) {
    console.error("Failed to get the telegram photo", error);
    return null;
  }
};
