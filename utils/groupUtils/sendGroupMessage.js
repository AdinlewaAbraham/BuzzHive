import {
  addDoc,
  collection,
  serverTimestamp,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";
import { getUser } from "../userUtils/getUser";

export const sendGroupMessage = async (senderId, groupID, messageText) => {
  const groupRef = doc(db, "groups", groupID);
  const message = {
    text: messageText,
    timeStamp: serverTimestamp(),
    senderId: senderId,
    reaction: null,
    groupID: groupID,
  };
  const senderDisplayName = senderId.senderDisplayName;
  const user = await getUser(senderId)
  const newMessage = {
    lastMessage: messageText,
    timeStamp: serverTimestamp(),
    senderId: senderId,
    senderDisplayName: user.name,
    senderDisplayImg: user.photoUrl,
  };
  try {
    await updateDoc(groupRef, { lastMessage: newMessage });
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
};
