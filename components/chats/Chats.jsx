import { useContext, useState, useMemo } from "react";
import { useGetChats } from "@/hooks/useGetChats";
import ChatCard from "./ChatCard";
import AddGroup from "../addGroup/AddGroup";
import { GrGroup } from "react-icons/gr";
import { FaUserCircle } from "react-icons/fa";

import { UserContext } from "../App";

const Chats = () => {
  const { User } = useContext(UserContext);
  const chats = useGetChats(User.uid);
  const [sortedChats, setSortedChats] = useState([]);
  useMemo(() => {
    if (!chats[0]) {
      return null;
    }
    const sortedChats = chats.sort(
      (a, b) =>
        a.timestamp.seconds * 1000 +
        a.timestamp.nanoseconds / 1000000 -
        b.timestamp.seconds * 1000 -
        b.timestamp.nanoseconds / 1000000
    );
    setSortedChats(sortedChats);
  }, [chats]);
  const [ShowAddGroup, setShowAddGroup] = useState(false);
  return (
    <>
      <div>
        <div className="flex justify-between my-2">
          <h1 className="text-2xl ">Chats</h1>{" "}
          <div className="relative">
            <button
              onClick={() => {
                setShowAddGroup(!ShowAddGroup);
              }}
            >
              add
            </button>
            {ShowAddGroup && <AddGroup />}
          </div>
        </div>

        <input
          type="text"
          placeholder="Search your chats"
          className="w-full mb-5 mt-2"
        />
      </div>
      {sortedChats.length > 0 ? (
        <div>
          {sortedChats.reverse().map((chat) => (
            <ChatCard
              key={chat.id}
              otherUserId={chat.otherParticipant}// this is the bug
              type={chat.type}
              id={chat.id}
              img={<img src={chat.senderDisplayImg} alt="" />}
              name={chat.senderDisplayName}
              sender={
                chat.senderId == User.uid ? "you" : chat.lastMessageSenderName
              }
              message={chat.lastMessage}
              //  timestamp={chat.timestamp}
            />
          ))}
        </div>
      ) : (
        <>Loading</>
      )}
    </>
  );
};

export default Chats;
