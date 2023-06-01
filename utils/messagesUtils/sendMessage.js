import { db } from "../firebaseUtils/firebase";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { getUser } from "../userUtils/getUser";
import { v4 as uuidv4 } from "uuid";

export async function sendMessage(
  user1Id,
  user2Id,
  messageText,
  senderId,
  senderDisplayName,
  type,
  time,
  replyObj,
  fileObj
) {
  const customId = uuidv4();

  console.log(customId);
  const message = {
    type: type,
    id: customId,
    text: messageText,
    senderId: senderId,
    senderDisplayName: senderDisplayName,
    timestamp: time,
    reactions: [],
    replyObject: replyObj || {},
    dataObject: fileObj || {},
    status: "sent",
  };

  try {
    const conversationsRef = collection(db, "conversations");
    const conversationId =
      user1Id > user2Id ? user1Id + user2Id : user2Id + user1Id;
    const newConversationRef = doc(conversationsRef, conversationId);
    const User = JSON.parse(localStorage.getItem("user"));
    const newConversationData = {
      participants: [user1Id, user2Id],
      lastMessage: { text: messageText, type: type, status: "sent" },
      senderId: senderId,
      senderDisplayName: User.name,
      timestamp: time,
    };
    await setDoc(newConversationRef, newConversationData);

    const messagesColRef = collection(newConversationRef, "messages");
    console.log(customId);
    const messageDocRef = doc(messagesColRef, customId);
    await setDoc(messageDocRef, message);
  } catch (error) {
    console.error("Failed to send message:", error);
    return null;
  }
}
