import { useContext, useState } from "react";
import { getConversation } from "@/utils/conversations/getConversation";
import { collection, onSnapshot, query, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import FaUserCircle from "react-icons/fa";
const ChatCard = ({
  img,
  name,
  sender,
  message,
  timestamp,
  id,
  type,
  otherUserId,
}) => {
  const { setChats, Chats ,setLoading, ChatObject, setChatObject } = useContext(
    SelectedChannelContext
  );
  const handleChatClick = async () => {
    console.log("start");
    setLoading(true);
    setChatObject({
      ...ChatObject,
      activeChatId: `${id}`,
      activeChatType: `${type}`,
      otherUserId: `${otherUserId}`,
      photoUrl: img,
      displayName: `${name}`,
    });

    // checks local storage for cached chats
    if (localStorage.getItem("Chats")) {
      console.log("checking local storage")
      const myArrayString = localStorage.getItem("Chats");
      const myArray = JSON.parse(myArrayString);
    } else {
      console.log("fetching from sever ")
      let q;
      if (type === "group") {
        q = query(collection(db, "groups", id, "messages"));
      } else if (type === "personal") {
        q = query(collection(db, "conversations", id, "messages"));
      }
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        let chats = [];
        const promises = [];
        for (const doc of snapshot.docs) {
          let chat = doc.data();
          const reactionsRef = collection(doc.ref, "reactions");
          const promise = getDocs(reactionsRef).then((querySnapshot) => {
            let reactionsArray = [];
            querySnapshot.forEach((doc) => {
              reactionsArray.push(doc.data());
            });
            chat.reactions = reactionsArray;
          });
          promises.push(promise);
          chats.push(chat);
        }
        await Promise.all(promises);
        setChats(chats);
      });
      setLoading(false);
      return () => unsubscribe();
    }
      console.log("end");
    // saves to localstorage 
    const myChatsString = JSON.stringify(myArray);
    localStorage.setItem("Chats", myChatsString);
  };

  return (
    <div
      className={`${
        ChatObject.activeChatId == id
          ? "bg-gray-600 hover:bg-gray-600"
          : "hover:bg-gray-700 "
      } flex flex-row justify-between align-middle items-center px-4 py-3 cursor-pointer
        rounded-xl w-[100%] hover: relative`}
      onClick={() => {
        handleChatClick();
      }}
    >
      <div className="flex flex-row  align-middle items-center">
        <div className="w-[50px] h-[50px] mr-3 flex items-center justify-center bg-gray-500 rounded-full">
          {img ? (
            <img
              src={img}
              alt=""
              className="rounded-full object-cover h-full w-full"
            />
          ) : type === "group" ? (
            <MdGroup size={35} />
          ) : (
            <FaUserCircle />
          )}
        </div>
        <div>
          <h3>{name}</h3>
          <div className="flex flex-row truncate">
            <p>{sender}</p>: <p> {message}</p>
          </div>
        </div>
      </div>
      <p className="">{timestamp}</p>
    </div>
  );
};

export default ChatCard;
