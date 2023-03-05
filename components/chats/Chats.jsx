import { useState, useContext } from "react";
import Image from "next/image";
import { useGetChats } from "@/hooks/useGetChats";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { getConversation } from "@/utils/conversations/getConversation";
import { getGroupMessages } from "@/utils/groupUtils/getGroupMessages";

const ChatCard = ({
  img,
  name,
  sender,
  message,
  timeStamp,
  id,
  type,
  otherUserId,
}) => {
  const { setChats, setLoading, ChatObject, setChatObject } = useContext(
    SelectedChannelContext
  );
  const handleChatClick = async () => {
    setLoading(true);
    setChatObject({
      ...ChatObject,
      activeChatId: `${id}`,
      activeChatType: `${type}`,
      otherUserId: `${otherUserId}`,
    });
    if (type == "group") {
      const chats = await getGroupMessages(id);
      setChats(chats);

      //setchat
    } else if (type == "personal") {
      const chats = await getConversation(id);
      setChats(chats);
    }
    setLoading(false);
  };
  return (
    <div
      className="flex flex-row justify-between align-middle items-center px-4 py-3 cursor-pointer
      rounded-xl hover:bg-gray-600 transition-all duration-100 ease-linear"
      onClick={() => {
        handleChatClick();
      }}
    >
      <div className="flex flex-row  align-middle items-center">
        <div className="w-14 h-14 mr-3">
          <Image className="object-cover w-full h-full" src={img} alt="hello" />
        </div>
        <div>
          <h3>{name}</h3>
          <div className="flex flex-row">
            <p>{sender}</p>: <p> {message}</p>
          </div>
        </div>
      </div>
      <p className="">{timeStamp}</p>
    </div>
  );
};

const Chats = () => {
  const { setChats, setLoading, ChatObject } = useContext(
    SelectedChannelContext
  );
  const chats = useGetChats();
  return (
    <div>
      {chats.map((chat) => (
        <ChatCard
          otherUserId={chat.senderId}
          type={chat.type}
          id={chat.id}
          //img={chat.senderDisplayImg || MyImage}
          name={chat.senderDisplayName}
          sender={chat.type === "group" ? "group" : "me"}
          message={chat.lastMessage}
          //  timeStamp={chat.timeStamp}
        />
      ))}
    </div>
  );
};

export default Chats;
