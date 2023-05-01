import { useContext, useState, useRef, useEffect } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { sendGroupMessage } from "@/utils/groupUtils/sendGroupMessage";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
import { UserContext } from "../App";
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";

import EmojiPicker from "emoji-picker-react";
import { AiOutlineSend } from "react-icons/ai";
import { ImCross } from "react-icons/im";

const Input = () => {
  const { User } = useContext(UserContext);
  const {
    ChatObject,
    setChatObject,
    setChats,
    ReplyObject,
    setReplyObject,
    setreplyDivHeight,
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
            <ul className="absolute bottom-[65px] border w-[120px]">
              {["file", "Photo or Video", "Poll", "Contact", "Drawing"].map(
                (t) => (
                  <li>{t}</li>
                )
              )}
            </ul>
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
