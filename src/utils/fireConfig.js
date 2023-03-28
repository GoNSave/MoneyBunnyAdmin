import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";

export const initFirebase = () => {
  return initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKER,
    messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  });
};

export const fireApp = initFirebase();
export const fireDb = getFirestore(fireApp);
export const fireStorage = getStorage(fireApp);
