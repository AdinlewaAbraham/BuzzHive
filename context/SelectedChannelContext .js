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
  ReplyObject: {
    ReplyText: "",
    ReplyTextId: "",
    displayName: "",
  },
  setReplyObject: () => {},
  ShowAddGroup: false,
  setShowAddGroup: () => {},
  isPopupOpen: false,
  setisPopupOpen: () => {},
  IsChatsLoading: false,
  setIsChatsLoading: () => {},
  showChats: false,
  setshowChats: () => {},
  activeId: "",
  setactiveId: () => {},
  replyDivHeight: "",
  setreplyDivHeight: () => {},
});

export const SelectedChannelProvider = ({ children }) => {
  const [isPopupOpen, setisPopupOpen] = useState(false);
  const [ShowAddGroup, setShowAddGroup] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("chats");
  const [Chats, setChats] = useState([]);
  const [IsChatsLoading, setIsChatsLoading] = useState(false);
  const [showChats, setshowChats] = useState(true);
  const [activeId, setactiveId] = useState("");
  const [replyDivHeight, setreplyDivHeight] = useState("");
  const [ChatObject, setChatObject] = useState({
    activeChatId: "",
    activeChatType: "",
    otherUserId: "",
    message: "",
  });
  const [ReplyObject, setReplyObject] = useState({
    ReplyText: "",
    ReplyTextId: "",
    displayName: "",
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
        activeId,
        setactiveId,
        ReplyObject,
        setReplyObject,
        replyDivHeight,
        setreplyDivHeight,
      }}
    >
      {children}
    </SelectedChannelContext.Provider>
  );
};

export default SelectedChannelContext;
