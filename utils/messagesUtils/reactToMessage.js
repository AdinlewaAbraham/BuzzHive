import { db } from "../firebaseUtils/firebase";
import { arrayUnion, collection, doc, getDoc, updateDoc } from "firebase/firestore";

export default async function reactTomessage(
  emoji,
  messageId,
  conversationId,
  user,
  messageType
) {
  console.log(user);
  if (messageType == "group") {
    const groupColRef = collection(db, "groups");
    const groupRef = doc(groupColRef, conversationId);
    const messageColRef = collection(groupRef, "messages");
    const messageRef = doc(messageColRef, messageId);

    const reactionData = {
      emoji: emoji,
      userName: user.name,
      userDisplayImg: user.photoUrl,
    };
    await updateDoc(messageRef, { reaction: arrayUnion(reactionData) });
  } else {
    //const messageRef =
  }
}
