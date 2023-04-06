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
  const senderid = User.uid;

  function handleSend() {
    if (
      ChatObject.message.replace(" ", "") == "" &&
      ChatObject.message.replace(" ", "")
    )
      return null;
    if (ChatObject.activeChatType == "group") {
      const time = new Date();
      const message = {
        text: ChatObject.message,
        senderId: senderid,
        timeStamp: time,
        reaction: "love",
      };
      setChats((prevChats) => [...prevChats, message]);
      sendGroupMessage(
        User.uid,
        ChatObject.activeChatId,
        ChatObject.message,
        time
      );
    } else if (ChatObject.activeChatType == "personal") {
      const time = new Date();
      const message = {
        text: ChatObject.message,
        senderId: senderid,
        timeStamp: time,
        reaction: "love",
      };
      setChats((prevChats) => [...prevChats, message]);
      sendMessage(
        senderid,
        ChatObject.otherUserId,
        ChatObject.message,
        senderid,
        time
      );
    }
  }

  const [showEmojiPicker, setshowEmojiPicker] = useState(false);

  useEffect(() => {
    // add event listener to document object
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
  return (
    <>
      <div className="flex bg-white items-center  px-[4px] py-[8px] fixed bottom-0 justify-start">
        <div className="relative">
          <div
            className="detectme bg-red-600 p-[10px] bg-transparent"
            onClick={() => setshowEmojiPicker(!showEmojiPicker)}
          >
            <BsEmojiSmile color="black" />
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
          className="text-black  px-4 py-2 bg-transparent w-full outline-none placeholder-black"
          placeholder="Type a message"
          value={ChatObject.message}
          onChange={(e) => {
            setChatObject({ ...ChatObject, message: `${e.target.value}` });
          }}
        />
        <div
          onClick={() => {
            handleSend();
          }}
          className="bg-transparent p-[10px]"
        >
          {" "}
          <AiOutlineSend color="black" />
        </div>
      </div>
    </>
  );
};

export default Input;
