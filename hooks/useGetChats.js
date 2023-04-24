import { useState, useMemo, useEffect, useContext } from "react";
import { db } from "@/utils/firebaseUtils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { getUser } from "@/utils/userUtils/getUser";

import SelectedChannelContext from "@/context/SelectedChannelContext ";

export const useGetChats = (currentUserId) => {
  const [chats, setChats] = useState([]);
  const [returnChats, setreturnChats] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [returnGroupChats, setreturnGroupChats] = useState([]);
  const [isPersonalChatLoading, setisPersonalChatLoading] = useState(true);
  const [isGroupChatsLoading, setisGroupChatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const { ChatObject } = useContext(SelectedChannelContext);

  const user = localStorage.getItem("user");

  useEffect(() => {
    console.log("ran");
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
    const lastMessagesObject = JSON.parse(
      localStorage.getItem("user")
    ).unReadMessages;

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log("ran");
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
          unReadmessagesCount: 0,
        };
        chats.push(chat);
      }
      setChats(chats);
      //////////////////////////////

      function updateUnreadMessages(chatId, unReadmessagesCount) {
        const chatToUpdate = chats.find((chat) => chat.id === chatId);
        if (chatToUpdate) {
          chatToUpdate.unReadmessagesCount = unReadmessagesCount;
        }
      }

      let filteredChats = chats;
      if (ChatObject.activeChatId !== "") {
        if (chats == []) return;
        filteredChats = chats.filter(
          (chat) => chat.id !== ChatObject.activeChatId
        );
      }
      for (const chatObject of filteredChats) {
        const chatId = chatObject.id;

        const lastMessageTimestamp = lastMessagesObject[chatId];

        if (lastMessageTimestamp) {
          console.log(lastMessageTimestamp);
          const qT = new Timestamp(
            lastMessageTimestamp.seconds,
            lastMessageTimestamp.nanoseconds
          );
          console.log(qT);
          const unReadMessagesQuery = query(
            collection(db, "conversations", chatId, "messages"),
            where("timestamp", ">", qT),
            orderBy("timestamp", "desc")
          );
          const unReadMessagequerySnapshot = await getDocs(unReadMessagesQuery);

          const unReadmessagesCount = unReadMessagequerySnapshot.size;
          console.log("this is for " + chatId + " " + unReadmessagesCount);
          updateUnreadMessages(chatId, unReadmessagesCount);
        }
      }

      setreturnChats([...chats]);
      ///////////////////////////////////////////
      setisPersonalChatLoading(false);
    });

    const unsub = onSnapshot(groupQuery, async (querySnapshot) => {
      const groupChats = [];
      for (const doc of querySnapshot.docs) {
        const group = doc.data();
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
          unReadmessagesCount: 0,
        };
        groupChats.push(groupChat);
      }
      setGroupChats(groupChats);

      ////////////////////////////////
      function updateUnreadMessages(chatId, unReadmessagesCount) {
        const chatToUpdate = groupChats.find((chat) => chat.id === chatId);
        if (chatToUpdate) {
          chatToUpdate.unReadmessagesCount = unReadmessagesCount;
        }
      }

      let filteredChats = groupChats;
      if (ChatObject.activeChatId !== "") {
        if (groupChats == []) return;
        filteredChats = groupChats.filter(
          (groupChat) => groupChat.id !== ChatObject.activeChatId
        );
      }

      for (const chatObject of filteredChats) {
        const chatId = chatObject.id;

        const lastMessageTimestamp = lastMessagesObject[chatId];

        if (lastMessageTimestamp) {
          console.log(lastMessageTimestamp);
          const qT = new Timestamp(
            lastMessageTimestamp.seconds,
            lastMessageTimestamp.nanoseconds
          );
          console.log(qT);
          const unReadMessagesQuery = query(
            collection(db, "groups", chatId, "messages"),
            where("timestamp", ">", qT),
            orderBy("timestamp", "desc")
          );
          const unReadMessagequerySnapshot = await getDocs(unReadMessagesQuery);

          const unReadmessagesCount = unReadMessagequerySnapshot.size;
          console.log("this is for " + chatId + " " + unReadmessagesCount);
          updateUnreadMessages(chatId, unReadmessagesCount);
        }
      }

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
