import { db } from "../firebaseUtils/firebase";
import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
    const ReactionColRef = collection(messageRef, "reactions")


    const reactionData = {
      emoji: emoji,
      userName: user.name,
      userDisplayImg: user.photoUrl,
      userID: user.id
    };
    await setDoc(doc(ReactionColRef, user.id), reactionData)

  } else {
    //const messageRef =
  }
}
