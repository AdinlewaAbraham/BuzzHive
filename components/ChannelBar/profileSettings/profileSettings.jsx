import React, { useContext, useState } from "react";
import Img from "@/components/Img";
import { UserContext } from "@/components/App";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { BsCheck2 } from "react-icons/bs";
import { useRef } from "react";
import { useEffect } from "react";

const EditProfileInfo = ({ title, toBeEdited }) => {
  const [showInput, setshowInput] = useState(false);
  const inputRef = useRef(null)
  const handleEditClick = () => {
    setshowInput(true);
  };
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.value = toBeEdited
      inputRef.current.focus();
    }
  }, [showInput]);
  
  
  return (
    <div>
      <p className="text-blue-500">{title}</p>
      {showInput ? (
        <div className="flex justify-between items-center">
          <input type="text" name="" id="" ref={inputRef} className="outline-none w-full bg-transparent"/>
          <div onClick={() => setshowInput(false)}>
            <BsCheck2 />
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="w-full">{toBeEdited}</p>
          <div onClick={ handleEditClick} className="cursor-pointer">
            <MdOutlineModeEditOutline size={20} />
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileSettings = () => {
  const { User } = useContext(UserContext);
  const [showEditDisplayNameInput, setshowEditDisplayNameInput] =
    useState(false);
  const [showEditAboutInput, setshowEditAboutInput] = useState(false);
  console.log(User);
  return (
    <div className="p-6">
      <h1>My Profile</h1>
      <section className="flex justify-center items-center">
        <div
          className={`h-[200px] w-[200px] rounded-full flex items-center justify-center${
            User.photoUrl === null ? "pt-[3px]" : ""
          }`}
        >
          <div className="w-[200px] h-[200px] ">
            <Img
              src={User.photoUrl}
              type={"personal"}
              styles="justify-center flex"
              imgStyles="rounded-full w-full h-full"
              groupSize={100}
              personalSize={75}
            />
          </div>
        </div>
      </section>
      <section>
        <EditProfileInfo title={"Display Name"} toBeEdited={User.name} />
        <EditProfileInfo title={"Bio"} toBeEdited={User.bio} />
      </section>
    </div>
  );
};

export default ProfileSettings;
