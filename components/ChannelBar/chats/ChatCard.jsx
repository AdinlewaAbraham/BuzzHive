import { useContext, useEffect, useState, useRef, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { UserContext } from "../../App";
import { changeMessagesStatus } from "@/utils/messagesUtils/changeMessagesStatus";
const ChatCard = ({
  img,
  name,
  sender,
  message,
  timestamp,
  id,
  type,
  otherUserId,
  unReadCount,
  set_Chats,
}) => {
  const {
    setChats,
    ChatObject,
    setChatObject,
    setshowChats,
    setactiveId,
    activeId,
  } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);
  const [invalidURL, setinvalidURL] = useState(true);
  const [currentChatId, setcurrentChatId] = useState();

  const activeChatIdRef = useRef(ChatObject.activeChatId);
  const LocalMessages = useMemo(() => {
    return JSON.parse(localStorage.getItem(id));
  }, [id]);
  useEffect(() => {
    sessionStorage.setItem(
      "activeChatId",
      JSON.stringify(ChatObject.activeChatId)
    );
    activeChatIdRef.current = ChatObject.activeChatId;
  }, [ChatObject.activeChatId]);

  useEffect(() => {
    setcurrentChatId(activeChatIdRef.current);
  }, [activeChatIdRef.current]);
  // onsnapshot
  const getStoredChats = () => {
    const storedData = localStorage.getItem(`${User.id}_userChats`);
    return storedData ? JSON.parse(storedData) : null;
  };

  const handleChatClick = async () => {
    if (ChatObject.activeChatId === id) {
      return;
    }

    if (unReadCount == 0) {
      const data = JSON.parse(localStorage.getItem(id));
      if (data) {
        (data);
        const filteredData = data.filter((message) => {
          if (!message) return;
          return message.type !== "unread";
        });
        localStorage.setItem(id, JSON.stringify(filteredData));
      }
    } else {
      const data = JSON.parse(localStorage.getItem(id));
      const unreadObj = {
        type: "unread",
        id: "propid",
      };
      if (data) {
        const filteredData = data.filter((message) => {
          if (!message) return;
          return message.type !== "unread";
        });
        const index = filteredData.length - unReadCount;
        const modifiedArr = [
          ...filteredData.slice(0, index),
          unreadObj,
          ...filteredData.slice(index),
        ];
        localStorage.setItem(id, JSON.stringify(modifiedArr));
      }
    }
    (unReadCount);
    (JSON.parse(localStorage.getItem("user")));
    setactiveId(id);
    setChatObject({
      activeChatId: id,
      activeChatType: type,
      otherUserId: otherUserId,
      photoUrl: img,
      displayName: name,
    });
    setshowChats(true);
    const userRef = doc(db, "users", User.id);

    const messages = JSON.parse(localStorage.getItem(id));
    (messages);
    if (!messages || JSON.stringify(message) == "[]") {
      return;
    }
    const lastMessage = messages[messages.length - 1];
    (lastMessage);
    const Chats = getStoredChats();
    (Chats);
    (Chats);
    const updatedArr = Chats.map((obj) => {
      if (obj.id == id) {
        return { ...obj, unReadmessagesCount: 0 };
      } else {
        return obj;
      }
    });
    (updatedArr);
    set_Chats(
      updatedArr.sort((a, b) => {
        a.timestamp - b.timestamp;
      })
    );
    localStorage.setItem(
      `${User.id}_userChats`,
      JSON.stringify(
        updatedArr.sort((a, b) => {
          a.timestamp - b.timestamp;
        })
      )
    );

    if (lastMessage) {
      ("trre");
      (User.id);
      (userRef);
      (lastMessage);
      await updateDoc(userRef, {
        [`unReadMessages.${id}`]: lastMessage.timestamp,
      });
      const prev = JSON.parse(localStorage.getItem("user"));
      const newObj = {
        ...prev,
        unReadMessages: {
          ...prev.unReadMessages,
          [id]: lastMessage.timestamp,
        },
      };
      (newObj);
      localStorage.setItem("user", JSON.stringify(newObj));
      (JSON.parse(localStorage.getItem("user")));
    }
  };
  ////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (!LocalMessages) {
      return;
    }
    const lastMessageTimestamp = LocalMessages[LocalMessages.length - 1]
      ? LocalMessages[LocalMessages.length - 1].timestamp
      : { seconds: 0, nanoseconds: 0 };
    if (!lastMessageTimestamp) {
      return;
    }
    if (!lastMessageTimestamp) {
      return;
    }

    const qt = new Timestamp(
      lastMessageTimestamp.seconds,
      lastMessageTimestamp.nanoseconds
    );
    const CollectionName = type === "group" ? "groups" : "conversations";
    const q = query(
      collection(db, CollectionName, id, "messages"),
      where("timestamp", ">", qt)
    );
    const chats = [];
    const lastUnReadMessagesObject = JSON.parse(
      localStorage.getItem("user")
    ).unReadMessages;
    const LocallyStoredMessages = JSON.parse(localStorage.getItem(id));
    const unsub = onSnapshot(q, (snapshot) => {
      ("ran");
      if (!lastUnReadMessagesObject[id]) return;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const severTS =
          data.timestamp.seconds + data.timestamp.nanoseconds / 1000000000;
        const localTS =
          lastMessageTimestamp.seconds +
          lastMessageTimestamp.nanoseconds / 1000000000;
        const isNewMessage = severTS > localTS;
        (isNewMessage);
        (data);
        if (isNewMessage && data.id !== null) {
          (data);
          if (
            !chats.some((chat) => chat.id === data.id) &&
            !LocallyStoredMessages.some((chat) => {
              if (!chat) return;
              return chat.id === data.id;
            })
          ) {
            chats.push(data);
            (data);
          }
        }
      });
      (LocallyStoredMessages);
      if (chats.length == 0) return;
      const sortedChats = [...chats].sort((a, b) => a.timestamp - b.timestamp);

      (sortedChats);

      const localstorageMessages = JSON.parse(localStorage.getItem(id));
      const newSortedChats = sortedChats.map((chat) => {
        //this pervent the snapshot from changing the status of the message to its previous status
        const matchingMessage = localstorageMessages.find(
          (localStorageChat) => {
            if (!localStorageChat) return;
            return localStorageChat.id === chat.id;
          }
        );
        if (matchingMessage) {
          return {
            ...chat,
            status: matchingMessage.status,
          };
        }
        return chat;
      });
      (newSortedChats);
      (sortedChats);
      const updatedMessages = [...LocallyStoredMessages, ...sortedChats];
      (updatedMessages);
      if (id === currentChatId) {
        const readReceiptsSetting = JSON.parse(
          localStorage.getItem("user")
        ).isReadReceiptsOn;
        changeMessagesStatus(id, type, "seen")
          .then(() => {
            setChats((prevChats) => [...updatedMessages]);
          })
          .catch((error) => {
            ("Error updating message status:", error);
          });
      } else {
        changeMessagesStatus(id, type, "received")
          .then(() => {
            setChats((prevChats) => [...updatedMessages]);
          })
          .catch((error) => {
            ("Error updating message status:", error);
          });
      }
      localStorage.setItem(id, JSON.stringify(updatedMessages));
    });
    return () => {
      unsub();
    };
  }, [currentChatId, unReadCount]);
  const getStoredMessages = () => {
    const str = localStorage.getItem(`${ChatObject.activeChatId}`);
    return JSON.parse(str);
  };
  useEffect(() => {
    if (ChatObject.activeChatId === "") return;

    setChats(null);
    changeMessagesStatus(id, type, "seen");

    if (
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "[]" &&
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "{}" &&
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "undefined" &&
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "null" &&
      localStorage.getItem(`${ChatObject.activeChatId}`)
    ) {
      const Chat = getStoredMessages();
      (Chat);
      ("this is for " + name + " " + unReadCount);
      setChats(Chat);
    } else {
      const getMessage = async () => {
        const CollectionName =
          ChatObject.activeChatType === "group" ? "groups" : "conversations";
        (CollectionName);
        const query = collection(
          db,
          CollectionName,
          ChatObject.activeChatId,
          "messages"
        );

        const snapshot = await getDocs(query);
        const messages = await snapshot.docs.map((doc) => doc.data());
        (messages);
        const sortedMessages = messages.sort((a, b) => {
          a.timestamp - b.timestamp;
        });
        (sortedMessages);
        const filteredMessages = sortedMessages.filter((message) => message);
        setChats(filteredMessages);
        localStorage.setItem(
          `${ChatObject.activeChatId}`,
          JSON.stringify(filteredMessages)
        );
      };
      getMessage();
    }
  }, [ChatObject.activeChatId]);

  return (
    <div
      className={`${
        ChatObject.activeChatId == id
          ? "bg-[#f0f2f5] hover:bg-[#f0f2f5] dark:bg-gray-600 dark:hover:bg-gray-600"
          : "hover:bg-[#f5f6f6] dark:hover:bg-gray-700"
      } relative flex w-[100%] cursor-pointer flex-row items-center justify-between rounded-xl
        px-4 py-3 align-middle`}
      onClick={() => {
        handleChatClick();
      }}
    >
      <div className="flex w-full  flex-row items-center ">
        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#dfe5e7] text-[#ffffff] dark:bg-gray-500 ">
          {img && invalidURL ? (
            <img
              src={img}
              alt="profile pic"
              className="h-full w-full rounded-full object-cover"
              onError={() => setinvalidURL(false)}
            />
          ) : type === "group" ? (
            <MdGroup size={35} />
          ) : (
            <FaUserAlt size={22} />
          )}
        </div>
        <div className=" ml-3 w-[90%]  truncate">
          <h3>{name}</h3>
          <div className="flex flex-row text-sm text-[#6c757d] dark:text-[#aaaaaa]">
            <p>{sender}</p>
            {sender && <>:</>} <p> {message}</p>
          </div>
        </div>
      </div>
      <p className="">{timestamp}</p>
      {unReadCount !== 0 && (
        <p className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
          {unReadCount}
        </p>
      )}
    </div>
  );
};

export default ChatCard;
