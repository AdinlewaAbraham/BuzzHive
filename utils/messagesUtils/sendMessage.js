import { db } from "../firebaseUtils/firebase";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
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
    // Check if a conversation document exists for the two users with user1 in user1 field
    const conversationQuery1 = query(
      conversationsRef,
      where("user1", "==", user1Id),
      where("user2", "==", user2Id)
    );
    const conversationQuerySnapshot1 = await getDocs(conversationQuery1);

    // Check if a conversation document exists for the two users with user1 in user2 field
    const conversationQuery2 = query(
      conversationsRef,
      where("user2", "==", user1Id),
      where("user1", "==", user2Id)
    );
    const conversationQuerySnapshot2 = await getDocs(conversationQuery2);

    if (conversationQuerySnapshot1.docs.length > 0) {
      // Add the message to the messages subcollection of the existing conversation document
      const conversationRef = conversationQuerySnapshot1.docs[0].ref;
      const messagesRef = collection(conversationRef, "messages");
      await addDoc(messagesRef, message);
    } else if (conversationQuerySnapshot2.docs.length > 0) {
      // Add the message to the messages subcollection of the existing conversation document
      const conversationRef = conversationQuerySnapshot2.docs[0].ref;
      const messagesRef = collection(conversationRef, "messages");
      await addDoc(messagesRef, message);
    } else {
      // Create a new conversation document and add the message to its messages subcollection
      const conversationId = user1Id + "_" + user2Id;
      const newConversationRef = doc(conversationsRef, conversationId);
      const newConversationData = {
        user1: user1Id,
        user2: user2Id,
      };
      await setDoc(newConversationRef, newConversationData);

      const messagesRef = collection(newConversationRef, "messages");
      await addDoc(messagesRef, message);
    }

    // Return the message data after it has been successfully sent
    return message;
  } catch (error) {
    // Handle the error and return null
    console.error("Failed to send message:", error);
    return null;
  }
}
