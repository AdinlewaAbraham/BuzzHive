import { db } from "../firebaseUtils/firebase";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { getUser } from "../userUtils/getUser";

export async function sendMessage(
  user1Id,
  user2Id,
  messageText,
  senderId,
  time
) {
  const message = {
    id: null,
    text: messageText,
    senderId: senderId,
    timestamp: time,
    reaction: [],
  };

  try {
    const conversationsRef = collection(db, "conversations");
    const conversationId =
      user1Id > user2Id ? user1Id + user2Id : user2Id + user1Id;
    console.log(conversationId);
    const newConversationRef = doc(conversationsRef, conversationId);
    const user = await getUser(senderId);
    const newConversationData = {
      participants: [user1Id, user2Id],
      lastMessage: messageText,
      senderId: senderId,
      senderDisplayName: user.name,
      timestamp: time,
    };
    await setDoc(newConversationRef, newConversationData);

    const messagesRef = collection(newConversationRef, "messages");
    const newMessageRef = await addDoc(messagesRef, message);
    const newMessageId = newMessageRef.id;
    message.id = newMessageId;

    await setDoc(newMessageRef, message);

    return message;
  } catch (error) {
    console.error("Failed to send message:", error);
    return null;
  }
}
