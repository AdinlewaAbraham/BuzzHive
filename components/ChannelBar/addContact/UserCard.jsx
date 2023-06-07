import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { useContext } from "react";
import { UserContext } from "../../App";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import Img from "@/components/Img";
const UserCard = ({ name, id, image, user }) => {
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
