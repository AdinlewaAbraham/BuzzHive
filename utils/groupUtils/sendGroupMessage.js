import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";
import { getUser } from "../userUtils/getUser";

export const sendGroupMessage = async (
  senderId,
  groupID,
  messageText,
  time
) => {
  const groupRef = doc(db, "groups", groupID);
  const message = {
    id: null,
    text: messageText,
    timestamp: time,
    senderId: senderId,
    groupID: groupID,
    reactions: [],
  };
  const user = await getUser(senderId);
  const newMessage = {
    lastMessage: messageText,
    timestamp: time,
    senderId: senderId,
    senderDisplayName: user.name,
    senderDisplayImg: user.photoUrl,
    readBy: [],
  };
  try {
    const messagesRef = collection(groupRef, "messages");
    const newMessageRef = await addDoc(messagesRef, message);
    console.log("newMessageRef", newMessageRef);
    const newMessageId = newMessageRef.id;
    console.log("newMessageId", newMessageId);
    message.id = newMessageId;
    await updateDoc(groupRef, { lastMessage: newMessage });
    await setDoc(newMessageRef, message);
  } catch (error) {
    console.error(
      "Error adding message to messages subcollection for group with ID",
      groupID,
      error
    );
  }
};
