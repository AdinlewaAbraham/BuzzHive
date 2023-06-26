import React, { useContext, useEffect, useState } from "react";
import Img from "../../Img";
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
import { UserContext } from "../../App";
import { MdGroup } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { MdClose } from "react-icons/md";
import ParticipantsComponent from "./ParticipantsComponent";
import FileSection from "./FileSection";
import MediaSection from "./MediaSection";

const Menu = ({ icon, header, context }) => {
  return (
    <div className="my-3 flex items-center">
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
      className={`mb-5 cursor-pointer ${isActive ? "border-b-2 border-blue-500 " : ""
        }`}
      onClick={onClick}
    >
      {title}
    </div>
  ) : null;
};


const AboutProfile = ({ setshowProfile, ChatObject }) => {
  const [profile, setprofile] = useState();

  const [activeComponent, setActiveComponent] = useState("Media");
  const [prevComponent, setPrevComponent] = useState(null);

  const [isAdmin, setisAdmin] = useState(false);
  const [invalidURL, setinvalidURL] = useState(true);
  const [showMenu, setshowMenu] = useState(false);
  const [groupObject, setGroupObject] = useState();

  const { User } = useContext(UserContext);

  useEffect(() => {
    const getGroupObject = async () => {
      if (ChatObject.activeChatType !== "group") return;
      const groupRef = doc(db, "groups", ChatObject.activeChatId);
      const groupSnapshot = await getDoc(groupRef);
      setGroupObject(groupSnapshot.data());
    };
    return () => getGroupObject();
  }, []);
  useEffect(() => {
    setActiveComponent("Media")
  }, [ChatObject.activeChatId])
  

  const renderComponent = () => {
    switch (activeComponent) {
      case "Media":
        return <MediaSection />;
      case "Files":
        return <FileSection />;
      case "Participants":
        return <ParticipantsComponent groupObject={groupObject} />;
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
      isUserInArray;
    })
    .catch((error) => {
      console.error("Error getting document: ", error);
    });
  return (
    <div className=" absolute inset-0 left-[1px] z-40 bg-light-secondary dark:bg-dark-secondary">
      <div className=" bg-primary  h-[66px] w-full pl-4">
        <div
          className="flex h-full max-w-max cursor-pointer items-center"
          onClick={() => {
            setshowProfile(false);
          }}
        >
          <i className="mr-4">
            <MdClose size={30} />
          </i>
          <h4>
            {ChatObject.activeChatType === "group" ? "Group" : "Contact"} info
          </h4>
        </div>
      </div>
      <div className="scrollBar h-[calc(100vh-76px)] overflow-y-auto ">
        <div className="">
          <div className="relative mb-5 flex flex-col items-center justify-center py-10 dark:bg-[#1d232a]">
            {showMenu && (
              <ul className="absolute top-[50%] right-[0]">
                <li>Remove image</li>
                <li>Open image</li>
                <li>Remove image</li>
              </ul>
            )}
            <div
              className={`ImgParentComp relative flex h-[200px] w-[200px] cursor-pointer items-center justify-center rounded-full bg-inherit`}
            >
              <div
                className="ImgChildComp absolute inset-0 flex items-center justify-center rounded-full opacity-0"
                onClick={() => {
                  isAdmin ? setshowMenu(true) : "open img";
                }}
              >
                {isAdmin && (
                  <label className="flex h-full w-full cursor-pointer items-center justify-center py-1 px-2">
                    <MdOutlineModeEditOutline size={30} />
                    <input
                      type="file"
                      className="hidden h-full w-full cursor-pointer"
                      onChange={async (e) => { }}
                      accept="image/png, image/jpeg"
                    />
                  </label>
                )}
              </div>

              {ChatObject.photoUrl && invalidURL ? (
                <img
                  src={ChatObject.photoUrl}
                  alt="profile pic"
                  className={`h-full w-full rounded-full object-cover`}
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
          <div className="mb-5 p-5 dark:bg-[#1d232a]">
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

        <div className="mb-5 flex flex-col items-center justify-around p-5 dark:bg-[#1d232a]">
          <div className="flex w-full justify-around">
            {["Media", "Files", "Participants"].map((header) => (
              <Header
                title={header}
                isActive={activeComponent === header}
                onClick={() => handleHeaderClick(header)}
              />
            ))}
          </div>
          <div className="w-full">{renderComponent()}</div>
        </div>
        <div className="mb-5  flex w-full cursor-pointer items-center p-5 text-red-500 dark:bg-[#1d232a]">
          {ChatObject.activeChatType === "group" ? (
            <>
              <BiLogOut /> Exit Group
            </>
          ) : (
            <>
              <ImBlocked />
              Block {ChatObject.displayName}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutProfile;
