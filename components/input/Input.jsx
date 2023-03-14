import { useContext, useState } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { sendGroupMessage } from "@/utils/groupUtils/sendGroupMessage";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
import { UserContext } from "../App";

const Input = () => {
  const {User} = useContext(UserContext)
  const { ChatObject, setChatObject, setChats } = useContext(
    SelectedChannelContext
  );
  const senderid = User.uid
  function handleSend() {
    if (ChatObject.activeChatType == "group") {
      const time = new Date();
      const message = {
        text: ChatObject.message,
        senderId: senderid,
        timeStamp: time,
        reaction: "love",
      };
      setChats((prevChats) => [...prevChats, message]);
      sendGroupMessage(User.uid, ChatObject.activeChatId, ChatObject.message, time);
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
      console.log(
        senderid)
      console.log(
        ChatObject.otherUserId)
    }
  }
  return (
    <div>
      {" "}
      <input
        type="text"
        className=" fixed w-full bg-white bottom-0 text-black  px-4 py-2"
        value={ChatObject.message}
        onChange={(e) => {
          setChatObject({ ...ChatObject, message: `${e.target.value}` });
        }}
      />
      <button
        className="fixed bottom-0 right-0 text-black bg-red-800 px-4 py-2"
        onClick={() => {
          handleSend();
        }}
      >
        send
      </button>
    </div>
  );
};

export default Input;
