import React, { useContext, useEffect, useRef, useState } from "react";
import Img from "../../Img";
import { db, storage } from "@/utils/firebaseUtils/firebase";
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { BiArrowBack, BiAt } from "react-icons/bi";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";
import { ImBlocked } from "react-icons/im";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../../App";
import { MdGroup } from "react-icons/md";
import { FaUserAlt, FaCheck } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import ParticipantsComponent from "./ParticipantsComponent";
import FileSection from "./FileSection";
import MediaSection from "./MediaSection";
import { removeMember } from "@/utils/groupUtils/removeMember";
import { Modal } from "@/components/ChannelBar/settings/Settings";
import { AnimatePresence, animate } from "framer-motion";
import { motion } from "framer-motion";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from "firebase/storage";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { downScalePicVid } from "@/utils/messagesUtils/downScalePicVid";
import Badge from "@/components/Badge";
import { MdClose, MdOutlineFileDownload } from "react-icons/md";

const EditProfileInfo = ({ type, toBeEdited, isAdmin }) => {
  const [showInput, setshowInput] = useState(false);
  const inputRef = useRef(null);
  const [toBeUpdated, settoBeUpdated] = useState("");
  const { User, setUser } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);
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
  const handleSubmit = async () => {
    try {
      if (toBeUpdated.trim() === "") return;
      const groupRef = doc(db, "groups", ChatObject.activeChatId);
      updateDoc(groupRef, { [type === "Bio" ? "bio" : "name"]: toBeUpdated });
    } catch (error) {
      console.error(error);
    } finally {
      setshowInput(false);
    }
  };

  return (
    <div className="mb-3">
      {showInput ? (
        <div className="flex items-center justify-between">
          <input
            type="text"
            name=""
            id=""
            ref={inputRef}
            className="w-full bg-transparent outline-none"
            onChange={(e) => settoBeUpdated(e.target.value)}
            maxLength={type === "Bio" ? 100 : 30}
          />
          <div
            onClick={() => handleSubmit()}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-hover-light dark:hover:bg-hover-dark"
          >
            <FaCheck />
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between">
          <p className=""> {toBeEdited}</p>
          {isAdmin && (
            <div
              onClick={() => setshowInput(true)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-hover-light dark:hover:bg-hover-dark"
            >
              <MdOutlineModeEditOutline size={20} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const Menu = ({ icon, header, context, isAdmin }) => {
  return (
    <div className="my-3 flex items-center" key={header}>
      <i className="text-muted"> {icon}</i>
      <div className="ml-3 w-full">
        <p className="text-muted text-sm">{header}</p>
        <EditProfileInfo toBeEdited={context} type={header} isAdmin={isAdmin} />
      </div>
    </div>
  );
};

const Header = ({ title, isActive, onClick, ChatObject }) => {
  return ChatObject.activeChatType === "group" || title !== "Participants" ? (
    <div
      className={`relative w-full cursor-pointer select-none pb-5 text-center ${
        !isActive && "text-muted"
      }`}
      onClick={onClick}
      key={title}
    >
      {isActive && (
        <span className="absolute bottom-0 left-0 h-1 w-full rounded-sm bg-accent-blue "></span>
      )}
      {title}
    </div>
  ) : (
    false
  );
};

const AboutProfile = ({ setshowProfile, ChatObject, setLocalChatObject }) => {
  const [profile, setprofile] = useState();
  const { setChatObject, chatRooms, setChatRooms } = useContext(
    SelectedChannelContext
  );
  const [activeComponent, setActiveComponent] = useState("Media");
  const [prevComponent, setPrevComponent] = useState(null);

  const [isAdmin, setisAdmin] = useState(false);
  const [invalidURL, setinvalidURL] = useState(true);
  const [showMenu, setshowMenu] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [progress, setProgress] = useState(0);
  const [isUploading, setisUploading] = useState(false);
  const [dontShowText, setDontShowText] = useState(false);
  const [showCheckMark, setShowCheckMark] = useState(false);

  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [imgUrl, setImgUrl] = useState(ChatObject.photoUrl);

  const { User } = useContext(UserContext);
  useEffect(() => {
    setActiveComponent("Media");
  }, [ChatObject.activeChatId]);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".Menu")) {
        setshowMenu(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const renderComponent = () => {
    switch (activeComponent) {
      case "Media":
        return <MediaSection ChatObject={ChatObject} />;
      case "Files":
        return <FileSection ChatObject={ChatObject} />;
      case "Participants":
        return (
          <ParticipantsComponent
            groupObject={profile}
            setGroupObject={setprofile}
          />
        );
      default:
        return null;
    }
  };

  const handleHeaderClick = (component) => {
    setPrevComponent(activeComponent);
    setActiveComponent(component);
  };

  useEffect(() => {
    const queryLocation =
      ChatObject.activeChatType === "group" ? "groups" : "users";
    const ProfileRef = doc(db, queryLocation, ChatObject.otherUserId);
    const unsubscribe = onSnapshot(ProfileRef, (snapshot) => {
      setprofile(snapshot.data());
    });
    return () => unsubscribe();
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
    })
    .catch((error) => {
      console.error("Error getting document: ", error);
    });
  const exitGroup = async (User, ChatObject) => {
    const groupRef = doc(db, "groups", ChatObject.activeChatId);
    const groupSnapshot = await getDoc(groupRef);

    if (!groupSnapshot.exists()) {
      return;
    }
    const { members } = groupSnapshot.data();

    const isLastUser = members.length === 1 && members[0] === User.id;

    if (isLastUser) {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `${ChatObject.activeChatType}/${ChatObject.activeChatId}`
      );
      const deleteGroupSever = async (ref) => {
        try {
          deleteObject(ref);
        } catch (err) {
          console.error(err);
        }
      };
      await Promise.all([deleteDoc(groupRef), deleteGroupSever(storageRef)]);
    } else {
      await updateDoc(groupRef, {
        members: arrayRemove(User.id),
        admins: arrayRemove(User.id),
      });
    }
    const filteredChatRooms = chatRooms.filter(
      (chatRoom) => chatRoom.id !== ChatObject.activeChatId
    );
    // test this stuff
    setChatRooms(filteredChatRooms);
    localStorage.setItem(`${User.id}_userChats`, filteredChatRooms);
    localStorage.removeItem(ChatObject.activeChatId);
    setChatObject({
      activeChatId: "",
      activeChatType: "",
      otherUserId: "",
      message: "",
      photoUrl: "",
      displayName: "",
    });
    setshowProfile(false);
  };

  const handleImageChange = async (file, dataObject) => {
    setProgress(0);
    setImgUrl(URL.createObjectURL(file));
    setinvalidURL(true);
    setisUploading(true);
    const storage = getStorage();
    const storageRef = ref(storage, "groupIcons/" + dataObject.activeChatId);

    const uploadPic = await downScalePicVid(file, 0.7, 1, 0);
    const uploadTask = uploadBytesResumable(storageRef, uploadPic);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {},
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setShowCheckMark(true);

          const groupRef = doc(db, "groups", dataObject.activeChatId);
          await updateDoc(groupRef, { photoUrl: downloadURL }).then(() => {
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
        } catch (error) {}
      }
    );
  };
  const removeImg = async () => {
    setshowMenu(false);
    const groupRef = doc(db, "groups", ChatObject.activeChatId);

    await updateDoc(groupRef, { photoUrl: null });
    const storageRef = ref(storage, "groupIcons/" + ChatObject.activeChatId);

    await deleteObject(storageRef)
      .then(() => true)
      .catch(() => false);
  };

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
      <div className="scrollBar h-[calc(100vh-76px)] overflow-y-auto overflow-x-hidden ">
        <div className="relative">
          <div className=" bg-primary mb-5 flex flex-col items-center justify-center py-10">
            <div
              className={`Menu relative  ${
                !(ChatObject.photoUrl && invalidURL) &&
                "bg-imgCover-light dark:bg-imgCover-dark"
              } 
              ${isUploading && "scale-90"} 
              flex h-[200px] w-[200px] cursor-pointer items-center justify-center  rounded-full bg-inherit
            transition-transform duration-300 `}
            >
              {isUploading && (
                <div style={{ position: "absolute", inset: -5 }}>
                  <CircularProgressbar
                    value={progress}
                    styles={buildStyles({
                      textColor: "#333",
                      pathColor: "#3f51b5",
                      trailColor: "transparent",
                    })}
                    strokeWidth={2.5}
                  />
                </div>
              )}

              <div
                className={` absolute inset-0 flex  items-center  ${
                  isUploading && "opacity-100"
                }  justify-center rounded-full bg-gray-900
                bg-opacity-10 opacity-0 transition-opacity duration-150  hover:opacity-100 dark:bg-opacity-50`}
                onClick={() => {
                  isAdmin && !isUploading
                    ? setshowMenu(true)
                    : (profile?.photoUrl || ChatObject.photoUrl) && invalidURL
                    ? setFullScreenMode(true)
                    : false;
                }}
              >
                <AnimatePresence>
                  {showCheckMark && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="80"
                      height="80"
                      className="translate-x-1 translate-y-[-7px] "
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
                  <p className="text-5xl font-medium">{progress.toFixed(0)}%</p>
                )}
                {isAdmin && !isUploading && !dontShowText && (
                  <MdOutlineModeEditOutline size={30} />
                )}
              </div>
              {imgUrl && invalidURL ? (
                <img
                  src={imgUrl}
                  alt="profile pic"
                  className={`h-full w-full rounded-full object-cover`}
                  onError={() => setinvalidURL(false)}
                />
              ) : ChatObject.activeChatType === "group" ? (
                <MdGroup size="70%" color="#ffffff" />
              ) : (
                <FaUserAlt size="50%" color="#ffffff" />
              )}
              <AnimatePresence>
                {showMenu && (
                  <motion.ul
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="Menu bg-secondary  [&>li]: [&>li]:
                     [&>li]: [&>li]: absolute bottom-[-140px] rounded-lg p-2
                              [&>li]:rounded-lg [&>li]:p-2 hover:[&>li]:bg-hover-light dark:hover:[&>li]:bg-hover-dark
                              "
                  >
                    <li
                      onClick={() => {
                        setLocalChatObject({ ...ChatObject, photoUrl: null });
                        setImgUrl(null);
                        removeImg();
                      }}
                    >
                      Remove image
                    </li>

                    {(profile?.photoUrl || ChatObject.photoUrl) &&
                      invalidURL && (
                        <li onClick={() => setFullScreenMode(true)}>
                          View image
                        </li>
                      )}
                    <li className="relative">
                      Change image
                      <label className="absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center ">
                        <input
                          type="file"
                          className="hidden h-full w-full cursor-pointer"
                          onChange={async (e) => {
                            handleImageChange(e.target.files[0], ChatObject);
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
            <AnimatePresence>
              {fullScreenMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[99] flex items-center justify-center bg-white dark:bg-black"
                >
                  <div
                    className="absolute top-4 right-4  flex h-[66px] items-center justify-end rounded-lg bg-white px-4
                    text-[30px]  text-black dark:bg-black dark:text-white [&>i]:cursor-pointer"
                  >
                    <i onClick={() => setFullScreenMode(false)}>
                      <MdClose />
                    </i>
                  </div>
                  <img
                    src={profile?.photoUrl || ChatObject.photoUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <h3 className="mt-2 flex items-center justify-center text-lg font-medium">
              {profile?.name || ChatObject.displayName}{" "}
              <Badge id={ChatObject.otherUserId} />
            </h3>
            {ChatObject.activeChatType === "group" && (
              <p className="text-muted text-sm">
                Group ·&nbsp;
                {profile?.members?.length} participants{" "}
              </p>
            )}
          </div>
          <div className="bg-primary mb-5 p-5">
            <Menu
              icon={<BiAt />}
              header="username"
              context={profile?.name || ChatObject.displayName}
              isAdmin={isAdmin}
            />
            <Menu
              icon={<AiOutlineInfoCircle />}
              header="Bio"
              context={profile?.bio}
              isAdmin={isAdmin}
            />
          </div>
        </div>

        <div
          className={`  ${
            ChatObject.activeChatType === "group" && "mb-5"
          } bg-primary flex flex-col items-center justify-around  p-5`}
        >
          <div className="mb-3 flex w-full justify-around">
            {["Media", "Files", "Participants"].map((header) => (
              <Header
                title={header}
                isActive={activeComponent === header}
                onClick={() => handleHeaderClick(header)}
                ChatObject={ChatObject}
              />
            ))}
          </div>
          <div className="w-full">{renderComponent()}</div>
        </div>
        {ChatObject.activeChatType === "group" && (
          <div
            onClick={() => setShowModal(true)}
            className="bg-primary  mb-3 flex w-full cursor-pointer items-center p-5  text-red-400"
          >
            {ChatObject.activeChatType === "group" && (
              <>
                <i className="mr-1 text-[20px]">
                  <BiLogOut />
                </i>{" "}
                Exit group
              </>
            )}
          </div>
        )}
      </div>
      <Modal
        modalObject={{
          header: `Exit "${profile?.name}" group?`,
          description: "Are you sure you want to exit?",
          returnText: "Cancel",
          disCardFunc: () => {
            exitGroup(User, ChatObject);
          },
          discardText: "Exit",
        }}
        showModal={showModal}
        setshowModal={setShowModal}
      />
    </div>
  );
};

export default AboutProfile;
