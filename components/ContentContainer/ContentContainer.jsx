import { useContext, useState, useMemo, useEffect } from "react";
import Input from "../input/Input";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { GrGroup } from "react-icons/gr";
import { FaUserCircle } from "react-icons/fa";
import { UserContext } from "../App";
import { BsEmojiSmile } from "react-icons/bs";
import { Emoji } from "emoji-picker-react";

const ChatCard = ({ chat }) => {
  const { User } = useContext(UserContext);

  const [showReactEmojiTray, setshowReactEmojiTray] = useState(false);

  const currentId = User.uid;
  console.log(chat);
  const timestamp = chat.timestamp;
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

  // Format the time as a string
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;
  return (
    <div
      className={`flex items-center my-2 justify-start${
        chat.senderId === currentId ? " flex-row-reverse" : " "
      } `}
    >
      <div
        className={`text-left rounded-lg p-2 max-w-[80%] relative ${
          chat.senderId === currentId
            ? " text-white text-right ml-2 bg-green-500 mr-5"
            : "bg-red-800 text-white text-left mr-2 ml-5"
        }`}
      >
        {chat.text}
        <p>{formattedTime}</p>
      </div>

      <div
        className={` flex ${
          chat.senderId === currentId ? "left-0 " : "right-0 "
        }`}
      >
        <div className="relative">
          {showReactEmojiTray && (
            <div className=" flex bg-blue-700 absolute bottom-[25px] left-[-100px] w-[200px] p-[20px] rounded-lg">
              {["1f423", "1f423", "1f433", "1f423", "1f423"].map(() => (
                <div className="mx-[5px]">
                  <Emoji unified="1f423" size="25" />
                </div>
              ))}
            </div>
          )}
          <div
            onClick={() => {
              setshowReactEmojiTray(!showReactEmojiTray);
            }}
          >
            <BsEmojiSmile />
          </div>
        </div>
      </div>
    </div>
  );
};

const ContentContainer = () => {
  const { Chats, Loading, ChatObject } = useContext(SelectedChannelContext);

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

  if (ChatObject.activeChatId == "") {
    return (
      <div className="bg-gray-300 dark:bg-gray-700 w-screen flex items-center justify-center">
        no active chat right now
      </div>
    );
  }
  return (
    <div className="relative bg-gray-300 dark:bg-gray-700 w-full overflow-y-auto overflow-x-hidden">
      <div className="fixed top-0 flex bg-gray-700 w-screen p-4 items-center z-10">
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
          {sortedChats && sortedChats.map((chat) => <ChatCard chat={chat} />)}
        </div>
      )}
      <Input />
    </div>
  );
};

export default ContentContainer;
