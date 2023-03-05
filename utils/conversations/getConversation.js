import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export const getConversation = async (conversationId) => {
  const ConversationColRef = collection(db, "conversations", conversationId, "messages");
  const chatSnapshot = await getDocs(ConversationColRef);
  const chatsData = [];

  chatSnapshot.forEach((doc) => {
    chatsData.push(doc.data());
  });
console.log(chatsData)
  return chatsData;
};
