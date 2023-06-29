import React, { useContext, useEffect, useState } from "react";
import Img from "../../Img";
import { db, storage } from "@/utils/firebaseUtils/firebase";
import {
  arrayRemove,
  collection,
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
import { FaUserAlt } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { MdClose } from "react-icons/md";
import ParticipantsComponent from "./ParticipantsComponent";
import FileSection from "./FileSection";
import MediaSection from "./MediaSection";
import { removeMember } from "@/utils/groupUtils/removeMember";
import { Modal } from "@/components/ChannelBar/settings/Settings";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Menu = ({ icon, header, context }) => {
  return (
    <div className="my-3 flex items-center">
      <i className="text-muted"> {icon}</i>
      <div className="ml-3">
        <h4>{header}</h4>
        <p className="text-muted text-sm">{context}</p>
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

const AboutProfile = ({ setshowProfile, ChatObject }) => {
  const [profile, setprofile] = useState();
  const { setChatObject } = useContext(SelectedChannelContext);

  const [activeComponent, setActiveComponent] = useState("Media");
  const [prevComponent, setPrevComponent] = useState(null);

  const [isAdmin, setisAdmin] = useState(false);
  const [invalidURL, setinvalidURL] = useState(true);
  const [showMenu, setshowMenu] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [progress, setProgress] = useState(0);
  const [isUploading, setisUploading] = useState(false);

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
        return <MediaSection />;
      case "Files":
        return <FileSection />;
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
  const exitGroup = async () => {
    const groupRef = doc(db, "groups", ChatObject.activeChatId);
    await updateDoc(groupRef, {
      members: arrayRemove(User.id),
      admins: arrayRemove(User.id),
    });
    setChatObject({
      activeChatId: "",
      activeChatType: "",
      otherUserId: "",
      message: "",
      photoUrl: "",
      displayName: "",
    });
  };

  const handleImageChange = (file) => {
    setChatObject((prevState) => ({
      ...prevState,
      photoUrl: URL.createObjectURL(file),
    }));
    setinvalidURL(true);
    setisUploading(true);
    const storage = getStorage();
    const storageRef = ref(storage, "groupIcons/" + ChatObject.activeChatId);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.log("Upload error:", error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        } catch (error) {
          console.log("Error getting download URL:", error);
        }
      }
    );
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
      <div className="scrollBar h-[calc(100vh-76px)] overflow-y-auto ">
        <div className="relative">
          <div className=" bg-primary mb-5 flex flex-col items-center justify-center py-10">
            <div
              className={`Menu relative  ${
                !(ChatObject.photoUrl && invalidURL) && "bg-coverColor"
              } 
              ${isUploading && "scale-90"} 
              flex h-[200px] w-[200px] cursor-pointer items-center justify-center  rounded-full bg-inherit
              shadow-2xl transition-transform duration-300 `}
            >
              <div style={{ position: "absolute", inset: -20 }}>
                <CircularProgressbar
                  value={50}
                  text={`${15}%`}
                  styles={buildStyles({
                    textColor: "#333",
                    pathColor: "#3f51b5",
                    trailColor: "transparent",
                  })}
                />
              </div>
              <div
                className={` absolute inset-0 flex  items-center  ${
                  isUploading && "opacity-100"
                }  justify-center rounded-full bg-gray-900 
                bg-opacity-50 opacity-0 transition-opacity  duration-150 hover:opacity-100`}
                onClick={() => {
                  isAdmin ? setshowMenu(true) : "open img";
                }}
              >
                {isUploading && <>{progress}</>}
                {isAdmin && !isUploading && (
                  <MdOutlineModeEditOutline size={30} />
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
                <MdGroup size="70%" />
              ) : (
                <FaUserAlt size="50%" />
              )}
              <AnimatePresence>
                {showMenu && (
                  <motion.ul
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="Menu bg-secondary hover:[&>li]:bg-coverColor [&>li]: [&>li]: [&>li]: [&>li]: absolute bottom-[-140px]
                rounded-lg p-2 [&>li]:rounded-lg [&>li]:p-2
                "
                  >
                    <li>Remove image</li>
                    <li>View image</li>
                    <li className="relative">
                      Change image
                      <label className="absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center ">
                        <input
                          type="file"
                          className="hidden h-full w-full cursor-pointer"
                          onChange={async (e) => {
                            handleImageChange(e.target.files[0]);
                          }}
                          accept="image/png, image/jpeg"
                        />
                      </label>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            <h3 className="mt-2 text-lg font-medium">
              {ChatObject.displayName}
            </h3>
            {ChatObject.activeChatType === "group" && (
              <p className="text-muted text-sm">
                Group <span className="text-xs">&#x25CF;</span>{" "}
                {profile?.members?.length} participants{" "}
              </p>
            )}
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
              context={profile?.bio}
            />
          </div>
        </div>

        <div
          className={`  ${
            ChatObject.activeChatType === "group" && "mb-5"
          } flex flex-col items-center justify-around p-5 dark:bg-[#1d232a]`}
        >
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
        {ChatObject.activeChatType === "group" && (
          <div
            onClick={() => setShowModal(true)}
            className="mb-3  flex w-full cursor-pointer items-center p-5 text-red-500 dark:bg-[#1d232a]"
          >
            {ChatObject.activeChatType === "group" && (
              <>
                <i className="mr-1">
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
            exitGroup();
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
