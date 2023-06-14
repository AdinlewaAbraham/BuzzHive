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
  deleteMediaTrigger: false,
  setdeleteMediaTrigger: () => {},
  IsChatsLoading: false,
  setIsChatsLoading: () => {},
  showChats: false,
  setshowChats: () => {},
  activeId: "",
  setactiveId: () => {},
  replyDivHeight: "",
  setreplyDivHeight: () => {},
  prevSelectedChannel: "chats",
  setprevSelectedChannel: () => {},
  allowScrollObject: {
    scrollTo: "",
    scrollBehaviour: "",
    allowScroll: true,
  },
  setallowScrollObject: () => {},
});

export const SelectedChannelProvider = ({ children }) => {
  const [deleteMediaTrigger, setdeleteMediaTrigger] = useState(false);
  const [ShowAddGroup, setShowAddGroup] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("chats");
  const [prevSelectedChannel, setprevSelectedChannel] = useState("chats");
  const [Chats, setChats] = useState([]);
  const [IsChatsLoading, setIsChatsLoading] = useState(false);
  const [showChats, setshowChats] = useState(true);
  const [activeId, setactiveId] = useState("");
  const [replyDivHeight, setreplyDivHeight] = useState("");
  const [allowScrollObject, setallowScrollObject] = useState({
    scrollTo: "",
    scrollBehaviour: "",
    allowScroll: true,
  });
  const [ChatObject, setChatObject] = useState({
    activeChatId: "",
    activeChatType: "",
    otherUserId: "",
    message: "",
    photoUrl: "",
    displayName: "",
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
        deleteMediaTrigger,
        setdeleteMediaTrigger,
        showChats,
        setshowChats,
        activeId,
        setactiveId,
        ReplyObject,
        setReplyObject,
        replyDivHeight,
        setreplyDivHeight,
        prevSelectedChannel,
        setprevSelectedChannel,
        allowScrollObject,
        setallowScrollObject,
      }}
    >
      {children}
    </SelectedChannelContext.Provider>
  );
};

export default SelectedChannelContext;
