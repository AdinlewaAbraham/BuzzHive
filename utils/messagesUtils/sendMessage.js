import { db } from "../firebaseUtils/firebase";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

export async function sendMessage(user1Id, user2Id, messageText, senderId) {
  const message = {
    text: messageText,
    senderId: senderId,
    timestamp: serverTimestamp(),
    reaction: "love",
  };

  try {
    // Check if a conversation document exists for the two users
    const conversationsRef = collection(db, "conversations");

    // Create a new conversation document and add the message to its messages subcollection
    const conversationId =
      user1Id > user2Id ? user1Id + user2Id : user2Id + user1Id;
    const newConversationRef = doc(conversationsRef, conversationId);
    const newConversationData = {
      participants: [user1Id, user2Id],
      lastMessage : messageText,
      timeStamp: serverTimestamp(),
    };
    await setDoc(newConversationRef, newConversationData);

    const messagesRef = collection(newConversationRef, "messages");
    await addDoc(messagesRef, message);

    // Return the message data after it has been successfully sent
    return message;
  } catch (error) {
    // Handle the error and return null
    console.error("Failed to send message:", error);
    return null;
  }
}
