import React, { useContext, useEffect, useMemo, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import useFetchUsers from "@/hooks/useFetchUsers";
import { UserContext } from "../../App";
import { createGroup } from "@/utils/groupUtils/createGroup";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import { AiFillPlusCircle } from "react-icons/ai";
import Goback from "../Goback";

const UserCard = (p) => {
  return (
    <div
      key={p.id}
      className="mr-1 flex cursor-pointer items-center rounded-md px-2 py-2 hover:bg-hover-light dark:hover:bg-hover-dark"
      onClick={p.onSelect}
    >
      <img
        src={p.photoUrl}
        alt=""
        className="mr-2 h-[45px] w-[45px] rounded-full"
      />
      <div>
        <p className="">{p.name}</p>
      </div>
      <input
        type="checkbox"
        className="outlined-none ml-auto h-5 w-5 rounded-lg"
        checked={p.isSelected}
        readOnly
      />
    </div>
  );
};

const AddGroup = () => {
  const { User } = useContext(UserContext);
  const { ShowAddGroup, setShowAddGroup, setSelectedChannel } = useContext(
    SelectedChannelContext
  );
  const { users } = useFetchUsers();
  const [selectedUsers, setselectedUsers] = useState([]);
  const [activeUsers, setactiveUsers] = useState([]);
  const [showAddGroupMenu, setshowAddGroupMenu] = useState(false);
  const [groupName, setgroupName] = useState("");
  const [isGroupPubic, setisGroupPubic] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  let data = localStorage.getItem(`${User.id}_userChats`);
  useEffect(() => {
    data ? setactiveUsers(JSON.parse(data)) : 0;
  }, [data]);

  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    content: {
      top: "50%",
      left: "55%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      zIndex: "50",
      color: "black",
    },
  };

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
  useEffect(() => {
    selectedUsers;
  }, [selectedUsers]);
  const handleClick = () => {
    if (!selectedUsers[0]) {
      setSelectedChannel("chats");
    }
  };
  return (
    <div className="relative h-full min-h-[430px]">
      <Goback text="New group" />
      {selectedUsers.length > 0 && (
        <div className="mb-3 flex flex-col">
          <div
            className="my-element scrollbar-thumb-rounded-[2px] flex max-h-[100px] flex-wrap
           items-center overflow-y-auto rounded-lg bg-light-secondary  py-1 scrollbar-thin scrollbar-track-transparent
              scrollbar-thumb-scrollbar-light dark:bg-dark-secondary dark:scrollbar-track-[transparent]
               dark:scrollbar-thumb-scrollbar-dark "
          >
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                id={user.id}
                className="text-bold m-1 flex items-center whitespace-nowrap rounded-lg bg-accent-blue
               px-2 py-1 text-center text-[12px] font-semibold"
              >
                <img className="h-5 rounded-full" src={user.photoUrl} alt="" />
                {user.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddGroupMenu ? (
        <div className="flex flex-col justify-between">
          <>
            <div className="my-5  flex items-center justify-center">
              <label
                for="dropzone-file"
                className="flex cursor-pointer items-center justify-center"
              >
                <div className="relative mr-3 flex h-[150px] w-[150px] items-center justify-center rounded-full bg-gray-500">
                  <MdGroup size={35} />
                  <div className="absolute top-[35%]">
                    <p className="hidden text-[15px]">
                      Add group Icon{" "}
                      <span className="text-gray-400">(optional)</span>
                    </p>
                  </div>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
              </label>
            </div>

            <div class="relative mt-10">
              <input
                id="password"
                type="text"
                name="input grroup name"
                className="peer h-10 w-full border-b-2 border-green-300 text-white placeholder-transparent focus:border-b-pink-600 
                focus:outline-none dark:bg-gray-800"
                placeholder="input group name"
                onChange={(e) => {
                  setgroupName(e.target.value);
                }}
              />
              <label
                for="password"
                className={`absolute left-0 -top-3.5 text-sm text-white transition-all peer-placeholder-shown:top-2
                 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                  ${
                    groupName
                      ? "peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-pink-600"
                      : ""
                  } `}
              >
                input group name
              </label>
              <div className="item-center mt-6 flex justify-between">
                <div>
                  <h3 className="text-2xl">make group public </h3>
                  <p className="text-sm text-gray-500">
                    {isGroupPubic ? "Public" : "private"}
                  </p>
                  <p className="text-sm">
                    if checked any group member will be able to add member
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isGroupPubic}
                  onChange={(e) => {
                    setisGroupPubic(e.target.checked);
                  }}
                />
              </div>
            </div>
          </>
          <div className="absolute left-0 bottom-0 mt-auto flex w-full">
            <button
              className="mr-1 w-1/2 bg-green-700 py-2"
              onClick={() => {
                const members = selectedUsers.map((user) => user.id);
                createGroup(
                  members,
                  true,
                  User.id,
                  groupName,
                  null,
                  "debo is the greatest"
                );
              }}
            >
              Create
            </button>
            <button className="w-1/2 bg-gray-500 py-2">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex w-full items-center justify-center">
            <input
              type="text"
              className=" w-[90%] rounded-lg bg-light-secondary px-3 py-2 placeholder-muted-light outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
              placeholder="Search"
            />
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex">
              <button
                className="mr-1 w-1/2 rounded-lg bg-accent-blue py-2"
                onClick={() => {
                  setshowAddGroupMenu(true);
                }}
              >
                Next
              </button>
              <button className="w-1/2 rounded-lg  bg-gray-500 py-2">
                Cancel
              </button>
            </div>
          )}

          <div
            className="my-element scrollbar-thumb-rounded-[2px] hover:scrollbar- relative mt-[10px] max-h-[calc(100vh-200px)]  overflow-y-auto scrollbar-thin
              scrollbar-thumb-scrollbar-light scrollbar-track-[transparent] dark:scrollbar-thumb-scrollbar-dark "
          >
            <h2
              className="sticky top-0 mb-1 rounded-lg bg-light-primary p-2 pt-0
             text-xl text-muted-light dark:bg-dark-primary dark:text-muted-dark "
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
                    <div className={`${user.type == "group" ? "hidden" : ""}`}>
                      <UserCard
                        id={user.id}
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
            <h2
              className="sticky top-0 mb-1 mt-1 rounded-lg bg-light-primary p-2
             text-xl text-muted-light dark:bg-dark-primary dark:text-muted-dark"
            >
              All users
            </h2>
            {[...users, ...users, ...users, ...users, ...users].map((user) => {
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
                  onSelect={(isSelected) => handleSelect(userObj, isSelected)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AddGroup;
