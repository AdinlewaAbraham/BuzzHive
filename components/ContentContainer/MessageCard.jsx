import { useContext, useEffect, useState } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Emoji } from "emoji-picker-react";
import reactTomessage from "@/utils/messagesUtils/reactToMessage";
import ImageComponent from "./imageComponent/ImageComponent";
import VideoComponent from "./videoComponent/VideoComponent";
import PollComponent from "./pollComponent/PollComponent";
import { BsCheckAll, BsCheckLg } from "react-icons/bs";
import { BiTimeFive } from "react-icons/bi";
import FileComponent from "./fileComponent/FileComponent";
import UploadCircularAnimation from "./UploadCircularAnimation";
const MessageCard = ({ chat }) => {
  if (!chat) return;
  const { ChatObject, setReplyObject, ReplyObject, setChats } = useContext(
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
    { label: "Forward", action: () => "Forward clicked" },
    { label: "React to message", action: () => "React clicked" },
    { label: "Copy", action: () => "Copy clicked" },
  ];
  chat;

  const handleMenuItemClick = (item) => {
    item.action();
    setshowMessageMenu(false);
  };

  return (
    <div
      className={`my-2 flex items-center justify-start ${
        chat.senderId === currentId ? " flex-row-reverse" : " "
      } ${chat.reactions.length === 0 ? "" : "mb-[30px]"}  `}
      key={chat.id}
      id={chat.id}
    >
      <div
        className={`relative max-w-[80%] rounded-lg p-2 text-left ${
          chat.senderId === currentId
            ? " ml-2 mr-5 bg-accent-blue  text-right text-white"
            : "mr-2 ml-5 bg-[#ffffff] text-left text-black dark:bg-[#252d35] dark:text-white"
        }  ${
          (chat.type === "pic/video" ||
            chat.type === "image" ||
            chat.type === "video" ||
            chat.type === "file" ||
            chat.type === "poll") &&
          "w-[300px]"
        }`}
      >
        {chat.type == "reply" && (
          <div
            className="max-h-[80px] truncate rounded-lg border-l-blue-600 p-2 dark:bg-gray-500"
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
        {chat.type === "file" && <FileComponent chat={chat} />}
        {(chat.type === "pic/video" ||
          chat.type === "image" ||
          chat.type === "video") && (
          <div>
            {console.log(chat.dataObject)}
            <>
              {chat.dataObject.type.startsWith("image") ? (
                <ImageComponent
                  blurredSRC={chat.dataObject.blurredPixelatedBlobDownloadURL}
                  downloadSRC={chat.dataObject.downloadURL}
                  messageId={chat.id}
                  chat={chat}
                />
              ) : (
                <VideoComponent
                  blurredSRC={chat.dataObject.blurredPixelatedBlobDownloadURL}
                  downloadSRC={chat.dataObject.downloadURL}
                  messageId={chat.id}
                  messageText={chat.text}
                  dataObject={chat.dataObject}
                />
              )}
            </>
          </div>
        )}
        {chat.type === "poll" && <PollComponent PollObject={chat} />}
        {chat.type !== "poll" && <p className="text-start">{chat.text}</p>}
        {chat.senderId === User.id && (
          <div
            className={`flex justify-end ${
              (chat.type === "pic/video" ||
                chat.type === "image" ||
                chat.type === "video") && !chat.text &&
              "absolute bottom-3 right-4 z-30"
            }`}
          >
            {chat.status === "pending" && <BiTimeFive />}
            {chat.status === "sent" && <BsCheckLg />}
            {chat.status === "received" && <BsCheckAll />}
            {chat.status === "seen" && <BsCheckAll color="hotpink" />}
          </div>
        )}

        {chat.reactions.length > 0 && (
          <div
            className={`absolute bottom-[-20px] right-0 flex max-w-[500px] rounded-lg  bg-white p-[5px]`}
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
            <div className=" absolute bottom-[25px] left-[-100px] z-20 flex w-[200px] rounded-lg bg-blue-700 p-[20px]">
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
              <ul className="rounded-md border border-gray-300 bg-white shadow-md">
                {menuItems.map((item) => (
                  <li
                    key={item.label}
                    onClick={() => handleMenuItemClick(item)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:bg-black"
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
