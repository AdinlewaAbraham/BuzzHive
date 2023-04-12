import { useState, useEffect, useContext } from "react";
import { useTheme } from "next-themes";
import { BsSun, BsMoon } from "react-icons/bs";
import { BsChatRightText } from "react-icons/bs";
import { MdOutlineDelete, MdPersonAddAlt } from "react-icons/md";
import { AiOutlineSetting } from "react-icons/ai";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { getAuth, signOut } from "firebase/auth";

import { BiLogOut } from "react-icons/bi";

const SideBarIcon = ({ icon, text = "tooltip", clickevent }) => {
  const { setSelectedChannel, selectedChannel } = useContext(
    SelectedChannelContext
  );
  return (
    <div
      className="sidebar-icon group"
      onClick={() => {
        console.log(clickevent);
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
    <div className="h-[50px] justify-center w-screen max-h-screen md:max-w-[70px] md:w-[5%] md:h-screen  md:min-w-[70px] flex  md:flex-col md:justify-between dark:bg-gray-900 text-white shadow-lg">
      <i className="flex md:flex-col">
        <SideBarIcon icon={<BsChatRightText size="20" />} clickevent="chats" />
        <SideBarIcon
          icon={<MdPersonAddAlt size="27" />}
          clickevent="addcontact"
        />
      </i>

      <i className="md:mx-auto flex md:flex-col mb-10 cursor-pointer">
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
    </div>
  );
};

export default SideBar;
