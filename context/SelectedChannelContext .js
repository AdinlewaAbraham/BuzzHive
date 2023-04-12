import { createContext, useState } from "react";

const SelectedChannelContext = createContext({
  selectedChannel: "chats",
  setSelectedChannel: () => {},
  Chats: [],
  setChats: () => {},
  Loading: false,
  setLoading: () => {},
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
  showChats: false,
  setshowChats:()=>{}
});

export const SelectedChannelProvider = ({ children }) => {
  const [isPopupOpen, setisPopupOpen] = useState(false);
  const [ShowAddGroup, setShowAddGroup] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("chats");
  const [Chats, setChats] = useState([]);
  const [Loading, setLoading] = useState(false);
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
        Loading,
        setLoading,
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
