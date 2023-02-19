import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export const getLatestConversations = async (currentUid) => {
  const conversationsRef = collection(db, "conversations");

  const queryRef = query(
    conversationsRef,
    where("user1", "==", currentUid),
    orderBy("messages.timestamp", "desc"),
    limit(10)
  );

  const user1Conversations = await getDocs(queryRef);

  const user1ConversationsData = user1Conversations.docs.map((doc) => ({
    conversationId: doc.id,
    otherUid: doc.data().user2,
    latestMessage: doc.data().messages[0],
  }));

  const queryRef2 = query(
    conversationsRef,
    where("user2", "==", currentUid),
    orderBy("messages.timestamp", "desc"),
    limit(1)
  );

  const user2Conversations = await getDocs(queryRef2);

  const user2ConversationsData = user2Conversations.docs.map((doc) => ({
    conversationId: doc.id,
    otherUid: doc.data().user1,
    latestMessage: doc.data().messages[0],
  }));

  const conversations = [...user1ConversationsData, ...user2ConversationsData];
  console.log(currentUid);
  console.log(conversations);
  return conversations;
};
