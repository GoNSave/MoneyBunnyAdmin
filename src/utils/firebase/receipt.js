import { fireDb } from "../fireConfig";
import { receiptDocName } from "../constants";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  getDoc,
  updateDoc,
} from "firebase/firestore/lite";

export const updateReceipt = async (receipt) => {
  console.log("Updating receipt", receipt);
  const q = query(
    collection(fireDb, receiptDocName),
    where("downloadUrl", "==", receipt.downloadUrl)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return addReceipt(receipt);
  }

  const docRef = querySnapshot.docs[0].ref;
  await updateDoc(docRef, receipt);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};

export const addReceipt = async (receipt) => {
  const docRef = await addDoc(collection(fireDb, receiptDocName), receipt);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};
