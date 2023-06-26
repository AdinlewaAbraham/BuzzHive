import Chats from "@/components/ChannelBar/chats/Chats";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";
import { useContext } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

export const getGroupMessages = async (groupId) => {
  const q = query(collection(db, "groups", groupId, "messages"));
  const [chats, setchats] = useState([]);
  let s = [];
  onSnapshot(q, (snapshot) => {
    let chats = [];
    snapshot.forEach((doc) => {
      chats.push(doc.data());
    });
    setchats(chats);
  });
  return chats;
};
