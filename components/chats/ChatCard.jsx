import { useContext, useEffect, useState, useRef } from "react";
import { collection, onSnapshot, query, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
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
  const { setChats, ChatObject, setChatObject, setshowChats } = useContext(
    SelectedChannelContext
  );
  const [invalidURL, setinvalidURL] = useState(true);

  const handleChatClick = async () => {
    if (ChatObject.activeChatId === id) {
      return;
    }
    setChatObject({
      activeChatId: id,
      activeChatType: type,
      otherUserId: otherUserId,
      photoUrl: img,
      displayName: name,
    });
    setshowChats(true);
  };

  useEffect(() => {
    if (
      localStorage.getItem(`${ChatObject.activeChatId}`) !== "[]" &&
      localStorage.getItem(`${ChatObject.activeChatId}`)
    ) {
      console.log(ChatObject.activeChatId);
      console.log(localStorage.getItem(`${ChatObject.activeChatId}`));
      console.log("checking local storage");
      const ChatString = localStorage.getItem(`${ChatObject.activeChatId}`);
      const Chat = JSON.parse(ChatString);
      setChats(Chat);
    } else {
      setChats(null);
      if (ChatObject.activeChatId == [""]) {
        return;
      }
      console.log("fetching from sever ");
      console.log(ChatObject.activeChatId);
      console.log(id);
      let q;
      if (type === "group") {
        q = query(
          collection(db, "groups", ChatObject.activeChatId, "messages")
        );
      } else if (type === "personal") {
        q = query(
          collection(db, "conversations", ChatObject.activeChatId, "messages")
        );
      }

      const fetchChats = async () => {
        console.log(ChatObject.activeChatId);
        try {
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
            console.log(ChatObject.activeChatId);
            localStorage.setItem(
              `${ChatObject.activeChatId}`,
              JSON.stringify(chats)
            );
          });
          return () => unsubscribe();
        } catch (error) {
          console.error(error);
        }
      };

      fetchChats();
    }
  }, [ChatObject]);

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
      <div className="flex flex-row  align-middle items-center w-full">
        <div className="w-[50px] h-[50px] mr-3 flex items-center justify-center bg-gray-500 rounded-full">
          {img && invalidURL ? (
            <img
              src={img}
              alt="profile pic"
              className="rounded-full object-cover h-full w-full"
              onError={() => setinvalidURL(false)}
            />
          ) : type === "group" ? (
            <MdGroup size={35} />
          ) : (
            <FaUserAlt size={22} />
          )}
        </div>
        <div className=" truncate w-[90%]">
          <h3>{name}</h3>
          <div className="flex flex-row">
            <p>{sender}</p>: <p> {message}</p>
          </div>
        </div>
      </div>
      <p className="">{timestamp}</p>
    </div>
  );
};

export default ChatCard;
