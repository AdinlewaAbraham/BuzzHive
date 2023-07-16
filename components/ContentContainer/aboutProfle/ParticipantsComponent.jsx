import Img from "@/components/Img";
import { db } from "@/utils/firebaseUtils/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useRef, useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { UserContext } from "@/components/App";
import { useContext } from "react";
import { MdPersonAddAlt1, MdOutlineAdminPanelSettings } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { usePopper } from "react-popper";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { removeMember } from "@/utils/groupUtils/removeMember";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import AddParticipants from "./AddParticipants";
import { CircularProgress } from "@mui/joy";
import Badge from "@/components/Badge";
import { motion, AnimatePresence } from "framer-motion";
import AddUserPopUp from "@/components/ChannelBar/addContact/AddUserPopUp";

const ParticipantCard = ({ user, groupObject, isAdmin, setParticipants }) => {
  const { User } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const referenceElement = useRef(null);
  const popperElement = useRef(null);
  const { styles, attributes } = usePopper(
    referenceElement.current,
    popperElement.current,
    {
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 10],
          },
        },
        {
          name: "arrow",
          options: {
            element: null,
          },
        },
      ],
      placement: "bottom-end",
    }
  );
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".dontClose")) {
        setShowMenu(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".clickEvent")) {
        setShowUserPopup(false);
      }
    }

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const isCurrentUserAdmin = groupObject.admins.includes(User.id);
  const removeGroupMember = async (removeId) => {
    setShowMenu(false);
    if (isCurrentUserAdmin && !isAdmin) {
      if (!groupObject.admins.includes(removeId)) {
        setParticipants((prevArr) =>
          prevArr.filter((user) => user.id !== removeId)
        );
        await removeMember([removeId], ChatObject.activeChatId);
      }
    }
  };
  const makeGroupAdmin = async (adminId) => {
    setShowMenu(false);
    if (isCurrentUserAdmin && !isAdmin) {
      const groupRef = doc(db, "groups", ChatObject.activeChatId);
      await updateDoc(groupRef, { admins: arrayUnion(adminId) });
    }
  };
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
        className="clickEvent hover:bg-hover flex cursor-pointer items-center justify-between truncate rounded-xl  px-4 py-3"
        onClick={(e) => {
          if (user.id !== User.id) {
            if (!e.target.closest(".dontClose")){
              setShowUserPopup(true);
            }
          }
        }}
      >
        <div className="flex items-center ">
          <Img
            styles="rounded-full h-[45px] w-[45px] mr-4"
            imgStyles="rounded-full"
            src={user.photoUrl}
            type="notgroup"
            personalSize="45"
          />
          <div>
            <h4 className="flex items-center">
              {user.name}
              <Badge id={user.id} />
              {isAdmin && (
                <span className="ml-3 rounded-md bg-green-700 px-1 text-white">
                  admin
                </span>
              )}
            </h4>
            <p className="text-sm text-muted-light dark:text-muted-dark">
              {user.bio}
            </p>
          </div>
        </div>
        {isCurrentUserAdmin && !isAdmin && (
          <i
            className="dontClose p-2 rounded-full hover:bg-coverColor"
            onClick={(e) => setShowMenu(true)}
            ref={referenceElement}
          >
            <BsThreeDotsVertical />
          </i>
        )}
      </div>
      <div style={styles.popper} {...attributes.popper} ref={popperElement}>
        {showMenu && (
          <ul
            className="bg-secondary dontClose [&>li]: [&>li]: z-50  
          rounded-lg p-2 [&>li>i]:mr-1 [&>li>i]:text-[20px]
           [&>li]:flex [&>li]:cursor-pointer  [&>li]:items-center [&>li]:rounded-lg [&>li]:p-2 hover:[&>li]:bg-hover-light hover:dark:[&>li]:bg-hover-dark"
          >
            <li onClick={() => makeGroupAdmin(user.id)}>
              <i>
                <MdOutlineAdminPanelSettings />
              </i>{" "}
              Make group admin
            </li>
            <li
              className="text-red-400"
              onClick={() => removeGroupMember(user.id)}
            >
              <i>
                <IoMdRemoveCircleOutline />
              </i>
              Remove
            </li>
          </ul>
        )}
      </div>
    </>
  );
};

const ParticipantsComponent = ({ groupObject }) => {
  if (!groupObject) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center">
        <i className="mr-1">
          <CircularProgress size="sm" variant="plain" />
        </i>
        loading Group Members...
      </div>
    );
  }
  const { User } = useContext(UserContext);
  const duplicatedIds = [...groupObject.admins, ...groupObject.members];
  const participantsId = [...new Set(duplicatedIds)];
  const [participants, setParticipants] = useState([]);
  const [lastParticipantId, setlastParticipantId] = useState(null);
  const [locked, setLocked] = useState(false);
  const [hasMore, sethasMore] = useState(true);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    loadMoreUsers();
  }, []);

  const loadMoreUsers = async () => {
    setLoadingUsers(true);

    setLocked(true);
    const spliceIndex = participantsId.findIndex(
      (participantId) => participantId === lastParticipantId
    );
    const fetchIds = JSON.parse(JSON.stringify(participantsId)).splice(
      spliceIndex + 1,
      20
    ); //deep copy so it doesn't modify original

    setlastParticipantId(fetchIds[fetchIds.length - 1]);
    if (fetchIds.length < 20) {
      sethasMore(false);
    }
    const fetchUsersWithIds = async (fetchIds) => {
      const fetchPromises = fetchIds.map(async (participantId) => {
        const userRef = doc(db, "users", participantId);
        const userSnapshot = await getDoc(userRef);
        return userSnapshot.data();
      });

      const fetchedUsers = await Promise.all(fetchPromises);
      return fetchedUsers;
    };
    const fetchedUsers = await fetchUsersWithIds(fetchIds);

    setParticipants([...participants, ...fetchedUsers]);
    setLocked(false);
    setLoadingUsers(false);
  };

  const handleOnScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const triggerHeight = container.scrollTop + container.offsetHeight;

    if (triggerHeight >= container.scrollHeight - 100 && hasMore) {
      loadMoreUsers();
    }
  };
  return (
    <div
      className="scrollBar flex h-[350px] w-full flex-col overflow-y-auto"
      onScroll={() => handleOnScroll()}
      ref={scrollContainerRef}
    >
      {showAddParticipants && (
        <AddParticipants
          setShowAddParticipants={setShowAddParticipants}
          groupObject={groupObject}
          setParticipants={setParticipants}
        />
      )}
      <div>
        {groupObject.admins.includes(User.id) && (
          <div
            className="hover:bg-hover flex cursor-pointer  items-center truncate rounded-xl px-4  py-3"
            onClick={() => setShowAddParticipants(true)}
          >
            <i className="mr-4 flex h-[45px] w-[45px] items-center justify-center rounded-full bg-green-700 text-2xl">
              <MdPersonAddAlt1 color="#ffffff" />
            </i>
            Add participant
          </div>
        )}
        {JSON.stringify(participants) === "[]" ? (
          <div className="flex h-full items-center justify-center [&>span]:mr-1">
            <CircularProgress size="sm" variant="plain" />
            fetching Group Members...
          </div>
        ) : (
          <>
        {console.log(participants)}
            {participants.map((user) => (
              <ParticipantCard
                user={user}
                groupObject={groupObject}
                isAdmin={groupObject.admins.includes(user.id)}
                setParticipants={setParticipants}
              />
            ))}
            {loadingUsers && (
              <div className="flex items-center justify-center">
                <CircularProgress size="sm" variant="plain" /> Loading...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParticipantsComponent;
