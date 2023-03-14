import { useState, useMemo, useEffect } from "react";
import { db } from "@/utils/firebaseUtils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { getUser } from "@/utils/userUtils/getUser";

export const useGetChats = (currentUserId) => {
  const [chats, setChats] = useState([]);
  const [groupChats, setgroupChats] = useState([]);

  useEffect(() => {
    const conversationRef = collection(db, "conversations");
    const groupRef = collection(db, "groups");
    const groupQuery = query(
      groupRef,
      where("members", "array-contains", currentUserId)
    );

    const q = query(
      conversationRef,
      where("participants", "array-contains", currentUserId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const promises = querySnapshot.docs.map(async (doc) => {
        const conversation = doc.data();
        const otherParticipants = await conversation.participants.filter(
          (id) => id !== currentUserId
        );

        //alows users to send message to there self
        const otherParticipant = otherParticipants.length !== 0
          ? otherParticipants[0]
          : conversation.participants[0];
        const user = await getUser(otherParticipant);
        const lastMessage = conversation.lastMessage;
        const timestamp = conversation.timestamp;
        const chat = {
          id: doc.id,
          senderId: conversation.senderId,
          otherParticipant: otherParticipant,
          senderDisplayName: user.name,
          lastMessageSenderName: conversation.senderDisplayName,
          senderDisplayImg: user.photoUrl,
          lastMessage: lastMessage,
          timestamp: timestamp,
          type: "personal",
        };
        return chat;
      });

      Promise.all(promises).then((chats) => {
        setChats(chats);
      });
    });

    const unsub = onSnapshot(groupQuery, (querySnapshot) => {
      const promises = querySnapshot.docs.map(async (doc) => {
        const group = doc.data();
        const sender = await getUser(group.lastMessage.senderId);
        const groupChat = {
          id: doc.id,
          senderId: group.lastMessage.senderId,
          otherParticipant: doc.id,
          senderDisplayName: group.name,
          lastMessageSenderName: group.lastMessage.senderDisplayName,
          senderDisplayImg: group.photoUrl,
          lastMessage: group.lastMessage.lastMessage,
          timestamp: group.lastMessage.timestamp,
          type: "group",
        };
        return groupChat;
      });

      Promise.all(promises).then((groupChats) => {
        setgroupChats(groupChats);
      });
    });

    return () => {
      unsubscribe();
      unsub();
    };
  }, []);

  const mergedChats = useMemo(
    () => [...chats, ...groupChats],
    [chats, groupChats]
  );

  mergedChats.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

  return mergedChats;
};
