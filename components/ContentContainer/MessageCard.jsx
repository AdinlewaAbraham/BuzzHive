import {
  useContext,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
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
import { RiDeleteBinLine } from "react-icons/ri";
import { BiTimeFive } from "react-icons/bi";
import FileComponent from "./fileComponent/FileComponent";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import { useTheme } from "next-themes";
import { HiReply } from "react-icons/hi";
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "@/utils/firebaseUtils/firebase";
import EmojiPicker from "./EmojiPicker";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { formatTimeForMessages } from "@/utils/actualUtils/formatTimeForMessages";
import { formatCount } from "@/utils/actualUtils/formatCount";
import Img from "../Img";
import { usePopper } from "react-popper";
import { sendGroupMessage } from "@/utils/groupUtils/sendGroupMessage";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
import { CircularProgress } from "@mui/joy";
import { ref, deleteObject } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import { Collapse } from "@mui/material";

const MessageCard = ({
  chat,
  searchText,
  activeIndexId,
  searchedMessages,
  scrollContainerRef,
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
  const [selectedUsers, setselectedUsers] = useState([]);
  const [Height, setHeight] = useState(0);
  const [isforwarding, setisforwarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
        !event.target.closest("#emojiBoard") &&
        !event.target.closest("#scrollContacts")
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
  const selectedUserHeight = useRef(null);
  useLayoutEffect(() => {
    if (!selectedUserHeight.current) return;
    setHeight(selectedUserHeight.current.clientHeight);
    console.log(selectedUserHeight.current.clientHeight);
  }, [selectedUsers]);

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
          ReplyUserId: `${chat.senderId}`,
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
  const handleMessageDelete = async () => {
    setAnchorEl(null);
    if (User.id !== chat.senderId) return;
    const docRef = doc(
      db,
      ChatObject.activeChatType === "group" ? "groups" : "conversations",
      ChatObject.activeChatId,
      "messages",
      chat.id
    );

    if (
      chat.type === "image" ||
      chat.type === "file" ||
      chat.type === "video"
    ) {
      const storageFileRef = ref(storage, chat.dataObject.filePath);
      const deleteFilePromise = deleteObject(storageFileRef);
      const deleteDocPromise = deleteDoc(docRef);

      await Promise.all([deleteDocPromise, deleteFilePromise])
        .then(() => console.log("done"))
        .catch((err) => console.error(err));
    } else {
      await deleteDoc(docRef);
    }
  };

  const divStyles = {
    maxHeight: `calc(100vh - 285px - ${Height}px
      )`,
    transition: "height ease-in-out 150ms",
  };
  const handleMessageForward = async () => {
    setisforwarding(true);
    const time = new Date();
    try {
      await Promise.all(
        selectedUsers.map(async (contact) => {
          if (contact.type === "group") {
            await sendGroupMessage(
              User.id,
              User.photoUrl,
              contact.id,
              chat.text,
              User.name,
              chat.type,
              time,
              chat.replyObject,
              chat.dataObject,
              null,
              () => {},
              true
            );
          } else {
            await sendMessage(
              User.id,
              contact.otherParticipant,
              chat.text,
              User.id,
              User.name,
              chat.type,
              time,
              chat.replyObject,
              chat.dataObject,
              null,
              () => {},
              true
            );
          }
        })
      );
    } catch (error) {
      console.error(error);
    }
    setforwardMessageModal(false);
    setisforwarding(false);
  };

  return (
    <div
      ref={messageRef}
      className={`group my-2 flex  justify-start px-5  ${
        chat.senderId === currentId ? " flex-row-reverse" : " "
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
        id={`${chat.id}_mainCard`}
        ref={setReferenceElement}
        className={`messageDiv relative box-border max-w-[80%] break-words rounded-lg p-2 text-left 
        ${
          SamePrevSender &&
          chat.senderId !== User.id &&
          ChatObject.activeChatType === "group" &&
          "ml-[38px]"
        }
        ${
          !SamePrevSender &&
          ` ${
            chat.senderId !== User.id ? "rounded-tl-none" : "rounded-tr-none"
          } `
        }
        ${
          activeIndexId === chat.id &&
          `${
            chat.senderId === User.id
              ? "pulse-bg-user"
              : ` ${
                  theme === "dark" || theme === "system"
                    ? "pulse-bg-notUser-dark"
                    : "pulse-bg-notUser-light"
                }  `
          }`
        }  ${
          chat.senderId === User.id
            ? "ml-2   bg-accent-blue text-right text-white"
            : "mr-2  bg-[#ffffff] text-left text-black dark:bg-[#252d35] dark:text-white"
        } ${
          (chat.type === "pic/video" ||
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
        {chat.isForwarded && (
          <div className="text-muted mb-1 flex items-center justify-start text-start text-[11px]">
            <i className="mr-1 scale-x-[-1]">
              <HiReply />
            </i>
            forwarded
          </div>
        )}
        {!SamePrevSender && (
          <span
            className={`absolute top-0 
          ${
            chat.senderId !== User.id
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
            className={`max-h-[80px] truncate rounded-lg p-2 text-start 
             ${
               chat.senderId === User.id
                 ? "bg-blue-400"
                 : "bg-light-secondary dark:bg-gray-500"
             } `}
            onClick={() => {
              const scrollToElement = document.getElementById(
                `${chat.replyObject.replyTextId}_mainCard`
              );
              const className =
                chat.replyObject.replyUserId === User.id
                  ? "pulse-bg-user"
                  : theme === "light"
                  ? "pulse-bg-notUser-light"
                  : "pulse-bg-notUser-dark";
              if (scrollToElement) {
                scrollToElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });

                scrollToElement.classList.remove(className);
                void scrollToElement.offsetWidth;
                scrollToElement.classList.add(className);
              }
            }}
          >
            <p className="text-[9px] ">{chat.replyObject.replyDisplayName}</p>
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
          className={`items- flex w-full flex-col ${
            chat.senderId !== User.id && "justify-end"
          } ${
            (chat.type === "pic/video" ||
              chat.type === "image" ||
              chat.type === "video") &&
            !chat.text &&
            "absolute bottom-3 right-4 z-30"
          }`}
        >
          <p
            className={`max-w-[400px] break-words text-start ${
              chat.type === "poll" && "hidden"
            }`}
          >
            {chat.text?.split(" ").map((word, index) => (
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
                className={`text-muted mt-1 text-xs ${
                  chat.senderId !== User.id && "mr-3"
                } `}
              >
                {formatTimeForMessages(chat.timestamp)}
              </div>
              {chat.senderId === User.id && (
                <i className="mx-1 mr-3 text-sm">
                  {chat.status === "pending" && <BiTimeFive />}
                  {chat.status === "sent" && <BsCheckLg />}
                  {chat.status === "received" && <BsCheckAll />}
                  {chat.status === "seen" && <BsCheckAll color="#000001" />}
                </i>
              )}
            </div>
          </div>
        </div>

        {chat.reactions?.length > 0 && (
          <div
            ref={animationParent}
            onClick={() => {}}
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
        className={` flex items-center ${
          chat.senderId === currentId ? "left-0 " : "right-0 "
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
              className="clickEvent bg-primary z-[100] w-[280px] rounded-lg p-2"
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              <h1 className="mb-2 flex items-center justify-start text-lg font-medium">
                Forward message
              </h1>
              <p className="text-muted mb-2 text-sm">
                Select up to 5 contacts{" "}
              </p>

              <div ref={selectedUserHeight}>
                <ul
                  ref={animationParent}
                  className={`${
                    selectedUsers.length === 0 && "hidden h-0"
                  }  scrollBar mb-2 flex max-h-[116px]
                   flex-wrap items-center overflow-y-auto rounded-lg bg-light-secondary 
                    py-1 dark:bg-dark-secondary `}
                >
                  {selectedUsers.map((user) => (
                    <li
                      key={user.id}
                      id={user.id}
                      className="parent-div text-bold relative m-1 flex items-center whitespace-nowrap
                    rounded-lg bg-accent-blue px-2 py-1 text-center text-[12px] font-semibold "
                    >
                      <img
                        className="mr-1 h-5 rounded-full"
                        src={user.senderDisplayImg}
                        alt=""
                      />
                      {user.senderDisplayName}
                    </li>
                  ))}
                </ul>
              </div>
              <input
                type="text"
                className=" mb-2 w-full rounded-lg bg-light-secondary px-3 py-2 placeholder-muted-light
                outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {selectedUsers.length > 0 && (
                <button
                  className={` ${
                    isforwarding && "cursor-wait"
                  } mb-4 w-full rounded-lg bg-accent-blue py-2`}
                  onClick={() => {
                    if (isforwarding) return;
                    handleMessageForward();
                  }}
                >
                  {isforwarding ? (
                    <div className="flex items-center justify-center">
                      <i className="mr-1">
                        <CircularProgress variant="plain" size="sm" />
                      </i>
                      Forwarding...
                    </div>
                  ) : (
                    <>
                      Forward to {selectedUsers.length} contact
                      {selectedUsers.length === 1 ? "" : "s"}
                    </>
                  )}
                </button>
              )}
              <div
                style={divStyles}
                className="scrollBar overflow-auto"
                id="scrollContacts"
              >
                {[...contacts]
                  .filter((contact) =>
                    contact.senderDisplayName
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((contact) => (
                    <div
                      className="hover:bg-hover flex cursor-pointer items-center justify-between rounded-lg px-2 py-2"
                      onClick={() => {
                        if (selectedUsers.length >= 5) return;
                        const index = selectedUsers.findIndex(
                          (user) =>
                            user.otherParticipant === contact.otherParticipant
                        );

                        if (index === -1) {
                          setselectedUsers([...selectedUsers, contact]);
                        } else {
                          const updatedUsers = selectedUsers.filter(
                            (user) =>
                              user.otherParticipant !== contact.otherParticipant
                          );
                          setselectedUsers(updatedUsers);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <Img
                          src={contact.senderDisplayImg}
                          styles="w-[35px] h-[35px] rounded-full mr-1"
                          imgStyles="rounded-full "
                          type={contact.type}
                          groupSize="70"
                          personalSize="45"
                        />
                        {contact.senderDisplayName}
                      </div>
                      <input
                        type="checkbox"
                        name=""
                        id=""
                        checked={selectedUsers.some(
                          (c) => c.otherParticipant === contact.otherParticipant
                        )}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
          <div
            className={` relative ${chat.status === "pending" && "hidden"}  flex cursor-pointer items-center justify-center
             rounded-r-full rounded-l-full bg-light-primary px-1 py-[6px] text-muted-light group-hover:opacity-100
             dark:bg-dark-primary dark:text-muted-dark md:opacity-0
              ${chat.senderId === currentId && "flex-row-reverse"}`}
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
            }}
          >
            <i
              className={` md:transition-all md:duration-150 ${
                chat.senderId === currentId &&
                "ml-2 flex-row-reverse group-hover:ml-2 md:ml-0"
              }  ${chat.senderId !== currentId && " group-hover:mr-2 "} `}
            >
              <BsChevronDown size={10} />
            </i>
            <i className="transition-opacity duration-150 group-hover:opacity-100 md:opacity-0">
              <BsEmojiSmile />
            </i>
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
          overflow: "hidden",
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
               hover:dark:text-white ${
                 chat.reactions?.find((reaction) => reaction.id === User.id)
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
        {chat.senderId === User.id && (
          <MenuItem
            sx={{ borderRadius: "8px" }}
            className="clickEvent cursor-pointer rounded-lg px-4 py-2  text-black hover:bg-hover-light
                 dark:text-white hover:dark:bg-hover-dark hover:dark:text-white"
            onClick={handleMessageDelete}
          >
            <RiDeleteBinLine />
            <p className="ml-2"> Delete</p>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default MessageCard;
