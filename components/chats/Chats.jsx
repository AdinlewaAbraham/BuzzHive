import { useContext, useState, useMemo, useEffect } from "react";
import { useGetChats } from "@/hooks/useGetChats";
import ChatCard from "./ChatCard";
import AddGroup from "../addGroup/AddGroup";
import { MdGroupAdd } from "react-icons/md";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

import { UserContext } from "../App";

const Chats = () => {
  const { User } = useContext(UserContext);
  const { loading, whatToReturn } = useGetChats(User.id);
  const [Chats, setChats] = useState(null);
  const [sortedChats, setSortedChats] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const chats = whatToReturn;

  const getStoredChats = () => {
    const storedData = localStorage.getItem(`${User.id}_userChats`)
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

  useEffect(() => {
    const storedChats = getStoredChats();
    if (storedChats && storedChats.length) {
      setChats(storedChats);
      setLoading(false); // Set loading to false after setting the stored chats
    } else {
      setChats(chats);
      localStorage.setItem(`${User.id}_userChats`, JSON.stringify(chats));
      setLoading(false); // Set loading to false after fetching new chats
    }
    if ((chats == null || chats.length == 0) && !loading) {
      setChats(null);
    }
  }, [chats, User.id, whatToReturn]);

  useEffect(() => {
    const fetchData = async () => {
      // Check if the chat data has changed
      if (
        JSON.stringify(chats) !== JSON.stringify(Chats) &&
        !loading &&
        isOnline
      ) {
        localStorage.setItem(`${User.id}_userChats`, JSON.stringify(chats));

        setChats(chats);
      }
    };
    fetchData();
    // Fetch new data every 10 minutes
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, [User.id, chats]);

  useMemo(() => {
    if (!Chats) return;
    const sortedChats = Chats.slice().sort(
      (a, b) => b.timestamp.seconds - a.timestamp.seconds
    );
    setSortedChats(sortedChats);
  }, [Chats]);

  const { ShowAddGroup, setShowAddGroup } = useContext(SelectedChannelContext);
  return (
    <>
      <div className="h-[10vh] min-h-[100px]">
        <div className="flex justify-between items-center ">
          <h1 className="text-2xl ">Chats</h1>{" "}
          <div className="relative">
            <i
              onClick={() => {
                setShowAddGroup(!ShowAddGroup);
              }}
              className="cursor-pointer"
            >
              <MdGroupAdd size={24} />
            </i>
            {ShowAddGroup && <AddGroup />}
          </div>
        </div>

        <input
          type="text"
          placeholder="Search your chats"
          className="w-full my-5"
        />
      </div>
      {console.log(Chats)}
      {sortedChats.length === 0 && !Loading && Chats == null ? (
        <>you have nothing </>
      ) : (
        <>
          {sortedChats.length !== 0 ? (
            <div className="overflow-y-auto overflow-x-hidden h-[calc(100vh-50px)]  md:h-[85vh]">
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
                  //  timestamp={chat.timestamp}
                />
              ))}
            </div>
          ) : (
            <>loading....</>
          )}
        </>
      )}
    </>
  );
};

export default Chats;
