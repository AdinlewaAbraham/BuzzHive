import { useContext } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { sendGroupMessage } from "@/utils/groupUtils/sendGroupMessage";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
const Input = () => {
  const { ChatObject, setChatObject } = useContext(SelectedChannelContext);
  function handleSend() {
    console.log(ChatObject.activeChatType)
    if (ChatObject.activeChatType == "group") {
    console.log("click")
      sendGroupMessage("1", ChatObject.activeChatId, ChatObject.message);
    } else if (ChatObject.activeChatType == "personal") {
        console.log("click")
        sendMessage("1", ChatObject.otherUserId, ChatObject.message, "1")
    }
  }
  return (
    <div>
      {" "}
      <input
        type="text"
        className="fixed w-full bg-white bottom-0 text-black"
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
