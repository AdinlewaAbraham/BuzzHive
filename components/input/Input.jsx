import { useContext, useState } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { sendGroupMessage } from "@/utils/groupUtils/sendGroupMessage";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
const Input = () => {
  const { ChatObject, setChatObject, setChats } = useContext(
    SelectedChannelContext
  );
  const [senderid, setsenderid] = useState("1");
  function handleSend() {
    if (ChatObject.activeChatType == "group") {
      sendGroupMessage("1", ChatObject.activeChatId, ChatObject.message);
    } else if (ChatObject.activeChatType == "personal") {
      const time = new Date();
      const message = {
        text: ChatObject.message,
        senderId: senderid,
        timestamp: time,
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
  return (
    <div>
      {" "}
      <input
        type="text"
        className="fixed w-20 bg-blue-200 bottom-20 text-black  px-4 py-2"
        onChange={(e) => {
          setsenderid(e.target.value);
        }}
      />
      <input
        type="text"
        className="fixed w-full bg-white bottom-0 text-black  px-4 py-2"
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
