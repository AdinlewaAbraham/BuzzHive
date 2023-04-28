import { useContext, useState, useRef, useEffect } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { sendGroupMessage } from "@/utils/groupUtils/sendGroupMessage";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
import { UserContext } from "../App";
import { BsEmojiSmile } from "react-icons/bs";

import EmojiPicker from "emoji-picker-react";
import { AiOutlineSend } from "react-icons/ai";

const Input = () => {
  const { User } = useContext(UserContext);
  const { ChatObject, setChatObject, setChats } = useContext(
    SelectedChannelContext
  );
  const [message, setmessage] = useState("");
  const senderid = User.id;

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
        "regular",
        time
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
      sendMessage(
        senderid,
        ChatObject.otherUserId,
        message,
        senderid,
        "regular",
        time
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
  return (
    <>
      <div className="flex dark:bg-[#1d232a] items-center justify-between px-[4px] py-[8px] w-full">
        <div className="relative">
          <div
            className="detectme bg-red-600 p-[10px] bg-transparent text-[#aaabaf] hover:text-white "
            onClick={() => setshowEmojiPicker(!showEmojiPicker)}
          >
            <BsEmojiSmile />
          </div>
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
