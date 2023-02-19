import {
  addDoc,
  collection,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export const addGroupMessage = async (senderId, groupID, messageText) => {
  const groupRef = doc(db, "groups", groupID);
  const message = {
    text: messageText,
    timeStamp: serverTimestamp(),
    senderId: senderId,
    reaction: null,
    groupID: groupID,
  };
  try {
    const messagesRef = collection(groupRef, "messages");
    await addDoc(messagesRef, message);
    console.log(
      "Message added to messages subcollection for group with ID",
      groupID
    );
  } catch (error) {
    console.error(
      "Error adding message to messages subcollection for group with ID",
      groupID,
      error
    );
  }
  // const groupsRef = collection(db, "groups")
  // const groupMessagesRef = collection(groupsRef, "groupMessages")
  // await addDoc(groupMessagesRef, message)
};
