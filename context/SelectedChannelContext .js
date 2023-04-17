import { createContext, useState } from "react";

const SelectedChannelContext = createContext({
  selectedChannel: "chats",
  setSelectedChannel: () => {},
  Chats: [],
  setChats: () => {},
  ChatObject: {
    activeChatId: "",
    activeChatType: "",
    otherUserId: "",
    message: "",
    photoUrl: "",
    displayName: "",
  },
  setChatObject: () => {},
  ShowAddGroup: false,
  setShowAddGroup: () => {},
  isPopupOpen: false,
  setisPopupOpen: () => {},
  IsChatsLoading: false,
  setIsChatsLoading: () => {},
  showChats: false,
  setshowChats:()=>{}
});

export const SelectedChannelProvider = ({ children }) => {
  const [isPopupOpen, setisPopupOpen] = useState(false);
  const [ShowAddGroup, setShowAddGroup] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("chats");
  const [Chats, setChats] = useState([]);
  const [IsChatsLoading, setIsChatsLoading] = useState(false);
  const [showChats, setshowChats] = useState(true);
  const [ChatObject, setChatObject] = useState({
    activeChatId: "",
    activeChatType: "",
    otherUserId: "",
    message: "",
  });

  return (
    <SelectedChannelContext.Provider
      value={{
        selectedChannel,
        setSelectedChannel,
        IsChatsLoading,
        setIsChatsLoading,
        Chats,
        setChats,
        ChatObject,
        setChatObject,
        ShowAddGroup,
        setShowAddGroup,
        isPopupOpen,
        setisPopupOpen,
        showChats,
        setshowChats,
      }}
    >
      {children}
    </SelectedChannelContext.Provider>
  );
};

export default SelectedChannelContext;
