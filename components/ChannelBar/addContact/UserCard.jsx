import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { useContext, useEffect } from "react";
import { UserContext } from "../../App";
import {
  collection,
  getDoc,
  getDocs,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import Img from "@/components/Img";
import AddUserPopUp from "./AddUserPopUp";
import { useState } from "react";
import { useRef } from "react";
const UserCard = ({ user }) => {
  const {
    setChats,
    setIsChatsLoading,
    ChatObject,
    setChatObject,
    setshowChats,
  } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);
  const [showUserPopup, setShowUserPopup] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".clickEvent")) {
        setShowUserPopup(false)
      }
    }

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      {showUserPopup && (
        <div className="Poll-input fixed inset-0 z-50 flex  items-center justify-center bg-gray-900 bg-opacity-50">
          <div
            className="clickEvent max-w-[500px] rounded-lg bg-light-secondary dark:bg-dark-secondary"
          >
            <AddUserPopUp
              setShowUserPopupTofalse={() => {
                setShowUserPopup(false);
              }}
              user={user}
            />
          </div>
        </div>
      )}
      <div
        key={user.id}
        className="clickEvent flex cursor-pointer items-center truncate rounded-lg px-4  py-3 hover:bg-hover-light dark:hover:bg-hover-dark"
        onClick={() => {
          setShowUserPopup(true);
        }}
      >
        <div className="mr-4 h-[45px] w-[45px] rounded-full">
          <Img
            src={user.photoUrl}
            styles="rounded-full bg-"
            imgStyles="rounded-full"
            personalSize="60"
            groupSize="60"
          />
        </div>
        <div>
          <p className="">{user.name}</p>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            {user.bio}
          </p>
        </div>
      </div>
    </>
  );
};

export default UserCard;
