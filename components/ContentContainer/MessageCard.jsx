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
import Badge from "../Badge";
import EmojiReactionsBoard from "./EmojiReactionsBoard";

const MessageCard = ({
  chat,
  searchText,
  activeIndexId,
  searchedMessages,
  scrollContainerRef,
  setshowProfile,
  setAboutProfleChatObject,
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
  const [showEmojiReactions, setshowEmojiReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [emojiAnchor, setemojiAnchor] = useState(null);
  const [SamePrevSender, setSamePrevSender] = useState(true);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const [forwardMessageModal, setforwardMessageModal] = useState(false);
  const [contacts, setcontacts] = useState([]);
  const [selectedUsers, setselectedUsers] = useState([]);
  const [Height, setHeight] = useState(0);
  const [isforwarding, setisforwarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emojiReactionBoardRef, setemojiReactionBoardRef] = useState(null);
  const [emojiReactionBoardPopperRef, setemojiReactionBoardPopperRef] =
    useState(null);

  const { styles: popperStyles1, attributes: popperAttributes1 } = usePopper(
    referenceElement,
    popperElement,
    {
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
    }
  );
  const { styles: popperStyles2, attributes: popperAttributes2 } = usePopper(
    emojiReactionBoardRef,
    emojiReactionBoardPopperRef,
    {
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
    }
  );

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
    const clickFunction = (e) => {
      if (!e.target.closest(".clickEvent")) {
        setforwardMessageModal(false);
      }
      if (!e.target.closest(".showEmojiReactionsBoard")) {
        setshowEmojiReactions(false);
      }
      if (!e.target.closest(".MenuLists")) {
        setShowMenu(false);
      }
    };
    window.addEventListener("click", clickFunction);

    return () => window.removeEventListener("click", clickFunction);
  }, []);
  const selectedUserHeight = useRef(null);
  useLayoutEffect(() => {
    if (!selectedUserHeight.current) return;
    setHeight(selectedUserHeight.current.clientHeight);
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
    const count = JSON.parse(
      sessionStorage.getItem("activeChatRoomUnreadMessageCount")
    );
    return (
      <div className="flex w-full items-center justify-center" id="unreadId">
        <div className="my-2 flex justify-center rounded-lg dark:bg-black bg-white p-2 text-center">
          {`Unread Messages`}
        </div>
      </div>
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
      action: () => {
        console.log(chat.text);
        navigator.clipboard.writeText(chat.text);
      },
    },
  ];

  const handleMenuItemClick = (item) => {
    item.action();
    setShowMenu(null);
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
    setShowMenu(null);
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

      await Promise.all([deleteDocPromise, deleteFilePromise]);
    } else {
      await deleteDoc(docRef);
    }
  };

  const divStyles = {
    maxHeight: `calc(100vh - 285px - ${Height}px - ${
      selectedUsers.length > 0 ? 120 : 0
    }px)`,
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

  const handleShowUserProfile = () => {
    const user1Id = User.id;
    const user2Id = chat.senderId;

    setAboutProfleChatObject({
      activeChatId: user1Id > user2Id ? user1Id + user2Id : user2Id + user1Id,
      activeChatType: "personal",
      otherUserId: user2Id,
      photoUrl: chat.senderDisplayImg,
      displayName: chat.senderDisplayName,
    });
    setshowProfile(true);
  };
  const isActivePopup = showMenu || forwardMessageModal || showReactEmojiTray;
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
          <div
            onClick={() => {
              handleShowUserProfile();
            }}
            className="cursor-pointer"
          >
            <Img
              src={chat.senderDisplayImg}
              styles=" w-[30px] h-[30px] rounded-full mr-2 bg-[#dfe5e7] dark:bg-gray-500 "
              type="personnal"
              personalSize="40"
              imgStyles=" rounded-full "
            />
          </div>
        )}
      <div
        id={`${chat.id}_mainCard`}
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
            <p
              className={`text-muted text-[11px] ${
                (chat.type === "pic/video" ||
                  chat.type === "image" ||
                  chat.type === "video" ||
                  chat.type === "reply") &&
                "mb-1 "
              } flex cursor-pointer items-center font-medium transition-colors duration-300 hover:text-white `}
              onClick={() => {
                handleShowUserProfile();
              }}
            >
              {chat.senderDisplayName}
              <Badge id={chat.senderId} styles=" ml-[4px]" />
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
                <ImageComponent chat={chat} />
              ) : (
                <VideoComponent chat={chat} />
              )}
            </>
          </div>
        )}
        {chat.type === "poll" && (
          <PollComponent
            PollObject={chat}
            searchText={searchText}
            searchedMessages={searchedMessages}
          />
        )}
        <div
          className={`items- flex w-full flex-col ${
            chat.senderId !== User.id && "justify-end"
          } ${
            (chat.type === "pic/video" ||
              chat.type === "image" ||
              chat.type === "video") &&
            !chat.text &&
            "absolute bottom-3 right-4 z-10"
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
        {showEmojiReactions && (
          <div
            className="bg-primary showEmojiReactionsBoard absolute top-0 left-0
             z-40 rounded-lg "
            ref={setemojiReactionBoardPopperRef}
            style={popperStyles2.popper}
            {...popperAttributes2.popper}
          >
            <EmojiReactionsBoard chat={chat} />
          </div>
        )}
        {chat.reactions?.length > 0 && (
          <div
            ref={setemojiReactionBoardRef}
            className={`showEmojiReactionsBoard absolute bottom-[-20px] right-0  cursor-pointer select-none
            items-center  rounded-lg bg-light-primary p-[5px] dark:bg-dark-primary`}
            onClick={(e) => setshowEmojiReactions(true)}
          >
            <div ref={animationParent} className="flex">
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
          </div>
        )}
      </div>

      <div
        className={` flex items-center ${
          chat.senderId === currentId ? "left-0 " : "right-0 "
        }`}
      >
        <div className="relative">
          <AnimatePresence>
            {showReactEmojiTray && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                id="emojiBoard"
                className="z-[100] w-[280px] overflow-hidden "
                ref={setPopperElement}
                style={popperStyles1.popper}
                {...popperAttributes1.popper}
              >
                <EmojiPicker
                  setshowReactEmojiTray={setshowReactEmojiTray}
                  addEmojiToLastUsedEmojiTray={addEmojiToLastUsedEmojiTray}
                  handleEmojiReaction={handleEmojiReaction}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {forwardMessageModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="clickEvent bg-primary z-[30] w-[280px] overflow-y-hidden rounded-lg p-3"
                ref={setPopperElement}
                style={popperStyles1.popper}
                {...popperAttributes1.popper}
              >
                <div className="min-h-[250px]">
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
                         p-1 dark:bg-dark-secondary `}
                    >
                      {selectedUsers.map((user) => (
                        <li
                          key={user.id}
                          id={user.id}
                          className="parent-div text-bold relative m-1 flex items-center whitespace-nowrap
                          rounded-lg bg-accent-blue px-1 py-0.5 text-center text-[12px] font-semibold "
                        >
                          <Img
                            src={user.senderDisplayImg}
                            styles="rounded-full h-5 w-5 "
                            imgStyles="rounded-full h-5 w-5 "
                            personalSize="50"
                            type="personnal"
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
                            const index = selectedUsers.findIndex(
                              (user) =>
                                user.otherParticipant ===
                                contact.otherParticipant
                            );

                            if (index === -1) {
                              if (selectedUsers.length >= 5) return;
                              setselectedUsers([...selectedUsers, contact]);
                            } else {
                              const updatedUsers = selectedUsers.filter(
                                (user) =>
                                  user.otherParticipant !==
                                  contact.otherParticipant
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
                              (c) =>
                                c.otherParticipant === contact.otherParticipant
                            )}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`MenuLists relative ${
              chat.status === "pending" && "hidden"
            }  flex cursor-pointer items-center justify-center
             rounded-r-full rounded-l-full bg-light-primary px-1 py-[6px] text-muted-light group-hover:opacity-100
             dark:bg-dark-primary dark:text-muted-dark md:opacity-0
             ${isActivePopup && "md:opacity-100"}
            
              ${chat.senderId === currentId && "flex-row-reverse"}`}
            onClick={(e) => {
              setShowMenu(e.currentTarget);
            }}
            ref={setReferenceElement}
          >
            <i
              className={` md:transition-all md:duration-150 ${
                chat.senderId === currentId
                  ? `ml-2 flex-row-reverse md:ml-0 md:group-hover:ml-2 ${
                      isActivePopup && "md:ml-2"
                    }`
                  : ` group-hover:mr-2 ${isActivePopup && "md:mr-2"}`
              }  `}
            >
              <BsChevronDown size={10} />
            </i>
            <i
              className={`transition-opacity duration-150 
            group-hover:opacity-100 md:opacity-0  ${
              isActivePopup && "md:opacity-100"
            }`}
            >
              <BsEmojiSmile />
            </i>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showMenu && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="MenuLists bg-primary  z-50 overflow-y-hidden rounded-lg p-2 [&>li]:flex [&>li]:items-center"
            ref={setPopperElement}
            style={popperStyles1.popper}
            {...popperAttributes1.popper}
          >
            <li
              className="hover:dark:light-primary flex cursor-default border-none p-2 text-black
                 hover:bg-hover-light dark:text-white hover:dark:bg-dark-primary  "
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
                  setShowMenu(null);
                  setshowReactEmojiTray(true);
                  setemojiAnchor(e.currentTarget);
                }}
                className="emoji-picker hover:dark:light-primary cursor-pointer rounded-lg p-1
                   text-black hover:bg-hover-light dark:text-white hover:dark:bg-hover-dark hover:dark:text-white "
              >
                <AiOutlinePlus size="23" />
              </i>
            </li>
            {menuItems.map((item) => (
              <li
                key={item.label}
                onClick={() => {
                  handleMenuItemClick(item);
                }}
                className="clickEvent cursor-pointer rounded-lg p-2  text-black hover:bg-hover-light
                 dark:text-white hover:dark:bg-hover-dark hover:dark:text-white"
              >
                {item.icon} <p className="ml-2">{item.label}</p>
              </li>
            ))}
            {chat.senderId === User.id && (
              <li
                sx={{ borderRadius: "8px" }}
                className="clickEvent cursor-pointer rounded-lg p-2  text-black hover:bg-hover-light
                 dark:text-white hover:dark:bg-hover-dark hover:dark:text-white"
                onClick={handleMessageDelete}
              >
                <RiDeleteBinLine />
                <p className="ml-2"> Delete</p>
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageCard;
