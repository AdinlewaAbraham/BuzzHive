import { useContext, useState, useMemo } from "react";
import Input from "../input/Input";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

import { UserContext } from "../App";
const ContentContainer = () => {
  const { Chats, Loading, ChatObject } = useContext(SelectedChannelContext);

  const [sortedChats, setSortedChats] = useState([]);
  const { User } = useContext(UserContext);

  useMemo(() => {
    setSortedChats(Chats.sort((a, b) => a.timestamp - b.timestamp));
  }, [Chats]);
  const currentId = User.uid;
  return (
    <div
      className="relative
      bg-gray-300 dark:bg-gray-700 h-screen w-screen overflow-y-scroll"
    >
      <div className="fixed top-0 flex bg-gray-700 w-screen p-4 items-center">
        <img src={ChatObject.photoUrl} alt="" className="w-[40px] h-[40px] mr-4"/>{" "}
        {ChatObject.displayName}
      </div>
      {Loading ? (
        <div className="text-center text-2xl">Loading</div>
      ) : (
        <>
          {sortedChats &&
            sortedChats.map((chat) => (
              <div
                className={`flex items-center ${
                  chat.senderId === currentId ? "justify-end" : "justify-start"
                } mt-2`}
              >
                <div
                  className={`text-left rounded-lg p-2 max-w-[80%] ${
                    chat.senderId === currentId
                      ? " text-white text-right ml-2 bg-green-500 mr-5"
                      : "bg-red-800 text-white text-left mr-2 ml-5"
                  }`}
                >
                  {chat.text}
                </div>
              </div>
            ))}
        </>
      )}
      <Input />
    </div>
  );
};

export default ContentContainer;
