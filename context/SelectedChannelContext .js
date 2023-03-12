import { createContext, useState } from 'react';

const SelectedChannelContext = createContext({
  selectedChannel: 'chats',
  setSelectedChannel: () => {},
  Chats: [],
  setChats: () => {},
  Loading: false,
  setLoading: () => {},
  ChatObject: {
    activeChatId: '',
    activeChatType: '',
    otherUserId: '',
    message: '',
    photoUrl: '',
    displayName: '',
  },
  setChatObject: () => {},
});

export const SelectedChannelProvider = ({ children }) => {
  const [selectedChannel, setSelectedChannel] = useState('chats');
  const [Chats, setChats] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [ChatObject, setChatObject] = useState({
    activeChatId: '',
    activeChatType: '',
    otherUserId: '',
    message: ''
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
      {children}
    </SelectedChannelContext.Provider>
  );
};

export default SelectedChannelContext;
