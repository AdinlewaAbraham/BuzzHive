import { useState, useEffect, useContext } from "react";
import { MdOutlineChat, MdOutlinePermIdentity } from "react-icons/md";
import { MdPersonAddAlt, MdOutlineGroupAdd } from "react-icons/md";
import { AiOutlineSetting } from "react-icons/ai";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";

import { createUser } from "@/utils/userUtils/createUser";
import { faker } from "@faker-js/faker";

import { deleteDB } from "idb";
const SideBarIcon = ({ icon, text, clickevent }) => {
  const {
    setSelectedChannel,
    selectedChannel,
    prevSelectedChannel,
    setprevSelectedChannel,
    ChatObject,
  } = useContext(SelectedChannelContext);

  const [IsMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function widthResizer() {
      const width = window.innerWidth < 768;
      setIsMobile(width);
    }

    widthResizer();

    window.addEventListener("resize", widthResizer);

    return () => window.removeEventListener("resize", widthResizer);
  }, []);

  const channels = {
    chats: 1,
    addcontact: 2,
    addGroup: 3,
    settings: 4,
    profileSettings: 5,
  };
  function handleClick() {
    setprevSelectedChannel(selectedChannel);

    setSelectedChannel(clickevent ? clickevent : selectedChannel);
  }
  return (
    <div className="relative flex items-center justify-center md:mb-1 md:w-[5%] md:min-w-[70px] md:max-w-[70px]">
      <span
        className={`rounded-sm duration-150 ease-out ${IsMobile && ChatObject.activeChatId !== "" && "hidden"
          } ${selectedChannel === clickevent
            ? ` opacity-1  right-[25%] md:bottom-[25%] ${channels[prevSelectedChannel] > channels[clickevent] &&
            "left-[25%] md:top-[25%]"
            } w-[50%] md:h-[50%] `
            : " left-[25%] w-[65%] opacity-0 md:bottom-[25%] md:h-[80%]"
          } ${prevSelectedChannel === clickevent &&
          `${channels[selectedChannel] < channels[prevSelectedChannel]
            ? `${IsMobile ? "" : "lineComingFromTop"} `
            : `${IsMobile ? "" : "lineComingFromBottom"} `
          } `
          } absolute  bottom-0 z-[1] h-1 bg-accent-blue transition-[width] md:left-0 md:w-1 md:transition-[height]`}
      ></span>

      <div
        className={`sidebar-icon group flex items-center ${selectedChannel === clickevent && "bg-hover-light dark:bg-hover-dark"
          }`}
        onClick={() => {
          if (selectedChannel !== clickevent) handleClick();
        }}
      >
        <i className="text-muted-light dark:text-muted-dark">{icon}</i>
        <span className="sidebar-tooltip group-hover:scale-100">{text}</span>
      </div>
    </div>
  );
};

const SideBar = () => {
  const [Mounted, setMounted] = useState(false);

  const [invalidURL, setinvalidURL] = useState(true);
  const { User } = useContext(UserContext);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function clearIndexedDB() {
    try {
      await deleteDB("myDatabase");

    } catch (error) {
      console.error("Failed to clear IndexedDB:", error);
    }
  }

  const addUser = async () => {
    for (let i = 0; i < 40; i++) {
      const fakeDisplayName = faker.internet.userName()
      const fakeEmail = faker.internet.email()
      const fakePhotoUrl = faker.image.avatar();
      const fakeBio = " faker.lorem.sentence();"
      createUser(faker.string.uuid(), fakeDisplayName, fakeEmail, fakePhotoUrl, fakeBio);
    }
  };
  return (
    <div
      className=" flex h-[70px] w-full items-center justify-center
     bg-light-secondary text-white dark:bg-dark-secondary
      md:h-screen md:max-h-screen md:w-[5%] md:min-w-[70px] md:max-w-[70px] md:flex-col 
       md:justify-between md:pt-10 md:pb-5 "
    >
      {/* <button onClick={() => addUser()}>add user</button> */}
      <i className="flex md:flex-col">
        <SideBarIcon
          icon={<MdOutlineChat size="23" />}
          clickevent="chats"
          text="Chats"
        />
        <SideBarIcon
          icon={<MdPersonAddAlt size="27" />}
          clickevent="addcontact"
          text="Add contact"
        />
        <SideBarIcon
          icon={<MdOutlineGroupAdd size="27" />}
          clickevent="addGroup"
          text="Add group"
        />
      </i>
      {/* <button onClick={() => localStorage.clear()}>clear</button> */}
      <div className="flex items-center justify-center md:flex-col ">
        <SideBarIcon
          icon={<AiOutlineSetting size={22} />}
          clickevent="settings"
          text="settings"
        />
        <SideBarIcon
          icon={
            <div
              className={`flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-lg bg-inherit [&>i]:flex [&>i]:h-full [&>i]:items-center [&>i]:justify-center `}
            >
              {User.photoUrl && invalidURL ? (
                <img
                  src={User.photoUrl}
                  alt="profile pic"
                  className={`h-full w-full rounded-lg object-cover`}
                  onError={() => setinvalidURL(false)}
                />
              ) : (
                <i>
                  <MdOutlinePermIdentity size="30" />
                </i>
              )}
            </div>
          }
          clickevent="profileSettings"
          text="Profile"
        />
      </div>
    </div>
  );
};

export default SideBar;
