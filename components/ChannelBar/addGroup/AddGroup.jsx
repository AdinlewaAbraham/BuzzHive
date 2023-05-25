import React, { useContext, useEffect, useMemo, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import useFetchUsers from "@/hooks/useFetchUsers";
import { UserContext } from "../../App";
import { createGroup } from "@/utils/groupUtils/createGroup";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import { AiFillPlusCircle } from "react-icons/ai";

import Modal from "react-modal";

const UserCard = (p) => {
  return (
    <div
      key={p.id}
      className="flex items-center px-2 py-2 mr-1 hover:bg-gray-600 cursor-pointer rounded-md"
      onClick={p.onSelect}
    >
      <img src={p.photoUrl} alt="" className="w-10 h-10 mr-2 rounded-full" />
      <div>
        <p className="font-bold">{p.name}</p>
      </div>
      <input
        type="checkbox"
        className="ml-auto rounded-lg h-5 w-5"
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
    console.log(selectedUsers);
  }, [selectedUsers]);

  return (
    <div className="relative h-full min-h-[430px]">
      {/* <button onClick={() => setIsOpen(true)}>Open Modal</button> */}
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        style={customStyles}
      >
        <h1>Modal Content</h1>
        <button onClick={() => setIsOpen(false)}>Close Modal</button>
      </Modal>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => {
          if (!selectedUsers[0]) {
            setSelectedChannel("chats");
          }
        }}
      >
        <BiArrowBack size={20} />
        <h1 className="text-2xl ml-2  mb-2">New group</h1>
      </div>
      <div className="flex flex-col mt-3">
        <div
          className="rounded-lg flex flex-wrap bg-white items-center max-h-[100px] my-element overflow-y-auto scrollbar-thin  scrollbar-thumb-rounded-[2px] scrollbar-thumb-blue-700
              scrollbar-track-blue-300 dark:scrollbar-thumb-gray-500 dark:scrollbar-track-[transparent] hover:scrollbar- "
        >
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              id={user.id}
              className="flex items-center bg-gray-500 text-[12px] text-bold text-center whitespace-nowrap
               px-2 py-1 m-1 font-semibold rounded-lg"
            >
              <img className="h-5 rounded-full" src={user.photoUrl} alt="" />
              {user.name}
            </div>
          ))}
        </div>
      </div>

      {showAddGroupMenu ? (
        <div className="flex flex-col justify-between">
          <>
            <div className="my-5  flex items-center justify-center">
              <label
                for="dropzone-file"
                className="cursor-pointer flex items-center justify-center"
              >
                <div className="w-[150px] h-[150px] mr-3 relative rounded-full bg-gray-500 flex items-center justify-center">
                  <MdGroup size={35} />
                  <div className="absolute top-[35%]">
                    <p className="text-[15px] hidden">
                      Add group Icon{" "}
                      <span className="text-gray-400">(optional)</span>
                    </p>
                  </div>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
              </label>
            </div>

            <div class="mt-10 relative">
              <input
                id="password"
                type="text"
                name="input grroup name"
                className="peer dark:bg-gray-800 h-10 w-full border-b-2 border-green-300 text-white placeholder-transparent 
                focus:outline-none focus:border-b-pink-600"
                placeholder="input group name"
                onChange={(e) => {
                  setgroupName(e.target.value);
                }}
              />
              <label
                for="password"
                className={`absolute left-0 -top-3.5 text-white text-sm transition-all peer-placeholder-shown:text-base
                 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2
                  ${
                    groupName
                      ? "peer-focus:-top-3.5 peer-focus:text-pink-600 peer-focus:text-sm"
                      : ""
                  } `}
              >
                input group name
              </label>
              <div className="mt-6 flex justify-between item-center">
                <div>
                  <h3 className="text-2xl">make group public </h3>
                  <p className="text-gray-500 text-sm">
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
          <div className="flex absolute w-full mt-auto left-0 bottom-0">
            <button
              className="w-1/2 py-2 bg-green-700 mr-1"
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
            <button className="w-1/2 py-2 bg-gray-500">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <input
            type="text"
            className=" border-b-pink-600 border-b-[2px] bg-inherit w-full mt-2 text-black appearance-none caret-black
                       focus:outline-none min-w-1 px-2 py-1"
            placeholder="search"
          />
          {selectedUsers.length > 0 && (
            <div className="flex mt-2">
              <button
                className="w-1/2 py-2 bg-green-700 mr-1 rounded-lg"
                onClick={() => {
                  setshowAddGroupMenu(true);
                }}
              >
                next
              </button>{" "}
              <button className="w-1/2 py-2  bg-gray-500 rounded-lg">
                cancel
              </button>
            </div>
          )}

          <div
            className="relative max-h-[calc(100vh-200px)] mt-[10px] my-element overflow-y-auto scrollbar-thin  scrollbar-thumb-rounded-[2px] scrollbar-thumb-blue-700
              scrollbar-track-blue-300 dark:scrollbar-thumb-gray-500 dark:scrollbar-track-[transparent] hover:scrollbar- "
          >
            <p className="text-gray-400 py-1 mt-5 mb-1 sticky top-0  dark:bg-gray-800">
              Active Chats
            </p>
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
            <p className="text-gray-400 mt-1 mb-4 py-1 sticky top-0 z-20 dark:bg-gray-800">
              All Users
            </p>
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
