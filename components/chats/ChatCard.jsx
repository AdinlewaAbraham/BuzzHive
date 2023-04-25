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
import Chats from "./Chats";
import { UserContext } from "../App";
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
}) => {
  const { setChats, ChatObject, setChatObject, setshowChats } = useContext(
    SelectedChannelContext
  );
  const { User } = useContext(UserContext);
  const [invalidURL, setinvalidURL] = useState(true);
  const [currentChatId, setcurrentChatId] = useState();

  const activeChatIdRef = useRef(ChatObject.activeChatId);

  useEffect(() => {
    activeChatIdRef.current = ChatObject.activeChatId;
  }, [ChatObject.activeChatId]);

  useEffect(() => {
    setcurrentChatId(activeChatIdRef.current);
  }, [activeChatIdRef.current]);

  const getStoredChats = () => {
    const storedData = localStorage.getItem(`${User.id}_userChats`);
    return storedData ? JSON.parse(storedData) : null;
  };

  const handleChatClick = async () => {
    if (ChatObject.activeChatId === id) {
      console.log("true");
      return;
    }
    console.log(JSON.parse(localStorage.getItem("user")));
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
    console.log(messages);
    if (messages || JSON.stringify(message == "[]")) {
      return;
    }
    const lastMessage = messages[messages.length - 1];
    console.log(lastMessage);
    const Chats = getStoredChats();
    console.log(Chats);

    const updatedArr = Chats.map((obj) => {
      if (obj.id == id) {
        return { ...obj, unReadmessagesCount: 0 };
      } else {
        return obj;
      }
    });
    localStorage.setItem(
      `${User.id}_userChats`,
      JSON.stringify(
        updatedArr.sort((a, b) => {
          a.timestamp - b.timestamp;
        })
      )
    );

    if (lastMessage) {
      console.log("trre")
      await updateDoc(userRef, {
        [`unReadMessages.${id}`]: lastMessage.timestamp,
      }).then(async () => {
        const userSnapshot = await getDoc(userRef);
        localStorage.setItem("user", JSON.stringify(userSnapshot.data()));
      });
    }
  };
////////////////////////////////////////////////////////////////
  useEffect(() => {
    console.log("ran");
    if (ChatObject.activeChatId === "") return;

    setChats(null);

    if (
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "[]" &&
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "{}" &&
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "undefined" &&
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "null" &&
      localStorage.getItem(`${ChatObject.activeChatId}`)
    ) {
      const ChatString = localStorage.getItem(`${ChatObject.activeChatId}`);
      const Chat = JSON.parse(ChatString);
      console.log(Chat);
      setChats(Chat);
    } else {
      const getMessage = async () => {
        const CollectionName =
          ChatObject.activeChatType === "group" ? "groups" : "conversations";
        console.log(CollectionName);
        const query = collection(
          db,
          CollectionName,
          ChatObject.activeChatId,
          "messages"
        );

        const snapshot = await getDocs(query);
        const messages = await snapshot.docs.map((doc) => doc.data());

        console.log(messages);
        const sortedMessages = messages.sort((a, b) => {
          a.timestamp - b.timestamp;
        });
        setChats(sortedMessages);
        localStorage.setItem(
          `${ChatObject.activeChatId}`,
          JSON.stringify(sortedMessages)
        );
      };
      getMessage();
    }
  }, [ChatObject.activeChatId]);

  const lastMessagesObject = useMemo(() => {
    return JSON.parse(localStorage.getItem(id));
  }, [id]);

  useEffect(() => {
    if (!lastMessagesObject) {
      return;
    }
    const lastMessageTimestamp = lastMessagesObject[
      lastMessagesObject.length - 1
    ]
      ? lastMessagesObject[lastMessagesObject.length - 1].timestamp
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
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        const localTS =
          data.timestamp.seconds + data.timestamp.nanoseconds / 1000000000;
        const severTS =
          lastMessageTimestamp.seconds +
          lastMessageTimestamp.nanoseconds / 1000000000;
        const isNewMessage = localTS > severTS;

        console.log(localTS);
        console.log(severTS);
        console.log(data.id);
        if (isNewMessage && data.id !== null) {
          console.log(data);
          if (!chats.some((chat) => chat.id === data.id)) {
            console.log(data);
            chats.push(data);
          }
        }
      });
      if (chats.length > 0) {
        const updatedMessages = [...lastMessagesObject, ...chats].sort(
          (a, b) => a.timestamp - b.timestamp
        );
        localStorage.setItem(id, JSON.stringify(updatedMessages));
        console.log(true);
        console.log(id);
        console.log(currentChatId);
        console.log(updatedMessages);
        if (id == currentChatId) {
          setChats(updatedMessages);
          console.log(true);
        }
      }
    });
    return () => {
      unsub();
    };
  }, [currentChatId]);

  return (
    <div
      className={`${
        ChatObject.activeChatId == id
          ? "bg-gray-600 hover:bg-gray-600"
          : "hover:bg-gray-700 "
      } flex flex-row justify-between align-middle items-center px-4 py-3 cursor-pointer
        rounded-xl w-[100%] hover: relative`}
      onClick={() => {
        handleChatClick();
      }}
    >
      <div className="flex flex-row  align-middle items-center w-full">
        <div className="w-[50px] h-[50px] mr-3 flex items-center justify-center bg-gray-500 rounded-full">
          {img && invalidURL ? (
            <img
              src={img}
              alt="profile pic"
              className="rounded-full object-cover h-full w-full"
              onError={() => setinvalidURL(false)}
            />
          ) : type === "group" ? (
            <MdGroup size={35} />
          ) : (
            <FaUserAlt size={22} />
          )}
        </div>
        <div className=" truncate w-[90%]">
          <h3>{name}</h3>
          <div className="flex flex-row">
            <p>{sender}</p>: <p> {message}</p>
          </div>
        </div>
      </div>
      <p className="">{timestamp}</p>
      <p className="flex justify-center items-center h-6 w-6 rounded-full bg-blue-500">
        {unReadCount}
      </p>
    </div>
  );
};

export default ChatCard;
