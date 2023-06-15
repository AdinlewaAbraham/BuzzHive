import { useState, useMemo, useEffect, useContext } from "react";
import { db } from "@/utils/firebaseUtils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { getUser } from "@/utils/userUtils/getUser";

import SelectedChannelContext from "@/context/SelectedChannelContext ";

export const useGetChats = (currentUserId) => {
  const [returnChats, setreturnChats] = useState([]);
  const [returnGroupChats, setreturnGroupChats] = useState([]);
  const [isPersonalChatLoading, setisPersonalChatLoading] = useState(true);
  const [isGroupChatsLoading, setisGroupChatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const { ChatObject, activeId } = useContext(SelectedChannelContext);

  useEffect(() => {
    ("ran");
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
    if (JSON.parse(localStorage.getItem("user")) == undefined) {
      return;
    }
    JSON.parse(localStorage.getItem("user"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      activeId;
      const activeChatId = JSON.parse(sessionStorage.getItem("activeChatId")); // this is a retarded hack but it works
      const lastMessagesObject = JSON.parse(
        localStorage.getItem("user")
      ).unReadMessages;
      const chats = [];
      for (const doc of querySnapshot.docs) {
        const conversation = doc.data();
        const otherParticipants = await conversation.participants.filter(
          (id) => id !== currentUserId
        );

        const otherParticipant =
          otherParticipants.length !== 0
            ? otherParticipants[0]
            : conversation.participants[0];
        const user = await getUser(otherParticipant);
        const lastMessage = conversation.lastMessage;
        const timestamp = conversation.timestamp;
        let unReadmessagesCount;

        const lastMessageTimestamp = lastMessagesObject[doc.id];
        if (lastMessageTimestamp /* && doc.id == ChatObject.activeChatId*/) {
          lastMessageTimestamp;
          const qT = new Timestamp(
            lastMessageTimestamp.seconds,
            lastMessageTimestamp.nanoseconds
          );
          qT;
          const unReadMessagesQuery = query(
            collection(db, "conversations", doc.id, "messages"),
            where("timestamp", ">", qT),
            orderBy("timestamp", "desc")
          );
          const unReadMessagequerySnapshot = await getDocs(unReadMessagesQuery);
          const unreadCount = unReadMessagequerySnapshot.docs.filter(
            (message) => message.data().senderId !== currentUserId
          ).length;
          const unreadCount2 = unReadMessagequerySnapshot.docs.filter(
            (message) => message.data().senderId !== currentUserId
          );
          const shir = unreadCount2.map((i)=>i.data())
          unReadmessagesCount = activeChatId == doc.id ? 0 : unreadCount;
        } else {
          unReadmessagesCount = 0;
        }
        console.log(lastMessage);
        const chat = {
          id: doc.id,
          senderId: conversation.senderId,
          otherParticipant: otherParticipant,
          senderDisplayName: user.name,
          lastMessageSenderName: conversation.senderDisplayName,
          senderDisplayImg: user.photoUrl,
          lastMessage: lastMessage.text,
          lastMessageType: lastMessage.type,
          lastMessageStatus: lastMessage.status,
          timestamp: timestamp,
          type: "personal",
          unReadmessagesCount: unReadmessagesCount,
        };
        chats.push(chat);
      }
      setreturnChats([...chats]);
      ///////////////////////////////////////////
      setisPersonalChatLoading(false);
    });

    const unsub = onSnapshot(groupQuery, async (querySnapshot) => {
      const activeChatId = JSON.parse(sessionStorage.getItem("activeChatId"));
      const lastMessagesObject = JSON.parse(
        localStorage.getItem("user")
      ).unReadMessages;
      const groupChats = [];
      for (const doc of querySnapshot.docs) {
        const group = doc.data();
        const lastMessageTimestamp = lastMessagesObject[doc.id];
        let unReadmessagesCount;
        if (lastMessageTimestamp) {
          const qT = new Timestamp(
            lastMessageTimestamp.seconds,
            lastMessageTimestamp.nanoseconds
          );
          const unReadMessagesQuery = query(
            collection(db, "groups", doc.id, "messages"),
            where("timestamp", ">", qT),
            orderBy("timestamp", "desc")
          );
          const unReadMessagequerySnapshot = await getDocs(unReadMessagesQuery);
          const unreadCount = unReadMessagequerySnapshot.docs.filter(
            (message) => message.data().senderId !== currentUserId
          ).length;
          unReadmessagesCount = activeChatId == doc.id ? 0 : unreadCount;
        } else {
          unReadmessagesCount = 0;
        }
        const groupChat = {
          id: doc.id,
          senderId: group.lastMessage.senderId,
          otherParticipant: doc.id,
          senderDisplayName: group.name,
          lastMessageSenderName: group.lastMessage.senderDisplayName,
          senderDisplayImg: group.photoUrl,
          lastMessage: group.lastMessage.lastMessage,
          lastMessageType: group.lastMessage.type,
          lastMessageStatus: group.lastMessage.status,
          timestamp: group.lastMessage.timestamp,
          type: "group",
          unReadmessagesCount: unReadmessagesCount,
        };
        groupChats.push(groupChat);
      }

      ////////////////////////////////

      setreturnGroupChats([...groupChats]);

      //////////////////////////////
      setisGroupChatsLoading(false);
    });

    return () => {
      unsubscribe();
      unsub();
    };
  }, []);

  const mergedChats = useMemo(() => {
    if (isPersonalChatLoading && isGroupChatsLoading) {
      return [];
    } else {
      return [...returnChats, ...returnGroupChats].sort(
        (a, b) => a.timestamp.seconds - b.timestamp.seconds
      );
    }
  }, [
    returnChats,
    returnGroupChats,
    isPersonalChatLoading,
    isGroupChatsLoading,
  ]);

  useEffect(() => {
    setLoading(isPersonalChatLoading || isGroupChatsLoading);
  }, [isPersonalChatLoading, isGroupChatsLoading]);
  let whatToReturn;
  mergedChats == 0 && !loading
    ? (whatToReturn = null)
    : (whatToReturn = mergedChats);

  return { loading, whatToReturn };
};
