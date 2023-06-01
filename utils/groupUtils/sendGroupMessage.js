import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";
import { getUser } from "../userUtils/getUser";

export const sendGroupMessage = async (
  senderId,
  groupID,
  messageText,
  senderDisplayName,
  type,
  time,
  replyObj,
  dataObj
) => {
  const groupRef = doc(db, "groups", groupID);
  const message = {
    type: type,
    id: null,
    text: messageText,
    timestamp: time,
    senderId: senderId,
    senderDisplayName: senderDisplayName,
    groupID: groupID,
    reactions: [],
    replyObject: replyObj || {},
    dataObject: dataObj || {},
    status: "sent",
  };
  const user = await getUser(senderId);
  console.log(messageText)
  const newMessage = {
    lastMessage: messageText,
    type: type, 
    status: sent,
    timestamp: time,
    senderId: senderId,
    senderDisplayName: user.name,
    senderDisplayImg: user.photoUrl,
  };
  try {
    const messagesRef = collection(groupRef, "messages");
    console.log(message);
    const newMessageRef = await addDoc(messagesRef, message);
    const newMessageId = newMessageRef.id;
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
