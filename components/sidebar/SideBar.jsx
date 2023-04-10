import { useState, useEffect, useContext } from "react";
import { useTheme } from "next-themes";
import { BsSun, BsMoon } from "react-icons/bs";
import { BsChatRightText } from "react-icons/bs";
import { MdPersonAddAlt } from "react-icons/md";
import { AiOutlineSetting } from "react-icons/ai";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { getAuth, signOut } from "firebase/auth";

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
    <div className="h-[50px] justify-center w-[500px] max-h-screen md:max-w-[70px] md:w-[5%] md:h-screen  md:min-w-[70px] flex  md:flex-col md:justify-between dark:bg-gray-900 text-white shadow-lg">
      <i className="flex md:flex-col">
        <SideBarIcon icon={<BsChatRightText size="20" />} clickevent="chats" />
        <SideBarIcon
          icon={<MdPersonAddAlt size="27" />}
          clickevent="addcontact"
        />
      </i>

      <i className="md:mx-auto flex md:flex-col mb-10 cursor-pointer">
        <button
          className="bg-red-600 mx-0 my-0"
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
          sign out
        </button>
        <button className="mx-0 my-0" onClick={()=>{
          localStorage.clear()
        }}>reset local</button>
        <SideBarIcon icon={renderThemeChanger()} />
        <SideBarIcon icon={<AiOutlineSetting size={22} />} />
      </i>
    </div>
  );
};

export default SideBar;
