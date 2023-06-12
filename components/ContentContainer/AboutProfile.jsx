import React, { useContext, useEffect, useState } from "react";
import Img from "../Img";
import { db } from "@/utils/firebaseUtils/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { BiArrowBack, BiAt } from "react-icons/bi";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";
import { ImBlocked } from "react-icons/im";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";
import { MdGroup } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import Goback from "../ChannelBar/Goback";

const Menu = ({ icon, header, context }) => {
  return (
    <div className="flex items-center my-3">
      {icon}
      <div className="ml-3">
        <h4>{header}</h4>
        <p>{context}</p>
      </div>
    </div>
  );
};

const Header = ({ title, isActive, onClick }) => {
  const { ChatObject } = useContext(SelectedChannelContext);
  return ChatObject.activeChatType === "group" || title !== "Participants" ? (
    <div
      className={`mb-5 cursor-pointer ${
        isActive ? "border-b-2 border-blue-500 " : ""
      }`}
      onClick={onClick}
    >
      {title}
    </div>
  ) : null;
};

const Media = () => {
  return <div className="w-full h-[350px]">Component Media</div>;
};

const Files = () => {
  return <div className="w-full h-[350px]">Component Files</div>;
};

const Links = () => {
  return <div className="w-full h-[350px]">Component Links</div>;
};

const Participants = () => {
  return <div className="w-full h-[350px]">Component Participants</div>;
};

const AboutProfile = ({ setshowProfile, ChatObject }) => {
  const [profile, setprofile] = useState();

  const [activeComponent, setActiveComponent] = useState("Media");
  const [prevComponent, setPrevComponent] = useState(null);

  const [isAdmin, setisAdmin] = useState(false);
  const [invalidURL, setinvalidURL] = useState(true);
  const [showMenu, setshowMenu] = useState(false);

  const { User } = useContext(UserContext);

  const renderComponent = () => {
    switch (activeComponent) {
      case "Media":
        return <Media />;
      case "Files":
        return <Files />;
      case "Links":
        return <Links />;
      case "Participants":
        return <Participants />;
      default:
        return null;
    }
  };

  const handleHeaderClick = (component) => {
    setPrevComponent(activeComponent);
    setActiveComponent(component);
  };

  useEffect(() => {
    const getProfileBio = async () => {
      const queryLocation =
        ChatObject.activeChatType === "group" ? "groups" : "users";
      const ProfileRef = doc(db, queryLocation, ChatObject.otherUserId);
      const ProfileSnapshot = await getDoc(ProfileRef);
      setprofile(ProfileSnapshot.data());
    };
    return () => {
      getProfileBio();
    };
  }, []);

  const q = query(
    collection(db, "groups"),
    where("admins", "array-contains", User.id),
    where("id", "==", ChatObject.activeChatId)
  );

  getDocs(q)
    .then((querySnapshot) => {
      const isUserInArray = !querySnapshot.empty;
      setisAdmin(isUserInArray);
      (isUserInArray);
    })
    .catch((error) => {
      console.error("Error getting document: ", error);
    });
  (ChatObject);
  return (
    <div className="dark:bg-dark-secondary bg-light-secondary inset-0 left-[1px] absolute z-30 ">
      <div
        className=" p-[16px] pt-0 flex items-center absolute w-full top-0 cursor-pointer"
        onClick={() => {
          setshowProfile(false);
        }}
      >
       <Goback />
        <h3>contact info</h3>
      </div>
      <div className="">
        <div className="flex flex-col items-center justify-center mb-5 py-10 dark:bg-[#1d232a] relative">
          {showMenu && (
            <ul className="absolute top-[50%] right-[0]">
              <li>Remove image</li>
              <li>Open image</li>
              <li>Remove image</li>
            </ul>
          )}
          <div
            className={`ImgParentComp bg-inherit w-[200px] h-[200px] flex justify-center items-center rounded-full relative cursor-pointer`}
          >
            <div
              className="ImgChildComp absolute inset-0 opacity-0 rounded-full flex justify-center items-center"
              onClick={() => {
                isAdmin ? setshowMenu(true) : "open img";
              }}
            >
              {isAdmin && (
                <label className="flex items-center justify-center w-full h-full cursor-pointer py-1 px-2">
                  <MdOutlineModeEditOutline size={30} />
                  <input
                    type="file"
                    className="hidden w-full h-full cursor-pointer"
                    onChange={async (e) => {}}
                    accept="image/png, image/jpeg"
                  />
                </label>
              )}
            </div>

            {ChatObject.photoUrl && invalidURL ? (
              <img
                src={ChatObject.photoUrl}
                alt="profile pic"
                className={`rounded-full object-cover h-full w-full`}
                onError={() => setinvalidURL(false)}
              />
            ) : ChatObject.activeChatType === "group" ? (
              <MdGroup size="80%" />
            ) : (
              <FaUserAlt size="50%" />
            )}
          </div>
          <h3 className="mt-2">{ChatObject.displayName}</h3>
        </div>
        <div className="dark:bg-[#1d232a] p-5 mb-5">
          <Menu
            icon={<BiAt />}
            header="username"
            context={ChatObject.displayName}
          />
          <Menu
            icon={<AiOutlineInfoCircle />}
            header="Bio"
            context={ChatObject.displayName}
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-around p-5 mb-5 dark:bg-[#1d232a]">
        <div className="flex justify-around w-full">
          {["Media", "Files", "Links", "Participants"].map((header) => (
            <Header
              title={header}
              isActive={activeComponent === header}
              onClick={() => handleHeaderClick(header)}
            />
          ))}
        </div>
        <div>{renderComponent()}</div>
      </div>
      <div className="flex  text-red-500 items-center dark:bg-[#1d232a] w-full p-5 cursor-pointer mb-5">
        {ChatObject.activeChatType === "group" ? (
          <>
            <BiLogOut /> Exit Group{" "}
          </>
        ) : (
          <>
            <ImBlocked />
            Block {ChatObject.displayName}
          </>
        )}
      </div>
    </div>
  );
};

export default AboutProfile;
