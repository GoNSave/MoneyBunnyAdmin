import { fireDb } from "../fireConfig";
import {
  helperDocName,
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
  const helper = await getHelper({
    telegramId: message.from.id,
    firstName: message.from.first_name,
    lastName: message.from.last_name,
    language: message.from.language_code,
  });

  const chatRef = doc(
    fireDb,
    `${helperDocName}/${helper.id}/${chatDocName}`,
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

export const getHelper = async (helper) => {
  const q = query(
    collection(fireDb, helperDocName),
    where("telegramId", "==", helper.telegramId)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return addHelper(helper);
  }
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
};

export const updateHelper = async (helper) => {
  console.log("Updating helper", helper);
  const q = query(
    collection(fireDb, helperDocName),
    where("telegramId", "==", helper.telegramId)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return addHelper(helper);
  }

  const docRef = querySnapshot.docs[0].ref;
  await updateDoc(docRef, helper);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};

export const addHelper = async (helper) => {
  const helpers = await getHelpers();
  helper.counter = helpers.length + 1;
  console.log("Add helper", helper);
  const docRef = await addDoc(collection(fireDb, helperDocName), helper);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};

export const getHelpers = async () => {
  const q = query(collection(fireDb, helperDocName));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return [];
  }

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
