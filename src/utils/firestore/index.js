import { fireDb, fireStorage } from "../fireConfig";
import { getUser } from "../firebase";
import { telegramBot } from "../telegram";
import { userDocName, chatDocName, filesDocName } from "@/utils/constants";
import { doc, setDoc } from "firebase/firestore/lite";

import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
const axios = require("axios");

export const uploadFile = async (ctx, fileId) => {
  console.log("uploadFile");
  const file = await telegramBot.getFile(fileId);
  if (!file) return null;

  const filePath = file.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${filePath}`;
  console.log("downloadUrl", downloadUrl);

  console.log("user found", ctx.user.id);
  const fileExtension = downloadUrl.split(".").pop();
  console.log("extension found", fileExtension);
  const uploadFileName = `users/${retUser.id}/${file.file_unique_id}.${fileExtension}`;

  console.log("uploadFileName", uploadFileName);
  const storageRef = ref(fireStorage, uploadFileName);

  const response = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
  });
  console.log("File data", response.data);
  const fileData = new Uint8Array(response.data);

  await uploadBytes(storageRef, fileData);

  return await getDownloadURL(storageRef);
  return "sh";
};
