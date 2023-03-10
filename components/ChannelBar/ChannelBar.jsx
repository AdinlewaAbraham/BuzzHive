import {useContext} from "react";
import Chats from "../chats/Chats";
import AddContact from "../addContact/AddContact";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

const ChannelBar = () => {
  const { selectedChannel } = useContext(
    SelectedChannelContext
  );
  return (
    <div className="h-screen w-[30%] max-w-[30%] bg-gray-200 p-3 dark:bg-gray-800 shadow-lg">
      {selectedChannel == "chats" && <Chats />}
      {selectedChannel == "addcontact" && <AddContact />}
    </div>
  );
};

export default ChannelBar;
