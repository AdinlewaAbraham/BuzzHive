import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export default async function getMessageReactions(
  messageType,
  chatid,
  messageId
) {
  if (!messageId) {
    return [];
  }
  const reactionsColRef = collection(
    db,
    messageType == "group" ? "groups" : "conversations",
    chatid,
    "messages",
    messageId,
    "reactions"
  );
  const reactionSnapShot = await getDocs(reactionsColRef);
  if (reactionSnapShot.docs.length === 0) {
    return [];
  }
  const reactions = reactionSnapShot.docs.map((doc) => doc.data());

  return reactions;
}
