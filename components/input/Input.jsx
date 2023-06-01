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
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { RiGalleryLine } from "react-icons/ri";
import { TiChartBarOutline } from "react-icons/ti";
import { CiUser } from "react-icons/ci";
import EmojiPicker from "emoji-picker-react";
import { AiOutlineSend, AiOutlineFile } from "react-icons/ai";
import { ImCross } from "react-icons/im";
import { downScalePicVid } from "@/utils/messagesUtils/downScalePicVid";
import MediaInput from "./MediaInput";
import PollInput from "./PollInput";
import FileInput from "./FileInput";
const Input = () => {
  const { User } = useContext(UserContext);
  const {
    ChatObject,
    setChats,
    ReplyObject,
    setReplyObject,
    setreplyDivHeight,
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
  function handleSend() {
    if (!message || message.trim().length === 0) return;
    const replyObject = {
      replyText: ReplyObject.ReplyText,
      replyTextId: ReplyObject.ReplyTextId,
      replyDisplayName: ReplyObject.displayName,
    };
    const time = new Date();
    const messageObj = {
      text: message,
      senderId: senderid,
      timeStamp: time,
      reactions: [],
      status: "pending",
      id: "propId",
    };
    setChats((prevChats) => {
      [...prevChats, messageObj];
      return [...prevChats, messageObj];
    });
    if (ChatObject.activeChatType == "group") {
      sendGroupMessage(
        User.id,
        ChatObject.activeChatId,
        message,
        User.name,
        ReplyObject.ReplyTextId ? "reply" : "regular",
        time,
        ReplyObject.ReplyTextId ? replyObject : {}
      );
    } else if (ChatObject.activeChatType == "personal") {
      const time = new Date();
      User;
      ("ran");
      sendMessage(
        senderid,
        ChatObject.otherUserId,
        message,
        senderid,
        User.name,
        ReplyObject.ReplyTextId ? "reply" : "regular",
        time,
        ReplyObject.ReplyTextId ? replyObject : {}
      );
    }
    document
      .getElementById("scrollToMe")
      .scrollIntoView({ behavior: "smooth" });
    setmessage("");
  }

  const [showEmojiPicker, setshowEmojiPicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest(".detectme") === null) {
        setshowEmojiPicker(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [setshowEmojiPicker]);
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
      {showPopup && (
        <div
          className="Poll-input fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
          ref={popupRef}
        >
          <div className="absolute rounded-lg bg-black p-4">
            <p>Do you want to forfeit your input?</p>
            <button
              className="bg-blue-500 p-4"
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
            <button
              className="detectMe p-4"
              onClick={() => {
                ("clicked");
                setShowPopup(false);
              }}
            >
              return to media
            </button>
          </div>
        </div>
      )}
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
      <div className="flex items-center justify-between bg-[#fcfcfc] px-[4px] py-[8px] dark:bg-[#1d232a] md:ml-[1px]">
        <div className="detectMe">
          {picVidmedia && (
            <MediaInput
              blurredPicVidmedia={blurredPicVidmedia}
              picVidmedia={picVidmedia}
              setblurredPicVidmedia={setblurredPicVidmedia}
              setpicVidmediaToNull={() => {
                setpicVidmedia(null);
                //setblurredPicVidmedia(null);
              }}
            />
          )}
          {file && <FileInput file={file} setfile={setfile} />}
        </div>
        {showPollInput && <PollInput />}
        <div className="relative flex">
          {[
            {
              icon: <BsEmojiSmile />,
              onclick: () => {
                setshowEmojiPicker(!showEmojiPicker);
              },
            },
            {
              icon: <ImAttachment />,
              onclick: () => {
                setshowMediaPicker(!showMediaPicker);
              },
            },
          ].map(({ icon, onclick }) => {
            return (
              <div
                className="detectme MediaPicker cursor-pointer bg-red-600 bg-transparent p-[10px] dark:text-[#aaabaf] dark:hover:text-white"
                onClick={onclick}
              >
                {icon}
              </div>
            );
          })}
          {showEmojiPicker && (
            <div className="detectme fixed bottom-[60px] left-[20%] ">
              <EmojiPicker
                width={"150%"}
                height={400}
                theme="dark"
                onEmojiClick={() => {
                  setshowEmojiPicker(true);
                }} /*width={}*/
              />
            </div>
          )}
          {showMediaPicker && (
            <div
              className="detectMe MediaPicker absolute bottom-[65px]  w-[160px] rounded-lg px-1 py-2 text-[15px]
                dark:bg-black [&>div>div>svg]:mr-2 [&>div>div]:flex
            [&>div>div]:items-center [&>div>div]:py-1 [&>div>div]:px-2 
            [&>div>label>svg]:mr-2 [&>div]:cursor-pointer [&>div]:rounded-md hover:[&>div]:bg-gray-500"
            >
              <div className="file-input px-0 py-0">
                <label className="flex h-full w-full cursor-pointer items-center py-1 px-2">
                  <AiOutlineFile />
                  File
                  <input
                    type="file"
                    className="hidden h-full w-full cursor-pointer"
                    onChange={(e) => {
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
                  <RiGalleryLine />
                  Photo or video
                  <input
                    type="file"
                    className="hidden h-full w-full cursor-pointer"
                    onChange={async (e) => {
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
                  <i className="mr-2 rotate-90">
                    <TiChartBarOutline />
                  </i>{" "}
                  Poll
                </div>
              </div>
            </div>
          )}
        </div>
        <input
          type="text"
          className="w-full  bg-transparent px-4 py-2 text-white placeholder-[#aaabaf] outline-none"
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
          className="bg-transparent p-[10px] text-[#aaabaf] hover:text-white "
        >
          {" "}
          <AiOutlineSend />
        </div>
      </div>
    </>
  );
};

export default Input;
