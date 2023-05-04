import { useContext, useState, useRef, useEffect } from "react";
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
const Input = () => {
  const { User } = useContext(UserContext);
  const {
    ChatObject,
    setChatObject,
    setChats,
    ReplyObject,
    setReplyObject,
    setreplyDivHeight,
    setpicVidmedia,
    picVidmedia,
  } = useContext(SelectedChannelContext);
  const [message, setmessage] = useState("");
  const [showMediaPicker, setshowMediaPicker] = useState(false);
  const senderid = User.id;
  const elementRef = useRef(null);

  function handleSend() {
    if (!message || message.trim().length === 0) return;
    if (ChatObject.activeChatType == "group") {
      const time = new Date();
      const messageObj = {
        text: message,
        senderId: senderid,
        timeStamp: time,
        reactions: [],
      };
      setChats((prevChats) => [...prevChats, messageObj]);
      sendGroupMessage(
        User.id,
        ChatObject.activeChatId,
        message,
        User.name,
        ReplyObject.ReplyTextId ? "reply" : "regular",
        time,
        ReplyObject.ReplyTextId
          ? {
              replyText: ReplyObject.ReplyText,
              replyTextId: ReplyObject.ReplyTextId,
              replyDisplayName: ReplyObject.displayName,
            }
          : {}
      );
    } else if (ChatObject.activeChatType == "personal") {
      const time = new Date();
      const messageObj = {
        text: message,
        senderId: senderid,
        timeStamp: time,
        reactions: [],
      };
      setChats((prevChats) => [...prevChats, messageObj]);
      console.log(User);
      console.log("ran");
      sendMessage(
        senderid,
        ChatObject.otherUserId,
        message,
        senderid,
        User.name,
        ReplyObject.ReplyTextId ? "reply" : "regular",
        time,
        ReplyObject.ReplyTextId
          ? {
              replyText: ReplyObject.ReplyText,
              replyTextId: ReplyObject.ReplyTextId,
              replyDisplayName: ReplyObject.displayName,
            }
          : {}
      );
    }
    //location.href = "#scrollToMe"
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
    console.log(ReplyObject);
  }, [ReplyObject]);

  useEffect(() => {
    console.log(elementRef.current);
    if (elementRef.current) {
      const height = elementRef.current.offsetHeight;
      console.log("Element height:", height);
      setreplyDivHeight(height);
    }
  }, [ReplyObject]);

  return (
    <>
      {ReplyObject.ReplyTextId && (
        <div
          className="px-10 py-2 dark:bg-[#1d232a] max-h-[90px] truncate ml-[1px]"
          ref={elementRef}
        >
          <div className="bg-gray-500 p-1 flex justify-between items-center rounded-lg ">
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
      <div className="flex md:ml-[1px] dark:bg-[#1d232a] items-center justify-between px-[4px] py-[8px]">
        {picVidmedia && <MediaInput />}
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
                className="detectme bg-red-600 p-[10px] bg-transparent text-[#aaabaf] hover:text-white cursor-pointer"
                onClick={onclick}
              >
                {icon}
              </div>
            );
          })}
          {showEmojiPicker && (
            <div className="fixed bottom-[60px] left-[20%] detectme ">
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
              //  onClick={() => setshowMediaPicker(false)}
              className="absolute bottom-[65px] dark:bg-black w-[160px] px-1 py-2 rounded-lg
                hover:[&>div]:bg-gray-500 [&>div]:cursor-pointer [&>div]:rounded-md
            text-[15px] [&>div>div]:flex [&>div>div]:items-center [&>div>div]:py-1 [&>div>div]:px-2 [&>div>div>svg]:mr-2 [&>div>label>svg]:mr-2"
            >
              <div className="px-0 py-0">
                <label className="flex items-center w-full h-full cursor-pointer py-1 px-2">
                  <AiOutlineFile />
                  File
                  <input
                    type="file"
                    className="hidden w-full h-full cursor-pointer"
                  />
                </label>
              </div>
              <div>
                <label className="flex items-center w-full h-full cursor-pointer py-1 px-2">
                  <RiGalleryLine />
                  Photo or video
                  <input
                    type="file"
                    className="hidden w-full h-full cursor-pointer"
                    onChange={async (e) => {
                      const blob = await downScalePicVid(e.target.files[0]);
                      console.log(blob);
                      setpicVidmedia(blob);
                    }}
                    accept="image/png, image/jpeg, video/mp4"
                  />
                </label>
              </div>
              <div>
                <div>
                  <TiChartBarOutline /> Poll
                </div>
              </div>
              <div>
                <div>
                  <CiUser />
                  Contact
                </div>
              </div>
            </div>
          )}
        </div>
        <input
          type="text"
          className="text-white  px-4 py-2 bg-transparent w-full outline-none placeholder-[#aaabaf]"
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
