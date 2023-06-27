import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
} from "react";
import { UserContext } from "../../App";
import { createGroup } from "@/utils/groupUtils/createGroup";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import { AiFillPlusCircle } from "react-icons/ai";
import Goback from "../Goback";
import { GiCancel } from "react-icons/gi";
import { CircularProgress } from "@mui/joy";
import { downScalePicVid } from "@/utils/messagesUtils/downScalePicVid";
import { FaUserAlt } from "react-icons/fa";
import {
  collection,
  query,
  limit,
  getDocs,
  startAfter,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import ModalComp from "@/components/ModalComp";
import { AnimatePresence, motion } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Checkbox from "@/components/Checkbox";
import { MdVerified } from "react-icons/md";

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
        <i className="mr-2 flex h-[45px] w-[45px] items-center justify-center rounded-full bg-cover ">
          <FaUserAlt size={22} />
        </i>
      )}
      <div className="flex items-center">
        <p className="">{p.name}</p>
        {p.id === "eaqHdrv5x1Z4jF7ZPoU6s7r1jOB2" && (
          <i className="ml-2 flex items-center border text-accent-blue">
            <MdVerified />
          </i>
        )}
      </div>
      <div className="outlined-none ml-auto h-5 w-5 rounded-lg">
        <Checkbox isChecked={p.isSelected} />
      </div>
    </div>
  );
};

const AddGroup = () => {
  const [animationParent] = useAutoAnimate({ duration: 150 });
  const { User } = useContext(UserContext);
  const { setSelectedChannel, prevSelectedChannel, setprevSelectedChannel } =
    useContext(SelectedChannelContext);
  const [selectedUsers, setselectedUsers] = useState([]);
  const [activeUsers, setactiveUsers] = useState([]);
  const [showAddGroupMenu, setshowAddGroupMenu] = useState(false);
  const [groupName, setgroupName] = useState("");
  const [height, setHeight] = useState(0);
  const [IsMobile, setIsMobile] = useState(false);

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [addUsersLoading, setaddUsersLoading] = useState(false);
  const [open, setOpen] = React.useState(false);

  const [creatingGroupLoading, setcreatingGroupLoading] = useState(false);

  const [groupBio, setgroupBio] = useState("");

  const [profilePic, setprofilePic] = useState(null);

  let data = localStorage.getItem(`${User.id}_userChats`);
  useEffect(() => {
    data ? setactiveUsers(JSON.parse(data)) : 0;
  }, [data]);

  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    setHeight(ref.current.clientHeight);
  }, [selectedUsers]);

  function handleSelect(user, checked) {
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
  }
  const handleRemoveUser = (userId) => {
    const updatedUsers = selectedUsers.filter((user) => user.id !== userId);
    setselectedUsers(updatedUsers);
  };
  useEffect(() => {
    function widthResizer() {
      const width = window.innerWidth < 768;
      setIsMobile(width);
    }

    widthResizer();

    window.addEventListener("resize", widthResizer);

    return () => window.removeEventListener("resize", widthResizer);
  }, []);
  const divStyles = {
    maxHeight: `calc(100vh - 125px${
      selectedUsers.length > 0
        ? ` - ${height}px - ${IsMobile ? "130px" : "60px"}`
        : ""
    })`,
    transition: "height ease-in-out 150ms",
  };
  const showAddGroupMenudivStyles = {
    maxHeight: `calc(100vh - 80px${
      selectedUsers.length > 0
        ? ` - ${height}px - ${IsMobile ? "130px" : "60px"}`
        : ""
    })`,
    transition: "max-height 0.5s ease",
  };

  const createGroupFunc = async () => {
    if (!groupName) {
      return;
    }
    setcreatingGroupLoading(true);

    const members = selectedUsers.map((user) => user.id);
    const profilePicBlob = await downScalePicVid(profilePic, 0.7, 1, 0);
    createGroup(
      members,
      false,
      User.id,
      groupName,
      profilePicBlob || null,
      groupBio || "Welcome to our group!",
      User.name
    ).then(() => {
      setcreatingGroupLoading(false);
      setSelectedChannel("chats");
    });
  };
  const filterUsersWithQuery = (SearchQuery) => {
    const filteredUsers = activeUsers.filter((user) => {
      console.log(user);
      const lowercaseName = user.senderDisplayName.toLowerCase();
      const lowercaseSearchQuery = SearchQuery.toLowerCase();
      return lowercaseName.includes(lowercaseSearchQuery);
    });

    setactiveUsers(filteredUsers);
  };

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

  const scrollContainerRef = useRef(null);
  const handleOnScroll = () => {
    const container = scrollContainerRef.current;

    if (!container) return;

    let triggerHeight = container.scrollTop + container.offsetHeight;
    if (triggerHeight >= container.scrollHeight - 20 && hasMore) {
      addUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  function goBack() {
    if (showAddGroupMenu) {
      setshowAddGroupMenu(false);
      return;
    }
    if (selectedUsers.length > 0) {
      setOpen(true);
      return;
    }
    setSelectedChannel(prevSelectedChannel || "chats");
    setprevSelectedChannel("addGroup");
  }
  function cancelCreateGroup() {
    setOpen(true);
  }
  return (
    <div className="relative h-full min-h-[430px]">
      <ModalComp
        open={open}
        setOpen={setOpen}
        discardFunc={() => {
          setSelectedChannel("chats");
          setOpen(false);
        }}
        header="Cancel creating group"
        description="Your group members will not be saved"
      />
      <Goback text="New group" clickFunc={goBack} />
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
                  <img
                    className="mr-1 h-5 rounded-full"
                    src={user.photoUrl}
                    alt=""
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

      <AnimatePresence>
        {showAddGroupMenu ? (
          <motion.div
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ x: 70, opacity: 0 }}
            transition={{
              ease: "linear",
              duration: 0.15,
            }}
            className={`flex  flex-col justify-between`}
          >
            <div
              style={showAddGroupMenudivStyles}
              className={`scrollBar relative
           flex flex-col justify-between
            overflow-y-auto px-1 
           pb-5 `}
            >
              <div className="-center  my-7 flex items-center">
                <label
                  for="dropzone-file"
                  className="cursor-pointier flex w-full cursor-pointer items-center justify-start rounded-lg "
                >
                  {!profilePic ? (
                    <div className="relative mr-3 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gray-500">
                      <MdGroup size={35} />
                    </div>
                  ) : (
                    <img
                      className="relative mr-3 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gray-500"
                      src={URL.createObjectURL(profilePic)}
                    />
                  )}
                  <input
                    disabled={creatingGroupLoading}
                    onChange={(e) => setprofilePic(e.target.files[0])}
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                  />

                  <p className=" text-[15px]">
                    Add group Icon{" "}
                    <span className="text-muted-light dark:text-muted-dark">
                      (optional)
                    </span>
                  </p>
                </label>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Provide a group subject</h3>
                <input
                  type="text"
                  className=" w-full rounded-lg bg-light-secondary px-3 py-2 placeholder-muted-light outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
                  placeholder="Enter group name"
                  onChange={(e) => {
                    setgroupName(e.target.value);
                  }}
                />
              </div>
              <div className="mt-4">
                <h3 className="mb-2 font-medium">
                  Provide a group bio{" "}
                  <span className="text-muted-light dark:text-muted-dark">
                    {"(optional)"}
                  </span>
                </h3>
                <input
                  type="text"
                  className=" w-full rounded-lg bg-light-secondary px-3 py-2 placeholder-muted-light outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
                  placeholder="Enter group bio"
                  value={groupBio}
                  onChange={(e) => {
                    setgroupBio(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="  left-0 bottom-0 mt-auto flex w-full" >
              <button
                className={`mr-1 flex w-1/2 items-center justify-center rounded-lg bg-accent-blue py-2 ${
                  creatingGroupLoading && "cursor-wait"
                } `}
                onClick={createGroupFunc}
                disabled={creatingGroupLoading}
              >
                {creatingGroupLoading && (
                  <CircularProgress
                    color="neutral"
                    size="sm"
                    value={23}
                    variant="plain"
                  />
                )}
                <p className="ml-2">
                  {creatingGroupLoading ? "Creating" : "Create"}
                </p>
              </button>
              <button
                onClick={cancelCreateGroup}
                disabled={creatingGroupLoading}
                className={`w-1/2 rounded-lg bg-gray-500 py-2 ${
                  creatingGroupLoading && "cursor-wait"
                } `}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-3 flex w-full items-center justify-center">
              <input
                type="text"
                className=" w-[90%] rounded-lg bg-light-secondary px-3 py-2 
                placeholder-muted-light outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                <button
                  className="mr-1 w-1/2 rounded-lg bg-accent-blue py-2"
                  onClick={() => {
                    setshowAddGroupMenu(true);
                  }}
                >
                  Next
                </button>
                <button
                  onClick={goBack}
                  className="w-1/2 rounded-lg  bg-gray-500 py-2"
                >
                  Cancel
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={divStyles}
              ref={scrollContainerRef}
              onScroll={handleOnScroll}
              className={` scrollBar relative
                mt-[10px] overflow-y-auto transition-all duration-200  `}
            >
              {activeUsers?.length > 0 && (
                <div className="relative">
                  <h2
                    className="sticky top-0 mb-1 bg-light-primary p-2 pt-0
                  text-muted-light dark:bg-dark-primary dark:text-muted-dark "
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
                            className={`${
                              user.type == "group" ? "hidden" : ""
                            }`}
                            key={`active${user.id}`}
                          >
                            <UserCard
                              id={user.id}
                              photoUrl={user.senderDisplayImg}
                              name={user.senderDisplayName}
                              isSelected={selectedUsers.some(
                                (u) =>
                                  JSON.stringify(u) === JSON.stringify(userObj)
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
                      className="flex cursor-pointer items-center px-4 py-4"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AddGroup;
