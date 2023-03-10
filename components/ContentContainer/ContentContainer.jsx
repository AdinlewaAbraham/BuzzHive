import { useContext } from "react";
import Input from "../input/Input";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
const ContentContainer = () => {
  const { Chats, Loading } = useContext(SelectedChannelContext);

  console.log(Chats);
  const sortedChats = Chats.sort(
    (a, b) =>
      a.timestamp.seconds * 1000 +
      a.timestamp.nanoseconds / 1000000 -
      b.timestamp.seconds * 1000 -
      b.timestamp.nanoseconds / 1000000
  );
  console.log(sortedChats);
  const currentId = "1";
  return (
    <div
      className="
      bg-gray-300 dark:bg-gray-700 h-screen w-screen overflow-y-scroll"
    >
      {Loading ? (
        <>Loading</>
      ) : (
        <>
          {sortedChats &&
            sortedChats.map((chat) => (
              <div
                className={`flex items-center ${
                  chat.senderId === currentId ? "justify-end" : "justify-start"
                } mt-2`}
              >
                <div
                  className={`text-left rounded-lg p-2 max-w-[80%] ${
                    chat.senderId === currentId
                      ? " text-white text-right ml-2 bg-green-500 mr-5"
                      : "bg-red-800 text-white text-left mr-2 ml-5"
                  }`}
                >
                  {chat.text}
                </div>
              </div>
            ))}
        </>
      )}
      <Input />
    </div>
  );
};

export default ContentContainer;
