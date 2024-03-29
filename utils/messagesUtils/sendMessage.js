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
  fileObj,
  createdId,
  clearMessage,
  isForwarded
) {
  clearMessage();
  const customId = uuidv4();

  const message = {
    type: type,
    id: createdId || customId,
    text: messageText,
    senderId: senderId,
    senderDisplayName: senderDisplayName,
    timestamp: time,
    reactions: [],
    replyObject: replyObj || {},
    dataObject: fileObj || {},
    status: user1Id === user2Id ? "seen" : "sent",
    isForwarded: isForwarded || false,
  };

  try {
    const conversationsRef = collection(db, "conversations");
    const conversationId =
      user1Id > user2Id ? user1Id + user2Id : user2Id + user1Id;
    const newConversationRef = doc(conversationsRef, conversationId);
    const lastMessage = {
      text: messageText,
      type: type,
      status: user1Id === user2Id ? "seen" : "sent",
      lastMessageId: createdId || customId,
    };
    if (type === "file") {
      lastMessage.fileName = fileObj?.name;
    }
    const newConversationData = {
      participants: [user1Id, user2Id],
      lastMessage,
      senderId: senderId,
      senderDisplayName: senderDisplayName,
      timestamp: time,
    };
    await setDoc(newConversationRef, newConversationData);

    const messagesColRef = collection(newConversationRef, "messages");
    const messageDocRef = doc(messagesColRef, createdId || customId);
    await setDoc(messageDocRef, message);
  } catch (error) {
    console.error("Failed to send message:", error);
    return null;
  }
}
