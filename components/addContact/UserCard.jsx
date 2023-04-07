import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { useContext } from "react";
import { UserContext } from "../App";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
const UserCard = ({ name, id, image }) => {
  const { setChats, setLoading, ChatObject, setChatObject } = useContext(
    SelectedChannelContext
  );
  const { User } = useContext(UserContext);
  const handleUserClick = async () => {
    setLoading(true);
    const activeChatId = User.id > id ? User.id + id : id + User.id;
     setChatObject({
      ...ChatObject,
      activeChatId: `${activeChatId}`,
      activeChatType: `personal`,
      otherUserId: `${id}`,
      photoUrl: image,
      displayName: `${name}`,
    });
    const q = query(collection(db, "conversations", id, "messages"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let chats = [];
      snapshot.forEach((doc) => {
        chats.push(doc.data());
      });
      setChats(chats); // Update the state with the latest data
    });
    setLoading(false);

    setLoading(false);
  };

  return (
    <div
      key={id}
      className="border rounded-lg flex cursor-pointer "
      onClick={() => {
        handleUserClick();
      }}
    >
      <img src={image} width={50} height={50} />
      {name}
    </div>
  );
};

export default UserCard;
