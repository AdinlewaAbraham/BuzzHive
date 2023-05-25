import React, { useEffect, useState } from "react";
import { GiCancel } from "react-icons/gi";
import Img from "../Img";
import { db } from "@/utils/firebaseUtils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { BiAt } from "react-icons/bi";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";
import { ImBlocked } from "react-icons/im";
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
  return (
    <div
      className={`header ${isActive ? " border-blue-500 " : ""}`}
      onClick={onClick}
    >
      {title}
    </div>
  );
};

const Media = () => {
  return <div>Component A</div>;
};

const Files = () => {
  return <div>Component B</div>;
};

const Links = () => {
  return <div>Component C</div>;
};

const Participants = () => {
  return <div>Component D</div>;
};

const AboutProfile = ({ setshowProfile, ChatObject }) => {
  const [profile, setprofile] = useState();

  const [activeComponent, setActiveComponent] = useState("A");
  const [prevComponent, setPrevComponent] = useState(null);

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
  console.log(ChatObject);

  return (
    <div className="dark:bg-[#12171d] inset-0 absolute z-30">
      <div>
        <div className="border-b p-[16px] flex items-center">
          <div
            className="cursor-pointer mr-3"
            onClick={() => {
              setshowProfile(false);
            }}
          >
            <GiCancel size={30} />
          </div>
          <h3>contact info</h3>
        </div>
        <div className=" p-5">
          <div className="flex flex-col items-center justify-center mb-5">
            <Img
              src={ChatObject.photoUrl}
              type={ChatObject.activeChatType}
              styles="w-[200px]"
            />
            <h3>{ChatObject.displayName}</h3>
          </div>
          <div>
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
      </div>

      <div className="flex flex-col items-center">
        <div className="flex">
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
      <div className="flex  text-red-500  p-5">
        {ChatObject.activeChatType === "group" ? (
          <div className="flex items-center">
            <BiLogOut /> Exit Group
          </div>
        ) : (
          <div className="flex items-center">
            <ImBlocked />
            Block {ChatObject.displayName}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutProfile;
