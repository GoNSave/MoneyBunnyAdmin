import { fireDb } from "../fireConfig";
import {
  maidDocName,
  chatDocName,
  questionsDocName,
  countryDocName,
  receiptDocName,
} from "../constants";

// import { doc, getDoc } from "firebase/firestore";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore/lite";

export const saveMessage = async (message, answer) => {
  const maid = await getMaid({
    telegramId: message.from.id,
    firstName: message.from.first_name,
    lastName: message.from.last_name,
    language: message.from.language_code,
  });

  const chatRef = doc(
    fireDb,
    `${maidDocName}/${maid.id}/${chatDocName}`,
    `${message.date}`
  );
  await setDoc(chatRef, {
    question: message.text,
    answer,
  });
};

export const getZones = async (country, city) => {
  const countryQuery = query(
    collection(fireDb, countryDocName),
    where("name", "==", country)
  );
  const countrySnapshot = await getDocs(countryQuery);
  const countryDoc = countrySnapshot.docs[0];

  const cityQuery = query(
    collection(countryDoc.ref, "cities"),
    where("name", "==", city)
  );
  const citySnapshot = await getDocs(cityQuery);
  const cityDoc = citySnapshot.docs[0];

  const zonesQuery = query(collection(cityDoc.ref, "zones"));
  const zonesSnapshot = await getDocs(zonesQuery);

  return zonesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getMaid = async (maid) => {
  const q = query(
    collection(fireDb, maidDocName),
    where("telegramId", "==", maid.telegramId)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return addMaid(maid);
  }
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
};

export const updateMaid = async (maid) => {
  console.log("Updating maid", maid);
  const q = query(
    collection(fireDb, maidDocName),
    where("telegramId", "==", maid.telegramId)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return addMaid(maid);
  }

  const docRef = querySnapshot.docs[0].ref;
  await updateDoc(docRef, maid);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};

export const addMaid = async (maid) => {
  const maids = await getMaids();
  maid.counter = maids.length + 1;
  console.log("Add maid", maid);
  const docRef = await addDoc(collection(fireDb, maidDocName), maid);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};

export const getMaids = async () => {
  const q = query(collection(fireDb, maidDocName));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return [];
  }

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
