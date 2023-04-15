import { useContext, useState, useMemo, useEffect } from "react";
import Input from "../input/Input";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { UserContext } from "../App";
import { BsEmojiSmile } from "react-icons/bs";
import { Emoji } from "emoji-picker-react";
import reactTomessage from "@/utils/messagesUtils/reactToMessage";
import getMessageReactions from "@/utils/messagesUtils/getMessageReactions";
import { GiCancel } from "react-icons/gi";
import { AiOutlineSearch } from "react-icons/ai";
import {BiArrowBack} from "react-icons/bi"

const MessageCard = ({ chat }) => {
  const { ChatObject } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);

  const [showReactEmojiTray, setshowReactEmojiTray] = useState(false);

  const currentId = User.id;
  const timestamp = chat.timestamp;

  const handleEmojiClick = (emoji) => {
    reactTomessage(
      emoji,
      chat.id,
      ChatObject.activeChatId,
      User,
      ChatObject.activeChatType
    );
  };

  return (
    <div
      className={`flex items-center my-2 justify-start ${
        chat.senderId === currentId ? " flex-row-reverse" : " "
      } ${chat.reactions.length === 0 ? "" : "mb-[30px]"} `}
      key={chat.id}
    >
      <div
        className={`text-left rounded-lg p-2 max-w-[80%] relative ${
          chat.senderId === currentId
            ? " text-white text-right ml-2 dark:bg-[#296eff] mr-5"
            : "dark:bg-[#252d35] text-white text-left mr-2 ml-5"
        }  `}
      >
        {chat.text}
        <p>{}</p>
        {chat.reactions.length > 0 && (
          <div
            className={`rounded-lg max-w-[500px] flex absolute bottom-[-20px] right-0  bg-white p-[5px]`}
          >
            {chat.reactions.map(({ emoji }) => (
              <Emoji unified={emoji} size="15" />
            ))}
          </div>
        )}
      </div>

      <div
        className={` flex ${
          chat.senderId === currentId ? "left-0 " : "right-0 "
        }`}
      >
        <div className="relative">
          {showReactEmojiTray && (
            <div className=" flex bg-blue-700 absolute bottom-[25px] left-[-100px] w-[200px] p-[20px] rounded-lg z-20">
              {["1f423", "1f423", "1f433", "1f423", "1f423"].map((emoji) => (
                <div
                  className="mx-[5px]"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  <Emoji unified={emoji} size="25" />
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
  const { Chats, Loading, ChatObject, showChats, setshowChats } = useContext(
    SelectedChannelContext
  );

  const [sortedChats, setSortedChats] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [showProfile, setshowProfile] = useState(false);
  const [IsMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function widthResizer() {
      const width = window.innerWidth < 768;
      setIsMobile(width);
    }

    // Getting the width of the browser on load
    widthResizer();

    // Getting the width of the browser whenever the screen resolution changes.
    window.addEventListener("resize", widthResizer);

    return () => window.removeEventListener("resize", widthResizer);
  }, []);

  useEffect(() => {
    if (ChatObject.photoUrl && ChatObject.photoUrl.props) {
      setPhotoUrl(ChatObject.photoUrl.props.src);
    }
  }, [ChatObject]);
  useEffect(() => {
    if (!IsMobile) setshowChats(true);
  }, [IsMobile]);

  useMemo(() => {
    setSortedChats(Chats.sort((a, b) => a.timestamp - b.timestamp));
  }, [Chats]);

  if (ChatObject.activeChatId == "") {
    return (
      <div className="bg-gray-300 dark:bg-[#12171d]  flex-1 overflow-hidden hidden items-center justify-center md:flex">
        no active chat right now
      </div>
    );
  }
  return (
    showChats && (
      <div className={`flex-1 ${IsMobile ? "fixed inset-0" : ""}`}>
        <div className=" flex-col relative bg-gray-300 dark:bg-[#12171d]  overflow-y-auto inset md:flex ">
          {showProfile && (
            <div className="bg-pink-500 inset-0 absolute z-30 ">
              <div
                className="border-b p-[16px]"
                onClick={() => {
                  setshowProfile(false);
                }}
              >
                <div className="cursor-pointer">
                  <GiCancel size={30} />
                </div>
              </div>
            </div>
          )}
          <div
            className="flex justify-between  items-center dark:bg-[#1d232a] w-full p-[13px] max-h-[66px] z-20 cursor-pointer"
            onClick={() => {
              //setshowProfile(true);
            }}
          >
            <div className="flex items-center">
              {IsMobile && (
                <div className="mr-[15px]"
                  onClick={() => {
                    setshowChats(false);
                  }}
                >
                  <BiArrowBack size={20}/>
                </div>
              )}
              <div
                className={`h-[40px] w-[40px] rounded-full flex item-center justify-center bg-gray-500 ${
                  ChatObject.photoUrl === null ? "pt-[3px]" : ""
                }`}
                onClick={() => {
                  setshowProfile(true);
                }}
              >
                {ChatObject.photoUrl === null ? (
                  ChatObject.activeChatType === "group" ? (
                    <MdGroup size={30} />
                  ) : (
                    <IoMdPerson size={30} />
                  )
                ) : (
                  <img
                    src={ChatObject.photoUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full"
                  />
                )}
              </div>
              <div className="ml-[10px]">{ChatObject.displayName}</div>
            </div>

            <div className="px-[10px]">
              <AiOutlineSearch />
            </div>
          </div>
          <main className="h-[calc(100vh-123px)] flex flex-col justify-end">
            {Loading ? (
              <div className="text-center text-2xl">Loading</div>
            ) : (
              <div
                className="my-[20px] w-full  my-element overflow-y-auto scrollbar-thin  scrollbar-thumb-rounded-[2px] scrollbar-thumb-blue-700
              scrollbar-track-blue-300 dark:scrollbar-thumb-gray-500 dark:scrollbar-track-[transparent] hover:scrollbar- transition-all duration-300"
              >
                {sortedChats &&
                  sortedChats.map((chat) => <MessageCard chat={chat} />)}
              </div>
            )}
            <div id="scrollToMe"></div>
          </main>
          <Input />
        </div>
      </div>
    )
  );
};

export default ContentContainer;
