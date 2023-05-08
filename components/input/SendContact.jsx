import React, { useContext, useEffect } from "react";
import { UserContext } from "../App";
import Img from "../Img";
import { useState } from "react";

const UserCard = (p) => {
  return (
    <li
      onClick={p.onSelect}
      className="flex items-center justify-between py-3 hover:bg-gray-700 cursor-pointer p-2 rounded-lg "
    >
      <div className="flex">
        <Img src={p.src} type="personal" styles="w-8 mr-2" />
        <p>{p.name}</p>
      </div>
      <input
        type="checkbox"
        className="w-4 h-4"
        checked={p.isSelected}
        readOnly
      />
    </li>
  );
};

const SendContact = ({setshowSendContact}) => {
  const { User } = useContext(UserContext);
  const [selectedUsers, setselectedUsers] = useState([]);

  const getStoredChats = () => {
    const storedData = localStorage.getItem(`${User.id}_userChats`);
    return storedData ? JSON.parse(storedData) : null;
  };
  const activeChats = getStoredChats();
  const contacts = activeChats
    ? activeChats.filter((contact) => contact.type !== "group")
    : null;
  console.log(contacts);

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
  const handleClickOutside = (e) => {
    if (!e.target.closest(".sendContact")) {
      setshowSendContact(false);
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []); 
  return (
    <div className="sendContact absolute bottom-5 left-5 dark:bg-black z-20 p-2 w-[50%] max-h-[70%] rounded-lg">
      <h1 className="text-xl font-bold ">Share Contact</h1>
      <input
        type="text"
        className="w-full rounded-lg px-3 py-2 mt-2 mb-5 outline-none"
        placeholder="search"
      />

      <h2 className="mb-2 text-gray-500">Active Chats</h2>
      <ul>
        {contacts &&
          contacts.map((contact) => {
            const userObj = {
              id: contact.otherParticipant,
              photoUrl: contact.senderDisplayImg,
              name: contact.senderDisplayName,
            };
            return (
              <UserCard
                src={contact.senderDisplayImg}
                name={contact.senderDisplayName}
                isSelected={selectedUsers.some(
                  (user) =>
                    JSON.stringify(user) === JSON.stringify(userObj)
                )}
                onSelect={(isSelected) => {
                  handleSelect(userObj, isSelected)
                }}
              />
            );
          })}
      </ul>
    </div>
  );
};

export default SendContact;
