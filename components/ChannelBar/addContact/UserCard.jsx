import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { useContext, useEffect } from "react";
import { UserContext } from "../../App";
import { db } from "@/utils/firebaseUtils/firebase";
import Img from "@/components/Img";
import AddUserPopUp from "./AddUserPopUp";
import { useState } from "react";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdVerified } from "react-icons/md";
import Badge from "@/components/Badge";
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
      <AnimatePresence>
        {showUserPopup && (
          <motion.div
            className="Poll-input fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="clickEvent max-w-[500px] rounded-lg bg-light-secondary dark:bg-dark-secondary"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <AddUserPopUp
                setShowUserPopupTofalse={() => {
                  setShowUserPopup(false);
                }}
                user={user}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        key={user.id}
        className="clickEvent flex rounded-xl cursor-pointer items-center truncate px-4  py-3 hover:bg-hover-light dark:hover:bg-hover-dark"
        onClick={() => {
          setShowUserPopup(true);
        }}
      >
        <Img
          src={user.photoUrl}
          styles=" h-[45px] w-[45px] mr-4 rounded-full"
          imgStyles="rounded-full"
          personalSize="45"
          groupSize="60"
        />
        <div>
          <p className="flex items-center">
            <span>{user.name}</span>
            <Badge id={user.id} />
          </p>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            {user.bio}
          </p>
        </div>
      </div>
    </>
  );
};

export default UserCard;
