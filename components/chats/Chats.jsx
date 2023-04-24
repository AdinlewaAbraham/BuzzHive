import { useContext, useState, useMemo, useEffect } from "react";
import { useGetChats } from "@/hooks/useGetChats";
import ChatCard from "./ChatCard";
import { MdGroupAdd } from "react-icons/md";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

import {
  onSnapshot,
  doc,
} from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { UserContext } from "../App";

const Chats = () => {
  const { User } = useContext(UserContext);
  const { loading, whatToReturn } = useGetChats(User.id);
  const [Chats, set_Chats] = useState(null);
  const [sortedChats, setSortedChats] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const chats = whatToReturn;
  const { setSelectedChannel} = useContext(
    SelectedChannelContext
  );

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
  console.log(JSON.parse(localStorage.getItem(`${User.id}_userChats`)));
  useEffect(() => {
    const storedChats = getStoredChats();
    console.log(storedChats);
    if (storedChats && storedChats.length) {
      console.log(storedChats);
      set_Chats(storedChats);
      setLoading(false);
    } else {
      console.log("ranning")
      console.log(chats);
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

  useEffect(() => {}, []);

  useMemo(async () => {
    if (!Chats) return;
    const sortedChats = Chats.slice().sort(
      (a, b) => b.timestamp.seconds - a.timestamp.seconds
    );
    setSortedChats(sortedChats);
  }, [Chats]);
  console.log(Chats);
  console.log(sortedChats);

  return (
    <div className="">
      <div className="h-[95px]">
        <div className="flex justify-between items-center px-2 ">
          <h1 className="text-2xl ">Chats</h1>{" "}
          <div className="relative">
            <i
              onClick={() => {
                setSelectedChannel("addGroup");
              }}
              className="cursor-pointer"
            >
              <MdGroupAdd size={24} />
            </i>
          </div>
        </div>
        <div className=" flex justify-center items-center">
          <input
            type="text"
            placeholder="Search"
            className="w-[90%] my-5 rounded-lg px-3 py-2 dark:bg-[#12171d] "
          />
        </div>
      </div>
      {sortedChats.length === 0 && !Loading && Chats == null ? (
        <>you have nothing </>
      ) : (
        <>
          {sortedChats.length !== 0 ? (
            <div
              className="flex flex-col items-center overflow-y-auto pt-[2px] pr-[2px] overflow-x-hidden md:h-[calc(100vh-125px)] h-[calc(100vh-195px)] mt-2 my-element scrollbar-thin  scrollbar-thumb-rounded-[2px] scrollbar-thumb-blue-700
            scrollbar-track-blue-300 dark:scrollbar-thumb-gray-500 dark:scrollbar-track-[transparent] hover:scrollbar-"
            >
              {sortedChats.map((chat) => (
                <ChatCard
                  key={chat.id}
                  otherUserId={chat.otherParticipant}
                  type={chat.type}
                  id={chat.id}
                  img={chat.senderDisplayImg}
                  name={chat.senderDisplayName}
                  sender={
                    chat.senderId == User.id
                      ? "you"
                      : chat.lastMessageSenderName
                  }
                  message={chat.lastMessage}
                  unReadCount={chat.unReadmessagesCount}
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
