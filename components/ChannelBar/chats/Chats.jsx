import { useContext, useState, useMemo, useEffect } from "react";
import { useGetChats } from "@/hooks/useGetChats";
import ChatCard from "./ChatCard";
import { MdGroupAdd } from "react-icons/md";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { UserContext } from "../../App";
import { HiUserAdd } from "react-icons/hi";
import { motion } from "framer-motion";
import { CircularProgress } from "@mui/joy";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const Chats = () => {
  const { User } = useContext(UserContext);
  const { loading, whatToReturn } = useGetChats(User.id);
  const [sortedChats, setSortedChats] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [animationParent] = useAutoAnimate({ duration: 300 });

  const chats = whatToReturn;
  const { setSelectedChannel, chatRooms, setChatRooms } = useContext(SelectedChannelContext);

  const getStoredChats = () => {
    const storedData = localStorage.getItem(`${User.id}_userChats`);
    return storedData ? JSON.parse(storedData) : null;
  };

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  JSON.parse(localStorage.getItem(`${User.id}_userChats`));
  useEffect(() => {
    console.log(chatRooms)
    const storedChats = getStoredChats();
    if (storedChats && storedChats.length) {
      setChatRooms(storedChats);
      setLoading(false);
    } else {
      setChatRooms(chats);
      chats == null
        ? 0
        : localStorage.setItem(`${User.id}_userChats`, JSON.stringify(chats));
      setLoading(false);
    }
    if ((chats == null || chats.length == 0) && !loading) {
      setChatRooms(null);
    }
  }, [chats, User.id, whatToReturn]);

  useEffect(() => {
    const fetchData = async () => {
      if (
        JSON.stringify(chats) !== JSON.stringify(getStoredChats()) &&
        !loading &&
        isOnline
      ) {
        localStorage.setItem(`${User.id}_userChats`, JSON.stringify(chats));
        setChatRooms(chats);
      }
    };
    fetchData();

    const q = doc(db, "users", User.id);
    const unsub = onSnapshot(q, async (doc) => {
      localStorage.setItem("user", JSON.stringify(doc.data()));
    });
    return () => {
      unsub();
    };
  }, [User, chats, loading]);

  useMemo(async () => {
    if (!chatRooms) return;
    const sortedChats = chatRooms.slice().sort(
      (a, b) => b.timestamp.seconds - a.timestamp.seconds
    );
    setSortedChats(sortedChats);
  }, [chatRooms]);
  return (
    <div className="">
      <div className="h-[95px]">
        <div className="flex h-[66px] items-center justify-between px-4">
          <h1 className="text-2xl ">Chats</h1>
          <div className="relative flex items-center text-muted-light dark:text-muted-dark">
            <i
              className="mr-6 cursor-pointer"
              onClick={() => {
                setSelectedChannel("addcontact");
              }}
            >
              <HiUserAdd size={27} />
            </i>
            <i
              onClick={() => {
                setSelectedChannel("addGroup");
              }}
              className="cursor-pointer"
            >
              <MdGroupAdd size={25} />
            </i>
          </div>
        </div>
        <div className=" flex items-center justify-center">
          <input
            type="text"
            placeholder="Search"
            className=" w-[90%] rounded-lg bg-light-secondary px-3 py-2 placeholder-muted-light 
            outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}

          />
        </div>
      </div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {sortedChats.length === 0 && !Loading && chatRooms == null ? (
          <div className="mt-6 flex flex-col items-center justify-center">
            <h2>You have no chats at the moment.</h2>
            <button
              onClick={() => {
                setSelectedChannel("addcontact");
              }}
              className="mt-2 rounded-lg bg-accent-blue p-2 "
            >
              Add Chat
            </button>
          </div>
        ) : (
          <>
            {sortedChats.length !== 0 ? (
              <div
              ref={animationParent}
                className="scrollBar  mt-6 flex h-[calc(100vh-190px)] flex-col items-center overflow-y-auto overflow-x-hidden
               pt-[2px] pr-[2px] md:h-[calc(100vh-120px)] "
              >
                {sortedChats
                  .filter(
                    (chat) =>
                      chat.senderDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((chat) => (
                    <ChatCard  
                      key={chat.id}
                      otherUserId={chat.otherParticipant}
                      type={chat.type}
                      id={chat.id}
                      img={chat.senderDisplayImg}
                      name={chat.senderDisplayName}
                      sender={chat.lastMessageSenderName}
                      isMessageSentByMe={chat.senderId === User.id}
                      message={{
                        text: chat.lastMessage,
                        type: chat.lastMessageType,
                        status: chat.lastMessageStatus,
                      }}
                      unReadCount={chat.unReadmessagesCount}
                      chat={chat}
                      timestamp={chat.timestamp}
                    />
                  ))}
              </div>
            ) : (
              <div className="scrollBar mt-6 h-[calc(100vh-190px)] overflow-y-auto overflow-x-hidden md:h-[calc(100vh-120px)]">
                {[1, 2, 3, 4, 5].map((key) => (
                  <div
                    className=" flex
                     cursor-pointer items-center px-4   py-4 "
                    key={key}
                    style={{ width: "100%" }}
                  >
                    <i className="skeleton absolute h-[50px] w-[50px] rounded-full"></i>
                    <div className="ml-[60px] w-full">
                      <div className="skeleton mb-[10px] h-[10px] w-[30%] rounded-md"></div>
                      <div className="skeleton h-[15px] w-[80%] rounded-md"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Chats;
