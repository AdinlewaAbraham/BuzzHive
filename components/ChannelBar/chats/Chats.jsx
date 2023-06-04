import { useContext, useState, useMemo, useEffect } from "react";
import { useGetChats } from "@/hooks/useGetChats";
import ChatCard from "./ChatCard";
import { MdGroupAdd } from "react-icons/md";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { UserContext } from "../../App";
import { HiUserAdd } from "react-icons/hi";

const Chats = () => {
  const { User } = useContext(UserContext);
  const { loading, whatToReturn } = useGetChats(User.id);
  const [Chats, set_Chats] = useState(null);
  const [sortedChats, setSortedChats] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const chats = whatToReturn;
  const { setSelectedChannel } = useContext(SelectedChannelContext);

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
    const storedChats = getStoredChats();
    storedChats;
    if (storedChats && storedChats.length) {
      storedChats;
      set_Chats(storedChats);
      setLoading(false);
    } else {
      ("ranning");
      chats;
      set_Chats(chats);
      chats == null
        ? 0
        : localStorage.setItem(`${User.id}_userChats`, JSON.stringify(chats));
      setLoading(false);
    }
    if ((chats == null || chats.length == 0) && !loading) {
      set_Chats(null);
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
        set_Chats(chats);
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
    if (!Chats) return;
    const sortedChats = Chats.slice().sort(
      (a, b) => b.timestamp.seconds - a.timestamp.seconds
    );
    setSortedChats(sortedChats);
  }, [Chats]);
  return (
    <div className="">
      <div className="h-[95px]">
        <div className="flex h-[66px] items-center justify-between px-2">
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
            className=" w-[90%] rounded-lg bg-light-secondary px-3 py-2 placeholder-muted-light outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
          />
        </div>
      </div>
      {sortedChats.length === 0 && !Loading && Chats == null ? (
        <>you have nothing </>
      ) : (
        <>
          {sortedChats.length !== 0 ? (
            <div
              className="my-element scrollbar-thumb-rounded-[2px] mt-6 flex h-[calc(100vh-195px)] flex-col items-center overflow-y-auto
               overflow-x-hidden pt-[2px] pr-[2px] scrollbar-thin  scrollbar-track-[transparent] scrollbar-thumb-scrollbar-light
            dark:scrollbar-thumb-scrollbar-dark md:h-[calc(100vh-125px)] "
            >
              {sortedChats.map((chat) => (
                <ChatCard //this is soo stupid of me too late to change this
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
                  set_Chats={set_Chats}
                  chat={chat}
                  //  timestamp={chat.timestamp}
                />
              ))}
            </div>
          ) : (
            <>loading....</>
          )}
        </>
      )}
    </div>
  );
};

export default Chats;
