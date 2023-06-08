import UserCard from "./UserCard";
import { UserContext } from "../../App";
import Goback from "../Goback";
import { faker } from "@faker-js/faker";
import { useState, useEffect, useContext } from "react";
import {
  collection,
  query,
  limit,
  getDocs,
  startAfter,
  orderBy,
} from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { createUser } from "@/utils/userUtils/createUser";
import { useRef } from "react";
import { CircularProgress } from "@mui/joy";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

const AddContact = () => {
  const { User } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [lastUser, setLastUser] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [addUsersLoading, setaddUsersLoading] = useState(false);

  const { setSelectedChannel, setprevSelectedChannel, prevSelectedChannel } =
    useContext(SelectedChannelContext);

  const fetchUsers = async () => {
    console.log("running");
    setLoading(true);
    const usersRef = collection(db, "users");
    console.log(lastUser);
    let q = query(usersRef, limit(10));

    if (lastUser) {
      (q = query(usersRef, orderBy("name"), startAfter(lastUser.data().name))),
        limit(10);
    } else {
      q = query(usersRef, orderBy("name"), limit(10));
    }
    try {
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map((doc) => doc.data());
      setUsers((prevUsers) => [...prevUsers, ...fetchedUsers]);
      setLastUser(querySnapshot.docs[querySnapshot.docs.length - 1]);
      if (querySnapshot.docs.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }

    setLoading(false);
  };
  const addUsers = async () => {
    if (addUsersLoading) return;
    setaddUsersLoading(true);
    const usersRef = collection(db, "users");
    const lastUser = users[users.length - 1];
    const q = query(
      usersRef,
      orderBy("name"),
      startAfter(lastUser.name),
      limit(10)
    );
    try {
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map((doc) => doc.data());
      setUsers((prevUsers) => [...prevUsers, ...fetchedUsers]);
      setLastUser(querySnapshot.docs[querySnapshot.docs.length - 1]);
      if (querySnapshot.docs.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setaddUsersLoading(false);
  };

  const scrollContainerRef = useRef(null);
  const handleOnScroll = () => {
    const container = scrollContainerRef.current;

    if (!container) return;

    let triggerHeight = container.scrollTop + container.offsetHeight;
    console.log(triggerHeight);
    console.log(container.scrollHeight);
    if (triggerHeight >= container.scrollHeight - 20 && hasMore) {
      addUsers();
      console.log("fetching users...");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const divStyles = {
    maxHeight: `calc(100vh - 125px)`,
  };
  function goBack() {
    setSelectedChannel(prevSelectedChannel);
    setprevSelectedChannel("addcontact");
  }
  return (
    <div className="">
      <Goback text="Add contact" clickFunc={goBack} />
      <div className="mb-3 mt-0 flex w-full items-center justify-center ">
        <input
          className=" w-[90%] rounded-lg bg-light-secondary px-3 py-2 placeholder-muted-light outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
          type="text"
          name=""
          placeholder="Search"
          id=""
        />
      </div>
      {loading ? (
        [1, 2, 3, 4, 5].map((key) => (
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
        ))
      ) : (
        <div
          style={divStyles}
          ref={scrollContainerRef}
          onScroll={handleOnScroll}
          className={`scrollBar  relative mt-[10px]
            overflow-y-auto 
           `}
        >
          {users
            .filter((user) => user.id !== User.id)
            .map((user) => (
              <UserCard
                name={user.name}
                id={user.id}
                image={user.photoUrl}
                user={user}
              />
            ))}
          {addUsersLoading && (
            <div className="mb-5 flex items-center justify-center">
              <i className="mr-1">
                <CircularProgress variant="plain" size="sm" />
              </i>{" "}
              loading...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddContact;
