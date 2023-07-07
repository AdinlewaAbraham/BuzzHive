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
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/utils/firebaseUtils/firebase";
import CircularProgress from "@mui/joy/CircularProgress";
import Image from "next/image";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { AnimatePresence, motion } from "framer-motion";
import Badge from "@/components/Badge";

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
    try {
      if (toBeUpdated.trim() === "") return;
      const objectKey = title === "Bio" ? "bio" : "name";
      const userRef = doc(db, "users", User.id);
      updateDoc(userRef, { [objectKey]: toBeUpdated });
      if (objectKey === "name") {
        updateDoc(userRef, { ["queryName"]: toBeUpdated.toLocaleLowerCase() });
      }
    } catch (error) {
     throw error
    } finally {
      setshowInput(false);
    }
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
            maxLength={title === "Bio" ? 100 : 25}
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
  const { User, setUser } = useContext(UserContext);
  const [showEditDisplayNameInput, setshowEditDisplayNameInput] =
    useState(false);
  const [showEditAboutInput, setshowEditAboutInput] = useState(false);
  const [invalidURL, setinvalidURL] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isUploading, setisUploading] = useState(false);
  const [dontShowText, setDontShowText] = useState(false);
  const [showMenu, setshowMenu] = useState(false);
  const [showCheckMark, setShowCheckMark] = useState(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".Menu")) {
        setshowMenu(false);
      }
    };
    window.addEventListener("click", (e) => handleClick(e));
    return window.removeEventListener("click", (e) => handleClick(e));
  }, []);

  const handleProfilePicChange = async (picture) => {
    setProgress(0);
    setUser({ ...User, photoUrl: URL.createObjectURL(picture) });

    setinvalidURL(true);
    setisUploading(true);
    const reducedQualityImg = await downScalePicVid(picture, 0.7, 1, 0);
    const profilePicRef = ref(storage, `users/profilePicture/${User.id}`);
    const userRef = doc(db, "users", User.id);
    const uploadTask = uploadBytesResumable(profilePicRef, reducedQualityImg);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {

      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setShowCheckMark(true);

          await updateDoc(userRef, { ["photoUrl"]: downloadURL }).then(() => {
            setTimeout(() => {
              setDontShowText(true);
              setShowCheckMark(false);
            }, 300);
          });

          setTimeout(() => {
            setisUploading(false);
          }, 500);
          setTimeout(() => {
            setDontShowText(false);
          }, 1000);
        } catch (error) {

        }
      }
    );
  };
  const { setSelectedChannel, setprevSelectedChannel, prevSelectedChannel } =
    useContext(SelectedChannelContext);
  const removeImg = async () => {
    setshowMenu(false)
    const userRef = doc(db, "users", User.id)

    setUser({ ...User, photoUrl: null })

    await updateDoc(userRef, { ["photoUrl"]: null })
    const profilePicRef = ref(storage, `users/profilePicture/${User.id}`);
    await deleteObject(profilePicRef)
      .then(() => true)
      .catch(() => false);
  }

  return (
    <div className="px-2">
      <Goback
        text={"Profile"}
        clickFunc={() => {
          setSelectedChannel(prevSelectedChannel || "chats");
          setprevSelectedChannel("profileSettings");
        }}
      />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-y-auto scrollBar md:h-[calc(100vh-100px)] h-[calc(100vh-150px)] "
      >
        <div className="flex w-full items-center justify-center">
          <div
            className={`Menu relative  ${!(User.photoUrl && invalidURL) && "bg-imgCover-light dark:bg-imgCover-dark"
              } 
              ${isUploading && "scale-90"} 
              flex h-[100px] w-[100px] cursor-pointer items-center justify-center  rounded-full bg-inherit
              transition-transform duration-300 `}
          >
            {isUploading && (
              <div style={{ position: "absolute", inset: -2 }}>
                <CircularProgressbar
                  value={progress}
                  styles={buildStyles({
                    textColor: "#333",
                    pathColor: "#3f51b5",
                    trailColor: "transparent",
                  })}
                  strokeWidth={3}
                />
              </div>
            )}
            <div
              className={` absolute inset-0 flex  items-center  ${isUploading && "opacity-100"
                }  justify-center rounded-full bg-gray-900 
              dark:bg-opacity-50 bg-opacity-10 opacity-0 transition-opacity  duration-150 hover:opacity-100`}
              onClick={() => {
                !isUploading ? setshowMenu(true) : "open img";
              }}
            >
              <AnimatePresence>
                {showCheckMark && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                  >
                    <motion.path
                      fill="none"
                      strokeWidth="2"
                      stroke="#008000"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M1 16.5l6.857 5.857L23.5 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 0.8 }}
                      exit={{ pathLength: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </svg>
                )}
              </AnimatePresence>
              {isUploading && !showCheckMark && !dontShowText && (
                <p className="text-2xl font-medium">{progress.toFixed(0)}%</p>
              )}
              {!isUploading && !dontShowText && (
                <MdOutlineModeEditOutline size={30} />
              )}
            </div>
            {User.photoUrl && invalidURL ? (
              <img
                src={User.photoUrl}
                alt="profile pic"
                className={`h-full w-full rounded-full object-cover`}
                onError={() => setinvalidURL(false)}
              />
            ) : (
              <FaUserAlt size="40%" color="#ffffff" />
            )}
            <AnimatePresence>
              {showMenu && (
                <motion.ul
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="Menu bg-secondary hover:[&>li]:bg-hover-light dark:hover:[&>li]:bg-hover-dark [&>li]: [&>li]: absolute bottom-[-140px] rounded-lg
                              p-2 [&>li]:whitespace-nowrap [&>li]:rounded-lg [&>li]:p-2
                              "
                >
                  <li
                    onClick={() => {
                      removeImg();
                    }}
                  >
                    Remove image
                  </li>
                  <li>View image</li>
                  <li className="relative">
                    Change image
                    <label className="absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center ">
                      <input
                        type="file"
                        className="hidden h-full w-full cursor-pointer"
                        onChange={async (e) => {
                          handleProfilePicChange(e.target.files[0]);
                          setshowMenu(false);
                        }}
                        accept="image/png, image/jpeg"
                      />
                    </label>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-7 text-center">
          <h4 className="font-medium mt-2 flex items-center justify-center ">{User.name}<Badge id={User.id} /></h4>
          <p className="text-muted-light  dark:text-muted-dark">{User.bio}</p>
        </div>
        <section>
          <EditProfileInfo title={"Display Name"} toBeEdited={User.name} />
          <EditProfileInfo title={"Bio"} toBeEdited={User.bio} />
        </section>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
