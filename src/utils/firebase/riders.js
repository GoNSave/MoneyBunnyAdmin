import { fireDb } from "../fireConfig";
import {
  ridersDocName,
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
  const user = await getRider({
    telegramId: message.from.id,
    firstName: message.from.first_name,
    lastName: message.from.last_name,
    language: message.from.language_code,
  });

  const chatRef = doc(
    fireDb,
    `${ridersDocName}/${user.id}/${chatDocName}`,
    `${message.date}`
  );
  await setDoc(chatRef, {
    question: message.text,
    answer,
  });
};

export const updateZone = async (country, city, zone) => {
  console.log(`update zone for ${country} ${city} ${zone}`);

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
};

export const getFeeForZone = async (country, city, zone) => {
  console.log(`get fee for ${country} ${city} ${zone}`);
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

  const zoneQuery = query(
    collection(cityDoc.ref, "zones"),
    where("name", "==", zone)
  );

  const zoneSnapshot = await getDocs(zoneQuery);
  const zoneDoc = zoneSnapshot.docs[0];

  const surgeFeeQuery = query(
    collection(zoneDoc.ref, "surgeFee"),
    where("name", "==", "default")
  );
  const surgeFeeSnapshot = await getDocs(surgeFeeQuery);
  const surgeFeeDoc = surgeFeeSnapshot.docs[0];

  console.log(surgeFeeDoc);
  // const timeSlotsRef = doc(surgeFeeDoc.ref, "timeSlots", "days");
  // const timeSlotsSnapshot = await getDoc(timeSlotsRef);
  // const timeSlotsDoc = timeSlotsSnapshot.data();
  // const fee = timeSlotsDoc.fee;

  // console.log(fee);
  return "zoneQuery";

  // console.log(`update zone for ${country} ${city} ${zone}`);

  // const countryRef = doc(fireDb, countryDocName, country);
  // const cityRef = doc(countryRef, "cities", city);
  // const zoneRef = doc(cityRef, "zones", zone);
  // console.log(zoneRef);
  // // const surgeFeeRef = doc(zoneRef, "surgeFee/default");
  // // const timeSlotsRef = doc(surgeFeeRef, "timeSlots/days");

  // // const timeSlotsDoc = await getDoc(timeSlotsRef);
  // // const fee = timeSlotsDoc.data().fee;

  // return fee;
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

export const getRider = async (user) => {
  const q = query(
    collection(fireDb, ridersDocName),
    where("telegramId", "==", user.telegramId)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return addUser(user);
  }
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
};

export const updateReceipt = async (user, downloadUrl) => {
  console.log("Updating receipt", url);
  const q = query(
    collection(fireDb, receiptDocName),
    where("downloadUrl", "==", downloadUrl)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return addReceipt(user);
  }

  const docRef = querySnapshot.docs[0].ref;
  await updateDoc(docRef, user);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};

export const addReceipt = async (user, downloadUrl) => {
  const docRef = await addDoc(collection(fireDb, ridersDocName), user);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};

export const updateRider = async (user) => {
  console.log("Updating rider", user);
  const q = query(
    collection(fireDb, ridersDocName),
    where("telegramId", "==", user.telegramId)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return addUser(user);
  }

  const docRef = querySnapshot.docs[0].ref;
  await updateDoc(docRef, user);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};

export const addUser = async (user) => {
  const docRef = await addDoc(collection(fireDb, ridersDocName), user);
  const docSnapshot = await getDoc(docRef);
  return { id: docSnapshot.id, ...docSnapshot.data() };
};

export const getQuestions = async () => {
  const q = query(collection(fireDb, questionsDocName));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return [];
  }

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getAnswers = async (questionId) => {
  // /questions/P0XSEF3PUUeJ8Vf8G7z2/answers
  const q = query(
    collection(fireDb, questionsDocName + "/" + questionId + "/" + "answers")
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return [];
  }

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getRiders = async () => {
  const q = query(collection(fireDb, ridersDocName));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return [];
  }

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/*
{
  message_id: 426,
  from: {
    id: 1863422087,
    is_bot: false,
    first_name: 'Ashok',
    last_name: 'Jaiswal',
    language_code: 'en'
  },
  chat: {
    id: 1863422087,
    first_name: 'Ashok',
    last_name: 'Jaiswal',
    type: 'private'
  },
  date: 1676972840,
  text: 'hi'
}
*/
