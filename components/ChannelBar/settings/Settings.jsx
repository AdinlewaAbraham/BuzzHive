import React, { useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { BsSun } from "react-icons/bs";
import { BsMoon } from "react-icons/bs";
import Goback from "../Goback";
import { UserContext } from "@/components/App";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "@mui/joy";
import { openDB } from "idb";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { BsCheckAll, BsChevronDown } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import { getAuth, signOut } from "firebase/auth";
import { TbFileShredder } from "react-icons/tb";
import { TbVideoOff } from "react-icons/tb";
import Image from "next/image";
import { MdOutlineImageNotSupported } from "react-icons/md";
import Checkbox from "@/components/Checkbox";

const DeleteOption = ({ option, onClickFunc, loading, complete }) => {
  return (
    <button
      onClick={() => {
        onClickFunc();
      }}
      key={option.text}
      className={` my-1 flex max-w-[max-content] items-center
      rounded-lg bg-light-secondary p-2
        text-red-400 transition-all duration-500
          dark:bg-dark-secondary`}
    >
      <i className="mr-1 flex items-center text-[20px]">{option.icon}</i>
      Delete all {option.text}
      {loading === option.text && (
        <i className="ml-1 flex items-center justify-center">
          <CircularProgress size="sm" variant="plain" />
        </i>
      )}
      {complete === option.text && (
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{ marginLeft: "4px", strokeWidth: "1px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.path
            fill="none"
            stroke="#32CD32"
            strokeWidth="2"
            d="M4,12 L10,17 L20,7"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
        </motion.svg>
      )}
    </button>
  );
};

const SelectMenu = ({ optionsArr, selectedMenuText, onClickFunc }) => {
  const [showMenuOptions, setshowMenuOptions] = useState(false);
  const selectedMenu = optionsArr.find(
    (option) => option.text == selectedMenuText
  );
  
  useEffect(() => {
    const handleClick = (e)=>{
      if (!e.target.closest(".optionsMenu")) {
        setshowMenuOptions(false)
      }
    }
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick) 
  }, [])
  

  return (
    <div className="relative optionsMenu menu w-[50%] ">
      <div
        className="flex w-full cursor-pointer
       items-center
       justify-between rounded-lg
        bg-light-secondary p-2 dark:bg-dark-secondary"
        onClick={() => setshowMenuOptions(!showMenuOptions)}
      >
        <div className="flex items-center">
          <i className="mr-2">{selectedMenu.icon}</i> {selectedMenu.text}{" "}
        </div>
        <i>
          <BsChevronDown size={10} />
        </i>
      </div>
      <AnimatePresence>
        {showMenuOptions && (
          <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -7, opacity: 0 }}
            className="absolute top-0 left-0 flex w-full flex-col
           rounded-lg bg-light-secondary p-2 dark:bg-dark-secondary optionsMenu"
           
          >
            {optionsArr
              .sort((a, b) => {
                if (a.text === selectedMenuText) return -1;
                if (b.text === selectedMenuText) return 1;
                return 0;
              })
              .map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setshowMenuOptions(false);
                    onClickFunc(option);
                  }}
                  className={`relative flex cursor-pointer items-center ${index !== optionsArr.length - 1 && "mb-1"
                    } p-2 px-2 ${index === 0 && "bg-hover-light dark:bg-hover-dark"
                    } rounded-lg hover:bg-hover-light hover:dark:bg-hover-dark `}
                >
                  {index === 0 && (
                    <span className=" absolute bottom-[25%] top-[25%] left-0 z-[1] w-1 rounded-sm bg-accent-blue"></span>
                  )}
                  <i className="mr-2">{option.icon}</i>
                  {option.text}
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
const Modal = ({ modalObject, showModal, setshowModal }) => {
  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="Poll-input fixed inset-0 z-50 flex  items-center justify-center bg-gray-900 bg-opacity-50"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-[35%] min-w-[300px]
          max-w-[500px] rounded-lg bg-light-secondary dark:bg-dark-secondary"
          >
            <div className="rounded-t-lg bg-light-primary p-5 dark:bg-dark-primary">
              <h1 className="text-xl font-medium  md:text-xl">{modalObject.header}</h1>
              <p className="mt-1 text-sm">{modalObject.description}</p>
            </div>
            <div className="z-[99] flex flex-col md:flex-row rounded-lg p-5 [&>button]:w-full [&>button]:rounded-lg [&>button]:py-2">
              <button
                className="detectMe mr-1  bg-light-primary p-4 dark:bg-dark-primary"
                onClick={() => {
                  setshowModal(false);
                }}
              >
                {modalObject.returnText}
              </button>
              <button
                className="bg-blue-500 p-4"
                onClick={() => {
                  setshowModal(false);
                  modalObject.disCardFunc();
                }}
              >
                {modalObject.discardText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
const Settings = () => {
  const [Mounted, setMounted] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const { User, setUser } = useContext(UserContext);
  const [showModal, setshowModal] = useState(false);
  const [modalObject, setmodalObject] = useState({});
  const { setChats, setChatObject, ChatObject } = useContext(
    SelectedChannelContext
  );
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOptionClick = (option) => {
    const userRef = doc(db, "users", User.id);

    updateDoc(userRef, {
      autoDownloadSettings: {
        ...User.autoDownloadSettings,
        [option.toLowerCase()]:
          !User.autoDownloadSettings[option.toLowerCase()],
      },
    });
  };
  useEffect(() => {
    if (!User) {
      return;
    }
    console.log("stop");
    const q = doc(db, "users", User.id);
    const unsub = onSnapshot(q, async (doc) => {
      if (!doc.data()) return;
      setUser(doc.data());
      localStorage.setItem("user", JSON.stringify(doc.data()));
      localStorage.getItem("user");
    });
    return () => {
      unsub();
    };
  }, []);

  const [loading, setloading] = useState(false);
  const [complete, setcomplete] = useState(false);
  const { setdeleteMediaTrigger } = useContext(SelectedChannelContext);
  async function handleDelete(option) {
    setloading(option);
    const optionsDatabaseLocation = {
      files: "myFilesDatabase",
      videos: "myvideosDatabase",
      photos: "myImagesDatabase",
    };
    const optionsContainsLocation = {
      files: "files",
      videos: "videos",
      photos: "images",
    };
    const db = await openDB(optionsDatabaseLocation[option], 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(optionsContainsLocation[option])) {
          db.createObjectStore(optionsContainsLocation[option]);
        }
      },
    });

    const transaction = db.transaction(
      optionsContainsLocation[option],
      "readwrite"
    );
    const store = transaction.objectStore(optionsContainsLocation[option]);
    store.clear();

    await new Promise((resolve) => {
      setTimeout(() => {
        setloading(false);
        resolve();
      }, 1000);
    });
    setcomplete(option);
    setdeleteMediaTrigger((prev) => !prev);
    setTimeout(() => {
      setcomplete(false);
      setdeleteMediaTrigger((prev) => !prev);
    }, 1000);
  }
  return (
    <div className=" h-screen">
      <Modal
        modalObject={modalObject}
        showModal={showModal}
        setshowModal={setshowModal}
      />

      <Goback text={"Settings"} />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="scrollBar h-[calc(100vh-70px-66px)] overflow-scroll md:h-[calc(100vh-66px)]"
      >
        <div className="flex flex-col">
          <h2 className="mb-4 text-xl font-medium">Account</h2>
          <h3 className="mb-2">Privacy</h3>
          <h5 className="text-muted-light dark:text-muted-dark">
            Read receipts
          </h5>
          <div>
            <SelectMenu
              onClickFunc={(option) => {
                const userRef = doc(db, "users", User.id);
                updateDoc(userRef, {
                  isReadReceiptsOn: option.text === "ON" ? true : false,
                });
              }}
              optionsArr={[
                { text: "OFF", icon: <BsCheckAll /> },
                {
                  text: "ON",
                  icon: <BsCheckAll color="blue" />,
                },
              ]}
              selectedMenuText={User.isReadReceiptsOn ? "ON" : "OFF"}
            />
          </div>
          <h5 className="text-muted-light dark:text-muted-dark">Log out</h5>

          <button
            onClick={() => {
              setmodalObject({
                header: "Log out confirmation",
                description: "Are you sure you want to log out?",
                returnText: "No",
                discardText: "Yes",
                disCardFunc: () => {
                  const auth = getAuth();
                  signOut(auth)
                    .then(() => {
                      console.log("Sign-out successful.");
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                },
              });
              setshowModal(true);
            }}
            className="my-1 flex max-w-[max-content] items-center justify-center
            rounded-lg bg-light-secondary p-2
          dark:bg-dark-secondary"
          >
            <i className="mr-1 flex items-center">
              {" "}
              <TbLogout size="22" />
            </i>
            Log out
          </button>
        </div>
        <div className="flex flex-col">
          <h2 className="mb-4 mt-1 text-xl font-medium">Personalization</h2>
          <h3 className="mb-2">Theme</h3>
          <h5 className=" mb-1 text-muted-light dark:text-muted-dark">
            App color theme
          </h5>
          <div>
            <SelectMenu
              onClickFunc={(option) => {
                if (!Mounted) return null;
                const userRef = doc(db, "users", User.id);
                updateDoc(userRef, {
                  darkMode: option.text === "Dark" ? true : false,
                });
                if (option.text === "Dark") {
                  setTheme("dark");
                } else {
                  setTheme("light");
                }
              }}
              optionsArr={[
                { text: "Dark", icon: <BsMoon /> },
                {
                  text: "Light",
                  icon: <BsSun />,
                },
              ]}
              selectedMenuText={User.darkMode ? "Dark" : "Light"}
            />
          </div>
        </div>
        <div className=" flex flex-col ">
          <h2 className="mb-4 mt-1 text-xl font-medium">Storage</h2>
          <h3 className="mb-2">Automatic downloads</h3>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Choose which media will be automatically downloaded from the
            messages you receive
          </p>
          <div className="mt-1">
            {["Files", "Videos", "Photos"].map((option) => (
              <div
                key={option}
                className="group flex cursor-pointer items-center py-1"
                onClick={() => handleOptionClick(option)}
              >
                <Checkbox
                  isChecked={User.autoDownloadSettings[option.toLowerCase()]}
                />
                <label for="myCheckbox">{option}</label>
              </div>
            ))}
          </div>
          <h3 className="my-2 p-1">Delete downloads</h3>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Free up space by deleting locally stored media files.
          </p>
          {[
            { text: "files", icon: <TbFileShredder /> },
            {
              text: "videos",
              icon: <TbVideoOff />,
            },
            {
              text: "photos",
              icon: <MdOutlineImageNotSupported />,
            },
          ].map((option) => (
            <DeleteOption
              key={option.text}
              option={option}
              onClickFunc={() => {
                setmodalObject({
                  header: `Clear all your ${option.text}`,
                  description: `All the locally saved ${option.text} will be cleared`,
                  returnText: "Cancel",
                  discardText: `Clear ${option.text}`,
                  disCardFunc: () => {
                    handleDelete(option.text);
                  },
                });
                setshowModal(true);
              }}
              loading={loading}
              complete={complete}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
export default Settings;
