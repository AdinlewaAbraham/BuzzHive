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
      {icon}{" "}
      <span className="sidebar-tooltip group-hover:scale-100">{text}</span>
    </div>
  );
};

const SideBar = () => {
  const [Mounted, setMounted] = useState(false);

  const { systemTheme, theme, setTheme } = useTheme();
  const {User} = useContext(UserContext)

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

  return (
    <div className=" justify-center items-center w-full h-[70px] md:max-h-screen
     md:max-w-[70px] md:w-[5%] md:h-screen
      md:min-w-[70px] flex md:flex-col md:justify-between bg-gray-900 dark:bg-[#12171d]
       text-white md:pt-10 md:pb-5 ">
      <i className="flex md:flex-col">
        <SideBarIcon icon={<BsChatRightText size="20" />} clickevent="chats" />
        <SideBarIcon
          icon={<MdPersonAddAlt size="27" />}
          clickevent="addcontact"
        />
      </i>

      <i className="md:mx-auto flex md:flex-col cursor-pointer">
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
        {renderThemeChanger()}
        <SideBarIcon icon={<AiOutlineSetting size={22} />} />
      </i>
      <div className=" flex justify-center items-center cursor-pointer">
        <img src={User.photoUrl} alt="" className="rounded-lg w-[30px] h-[30px] " />
      </div>
    </div>
  );
};

export default SideBar;
