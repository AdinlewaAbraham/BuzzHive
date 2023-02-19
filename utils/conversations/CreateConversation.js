import { db } from "../firebaseUtils/firebase";
import { collection, addDoc, doc } from "firebase/firestore";

const conversationDocRef = doc(collection(db, "conversations"));
///const messageDocRef = collection(conversationDocRef, "messages");
const messagesCollectionRef = collection(conversationDocRef, "messages");

// Set the message document
export const createMessage = async () => {
  try {
    const docRef = await addDoc(messagesCollectionRef, {
      text: "Hello, world!",
      senderId: "sender_id_here",
      // timestamp: serverTimestamp(),
    });
    console.log("wow it works")
  } catch (error) {
    console.error("Error adding mess to Firebase: ", error);
  }
};
