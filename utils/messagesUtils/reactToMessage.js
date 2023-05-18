import { db } from "../firebaseUtils/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export default async function reactTomessage(
  emoji,
  messageId,
  conversationId,
  user,
  messageType
) {
  console.log(user);
  const collectionName = messageType === "group" ? "groups" : "conversations";
  const docRef = doc(db, collectionName, conversationId, "messages", messageId);
  const messageDoc = await getDoc(docRef);
  console.log(messageDoc);
  if (messageDoc.exists()) {
    const updatedReactions = arrayUnion({ emoji, name: user.name, displayImg: user.photoUrl });
    await updateDoc(docRef, { reactions: updatedReactions }, { merge: true });
  }
}
