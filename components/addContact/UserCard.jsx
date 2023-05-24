import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { useContext } from "react";
import { UserContext } from "../App";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
const UserCard = ({ name, id, image }) => {
  const { setChats, setIsChatsLoading, ChatObject, setChatObject } = useContext(
    SelectedChannelContext
  );
  const { User } = useContext(UserContext);
  const handleUserClick = async () => {
    setIsChatsLoading(true);
    const activeChatId = User.id > id ? User.id + id : id + User.id;
     setChatObject({
      ...ChatObject,
      activeChatId: `${activeChatId}`,
      activeChatType: `personal`,
      otherUserId: `${id}`,
      photoUrl: image,
      displayName: `${name}`,
    });
    setIsChatsLoading(false);
  };

  return (
    <div
      key={id}
      className="rounded-lg flex cursor-pointer items-center hover:bg-gray-600  px-4 py-3 "
      onClick={() => {
        handleUserClick();
      }}
    >
      {image ? <img src={image} width={50} height={50} />: <>you have no img</>}
      {name}
    </div>
  );
};

export default UserCard;
