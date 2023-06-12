export const formatChats = (chats) => {
    if (!chats) return
const formattedChats = [];
let lastMessageDate = null;

for (let i = 0; i < chats.length; i++) {
  const chat = chats[i];
  const timestamp = chat.timestamp?.seconds * 1000 + chat.timestamp?.nanoseconds / 1e6;
  const messageDate = new Date(timestamp);

  if (
    !lastMessageDate ||
    messageDate.getDate() !== lastMessageDate.getDate() ||
    messageDate.getMonth() !== lastMessageDate.getMonth() ||
    messageDate.getFullYear() !== lastMessageDate.getFullYear()
  ) {
    if (messageDate.toDateString() === new Date().toDateString()) {
      formattedChats.push({ type: 'timeStamp', day: 'Today' });
    } else if (
      messageDate.toDateString() ===
      new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
    ) {
      formattedChats.push({ type: 'timeStamp', day: 'Yesterday' });
    } else {
      const formattedDate = `${messageDate.getMonth() + 1}/${messageDate.getDate()}/${messageDate.getFullYear()}`;
      formattedChats.push({ type: 'timeStamp', day: formattedDate });
    }
  }

  formattedChats.push(chat);

  lastMessageDate = messageDate;
}



  return formattedChats;
};
