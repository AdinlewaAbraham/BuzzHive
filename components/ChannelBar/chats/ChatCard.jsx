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
  orderBy,
} from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { UserContext } from "../../App";
import { changeMessagesStatus } from "@/utils/messagesUtils/changeMessagesStatus";
import { TiChartBarOutline } from "react-icons/ti";
import { HiOutlinePhotograph } from "react-icons/hi";
import { BsFileEarmark, BsCheckAll, BsCheckLg } from "react-icons/bs";
import { AiOutlineStop } from "react-icons/ai";
import { BiTimeFive } from "react-icons/bi";
import { formatCount } from "@/utils/actualUtils/formatCount";

import { formatTime } from "@/utils/actualUtils/formatTime";
import Badge from "@/components/Badge";
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
  isMessageSentByMe,
  chat,
}) => {
  const {
    Chats,
    setChats,
    ChatObject,
    setChatObject,
    setshowChats,
    setactiveId,
    setallowScrollObject,
    setChatRooms,
  } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);
  const [invalidURL, setinvalidURL] = useState(true);
  const [currentChatId, setcurrentChatId] = useState();
  const activeChatIdRef = useRef(ChatObject.activeChatId);

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
  function getStoredChats() {
    const storedData = localStorage.getItem(`${User.id}_userChats`);
    return storedData ? JSON.parse(storedData) : null;
  }

  const handleChatClick = async () => {
    if (ChatObject.activeChatId === id) {
      return;
    }
    const userRef = doc(db, "users", User.id);
    sessionStorage.setItem(
      "activeChatRoomUnreadMessageCount",
      JSON.stringify(unReadCount)
    );
    if (unReadCount === 0) {
      const data = JSON.parse(localStorage.getItem(id));
      if (data) {
        const filteredData = data.filter((message) => {
          if (!message) return;
          return message.type !== "unread";
        });
        localStorage.setItem(id, JSON.stringify(filteredData));
      }
    } else {
      const data = JSON.parse(localStorage.getItem(id)).sort((a, b) => {
        a.timestamp?.seconds - b.timestamp?.seconds;
      });
      const unreadObj = {
        type: "unread",
        id: "unreadId",
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
    setactiveId(id);
    sessionStorage.setItem("activeChatId", new String(id));
    if (unReadCount === 0) {
      setallowScrollObject({
        scrollTo: "bottom",
        scrollBehaviour: "instant",
        allowScroll: true,
      });
    } else {
      setallowScrollObject({
        scrollTo: "unreadId",
        scrollBehaviour: "instant",
        allowScroll: true,
      });
    }
    setChatObject({
      activeChatId: id,
      activeChatType: type,
      otherUserId: otherUserId,
      photoUrl: img,
      displayName: name,
    });
    setshowChats(true);

    const messages = JSON.parse(localStorage.getItem(id))?.sort(
      (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
    );
    if (!messages || JSON.stringify(message) == "[]") {
      return;
    }
    const lastMessage = messages[messages.length - 1];
    const Chats = getStoredChats();
    if (!Chats) return;
    const updatedArr = Chats.map((obj) => {
      if (obj.id == id) {
        return { ...obj, unReadmessagesCount: 0 };
      } else {
        return obj;
      }
    });
    setChatRooms(
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
      newObj;
      localStorage.setItem("user", JSON.stringify(newObj));
      JSON.parse(localStorage.getItem("user"));
    }
  };
  useEffect(() => {
    const CollectionName = type === "group" ? "groups" : "conversations";
    const q = query(collection(db, CollectionName, id, "messages"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const localstorageMessages = JSON.parse(localStorage.getItem(id));
      snapshot.docChanges().forEach((change) => {
        const messageData = change.doc.data();
        if (change.type === "added") {
          if (localstorageMessages === null) return;
          if (!isMessageInLocalStorage(localstorageMessages, messageData)) {
            localstorageMessages.push(messageData);
            const saveChats = localstorageMessages.sort(
              (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
            );
            localStorage.setItem(id, JSON.stringify(saveChats));
            if (id === ChatObject.activeChatId) {
              const userRef = doc(db, "users", User.id);
              const activeChats = JSON.parse(
                localStorage.getItem(ChatObject.activeChatId)
              )?.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
              if (activeChats || JSON.stringify(activeChats) !== "[]") {
                const lastMessage = activeChats[activeChats.length - 1];
                const Chats = getStoredChats();
                const updatedArr = Chats.map((obj) => {
                  if (obj.id == id) {
                    return { ...obj, unReadmessagesCount: 0 };
                  } else {
                    return obj;
                  }
                });
                setChatRooms(
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
                  updateDoc(userRef, {
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
                  localStorage.setItem("user", JSON.stringify(newObj));
                }
              }
              if (JSON.parse(sessionStorage.getItem("50pxAwayFromBottom"))) {
                setallowScrollObject({
                  scrollTo: "bottom",
                  scrollBehaviour: "smooth",
                  allowScroll: true,
                });
              }
              setChats((prevMessages) => {
                if (!prevMessages) return;
                const firstMessageId = prevMessages[0]["id"];

                const firstMessageIndex = saveChats.findIndex(
                  (message) => message.id === firstMessageId
                );

                if (firstMessageIndex === -1) {
                  return [...saveChats].splice(-30);
                }
                return [...saveChats].splice(firstMessageIndex);
              });
              if (User.isReadReceiptsOn) {
                changeMessagesStatus(id, type, "seen");
              } else {
                changeMessagesStatus(id, type, "received");
              }
            } else if (id !== ChatObject.activeChatId) {
              changeMessagesStatus(id, type, "received")
                .then(() => {})
                .catch((error) => {
                  "Error updating message status:", error;
                });
            }
          }
        }
        if (change.type === "modified") {
          const modifiedMessage = change.doc.data();
          const localstorageMessages = JSON.parse(localStorage.getItem(id));

          if (localstorageMessages !== null) {
            const index = localstorageMessages.findIndex(
              (message) => message.id === modifiedMessage.id
            );

            if (index !== -1) {
              localstorageMessages[index] = modifiedMessage;
              localStorage.setItem(id, JSON.stringify(localstorageMessages));
              if (id === ChatObject.activeChatId) {
                setChats((prevMessages) => {
                  const firstMessage = prevMessages[0];
                  const lastMessage = prevMessages[prevMessages.length - 1];

                  const indexofFirstMessage = localstorageMessages.findIndex(
                    (message) => message.id === firstMessage.id
                  );
                  const indexofLastMessage = localstorageMessages.findIndex(
                    (message) => message.id === lastMessage.id
                  );
                  if (indexofFirstMessage === -1 || indexofLastMessage === -1) {
                    return [...localstorageMessages].splice(-30);
                  }

                  const returnThis = [...localstorageMessages].splice(
                    indexofFirstMessage,
                    indexofLastMessage + 1
                  );
                  return returnThis;
                });
              }
            }
          }
        }
        if (change.type === "removed") {
          const removedMessage = change.doc.data();
          const localstorageMessages = JSON.parse(localStorage.getItem(id));

          if (localstorageMessages !== null) {
            const index = localstorageMessages.findIndex(
              (message) => message.id === removedMessage.id
            );

            if (index !== -1) {
              localstorageMessages.splice(index, 1);
              localStorage.setItem(id, JSON.stringify(localstorageMessages));
              if (id === ChatObject.activeChatId) {
                setChats((prevMessages) => {
                  const firstMessage = prevMessages[0];
                  const lastMessage = prevMessages[prevMessages.length - 1];

                  const indexofFirstMessage = localstorageMessages.findIndex(
                    (message) => message.id === firstMessage.id
                  );
                  const indexofLastMessage = localstorageMessages.findIndex(
                    (message) => message.id === lastMessage.id
                  );

                  if (indexofFirstMessage === -1 || indexofLastMessage === -1) {
                    return [...localstorageMessages].splice(-30);
                  }
                  const returnThis = [...localstorageMessages].splice(
                    indexofFirstMessage,
                    indexofLastMessage + 1
                  );
                  return returnThis;
                });
              }
            }
          }
        }
      });
    });

    function isMessageInLocalStorage(messages, newMessage) {
      return messages.some((message) => message.id === newMessage.id);
    }
    return () => unsubscribe();
  }, [ChatObject.activeChatId]);
  const getStoredMessages = () => {
    const str = localStorage.getItem(`${ChatObject.activeChatId}`);
    const messages = JSON.parse(str).sort(
      (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
    );

    if (unReadCount !== 0 && User.unReadMessages[ChatObject.activeChatId]) {
      const timestamp = User.unReadMessages[ChatObject.activeChatId];
      const index = messages.findIndex((message) => {
        return (
          JSON.stringify({
            seconds: message.timestamp?.seconds,
            nanoseconds: message.timestamp?.nanoseconds,
          }) ==
          JSON.stringify({
            seconds: timestamp?.seconds,
            nanoseconds: timestamp?.nanoseconds,
          })
        );
      });

      if (index !== -1) {
        const startIndex = Math.max(index - 10, 0);

        if (messages.length - startIndex > 30) {
          return messages.slice(startIndex, startIndex + 30);
        } else {
          return messages.slice(startIndex);
        }
      }
    }

    return messages.slice(-30);
  };

  useEffect(() => {
    if (ChatObject.activeChatId === "") return;

    setChats(null);
    if (User.isReadReceiptsOn) {
      changeMessagesStatus(ChatObject.activeChatId, type, "seen");
    }
    console.log(ChatObject.activeChatId);
    if (
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "[]" &&
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "{}" &&
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "undefined" &&
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "null" &&
      localStorage.getItem(`${ChatObject.activeChatId}`)
    ) {
      const Chat = getStoredMessages();
      setChats(Chat);
    } else {
      const getMessage = async () => {
        const CollectionName =
          ChatObject.activeChatType === "group" ? "groups" : "conversations";
        CollectionName;

        const q = query(
          collection(db, CollectionName, ChatObject.activeChatId, "messages"),
          orderBy("timestamp")
        );

        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map((doc) => doc.data());
        const sortedMessages = messages.sort(
          (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
        );
        const filteredMessages = sortedMessages.filter((message) => message);
        localStorage.setItem(
          `${ChatObject.activeChatId}`,
          JSON.stringify(filteredMessages)
        );
        setChats(JSON.parse(JSON.stringify(filteredMessages.splice(-30))));
      };
      getMessage();
    }
  }, [ChatObject.activeChatId]);
  return (
    <div
      className={`${
        ChatObject.activeChatId == id
          ? "bg-[#f0f2f5] hover:bg-[#f0f2f5] dark:bg-gray-600 dark:hover:bg-gray-600"
          : "hover:bg-hover-light dark:hover:bg-hover-dark"
      } relative mb-1 flex w-[100%] cursor-pointer items-center justify-between rounded-xl
        px-4 py-3 align-middle `}
      onClick={() => {
        handleChatClick();
      }}
    >
      <div className=" bg-coverColor flex h-[50px] w-[50px] items-center justify-center rounded-full text-[#ffffff]">
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
      <div className="flex  w-[calc(100%-62px)] flex-col items-start justify-between truncate">
        <div className="flex w-full  items-center justify-between">
          <h3 className=" flex items-center font-normal ">
            {name}
            <Badge id={otherUserId} />
          </h3>
          <p className="text-muted  text-[11px]">{formatTime(timestamp)}</p>
        </div>

        <div className="flex w-full  items-center justify-between">
          <div className=" flex w-[95%] items-center truncate text-[14px] text-muted-light dark:text-muted-dark">
            {isMessageSentByMe && (
              <i className="mr-1 flex items-center ">
                {message.status === "pending" && <BiTimeFive />}
                {message.status === "sent" && <BsCheckLg />}
                {message.status === "received" && <BsCheckAll />}
                {message.status === "seen" && <BsCheckAll color="blue" />}
              </i>
            )}
            {!isMessageSentByMe && <p className="mr-1">{sender}:</p>}
            <i className="flex items-center ">
              {/* make this better by using switch statement */}
              {(message.type === "pic/video" ||
                message.type === "image" ||
                message.type === "video") && (
                <div className=" flex items-center truncate ">
                  <i className="mr-1">
                    <HiOutlinePhotograph />
                  </i>
                  {message.text === "" && message.type === "deleted"
                    ? "Deleted message"
                    : message.type}
                </div>
              )}
              {message.type === "file" && (
                <div className=" flex items-center truncate">
                  <i className="mr-1">
                    <BsFileEarmark />
                  </i>
                  {message.text === "" && message.type === "deleted"
                    ? "Deleted message"
                    : chat.fileName}
                </div>
              )}
              {message.type === "poll" && (
                <i className="mr-1 flex rotate-90 items-center">
                  <TiChartBarOutline />
                </i>
              )}

              {message.type === "deleted" && (
                <i className="mr-1 flex items-center ">
                  <AiOutlineStop />
                </i>
              )}
            </i>
            <p className="flex items-center truncate ">
              {message.type === "deleted" ? "Deleted message" : message.text}
            </p>
          </div>
          <div className="ml-2 min-w-max">
            {unReadCount !== 0 && (
              <p
                className="relative inline-block h-5 w-5 rounded-full bg-accent-blue 
                p-2 text-center text-[12px] font-bold text-white "
              >
                <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] transform">
                  {formatCount(unReadCount)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
