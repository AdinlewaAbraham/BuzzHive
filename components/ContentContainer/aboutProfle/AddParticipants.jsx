import React, { useState, useEffect, useContext, useLayoutEffect } from "react";
import { FaUserAlt, FaUsersCog } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Checkbox from "@/components/Checkbox";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  startAfter,
} from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { UserContext } from "@/components/App";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { GiCancel } from "react-icons/gi";
import { CircularProgress } from "@mui/joy";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import Goback from "@/components/ChannelBar/Goback";
import Badge from "@/components/Badge";
import Img from "@/components/Img";
const UserCard = (p) => {
  const [invalidURL, setinvalidURL] = useState(true);
  return (
    <div
      key={p.id}
      className="group mr-1 flex cursor-pointer items-center rounded-xl px-2 py-2 hover:bg-hover-light dark:hover:bg-hover-dark"
      onClick={p.onSelect}
    >
      {p.photoUrl && invalidURL ? (
        <img
          src={p.photoUrl}
          alt="profile pic"
          className="mr-2 h-[45px] w-[45px] rounded-full"
          onError={() => setinvalidURL(false)}
        />
      ) : (
        <i className="bg-coverColor mr-2 flex h-[45px] w-[45px] items-center justify-center rounded-full ">
          <FaUserAlt size={22} />
        </i>
      )}
      <div className="flex items-center">
        <p className="">{p.name}</p>
        <Badge id={p.id} />
      </div>
      <div className="outlined-none ml-auto h-5 w-5 rounded-lg">
        <Checkbox isChecked={p.isSelected} />
      </div>
    </div>
  );
};

const AddParticipants = ({ setShowAddParticipants, groupObject }) => {
  const [animationParent] = useAutoAnimate({ duration: 150 });
  const [activeUsers, setactiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setselectedUsers] = useState([]);
  const [showAddGroupMenu, setshowAddGroupMenu] = useState(false);
  const [addUsersLoading, setaddUsersLoading] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [height, setHeight] = useState(0);
  const [IsMobile, setIsMobile] = useState(false);
  const { User } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);
  const ref = useRef(null);
  const scrollContainerRef = useRef(null);

  const [addedUsers, setAddedUsers] = useState(false);

  let data = localStorage.getItem(`${User.id}_userChats`);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const usersRef = collection(db, "users");
      let q = query(usersRef, orderBy("name"), limit(15));

      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map((doc) => doc.data());
      setUsers(fetchedUsers);
      setHasMore(querySnapshot.docs.length === 15);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    data ? setactiveUsers(JSON.parse(data)) : 0;
    fetchUsers();
  }, []);

  useEffect(() => {
    function widthResizer() {
      const width = window.innerWidth < 768;
      setIsMobile(width);
    }

    widthResizer();

    window.addEventListener("resize", widthResizer);

    return () => window.removeEventListener("resize", widthResizer);
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    setHeight(ref.current.clientHeight);
  }, [selectedUsers]);

  const filterUsersWithQuery = (SearchQuery) => {
    const filteredUsers = activeUsers.filter((user) => {
      const lowercaseName = user.senderDisplayName.toLowerCase();
      const lowercaseSearchQuery = SearchQuery.toLowerCase();
      return lowercaseName.includes(lowercaseSearchQuery);
    });

    setactiveUsers(filteredUsers);
  };

  const fetchedUsersWithQuery = async (searchQuery) => {
    setLoading(true);
    const usersRef = collection(db, "users");
    let q = query(
      usersRef,
      where("queryName", "!=", User.name.toLowerCase()), // using queryName because firebase query is case sensitive
      where("queryName", ">=", searchQuery.toLowerCase()),
      where("queryName", "<=", searchQuery.toLowerCase() + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);
    const fetchedUsers = querySnapshot.docs.map((doc) => doc.data());

    setUsers(fetchedUsers);
    setLoading(false);
  };
  const handleSelect = (user, checked) => {
    if (checked) {
      if (
        selectedUsers.some((u) => JSON.stringify(u) === JSON.stringify(user))
      ) {
        setselectedUsers((prevSelectedUsers) =>
          prevSelectedUsers.filter(
            (u) => JSON.stringify(u) !== JSON.stringify(user)
          )
        );
      } else {
        setselectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
      }
    } else {
      setselectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((u) => u.id !== user.id)
      );
    }
  };
  const handleRemoveUser = (userId) => {
    const updatedUsers = selectedUsers.filter((user) => user.id !== userId);
    setselectedUsers(updatedUsers);
  };

  const addUsersToGroup = async () => {
    if (addingUser) return;
    setAddingUser(true);
    const userid = selectedUsers.map((user) => user.id);
    const groupRef = doc(db, "groups", ChatObject.activeChatId);
    await updateDoc(groupRef, { members: arrayUnion(...userid) });

    setAddedUsers(true);
    setTimeout(() => {
      setShowAddParticipants(false);
    }, 1000);
  };
  const addUsers = async () => {
    if (addUsersLoading) return;
    setaddUsersLoading(true);
    const usersRef = collection(db, "users");
    const lastUser = users[users.length - 1];
    if (!lastUser) return;
    const q = query(
      usersRef,
      orderBy("name"),
      startAfter(lastUser?.name),
      limit(10)
    );
    try {
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map((doc) => doc.data());
      setUsers((prevUsers) => [...prevUsers, ...fetchedUsers]);
      if (querySnapshot.docs.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setaddUsersLoading(false);
  };
  const handleOnScroll = () => {
    const container = scrollContainerRef.current;

    if (!container) return;

    let triggerHeight = container.scrollTop + container.offsetHeight;
    if (triggerHeight >= container.scrollHeight - 20 && hasMore) {
      addUsers();
    }
  };

  const divStyles = {
    maxHeight: `calc(100vh - 200px${
      selectedUsers.length > 0
        ? ` - ${height}px - ${IsMobile ? "130px" : "60px"}`
        : ""
    })`,
    transition: "height ease-in-out 150ms",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70">
      <div
        className="bg-primary w-[35%] min-w-[300px]
       max-w-[500px] rounded-lg p-4 pt-0 shadow-xl"
      >
        <Goback
          text={"Add participant"}
          clickFunc={() => setShowAddParticipants(false)}
        />
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`${!showAddGroupMenu && "mb-3"} flex flex-col`}
          >
            <div ref={ref}>
              <ul
                ref={animationParent}
                className="scrollBar flex max-h-[116px] flex-wrap
                  items-center overflow-y-auto rounded-lg bg-light-secondary py-1  dark:bg-dark-secondary  "
              >
                {[...selectedUsers].map((user) => (
                  <li
                    key={user.id}
                    id={user.id}
                    className="parent-div text-bold group relative m-1 flex items-center whitespace-nowrap
                     rounded-lg bg-accent-blue px-2 py-1 text-center text-[12px] font-semibold"
                  >
                    <Img
                      src={user.photoUrl}
                      type="personal"
                      personalSize={50}
                      styles="rounded-full w-5 h-5 select-none mr-1"
                      imgStyles="rounded-full w-5 h-5"
                    />
                    {user.name}
                    <i
                      className={`text-danger absolute right-1 cursor-pointer p-1
                      opacity-0 transition-all duration-300 group-hover:bg-accent-blue ${
                        !showAddGroupMenu && "group-hover:opacity-100  "
                      } `}
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <GiCancel />
                    </i>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
        <div className="mb-3 flex w-full items-center justify-center">
          <input
            type="text"
            className=" bg-secondary w-[90%]  rounded-lg px-3 py-2 
          placeholder-muted-light outline-none dark:placeholder-muted-dark"
            placeholder="Search"
            onChange={(e) => {
              const newSearchQuery = e.target.value;
              if (newSearchQuery === "") {
                fetchUsers();
                let data = localStorage.getItem(`${User.id}_userChats`);
                data ? setactiveUsers(JSON.parse(data)) : 0;
              } else {
                fetchedUsersWithQuery(newSearchQuery);
                filterUsersWithQuery(newSearchQuery);
              }
            }}
          />
        </div>
        {selectedUsers.length > 0 && (
          <button
            className={` ${
              addingUser && "cursor-wait"
            } mb-3 w-full rounded-lg bg-accent-blue py-2`}
            onClick={() => addUsersToGroup()}
          >
            {addingUser ? (
              <div className="flex items-center justify-center [&>span]:mr-1">
                {addedUsers ? (
                  <>
                    {" "}
                    Successfully added {selectedUsers.length} user
                    {selectedUsers > 1 && "s"}.{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="17"
                      height="17"
                      className="ml-1"
                    >
                      <motion.path
                        fill="none"
                        strokeWidth="3"
                        stroke="#fff"
                        d="M1 14.5l6.857 6.857L23.5 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <CircularProgress size="sm" variant="plain" /> Adding
                    users...
                  </>
                )}
              </div>
            ) : (
              <>Add {selectedUsers.length} Users to group</>
            )}
          </button>
        )}
        <div
          className="scrollBar overflow-y-auto"
          style={divStyles}
          ref={scrollContainerRef}
          onScroll={handleOnScroll}
        >
          {activeUsers?.length > 0 && (
            <div className="relative">
              <h2
                className="sticky top-0 mb-1 bg-light-primary p-2 pt-0 
            text-muted-light dark:bg-dark-primary dark:text-muted-dark"
              >
                Active chats
              </h2>
              <div>
                {activeUsers
                  .slice()
                  .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
                  .map((user) => {
                    const userObj = {
                      id: user.otherParticipant,
                      photoUrl: user.senderDisplayImg,
                      name: user.senderDisplayName,
                    };
                    return (
                      <div
                        className={`${user.type == "group" ? "hidden" : ""}`}
                        key={`active${user.id}`}
                      >
                        <UserCard
                          id={user.otherParticipant}
                          photoUrl={user.senderDisplayImg}
                          name={user.senderDisplayName}
                          isSelected={selectedUsers.some(
                            (u) => JSON.stringify(u) === JSON.stringify(userObj)
                          )}
                          onSelect={(isSelected) =>
                            handleSelect(userObj, isSelected)
                          }
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          <h2
            className="sticky top-0 mb-1 mt-1 rounded-lg bg-light-primary p-2
          text-muted-light dark:bg-dark-primary dark:text-muted-dark"
          >
            All users
          </h2>
          {!loading ? (
            <>
              {users.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  no contacts found
                </div>
              )}
              {[...users]
                .filter((user) => user.id !== User.id)
                .map((user) => {
                  const userObj = {
                    id: user.id,
                    photoUrl: user.photoUrl,
                    name: user.name,
                  };
                  return (
                    <UserCard
                      key={user.id}
                      id={user.id}
                      photoUrl={user.photoUrl}
                      name={user.name}
                      isSelected={selectedUsers.some(
                        (u) => JSON.stringify(u) === JSON.stringify(userObj)
                      )}
                      onSelect={(isSelected) =>
                        handleSelect(userObj, isSelected)
                      }
                    />
                  );
                })}
            </>
          ) : (
            <>
              {[1, 2, 3, 4, 5].map((key) => (
                <div
                  className="relative flex cursor-pointer items-center px-4 py-4"
                  key={key}
                  style={{ width: "100%" }}
                >
                  <i className="skeleton absolute h-[50px] w-[50px] rounded-full"></i>
                  <div className="ml-[60px] w-full">
                    <div className="skeleton mb-[10px] h-[10px] w-[30%] rounded-md"></div>
                    <div className="skeleton h-[15px] w-[80%] rounded-md"></div>
                  </div>
                </div>
              ))}
            </>
          )}

          {addUsersLoading && (
            <div className="mb-5 flex items-center justify-center">
              <i className="mr-1">
                <CircularProgress variant="plain" size="sm" />
              </i>{" "}
              loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddParticipants;
