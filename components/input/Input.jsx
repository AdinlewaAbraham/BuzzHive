import {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { sendGroupMessage } from "@/utils/groupUtils/sendGroupMessage";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
import { UserContext } from "../App";
import { ImAttachment } from "react-icons/im";
import { RiGalleryLine } from "react-icons/ri";
import { TiChartBarOutline } from "react-icons/ti";
import { AiOutlineSend, AiOutlineFile } from "react-icons/ai";
import { ImCross } from "react-icons/im";
import { downScalePicVid } from "@/utils/messagesUtils/downScalePicVid";
import MediaInput from "./MediaInput";
import PollInput from "./PollInput";
import FileInput from "./FileInput";
import { Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
const Input = () => {
  const { User } = useContext(UserContext);
  const {
    ChatObject,
    setChats,
    ReplyObject,
    setReplyObject,
    setreplyDivHeight,
    setallowScrollObject,
  } = useContext(SelectedChannelContext);
  const [message, setmessage] = useState("");
  const [showMediaPicker, setshowMediaPicker] = useState(false);
  const [showPollInput, setshowPollInput] = useState(false);
  const [showSendContact, setshowSendContact] = useState(false);
  const [file, setfile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [picVidmedia, setpicVidmedia] = useState(null);
  const [blurredPicVidmedia, setblurredPicVidmedia] = useState(null);

  const senderid = User.id;
  const elementRef = useRef(null);
  async function handleSend() {
    if (!message || message.trim().length === 0) return;
    const replyObject = {
      replyText: ReplyObject.ReplyText,
      replyTextId: ReplyObject.ReplyTextId,
      replyDisplayName: ReplyObject.displayName,
      replyUserId: ReplyObject.ReplyUserId,
    };
    const time = new Date();

    let currentTime = new Date().getTime();

    let seconds = Math.floor(currentTime / 1000);
    let nanoseconds = (currentTime % 1000) * 10 ** 6;

    let timestamp = { seconds: seconds, nanoseconds: nanoseconds };
    const messageObj = {
      text: message,
      senderId: senderid,
      timestamp,
      reactions: [],
      status: "pending",
      id: "propId",
    };
    setallowScrollObject({
      scrollTo: "bottom",
      scrollBehaviour: "smooth",
      allowScroll: true,
    });
    setChats((prevChats) => {
      [...prevChats, messageObj];
      return [...prevChats, messageObj];
    });
    if (ChatObject.activeChatType == "group") {
      await sendGroupMessage(
        User.id,
        User.photoUrl,
        ChatObject.activeChatId,
        message,
        User.name,
        ReplyObject.ReplyTextId ? "reply" : "regular",
        time,
        ReplyObject.ReplyTextId ? replyObject : {},
        null,
        null,
        clearMessage
      );
    } else if (ChatObject.activeChatType == "personal") {
      await sendMessage(
        senderid,
        ChatObject.otherUserId,
        message,
        senderid,
        User.name,
        ReplyObject.ReplyTextId ? "reply" : "regular",
        time,
        ReplyObject.ReplyTextId ? replyObject : {},
        null,
        null,
        clearMessage
      );
    }
  }
  function clearMessage() {
    setmessage("");
  }

  function handleInputKeyDown(e) {
    if (e.key == "Enter") {
      handleSend();
    }
  }

  useEffect(() => {
    if (elementRef.current) {
      const height = elementRef.current.offsetHeight;
      "Element height:", height;
      setreplyDivHeight(height);
    }
  }, [ReplyObject]);
  const popupRef = useRef(null);

  const handleClickOutside = useCallback(
    (file, picVidmedia, showPollInput, showSendContact, e) => {
      if (
        (file || picVidmedia || showPollInput || showSendContact) &&
        !e.target.closest(".detectMe")
      ) {
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }

      if (!e.target.closest(".MediaPicker")) {
        setshowMediaPicker(false);
      }
    },
    []
  );

  useLayoutEffect(() => {
    const handleClick = (e) => {
      handleClickOutside(file, picVidmedia, showPollInput, showSendContact, e);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [
    handleClickOutside,
    file,
    picVidmedia,
    showPollInput,
    showSendContact,
    showPopup,
  ]);
  return (
    <>
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="Poll-input fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-[35%] min-w-[300px] max-w-[500px] rounded-lg bg-light-secondary dark:bg-dark-secondary"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="bg-primary rounded-t-lg p-5">
                <h1 className="text-lg font-medium md:text-xl">
                  Discard unsent message
                </h1>
                <p className="mt-1 text-sm">
                  {showPollInput
                    ? "Your poll, including attached options and settings, will not be sent if you leave this screen."
                    : `Your message, including attached ${
                        file ? "file" : "media"
                      }, will not be sent if you
                  leave this screen`}
                </p>
              </div>
              <div className="z-[99] flex flex-col rounded-lg p-5 md:flex-row [&>button]:w-full [&>button]:rounded-lg [&>button]:py-2">
                <button
                  className="detectMe mr-1  bg-light-primary p-4 dark:bg-dark-primary"
                  onClick={() => {
                    setShowPopup(false);
                  }}
                >
                  return to {file ? "file" : showPollInput ? "poll" : "media"}
                </button>
                <button
                  className="mt-2 bg-blue-500 p-4 md:mt-0"
                  onClick={() => {
                    setfile(null);
                    setpicVidmedia(null);
                    setblurredPicVidmedia(null);
                    setShowPopup(false);
                    setshowPollInput(false);
                    setshowSendContact(false);
                  }}
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {ReplyObject.ReplyTextId && (
        <div
          className="ml-[1px] max-h-[90px] truncate px-10 py-2 dark:bg-[#1d232a]"
          ref={elementRef}
        >
          <div className="flex items-center justify-between rounded-lg bg-gray-500 p-1 ">
            <div>
              <p>{ReplyObject.displayName}</p>
              <p>{ReplyObject.ReplyText}</p>
            </div>
            <div
              className="cursor-pointer"
              onClick={() => {
                setReplyObject({
                  ReplyText: "",
                  ReplyTextId: "",
                  displayName: "",
                });
              }}
            >
              <ImCross />
            </div>
          </div>
        </div>
      )}
      {(file || picVidmedia || showPollInput || showSendContact) && (
        <div className="fixed inset-0 "></div>
      )}
      <div className="flex items-center justify-between bg-[#fcfcfc] px-[4px] py-[8px] dark:bg-[#1d232a] md:ml-[1px]">
        <div className="detectMe">
          {picVidmedia && (
            <MediaInput
              blurredPicVidmedia={blurredPicVidmedia}
              picVidmedia={picVidmedia}
              setblurredPicVidmedia={setblurredPicVidmedia}
              setpicVidmediaToNull={() => {
                setpicVidmedia(null);
              }}
            />
          )}
          {file && <FileInput file={file} setfile={setfile} />}
        </div>
        {showPollInput && (
          <motion.div
            initial={{ opacity: 0,  }}
            animate={{ opacity: 1,  }}
            exit={{ opacity: 0, }}
          >
            <PollInput setshowPollInputFunc={() => setshowPollInput(false)} />
          </motion.div>
        )}
        <div className="relative flex">
          <div
            key={"showMediaPicker"}
            className={` detectme MediaPicker
                ${
                  (showMediaPicker ||
                    file ||
                    picVidmedia ||
                    showPollInput ||
                    showSendContact) &&
                  "bg-hover-light dark:bg-hover-dark"
                } 
                 cursor-pointer rounded-lg bg-transparent p-[10px] px-[15px]
                 text-muted-light hover:bg-hover-light dark:text-muted-dark dark:hover:bg-hover-dark`}
            onClick={() => {
              if (file || picVidmedia || showPollInput || showSendContact)
                return;
              setshowMediaPicker(!showMediaPicker);
            }}
          >
            <ImAttachment />
          </div>
          <AnimatePresence>
            {showMediaPicker && (
              <motion.div
                className="detectMe MediaPicker absolute bottom-[52px] z-[99]  w-[160px] rounded-lg
               bg-light-primary px-1 py-2
                text-[15px] dark:bg-dark-primary  [&>div>div>svg]:mr-2 [&>div>div]:flex
               [&>div>div]:items-center [&>div>div]:py-1 [&>div>div]:px-2 
               [&>div>label>svg]:mr-2 [&>div]:cursor-pointer [&>div]:rounded-md hover:[&>div]:bg-hover-light
                dark:hover:[&>div]:bg-hover-dark"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="file-input px-0 py-0">
                  <label className="flex h-full w-full cursor-pointer items-center py-1 px-2">
                    <i className="mr-2 text-muted-light dark:text-muted-dark">
                      <AiOutlineFile />
                    </i>
                    File
                    <input
                      type="file"
                      className="hidden h-full w-full cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files[0].size > 20971520) {
                          alert("Selected file exceeds the 20MB limit.");
                          e.target.value = null;
                          return;
                        }
                        e.target.files[0];
                        setfile(e.target.files[0]);
                        e.target.files[0];
                        setshowMediaPicker(false);
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label className="flex h-full w-full cursor-pointer items-center py-1 px-2">
                    <i className="mr-2 text-muted-light dark:text-muted-dark">
                      <RiGalleryLine />
                    </i>
                    Photo or video
                    <input
                      type="file"
                      className="hidden h-full w-full cursor-pointer"
                      onChange={async (e) => {
                        if (e.target.files[0].size > 20971520) {
                          alert("Selected file exceeds the 20MB limit.");
                          e.target.value = null;
                          return;
                        }
                        if (e.target.files[0].type.startsWith("image")) {
                          const blob = await downScalePicVid(
                            e.target.files[0],
                            0.7,
                            1,
                            0
                          );
                          const downscaledBlod = await downScalePicVid(
                            blob,
                            0.35,
                            0.1,
                            2
                          );
                          setpicVidmedia(blob);
                          setblurredPicVidmedia(downscaledBlod);
                        } else {
                          const videoObj = e.target.files[0];
                          videoObj;
                          setpicVidmedia(videoObj);
                          setblurredPicVidmedia(null);
                        }
                        setshowMediaPicker(false);
                      }}
                      accept="image/png, image/jpeg, video/mp4"
                    />
                  </label>
                </div>
                <div
                  className="Poll-input"
                  onClick={() => {
                    setshowPollInput(true);
                    setshowMediaPicker(false);
                  }}
                >
                  <div>
                    <i className="mr-2 rotate-90 text-muted-light dark:text-muted-dark">
                      <TiChartBarOutline />
                    </i>
                    Poll
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <input
          type="text"
          className="w-full  bg-transparent px-4 py-2 placeholder-muted-light outline-none dark:placeholder-muted-dark"
          placeholder="Type a message"
          value={message}
          onKeyDown={handleInputKeyDown}
          onChange={(e) => {
            setmessage(e.target.value);
          }}
        />
        <div
          onClick={() => {
            handleSend();
          }}
          className="cursor-pointer rounded-lg bg-transparent p-[10px] px-[15px] text-muted-light hover:bg-hover-light dark:text-muted-dark dark:hover:bg-hover-dark"
        >
          <AiOutlineSend />
        </div>
      </div>
    </>
  );
};

export default Input;
