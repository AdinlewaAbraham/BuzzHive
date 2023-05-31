import { useState, useEffect, useContext } from "react";
import { useTheme } from "next-themes";
import { BsSun, BsMoon } from "react-icons/bs";
import { BsChatRightText } from "react-icons/bs";
import { MdOutlineDelete, MdPersonAddAlt } from "react-icons/md";
import { AiOutlineSetting } from "react-icons/ai";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { getAuth, signOut } from "firebase/auth";
import { UserContext } from "../App";

import { BiLogOut } from "react-icons/bi";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { deleteDB } from "idb";
import { FcDeleteDatabase } from "react-icons/fc";
import Img from "../Img";
const SideBarIcon = ({ icon, text = "tooltip", clickevent }) => {
  const { setSelectedChannel, selectedChannel } = useContext(
    SelectedChannelContext
  );
  return (
    <div
      className="sidebar-icon group"
      onClick={() => {
        setSelectedChannel(clickevent ? clickevent : selectedChannel);
      }}
    >
      {icon}
      <span className="sidebar-tooltip group-hover:scale-100">{text}</span>
    </div>
  );
};

const SideBar = () => {
  const [Mounted, setMounted] = useState(false);

  const { systemTheme, theme, setTheme } = useTheme();
  const { User } = useContext(UserContext);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderThemeChanger = () => {
    if (!Mounted) return null;
    const currenTheme = theme === "system" ? systemTheme : theme;

    if (currenTheme === "dark") {
      return (
        <i
          onClick={() => {
            setTheme("light");
          }}
        >
          <SideBarIcon icon={<BsSun size={20} />} />
        </i>
      );
    } else {
      return (
        <i
          onClick={() => {
            setTheme("dark");
          }}
        >
          <SideBarIcon icon={<BsMoon color="black" size={20} />} />
        </i>
      );
    }
  };

  async function clearIndexedDB() {
    try {
      await deleteDB("myDatabase");
      console.log("IndexedDB cleared successfully.");
    } catch (error) {
      console.error("Failed to clear IndexedDB:", error);
    }
  }

  return (
    <div
      className=" flex h-[70px] w-full items-center justify-center
     bg-[#f0f2f5] text-white dark:bg-[#12171d]
      md:h-screen md:max-h-screen md:w-[5%] md:min-w-[70px] md:max-w-[70px] md:flex-col 
       md:justify-between md:pt-10 md:pb-5 "
    >
      <i className="flex md:flex-col">
        <SideBarIcon icon={<BsChatRightText size="20" />} clickevent="chats" />
        <SideBarIcon
          icon={<MdPersonAddAlt size="27" />}
          clickevent="addcontact"
        />
      </i>

      <i className="flex cursor-pointer md:mx-auto md:flex-col">
        <i
          onClick={() => {
            const auth = getAuth();
            signOut(auth)
              .then(() => {
                console.log("Sign-out successful.");
              })
              .catch((error) => {
                console.log(error);
              });
          }}
        >
          <SideBarIcon icon={<BiLogOut size="27" />} />
        </i>
        <i
          onClick={() => {
            localStorage.clear();
          }}
        >
          <SideBarIcon icon={<MdOutlineDelete size="27" />} />
        </i>
        <i
          onClick={() => {
            clearIndexedDB();
          }}
        >
          <SideBarIcon icon={<FcDeleteDatabase size="27" />} />
        </i>
        {/* {renderThemeChanger()} */}
      </i>
      {renderThemeChanger()}
      <div className="flex items-center justify-center md:flex-col ">
        <SideBarIcon
          icon={<AiOutlineSetting size={22} />}
          clickevent="settings"
        />
        <SideBarIcon
          icon={
            <Img
              src={User.photoUrl}
              type="personal"
              styles="rounded-lg flex justify-center items-center cursor-pointer w-[30px] h-[30px]"
              imgStyles="rounded-lg"
              personalSize="80"
            />
          }
          clickevent="profileSettings"
        />
      </div>
    </div>
  );
};

export default SideBar;
