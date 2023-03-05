import { useState } from "react";
import SideBar from "./sidebar/SideBar";
import ChannelBar from "./ChannelBar/ChannelBar";
import ContentContainer from "./ContentContainer/ContentContainer";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

const App = () => {
  const [selectedChannel, setSelectedChannel] = useState("chats");
  const [Chats, setChats] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [ChatObject, setChatObject] = useState({
    activeChatId: "",
    activeChatType: "",
    otherUserId: "",
    message: ""
  });

  return (
    <SelectedChannelContext.Provider
      value={{
        selectedChannel,
        setSelectedChannel,
        Loading,
        setLoading,
        Chats,
        setChats,
        ChatObject,
        setChatObject,
      }}
    >
      <main className="flex">
        <SideBar />
        <ChannelBar />
        <ContentContainer />
      </main>
    </SelectedChannelContext.Provider>
  );
};

export default App;
