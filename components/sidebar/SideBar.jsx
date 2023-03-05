import { useState, useEffect, useContext } from "react";
import { useTheme } from "next-themes";
import { BsSun, BsMoon } from "react-icons/bs";
import { BsChatRightText } from "react-icons/bs";
import { MdPersonAddAlt } from "react-icons/md";
import { AiOutlineSetting } from "react-icons/ai";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

const SideBarIcon = ({ icon, text = "tooltip", clickevent }) => {
  const { setSelectedChannel } = useContext(SelectedChannelContext);
  return (
    <div
      className="sidebar-icon group"
      onClick={() => {
        setSelectedChannel(clickevent);
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
        <BsSun
          size={20}
          onClick={() => {
            setTheme("light");
          }}
        />
      );
    } else {
      return (
        <BsMoon
          color="black"
          size={20}
          onClick={() => {
            setTheme("dark");
          }}
        />
      );
    }
  };
  return (
    <div className="h-screen w-20 px-5- flex flex-col justify-between dark:bg-gray-900 text-white shadow-lg">
      <i>
        <SideBarIcon icon={<BsChatRightText size="20" />} clickevent="chats" />
        <SideBarIcon
          icon={<MdPersonAddAlt size="27" />}
          clickevent="addcontact"
        />
      </i>

      <i className="mx-auto flex flex-col mb-10 cursor-pointer">
        <SideBarIcon icon={renderThemeChanger()} />
        <SideBarIcon icon={<AiOutlineSetting size={22} />} />
      </i>
    </div>
  );
};

export default SideBar;
