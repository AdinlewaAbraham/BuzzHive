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
import Img from "../Img";
import { usePopper } from "react-popper";
import { placements } from "@popperjs/core";
const MessageCard = ({
  chat,
  searchText,
  activeIndexId,
  searchedMessages,
  ref,
}) => {
  const [animationParent] = useAutoAnimate();

  const { ChatObject, setReplyObject, setChats, Chats } = useContext(
    SelectedChannelContext
  );

  const { User, setUser } = useContext(UserContext);
  const { theme } = useTheme();

  const [showReactEmojiTray, setshowReactEmojiTray] = useState(false);

  const currentId = User.id;
  const timestamp = chat.timestamp;

  const [anchorEl, setAnchorEl] = useState(null);
  const [emojiAnchor, setemojiAnchor] = useState(null);
  const [SamePrevSender, setSamePrevSender] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const [forwardMessageModal, setforwardMessageModal] = useState(false);
  const [contacts, setcontacts] = useState([]);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
      {
        name: "arrow",
        options: {
          element: arrowElement,
        },
      },
    ],
    placement: "auto",
  });

  const Open = Boolean(anchorEl);

  const messageRef = useRef(null);
  useEffect(() => {
    const getContacts = () => {
      const contacts = JSON?.parse(
        localStorage.getItem(`${User.id}_userChats`)
      );
      setcontacts(contacts);
    };
    return () => getContacts();
  }, []);
  useEffect(() => {
    const currentIndex = Chats.findIndex((chatItem) => chatItem === chat);
    if (currentIndex > 0) {
      const prevChat = Chats[currentIndex - 1];

      if (prevChat.senderId === chat.senderId) {
        setSamePrevSender(true);
      } else {
        setSamePrevSender(false);
      }
    } else {
      setSamePrevSender(false);
    }
  }, [Chats, chat, setSamePrevSender]);
  useEffect(() => {
    const mainElement = document.getElementById("scrollContainer");

    const handleWheel = (event) => {
      if (
        (Open || showReactEmojiTray || forwardMessageModal) &&
        !event.target.closest("#emojiBoard")
      ) {
        event.preventDefault();
      }
    };

    mainElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      mainElement.removeEventListener("wheel", handleWheel);
    };
  }, [Open, showReactEmojiTray, setPopperElement, forwardMessageModal]);

  useEffect(() => {
    const event = window.addEventListener("click", (e) => {
      if (!e.target.closest(".clickEvent")) {
        setforwardMessageModal(false);
      }
    });

    return () => event;
  }, []);

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
      action: () => {
        setforwardMessageModal(true);
      },
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
    setAnchorEl(null);
  };

  if (chat.type === "announcement") {
    return (
      <div className="flex items-center justify-center truncate pb-4">
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
      className={`group my-2 flex  justify-start px-5  ${chat.senderId === currentId ? " flex-row-reverse" : " "
        } ${chat.reactions?.length === 0 ? "" : "mb-[30px]"}  `}
      key={chat.id}
      id={chat.id}
    >
      {ChatObject.activeChatType === "group" &&
        chat.senderId !== User.id &&
        !SamePrevSender && (
          <Img
            src={chat.senderDisplayImg}
            styles=" w-[30px] h-[30px] rounded-full mr-2 bg-[#dfe5e7] dark:bg-gray-500"
            type="personnal"
            personalSize="40"
            imgStyles=" rounded-full "
          />
        )}
      <div
        ref={setReferenceElement}
        className={`messageDiv relative box-border max-w-[80%] break-words rounded-lg p-2 text-left 
        ${SamePrevSender &&
          chat.senderId !== User.id &&
          ChatObject.activeChatType === "group" &&
          "ml-[38px]"
          }
        ${!SamePrevSender &&
          ` ${chat.senderId !== User.id ? "rounded-tl-none" : "rounded-tr-none"
          } `
          }
        ${activeIndexId === chat.id &&
          `${chat.senderId === User.id
            ? "pulse-bg-user"
            : ` ${theme === "dark" || theme === "system"
              ? "pulse-bg-notUser-dark"
              : "pulse-bg-notUser-light"
            }  `
          }`
          }  ${chat.senderId === User.id
            ? "ml-2   bg-accent-blue text-right text-white"
            : "mr-2  bg-[#ffffff] text-left text-black dark:bg-[#252d35] dark:text-white"
          } ${(chat.type === "pic/video" ||
            chat.type === "image" ||
            chat.type === "video" ||
            chat.type === "file" ||
            chat.type === "poll") &&
          "w-[300px]"
          }
          `}
      >
        {chat.senderId !== User.id &&
          ChatObject.activeChatType === "group" &&
          !SamePrevSender && (
            <p className="text-muted text-[11px] font-medium">
              {chat.senderDisplayName}
            </p>
          )}
        {!SamePrevSender && (
          <span
            className={`absolute top-0 
          ${chat.senderId !== User.id
                ? "left-[-7px] text-[#ffffff] dark:text-[#252d35]"
                : "right-[-7px] scale-x-[-1] text-accent-blue"
              } 
           `}
          >
            <svg width="7" height="10" viewBox="0 0 7 10" className="">
              <polygon
                points="0 0, 200 0, 200 200"
                mydatadeg="0"
                fill="currentColor"
              />
            </svg>
          </span>
        )}
        {chat.type == "reply" && (
          <div
            className="max-h-[80px] truncate rounded-lg  p-2 dark:bg-gray-500"
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
          <p className="max-w-[400px] break-words text-start">
            {chat.text.split(" ").map((word, index) => (
              <span
                key={index}
                className={
                  searchText
                    .toLowerCase()
                    .split(" ")
                    .includes(word.toLowerCase()) &&
                  searchText !== "" &&
                  searchedMessages.includes(chat.id) &&
                  "m-0 max-h-min max-w-min bg-red-500 p-0"
                }
              >
                {word}{" "}
              </span>
            ))}
          </p>

          <div className="ml-3 flex w-full items-center justify-end text-end">
            <div className={`ml-auto flex items-center justify-end`}>
              <div
                className={`text-muted mt-1 text-[11px] ${chat.senderId !== User.id && "mr-3"
                  } `}
              >
                {formatTimeForMessages(chat.timestamp)}
              </div>
              {chat.senderId === User.id && (
                <i className="mx-1 mr-3">
                  {chat.status === "pending" && <BiTimeFive />}
                  {chat.status === "sent" && <BsCheckLg />}
                  {chat.status === "received" && <BsCheckAll />}
                  {chat.status === "seen" && <BsCheckAll color="#000001 " />}
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
        className={` flex items-center ${chat.senderId === currentId ? "left-0 " : "right-0 "
          }`}
      >
        <div className="relative">
          {showReactEmojiTray && (
            <div
              id="emojiBoard"
              className="absolute bottom-0 right-0 z-[100] h-[300px] w-[280px]"
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              <EmojiPicker
                setshowReactEmojiTray={setshowReactEmojiTray}
                message={chat}
                addEmojiToLastUsedEmojiTray={addEmojiToLastUsedEmojiTray}
                handleEmojiReaction={handleEmojiReaction}
                anchor={emojiAnchor}
              />
            </div>
          )}
          {forwardMessageModal && (
            <div
              className="clickEvent z-50 bg-primary rounded-lg w-[200px] p-2"
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              <h1>Forward message</h1>
              <input
                type="text"
                className=" w-full rounded-lg bg-light-secondary px-3 py-2 placeholder-muted-light 
            outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
                placeholder="Search"
              />
              <div>
                {console.log(contacts)}
                {contacts.map((contact) => (
                  <div className="flex items-center cursor-pointer justify-between">
                    <div className="flex">
                      <Img
                        src={contact.senderDisplayImg}
                        styles="w-[40px] h-[40px] rounded-full"
                        imgStyles="rounded-full "
                        type={contact.type}
                        groupSize="70"
                        personalSize="50"
                      />
                      {contact.senderDisplayName}</div>
                    <input type="checkbox" name="" id="" />
                  </div>
                ))}
              </div>
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
        onClose={() => setAnchorEl(null)}
        placement={chat.senderId === currentId ? "bottom-end" : "bottom-start"}
        sx={{
          backgroundColor:
            theme === "dark" || theme === "system" ? "#1d232a" : "#fcfcfc",
          boxShadow: "none",
          ".MuiOutlinedInput-notchedOutline": { border: 0 },
          padding: "7px",
        }}
      >
        <MenuItem
          className="hover:dark:light-primary flex cursor-default border-none py-2 text-black
                 hover:bg-hover-light dark:text-white hover:dark:bg-dark-primary  "
          sx={{ borderRadius: "8px" }}
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
            className="clickEvent cursor-pointer rounded-lg px-4 py-2  text-black hover:bg-hover-light
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
