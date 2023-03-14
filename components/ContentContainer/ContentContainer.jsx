import { useContext, useState, useMemo, useEffect } from "react";
import Input from "../input/Input";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { GrGroup } from "react-icons/gr";
import { FaUserCircle } from "react-icons/fa";
import { UserContext } from "../App";

const ContentContainer = () => {
  const { Chats, Loading, ChatObject } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);

  console.log(Chats)
  const [sortedChats, setSortedChats] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (ChatObject.photoUrl && ChatObject.photoUrl.props) {
        setPhotoUrl(ChatObject.photoUrl.props.src);
    }
  }, [ChatObject]);
  

  useMemo(() => {
    setSortedChats(Chats.sort((a, b) => a.timestamp - b.timestamp));
  }, [Chats]);

  const currentId = User.uid;

  return (
    <div
      className="relative
      bg-gray-300 dark:bg-gray-700 h-screen w-screen overflow-y-scroll"
    >
      <div className="fixed top-0 flex bg-gray-700 w-screen p-4 items-center ">
        {photoUrl === null ? (
          ChatObject.activeChatType === "group" ? (
            <GrGroup size={35} />
          ) : (
            <FaUserCircle />
          )
        ) : (
          <img src={photoUrl} alt="Profile" className="w-8 h-8 rounded-full" />
        )}
        {ChatObject.displayName}
      </div>
      {Loading ? (
        <div className="text-center text-2xl">Loading</div>
      ) : (
        <div className="my-20">
          {sortedChats &&
            sortedChats.map((chat) => (
              <div
                className={`flex items-center ${
                  chat.senderId === currentId ? "justify-end" : "justify-start"
                } my-2`}
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
        </div>
      )}
      <Input />
    </div>
  );
};

export default ContentContainer;
