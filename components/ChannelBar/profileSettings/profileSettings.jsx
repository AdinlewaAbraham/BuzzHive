import React, { useContext, useState } from "react";
import Img from "@/components/Img";
import { UserContext } from "@/components/App";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { BsCheck2 } from "react-icons/bs";
import { useRef } from "react";
import { useEffect } from "react";
import Goback from "../Goback";
import { FaUserAlt, FaCheck } from "react-icons/fa";
import { db } from "@/utils/firebaseUtils/firebase";
import { updateDoc, doc, onSnapshot } from "firebase/firestore";
import { downScalePicVid } from "@/utils/messagesUtils/downScalePicVid";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/utils/firebaseUtils/firebase";
import CircularProgress from "@mui/joy/CircularProgress";
import Image from "next/image";

const EditProfileInfo = ({ title, toBeEdited }) => {
  const [showInput, setshowInput] = useState(false);
  const inputRef = useRef(null);
  const [toBeUpdated, settoBeUpdated] = useState("");
  const { User, setUser } = useContext(UserContext);
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.value = toBeEdited;
      inputRef.current.focus();
    }
  }, [showInput]);
  useEffect(() => {
    const userRef = doc(db, "users", User.id);
    const unsub = onSnapshot(userRef, (snapShot) => {
      if (snapShot.data()) {
        localStorage.setItem("user", JSON.stringify(snapShot.data()));
        setUser(snapShot.data());
      }
    });
    return () => unsub();
  }, []);
  const handleSubmit = async (title) => {
    if (toBeUpdated.trim() === "") return;
    const objectKey = title === "Bio" ? "bio" : "name";
    const userRef = doc(db, "users", User.id);
    updateDoc(userRef, { [objectKey]: toBeUpdated });
    setshowInput(false);
  };
  return (
    <div className="mb-3">
      <h5 className="text-muted-light dark:text-muted-dark">{title}</h5>
      {showInput ? (
        <div className="flex items-center justify-between">
          <input
            type="text"
            name=""
            id=""
            ref={inputRef}
            className="w-full bg-transparent outline-none"
            onChange={(e) => settoBeUpdated(e.target.value)}
          />
          <div
            onClick={() => handleSubmit(title)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-hover-light dark:hover:bg-hover-dark"
          >
            <FaCheck />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="w-full">{toBeEdited}</p>
          <div
            onClick={() => setshowInput(true)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-hover-light dark:hover:bg-hover-dark"
          >
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
  const [invalidURL, setinvalidURL] = useState(true);
  const [isUploading, setisUploading] = useState(false);
  const handleProfilePicChange = async (picture) => {
    setisUploading(true);
    const reducedQualityImg = await downScalePicVid(picture, 0.7, 1, 0);
    const profilePicRef = ref(storage, `users/profilePicture/${User.id}`);
    const userRef = doc(db, "users", User.id);
    await uploadBytesResumable(profilePicRef, reducedQualityImg);
    getDownloadURL(profilePicRef).then(async (profilePictureURL) => {
      await updateDoc(userRef, { ["photoUrl"]: profilePictureURL });
      setisUploading(false);
    });
  };
  return (
    <div className="px-2">
      <Goback text={"Profile"} />
      <section className="flex items-center justify-center">
        <div
          className={`flex  ${
            User.photoUrl === null ? "pt-[3px]" : ""
          } group relative h-[100px] w-[100px] cursor-pointer justify-center bg-inherit 
          [&>i]:flex [&>i]:h-full [&>i]:items-center [&>i]:justify-center `}
        >
          {isUploading && (
            <div
              className="absolute inset-0 flex cursor-wait items-center
           justify-center bg-gray-900 bg-opacity-50 "
            >
              <CircularProgress size="sm" variant="plain" />
            </div>
          )}
          {!isUploading && (
            <label
              className="absolute inset-0 flex cursor-pointer items-center
           justify-center bg-gray-900 bg-opacity-50 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            >
              <div>
                <MdOutlineModeEditOutline size={20} />
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="hidden h-full w-full cursor-pointer"
                onChange={(e) => handleProfilePicChange(e.target.files[0])}
              />
            </label>
          )}
          {User.photoUrl && invalidURL ? (
            <Image
              width={100}
              height={100}
              src={User.photoUrl}
              alt="profile pic"
              className={`h-full w-full rounded-full object-cover`}
              onError={() => setinvalidURL(false)}
            />
          ) : (
            <i>
              <FaUserAlt size="75" />
            </i>
          )}
        </div>
      </section>
      <div className="mb-7 text-center">
        <h4>{User.name}</h4>
        <p className="text-muted-light dark:text-muted-dark">{User.bio}</p>
      </div>
      <section>
        <EditProfileInfo title={"Display Name"} toBeEdited={User.name} />
        <EditProfileInfo title={"Bio"} toBeEdited={User.bio} />
      </section>
    </div>
  );
};

export default ProfileSettings;
