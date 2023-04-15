import { useContext } from "react";
import Chats from "../chats/Chats";
import AddContact from "../addContact/AddContact";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import AddGroup from "../addGroup/AddGroup";

const ChannelBar = () => {
  const { selectedChannel } = useContext(SelectedChannelContext);
  return (
    <div className="max-h-screen h-[calc(100vh-70px)] md:h-screen w-full md:w-[35%] md:min-w-[400px] p-3 bg-gray-800 dark:bg-[#1d232a] md:mr-[2px] shadow-lg overflow-y-hidden">
      {selectedChannel == "chats" && <Chats />}
      {selectedChannel == "addcontact" && <AddContact />}
      {selectedChannel == "addGroup" &&  <AddGroup />}

    </div>
  );
};

export default ChannelBar;
