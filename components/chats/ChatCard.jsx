import { useContext, useState } from "react";
import { getConversation } from "@/utils/conversations/getConversation";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import SelectedChannelContext from "@/context/SelectedChannelContext ";


const ChatCard = ({
  img,
  name,
  sender,
  message,
  timeStamp,
  id,
  type,
  otherUserId,
}) => {
  const { setChats, setLoading, ChatObject, setChatObject } = useContext(
    SelectedChannelContext
  );
  const handleChatClick = async () => {
    setLoading(true);
    setChatObject({
      ...ChatObject,
      activeChatId: `${id}`,
      activeChatType: `${type}`,
      otherUserId: `${otherUserId}`,
      photoUrl: `${img}`,
      displayName: `${name}`,
    });
    if (type == "group") {
      const q = query(collection(db, "groups", id, "messages"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let chats = [];
        snapshot.forEach((doc) => {
          chats.push(doc.data());
        });
        setChats(chats); // Update the state with the latest data
      });
      setLoading(false);
      return () => unsubscribe();
    } else if (type == "personal") {
      const q = query(collection(db, "conversations", id, "messages"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let chats = [];
        snapshot.forEach((doc) => {
          chats.push(doc.data());
        });
        setChats(chats); // Update the state with the latest data
      });
      setLoading(false);
      return () => unsubscribe();
    }
    setLoading(false);
  };
  return (
    <div
      className="flex flex-row justify-between align-middle items-center px-4 py-3 cursor-pointer
        rounded-xl hover:bg-gray-600 transition-all duration-100 ease-linear border w-[100%]"
      onClick={() => {
        handleChatClick();
      }}
    >
      <div className="flex flex-row  align-middle items-center">
        <div className="w-14 h-14 mr-3">
          <img className="object-cover w-full h-full" src={img} alt="hello" />
        </div>
        <div>
          <h3>{name}</h3>
          <div className="flex flex-row truncate border">
            <p>{sender}</p>: <p> {message}</p>
          </div>
        </div>
      </div>
      <p className="">{timeStamp}</p>
    </div>
  );
};

export default ChatCard;
