import { useContext } from "react";
import { useGetChats } from "@/hooks/useGetChats";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import ChatCard from "./ChatCard";

const Chats = () => {
  const { setChats, setLoading, ChatObject } = useContext(
    SelectedChannelContext
  );
  const chats = useGetChats();
  console.log(chats)
  const sortedChats = chats.sort(
    (a, b) =>
      a.timeStamp.seconds * 1000 +
      a.timeStamp.nanoseconds / 1000000 +
      b.timeStamp.seconds * 1000 -
      b.timeStamp.nanoseconds / 1000000
  );
  return (
    <>
      {sortedChats.length > 0 ? (
        <div>
          {sortedChats.map((chat) => (
            <ChatCard
              key={chat.id}
              otherUserId={chat.senderId}
              type={chat.type}
              id={chat.id}
              //img={chat.senderDisplayImg || MyImage}
              name={chat.id}
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
