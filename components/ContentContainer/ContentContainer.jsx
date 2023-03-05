import { useContext } from "react";
import Input from "../input/Input";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
const ContentContainer = () => {
  const { selectedChannel, Chats, Loading } = useContext(
    SelectedChannelContext
  );
  return (
    <div
      className="
      bg-gray-300 dark:bg-gray-700 h-screen w-screen overflow-hidden"
    >
      {Loading ? <>Loading</> : <>{Chats.map((chat)=>(
        <div>{chat.text}</div>
      ))}</>}
     <Input/>
    </div>
  );
};

export default ContentContainer;
