import { useContext } from "react";
import Chats from "./chats/Chats";
import AddContact from "./addContact/AddContact";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import AddGroup from "./addGroup/AddGroup";
import Settings from "./settings/Settings";
import ProfileSettings from "./profileSettings/profileSettings";
import { AnimatePresence } from "framer-motion";

const ChannelBar = () => {
  const { selectedChannel } = useContext(SelectedChannelContext);
  return (
    <AnimatePresence>
      <div
        className="h-[calc(100%-70px)] max-h-full w-full overflow-y-hidden bg-light-primary p-4 pt-0 dark:bg-dark-primary 
    md:mr-[0px] md:h-full md:w-[30%]  md:min-w-[400px]"
      >
        <Chats />
        {/* Notice that I have not applied a conditional statement to this component(<Chats/>).
         It is intentionally kept mounted at all times to ensure that the user can
         receive new messages when another channel is active. */} 
         {selectedChannel === "addcontact" && <AddContact />}
        {selectedChannel === "addGroup" && <AddGroup />}
        {selectedChannel === "settings" && <Settings />}
        {selectedChannel === "profileSettings" && <ProfileSettings />}
      </div>
    </AnimatePresence>
  );
};

export default ChannelBar;
