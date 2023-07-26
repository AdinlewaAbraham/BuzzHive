import React, { useContext, useEffect, useState } from "react";
import Img from "@/components/Img";
import { UserContext } from "@/components/App";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import Badge from "@/components/Badge";
import { CircularProgress } from "@mui/joy";

const AddUserPopUp = ({ setShowUserPopupTofalse, user }) => {
  const { User } = useContext(UserContext);
  const { setSelectedChannel } = useContext(SelectedChannelContext);

  const [isInContacts, setIsInContacts] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [noStortedChats, setNoStortedChats] = useState(false);
  const [addingUser, setaddingUser] = useState(false);
  useEffect(() => {
    setLoadingState(true);
    const storedData = JSON?.parse(
      localStorage.getItem(`${User.id}_userChats`)
    );
    if (storedData) {
      const inChats = storedData.some(
        (chatRoom) => chatRoom.otherParticipant === user.id
      );
      if (inChats) {
        setIsInContacts(true);
      } else {
        setIsInContacts(false);
      }
      setLoadingState(false);
    } else {
      setNoStortedChats(true);
      setIsInContacts(true)
    }
  }, []);
  return (
    <div className=" rounded-xl p-4 px-8">
      <div className="flex w-44 flex-col items-center justify-center">
        <Img
          src={user.photoUrl}
          styles="rounded-full h-[60px] w-[60px] "
          imgStyles="rounded-full "
          personalSize="50"
          type="personnal"
        />
        <div className="my-2 text-center">
          <p className="flex items-center justify-center">
            {user.name}
            <Badge id={user.id} />
          </p>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            {user.bio}
          </p>
        </div>
        {loadingState ? (
          <button
            className={`flex w-full cursor-wait items-center
           justify-center rounded-lg bg-accent-blue  
             py-2
           `}
          >
            <i className="mr-1 flex items-center justify-center">
              <CircularProgress size="sm" variant="plain" />
            </i>
            Loading...
          </button>
        ) : !isInContacts ? (
          <button
            className={`flex w-full items-center justify-center rounded-lg bg-accent-blue py-2  ${
              addingUser && "cursor-wait"
            } `}
            onClick={() => {
              if (addingUser) return;
              setaddingUser(true);
              sendMessage(
                User.id,
                user.id,
                `${User.name} added ${user.name}`,
                User.id,
                User.name,
                "announcement",
                new Date(),
                null,
                null,
                null,
                () => {}
              ).then(() => {
                setIsInContacts(true);
                setaddingUser(false);

                setTimeout(() => {
                  setSelectedChannel("chats");
                  setShowUserPopupTofalse;
                }, 1000);
              });
            }}
          >
            {addingUser ? "Adding contact..." : "Add Contact"}
          </button>
        ) : (
          <p className="text-green-500">Already in Contacts</p>
        )}
        <button
          className={`mt-2 flex w-full items-center justify-center rounded-lg bg-gray-500 py-2  `}
          onClick={setShowUserPopupTofalse}
        >
          cancel
        </button>
      </div>
    </div>
  );
};

export default AddUserPopUp;
