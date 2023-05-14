import { useContext, useEffect, useState } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Emoji } from "emoji-picker-react";
import reactTomessage from "@/utils/messagesUtils/reactToMessage";
import { RenderFileType } from "../input/FileInput";
import ImageComponent from "./ImageComponent";
import VideoComponent from "./VideoComponent";
const MessageCard = ({ chat }) => {
  const { ChatObject, setReplyObject, ReplyObject } = useContext(
    SelectedChannelContext
  );
  const { User } = useContext(UserContext);

  const [showReactEmojiTray, setshowReactEmojiTray] = useState(false);
  const [showMessageMenu, setshowMessageMenu] = useState(false);

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
  if (chat.type == "unread") {
    return (
      <div className="bg-red-500 text-center">you neva read this one boss</div>
    );
  }

  const menuItems = [
    {
      label: "Reply",
      action: () =>
        setReplyObject({
          ReplyText: `${chat.text}`,
          ReplyTextId: `${chat.id}`,
          displayName: `${chat.senderDisplayName}`,
        }),
    },
    { label: "Forward", action: () => console.log("Forward clicked") },
    { label: "React to message", action: () => console.log("React clicked") },
    { label: "Copy", action: () => console.log("Copy clicked") },
  ];
  console.log(chat);

  const handleMenuItemClick = (item) => {
    item.action();
    setshowMessageMenu(false);
  };

  // const handleClickOutside = (e) => {
  //   console.log(e)
  //   if(!e) return
  //   if (!e.target.closest(".menu")) {
  //     setshowMessageMenu(false);
  //   }
  // };
  // useEffect(() => {
  //   window.addEventListener("click", handleClickOutside);
  // }, []);
  return (
    <div
      className={`flex items-center my-2 justify-start ${
        chat.senderId === currentId ? " flex-row-reverse" : " "
      } ${chat.reactions.length === 0 ? "" : "mb-[30px]"}  `}
      key={chat.id}
      id={chat.id}
    >
      <div
        className={`text-left rounded-lg p-2 max-w-[80%] relative ${
          chat.senderId === currentId
            ? " text-white text-right ml-2 dark:bg-[#296eff] mr-5"
            : "dark:bg-[#252d35] text-white text-left mr-2 ml-5"
        }  ${chat.type === "pic/video" && "w-[300px]"}`}
      >
        {chat.type == "reply" && (
          <div
            className="dark:bg-gray-500 p-2 rounded-lg border-l-blue-600 max-h-[80px] truncate"
            onClick={() => {
              document
                .getElementById(chat.replyObject.replyTextId)
                .scrollIntoView({ behavior: "smooth" });
            }}
          >
            <p className="text-[9px]">{chat.replyObject.replyDisplayName}</p>
            <p className="text-[12px]">{chat.replyObject.replyText}</p>
          </div>
        )}
        {chat.type === "file" && (
          <div>
            <div className={`w-full flex ${chat.text && "mb-2"}`}>
              <div className="p-3 bg-blue-900 rounded-full flex justify-center items-center mr-2">
                <RenderFileType type={chat.dataObject.type} size={40} />
              </div>
              <div className="text-start">
                <p>{chat.dataObject.name}</p>
                <p>{chat.dataObject.size}</p>
              </div>
            </div>
          </div>
        )}
        {chat.type === "pic/video" && (
          <div>
            {console.log(chat.dataObject.type)}
            {chat.dataObject.type.startsWith("image") ? (
              <ImageComponent
                blurredSRC={chat.dataObject.blurredPixelatedBlobDownloadURL}
                downloadSRC={chat.dataObject.downloadURL}
                messageId={chat.id}
              />
            ) : (
              <VideoComponent src={chat.dataObject.downloadURL} />
            )}

            {chat.dataObject.name}
          </div>
        )}
        {chat.text}
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
          {showMessageMenu && (
            <div className="absolute top-4 z-20">
              <ul className="bg-white border border-gray-300 shadow-md rounded-md">
                {menuItems.map((item) => (
                  <li
                    key={item.label}
                    onClick={() => handleMenuItemClick(item)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:bg-black"
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div
            onClick={() => {
              setshowMessageMenu(!showMessageMenu);
            }}
          >
            <BsThreeDotsVertical color="grey" className="cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
