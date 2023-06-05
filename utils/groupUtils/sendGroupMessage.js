import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";
import { getUser } from "../userUtils/getUser";
import { v4 as uuidv4 } from "uuid";

export const sendGroupMessage = async (
  senderId,
  groupID,
  messageText,
  senderDisplayName,
  type,
  time,
  replyObj,
  dataObj, createdId
) => {
  const groupRef = doc(db, "groups", groupID);
  const customId = uuidv4();
  const message = {
    type: type,
    id: createdId || customId,
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
  const newMessage = {
    lastMessage: messageText,
    type: type, 
    status: "sent",
    timestamp: time,
    senderId: senderId,
    senderDisplayName: user.name,
    senderDisplayImg: user.photoUrl,
  };
  try {
    await updateDoc(groupRef, { lastMessage: newMessage });




    const messagesColRef = collection(groupRef, "messages");
    const messageDocRef = doc(messagesColRef, customId);
    await setDoc(messageDocRef, message);
  } catch (error) {
    console.error(
      "Error adding message to messages subcollection for group with ID",
      groupID,
      error
    );
  }
};
