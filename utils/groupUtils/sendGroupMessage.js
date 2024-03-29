import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";
import { getUser } from "../userUtils/getUser";
import { v4 as uuidv4 } from "uuid";

export const sendGroupMessage = async (
  senderId,
  senderDisplayImg,
  groupID,
  messageText,
  senderDisplayName,
  type,
  time,
  replyObj,
  dataObj,
  createdId,
  clearMessage,
  isForwarded
) => {
  clearMessage();
  const groupRef = doc(db, "groups", groupID);
  const customId = uuidv4();
  const message = {
    type: type,
    id: createdId || customId,
    text: messageText,
    timestamp: time,
    senderId: senderId,
    senderDisplayName: senderDisplayName,
    senderDisplayImg,
    groupID: groupID,
    reactions: [],
    replyObject: replyObj || {},
    dataObject: dataObj || {},
    status: "sent",
    isForwarded: isForwarded || false,
  };
  const user = await getUser(senderId);
  const newMessage = {
    lastMessageId: createdId || customId,
    lastMessage: messageText,
    type: type,
    status: "sent",
    timestamp: time,
    senderId: senderId,
    senderDisplayName: user.name,
    senderDisplayImg: user.photoUrl,
  };
  if (type === "file") {
    newMessage.fileName = dataObj?.name;
  }

  try {
    await updateDoc(groupRef, { lastMessage: newMessage });

    const messagesColRef = collection(groupRef, "messages");
    const messageDocRef = doc(messagesColRef, createdId || customId);
    await setDoc(messageDocRef, message);
  } catch (error) {
    console.error(
      "Error adding message to messages subcollection for group with ID",
      groupID,
      error
    );
  }
};
