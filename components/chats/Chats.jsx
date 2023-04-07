import { useContext, useState, useMemo } from "react";
import { useGetChats } from "@/hooks/useGetChats";
import ChatCard from "./ChatCard";
import AddGroup from "../addGroup/AddGroup";
import { MdGroupAdd } from "react-icons/md";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

import { UserContext } from "../App";

const Chats = () => {
  const { User } = useContext(UserContext);
  const chats = useGetChats(User.id);
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
  const {ShowAddGroup, setShowAddGroup} = useContext(SelectedChannelContext);
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
      {sortedChats.length > 0 ? (
        <div className="overflow-y-auto overflow-x-hidden h-[85vh]">
          {sortedChats.reverse().map((chat) => (
            <ChatCard
              key={chat.id}
              otherUserId={chat.otherParticipant} // this is the bug
              type={chat.type}
              id={chat.id}
              img={<img src={chat.senderDisplayImg} alt="" />}
              name={chat.senderDisplayName}
              sender={
                chat.senderId == User.id ? "you" : chat.lastMessageSenderName
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
