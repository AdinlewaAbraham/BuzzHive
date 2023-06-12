import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { useContext } from "react";
import { UserContext } from "../../App";
import { collection, getDoc, getDocs, onSnapshot, query } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import Img from "@/components/Img";
const UserCard = ({ name, id, image, user }) => {
  const { setChats, setIsChatsLoading, ChatObject, setChatObject,
    setshowChats } = useContext(
      SelectedChannelContext
    );
  const { User } = useContext(UserContext);
  const handleUserClick = async () => {
    setIsChatsLoading(true);
    const activeChatId = User.id > id ? User.id + id : id + User.id;
    sessionStorage.setItem("activeChatId", new String(activeChatId));
    setChatObject({
      ...ChatObject,
      activeChatId: `${activeChatId}`,
      activeChatType: `personal`,
      otherUserId: `${id}`,
      photoUrl: image,
      displayName: `${name}`,
    });
    const getStoredMessages = () => {
      const str = localStorage.getItem(`${activeChatId}`);
      return JSON.parse(str);
    };
    if (
      localStorage.getItem(`${activeChatId}`) !== "[]" &&
      localStorage.getItem(`${activeChatId}`) !== "{}" &&
      localStorage.getItem(`${activeChatId}`) !== "undefined" &&
      localStorage.getItem(`${activeChatId}`) !== "null" &&
      localStorage.getItem(`${activeChatId}`)
    ) {
      const Chat = getStoredMessages();
      Chat;
      "this is for " + name + " " + unReadCount;
      setChats(Chat);
    } else {
      const getMessage = async () => {
        const query = collection(
          db,
          "conversations",
          activeChatId,
          "messages"
        );

        const snapshot = await getDocs(query);
        const messages = await snapshot.docs.map((doc) => doc.data());
        messages;
        const sortedMessages = messages.sort((a, b) => {
          a.timestamp - b.timestamp;
        });
        sortedMessages;
        const filteredMessages = sortedMessages.filter((message) => message);
        setChats(filteredMessages);
        localStorage.setItem(
          `${ChatObject.activeChatId}`,
          JSON.stringify(filteredMessages)
        );
      };
      getMessage();
    }
    setshowChats(true);
    setIsChatsLoading(false);
  };

  return (
    <div
      key={user.id}
      className="flex cursor-pointer items-center truncate rounded-lg px-4  py-3 hover:bg-hover-light dark:hover:bg-hover-dark"
      onClick={() => {
        handleUserClick();
      }}
    >
      <div className="mr-4 h-[45px] w-[45px] rounded-full">
        <Img
          src={user.photoUrl}
          styles="rounded-full bg-"
          imgStyles="rounded-full"
          personalSize="60"
          groupSize="60"
        />
      </div>
      <div>
        <p className="">{user.name}</p>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          {user.bio}
        </p>
      </div>
    </div>
  );
};

export default UserCard;
