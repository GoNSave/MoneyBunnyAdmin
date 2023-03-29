import { fireDb, fireStorage } from "../fireConfig";
import { getUser } from "../firebase";
import { telegramBot } from "../telegram";
import { userDocName, chatDocName, filesDocName } from "@/utils/constants";
import { doc, setDoc } from "firebase/firestore/lite";

import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
const axios = require("axios");

export const saveFile = async (user, photo, caption) => {
  const fileId = photo.file_id;
  const file = await telegramBot.getFile(fileId);
  if (!file) return null;

  const filePath = file.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${filePath}`;

  const retUser = await getUser(user);
  if (!retUser) return null;

  const fileExtension = downloadUrl.split(".").pop();
  const uploadFileName = `users/${retUser.id}/${file.file_unique_id}.${fileExtension}`;

  const storageRef = ref(fireStorage, uploadFileName);

  const response = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
  });
  const fileData = new Uint8Array(response.data);

  await uploadBytes(storageRef, fileData);

  const fireUrl = await getDownloadURL(storageRef);

  const filesRef = doc(
    fireDb,
    `${userDocName}/${retUser.id}/${filesDocName}`,
    `${Date.now().toString()}`
  );

  await setDoc(filesRef, {
    firestoreUrl: fireUrl,
    telegramUrl: downloadUrl,
    caption,
  });

  return fireUrl;
};
