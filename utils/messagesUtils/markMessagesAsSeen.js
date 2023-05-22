import {
  Timestamp,
  collection,
  orderBy,
  query,
  where,
  writeBatch,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export const markMessagesAsSeen = async (activeChatId, type) => {
  const User = JSON.parse(localStorage.getItem("user"));
  const { unReadMessages } = User;
  const lastMessageTimestamp = unReadMessages[activeChatId];
  const qt = new Timestamp(
    lastMessageTimestamp.seconds,
    lastMessageTimestamp.nanoseconds
  );

  const queryRef = collection(
    db,
    type === "group" ? "groups" : "conversations",
    activeChatId,
    "messages"
  );

  const timestampQuery = query(
    queryRef,
    where("timestamp", ">", qt),
    orderBy("timestamp", "desc"),
    limit(20)
  );

  const senderIdQuery = query(
    queryRef,
    where("senderId", "!=", User.id),
    orderBy("senderId"),
    orderBy("timestamp", "desc"),
    limit(20)
  );

  const timestampQuerySnapshot = await getDocs(timestampQuery);
  const senderIdQuerySnapshot = await getDocs(senderIdQuery);

  const batch = writeBatch(db);

  timestampQuerySnapshot.forEach((doc) => {
    batch.update(doc.ref, { status: "seen" });
  });

  senderIdQuerySnapshot.forEach((doc) => {
    batch.update(doc.ref, { status: "seen" });
  });

  await batch.commit();
};
