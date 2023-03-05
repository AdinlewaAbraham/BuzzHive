import { useState, useMemo } from "react";
import { db } from "@/utils/firebaseUtils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { getUser } from "@/utils/userUtils/getUser";

export const useGetChats = () => {
  const currentUserId = "1";
  const [chats, setChats] = useState([]);
  const [groupChats, setgroupChats] = useState([]);

  useMemo(() => {
    console.log("code run")
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
      const chats = [];
      const promises = querySnapshot.docs.map(async (doc) => {
        const conversation = doc.data();
        const otherParticipants = await conversation.participants.filter(
          (id) => id !== currentUserId
        );
        const user = await getUser(otherParticipants);
        const lastMessage = conversation.lastMessage;
        const timeStamp = conversation.timeStamp;
        const chat = {
          id: doc.id,
          senderId: otherParticipants,
          senderDisplayName: user.name,
          senderDisplayImg: user.photoUrl,
          lastMessage: lastMessage,
          timeStamp: timeStamp,
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
        const groupChats = doc.data();
        const sender = await getUser(groupChats.lastMessage.senderId);
        const groupChat = {
          id: doc.id,
          senderId: groupChats.lastMessage.senderId,
          senderDisplayName: groupChats.lastMessage.senderDisplayName,
          senderDisplayImg: groupChats.lastMessage.senderDisplayImg,
          lastMessage: groupChats.lastMessage.lastMessage,
          timeStamp: groupChats.lastMessage.timeStamp,
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
  }, [ ]);

  const mergedChats = useMemo(() => [...chats, ...groupChats], [chats, groupChats]);
  mergedChats.sort((a, b) => b.timestamp - a.timestamp);

  return mergedChats;
};
