import { useContext, useEffect, useState, useRef } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";
import { Emoji } from "emoji-picker-react";
import ImageComponent from "./imageComponent/ImageComponent";
import VideoComponent from "./videoComponent/VideoComponent";
import PollComponent from "./pollComponent/PollComponent";
import {
  BsCheckAll,
  BsCheckLg,
  BsChevronDown,
  BsEmojiSmile,
} from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineContentCopy } from "react-icons/md";
import { BiTimeFive } from "react-icons/bi";
import FileComponent from "./fileComponent/FileComponent";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import { useTheme } from "next-themes";
import { HiReply } from "react-icons/hi";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import EmojiPicker from "./EmojiPicker";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { motion } from "framer-motion";
import { formatTimeForMessages } from "@/utils/actualUtils/formatTimeForMessages";
import { formatCount } from "@/utils/actualUtils/formatCount";
const MessageCard = ({ chat }) => {
  const [animationParent] = useAutoAnimate();

  const { ChatObject, setReplyObject, ReplyObject, setChats } = useContext(
    SelectedChannelContext
  );
  const { User, setUser } = useContext(UserContext);
  const { theme } = useTheme();

  const [showReactEmojiTray, setshowReactEmojiTray] = useState(false);
  const [showMessageMenu, setshowMessageMenu] = useState(false);

  const currentId = User.id;
  const timestamp = chat.timestamp;

  const [anchorEl, setAnchorEl] = useState(null);
  const [emojiAnchor, setemojiAnchor] = useState(null);
  const Open = Boolean(anchorEl);

  const messageRef = useRef(null);

  const handleEmojiReaction = async (emoji) => {
    const reactions = chat.reactions;
    const existingReaction = reactions.find(
      (reaction) => reaction.id === User.id
    );
    const collectionName =
      ChatObject.activeChatType === "group" ? "groups" : "conversations";
    const docRef = doc(
      db,
      collectionName,
      ChatObject.activeChatId,
      "messages",
      chat.id
    );
    if (existingReaction) {
      const udatedReactionsArr = reactions.filter(
        (reaction) => reaction.id !== User.id
      );
      if (existingReaction.emoji === emoji) {

        await updateDoc(docRef, { ["reactions"]: udatedReactionsArr });
      } else if (existingReaction.emoji !== emoji) {
        const reactionObj = {
          displayImg: User.photoUrl,
          emoji,
          name: User.name,
          id: User.id,
        };
        await updateDoc(docRef, {
          ["reactions"]: [...udatedReactionsArr, reactionObj],
        });
      }
    } else {
      const reactionObj = {
        displayImg: User.photoUrl,
        emoji,
        name: User.name,
        id: User.id,
      };
      await updateDoc(docRef, {
        ["reactions"]: [...chat.reactions, reactionObj],
      });
    }
  };
  const addEmojiToLastUsedEmojiTray = async (emoji) => {
    const userRef = doc(db, "users", User.id);
    const newEmojiTray = [...User.lastUsedEmojiTray];

    if (!newEmojiTray.includes(emoji)) {
      newEmojiTray.pop();
      newEmojiTray.unshift(emoji);
    }

    setUser({ ...User, ["lastUsedEmojiTray"]: newEmojiTray });
    await updateDoc(userRef, { ["lastUsedEmojiTray"]: newEmojiTray });
  };

  if (chat.type == "unread") {
    return (
      <div className="bg-red-500 text-center">you neva read this one boss</div>
    );
  }

  const menuItems = [
    {
      icon: <HiReply />,
      label: "Reply",
      action: () =>
        setReplyObject({
          ReplyText: `${chat.text}`,
          ReplyTextId: `${chat.id}`,
          displayName: `${chat.senderDisplayName}`,
        }),
    },
    {
      icon: (
        <i className="scale-x-[-1]">
          <HiReply />
        </i>
      ),
      label: "Forward",
      action: () => "Forward clicked",
    },

    {
      icon: <MdOutlineContentCopy />,
      label: "Copy",
      action: () => "Copy clicked",
    },
  ];
  chat;

  const handleMenuItemClick = (item) => {
    item.action();
    setshowMessageMenu(false);
  };

  if (chat.type === "announcement") {
    return (
      <div className="flex items-center justify-center truncate">
        <p className="my-2 max-w-[50%] truncate rounded-md bg-white  p-3 text-center text-[13px] dark:bg-black">
          {chat.text}
        </p>
      </div>
    );
  }

  if (chat.type == "timeStamp") {
    return (
      <div className="sticky top-2 z-10 flex items-center justify-center pb-4">
        <p className=" my-2 max-w-[50%] truncate rounded-md bg-white  p-3 text-center text-[13px] dark:bg-black">
          {chat.day}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={messageRef}
      className={`group my-2 flex items-center justify-start ${chat.senderId === currentId ? " flex-row-reverse" : " "
        } ${chat.reactions?.length === 0 ? "" : "mb-[30px]"}  `}
      key={chat.id}
      id={chat.id}
    >
      <div
        className={`relative max-w-[80%] break-words rounded-lg p-2 text-left ${chat.senderId === currentId
            ? " ml-2 mr-5 bg-accent-blue  text-right text-white"
            : "mr-2 ml-5 bg-[#ffffff] text-left text-black dark:bg-[#252d35] dark:text-white"
          }  ${(chat.type === "pic/video" ||
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
        <div
          className={`items- flex w-full flex-col ${chat.senderId !== User.id && "justify-end"
            } ${(chat.type === "pic/video" ||
              chat.type === "image" ||
              chat.type === "video") &&
            !chat.text &&
            "absolute bottom-3 right-4 z-30"
            }`}
        >
          <p
            className={`max-w-[400px] break-words  text-start ${chat.type === "poll" && "w-1 truncate opacity-0"
              } `}
          >
            {chat.text}
          </p>
          <div className="ml-3 flex w-full items-center justify-end text-end">
            <div className={`ml-auto flex items-center justify-end`}>
              <div
                className={`text-muted mt-1 text-[11px] ${chat.senderId !== User.id && "mr-2"
                  } `}
              >
                {formatTimeForMessages(chat.timestamp)}
              </div>
              {chat.senderId === User.id && (
                <i className="mx-1 mr-3">
                  {chat.status === "pending" && <BiTimeFive />}
                  {chat.status === "sent" && <BsCheckLg />}
                  {chat.status === "received" && <BsCheckAll />}
                  {chat.status === "seen" && <BsCheckAll color="hotpink" />}
                </i>
              )}
            </div>
          </div>
        </div>

        {chat.reactions?.length > 0 && (
          <div
            ref={animationParent}
            onClick={() => { }}
            className={`absolute bottom-[-20px] right-0 flex cursor-pointer
            items-center  rounded-lg bg-light-primary p-[5px] dark:bg-dark-primary`}
          >
            {[...new Set(chat.reactions.map(({ emoji }) => emoji))]
              .slice(-3)
              .reverse()
              .map((emoji) => (
                <Emoji unified={emoji} size="15" key={emoji} />
              ))}
            <span className="text-muted ml-1 text-[10px] ">
              {formatCount(chat.reactions?.length)}
            </span>
          </div>
        )}
      </div>

      <div
        className={` flex ${chat.senderId === currentId ? "left-0 " : "right-0 "
          }`}
      >
        <div className="relative">
          {showReactEmojiTray && (
            <div className="absolute bottom-0 right-0 h-[300px] w-[280px]">
              <EmojiPicker
                setshowReactEmojiTray={setshowReactEmojiTray}
                message={chat}
                addEmojiToLastUsedEmojiTray={addEmojiToLastUsedEmojiTray}
                handleEmojiReaction={handleEmojiReaction}
                anchor={emojiAnchor}
              />
            </div>
          )}
          <div
            className={`group-hover: group-hover: group-hover: group-hover: relative  flex cursor-pointer items-center justify-center
             rounded-r-full rounded-l-full bg-light-primary px-1 py-[6px] text-muted-light group-hover:opacity-100
             dark:bg-dark-primary dark:text-muted-dark md:opacity-0
              ${chat.senderId === currentId && "flex-row-reverse"}`}
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
            }}
          >
            <i
              className={` transition-all duration-300 ${chat.senderId === currentId &&
                " ml-2 flex-row-reverse md:group-hover:ml-2"
                }  ${chat.senderId !== currentId && " mr-2 md:group-hover:mr-2 "
                } `}
            >
              <BsChevronDown size={10} />
            </i>
            <BsEmojiSmile />
          </div>
        </div>
      </div>
      <Menu
        anchorEl={anchorEl}
        variant="plain"
        open={Open}
        disableFocusRipple={true}
        onClose={() => setAnchorEl(null)}
        placement={chat.senderId === currentId ? "bottom-end" : "bottom-start"}
        sx={{
          backgroundColor: theme === "dark" ? "#1d232a" : "#fcfcfc",
          boxShadow: "none",
          padding: "7px",
        }}
      >
        <MenuItem
          className="hover:dark:light-primary cursor-default px-4 py-2 text-black
                 hover:bg-hover-light dark:text-white hover:dark:bg-dark-primary"
        >
          {User.lastUsedEmojiTray?.map((emoji) => (
            <div
              key={emoji}
              className={`mr-1 cursor-pointer rounded-lg p-1 hover:dark:bg-hover-dark
               hover:dark:text-white ${chat.reactions?.find((reaction) => reaction.id === User.id)
                  ?.emoji === emoji && "bg-hover-light dark:bg-hover-dark"
                } `}
              onClick={() => handleEmojiReaction(emoji)}
            >
              <Emoji unified={emoji} size="23" />
            </div>
          ))}
          <i
            onClick={(e) => {
              setAnchorEl(null);
              setshowReactEmojiTray(true);
              setemojiAnchor(e.currentTarget);
            }}
            className="emoji-picker hover:dark:light-primary cursor-pointer rounded-lg p-1
              text-black hover:bg-hover-light dark:text-white hover:dark:bg-hover-dark hover:dark:text-white "
          >
            <AiOutlinePlus size="23" />
          </i>
        </MenuItem>
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              handleMenuItemClick(item);
            }}
            sx={{ borderRadius: "8px" }}
            className="cursor-pointer rounded-lg px-4 py-2  text-black hover:bg-hover-light
                 dark:text-white hover:dark:bg-hover-dark hover:dark:text-white"
          >
            {item.icon} <p className="ml-2">{item.label}</p>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default MessageCard;
