import Chats from "@/components/chats/Chats";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";
import { useContext } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

export const getGroupMessages = async (groupId) => {
const { setChats, setLoading, ChatObject } = useContext(
  SelectedChannelContext
);
  const q = query(collection(db, "groups", groupId, "messages"));
  const [chats, setchats] = useState([]);
  let s = [];
  onSnapshot(q, (snapshot) => {
    console.log("satrt");
    let chats = [];
    snapshot.forEach((doc) => {
      chats.push(doc.data());
    });
    setchats(chats)
  });
  console.log(chats);
  return chats;
};
