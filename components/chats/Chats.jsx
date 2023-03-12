import { useContext, useState, useMemo } from "react";
import { useGetChats } from "@/hooks/useGetChats";
import ChatCard from "./ChatCard";
import AddGroup from "../addGroup/AddGroup";

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
        a.timeStamp.seconds * 1000 +
        a.timeStamp.nanoseconds / 1000000 -
        b.timeStamp.seconds * 1000 -
        b.timeStamp.nanoseconds / 1000000
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
          {sortedChats.map((chat) => (
            <ChatCard
              key={chat.id}
              otherUserId={chat.senderId}
              type={chat.type}
              id={chat.id}
              img={chat.senderDisplayImg || MyImage}
              name={chat.senderDisplayName}
              sender={chat.type === "group" ? "group" : "me"}
              message={chat.lastMessage}
              //  timeStamp={chat.timeStamp}
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
