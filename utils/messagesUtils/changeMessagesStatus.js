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

export async function changeMessagesStatus(activeChatId, type, status) {
  console.log(activeChatId);
  const User = JSON.parse(localStorage.getItem("user"));
  const { unReadMessages } = User;
  const lastMessageTimestamp = unReadMessages[activeChatId];

  console.log(lastMessageTimestamp);
  console.log(activeChatId);
  const queryRef = collection(
    db,
    type === "group" ? "groups" : "conversations",
    activeChatId,
    "messages"
  );

  const senderIdQuery = query(
    queryRef,
    where("senderId", "!=", User.id),
    orderBy("senderId"),
    orderBy("timestamp", "desc")
    //  limit(20)
  );
  const senderIdQuerySnapshot = await getDocs(senderIdQuery);

  if (!senderIdQuerySnapshot.empty) {
    let newestMessageTimestamp = null;

    senderIdQuerySnapshot.docs.forEach((doc) => {
      const timestamp = doc.data().timestamp;
      if (!newestMessageTimestamp || timestamp > newestMessageTimestamp) {
        newestMessageTimestamp = timestamp;
      }
    });

    console.log("Newest message timestamp:", newestMessageTimestamp);
  } else {
    console.log("No messages found.");
  }

  const batch = writeBatch(db);

  senderIdQuerySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.status === "seen") {
      // Do nothing if status is already "seen"
      return;
    } else if (data.status === "received" && status === "seen") {
      // Change status to "sent" only if current status is "received"
      batch.update(doc.ref, { status: status });
    } else if (
      data.status === "sent" &&
      (status === "received" || status === "seen")
    ) {
      // Change status to "received" or "seen" if current status is "sent"
      batch.update(doc.ref, { status: status });
    }
  });

  await batch.commit();
}
