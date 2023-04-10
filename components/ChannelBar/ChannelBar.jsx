import { useContext } from "react";
import Chats from "../chats/Chats";
import AddContact from "../addContact/AddContact";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

const ChannelBar = () => {
  const { selectedChannel } = useContext(SelectedChannelContext);
  return (
    <div className="max-h-screen h-[calc(100vh-100px)] md:h-screen w-screen md:w-[35%] min-w-[400px] bg-gray-200 p-3 dark:bg-gray-800 shadow-lg overflow-y-hidden">
      {selectedChannel == "chats" && <Chats />}
      {selectedChannel == "addcontact" && <AddContact />}
    </div>
  );
};

export default ChannelBar;
