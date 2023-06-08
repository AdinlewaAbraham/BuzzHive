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

const DeleteOption = ({ option }) => {
  const [loading, setloading] = useState(false);
  const [complete, setcomplete] = useState(false);

  const {setdeleteMediaTrigger} = useContext(SelectedChannelContext)
  async function handleDelete(option) {
    setloading(true);
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
    setloading(false);
    setcomplete(true);
    setdeleteMediaTrigger((prev)=>!prev)
    setTimeout(() => {
      setcomplete(false);
      setdeleteMediaTrigger((prev)=>!prev)
    }, 1000);
  }
  return (
    <button
      onClick={() => {
        handleDelete(option);
      }}
      key={option}
      className="flex items-center"
    >
      Delete all {option}{" "}
      {loading && <CircularProgress size="sm" variant="plain" />}{" "}
      {complete && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{ marginRight: "8px", strokeWidth: "2px" }}
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
        </svg>
      )}
    </button>
  );
};

const Settings = () => {
  const [Mounted, setMounted] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const { User, setUser } = useContext(UserContext);
  const { setChats, setChatObject, ChatObject } = useContext(
    SelectedChannelContext
  );
  useEffect(() => {
    setMounted(true);
  }, []);

  const renderThemeChanger = () => {
    if (!Mounted) return null;
    const currenTheme = theme === "system" ? systemTheme : theme;

    if (currenTheme === "dark") {
      return (
        <i
          onClick={() => {
            setTheme("light");
          }}
        >
          <BsSun size={50} />
        </i>
      );
    } else {
      return (
        <i
          onClick={() => {
            setTheme("dark");
          }}
        >
          <BsMoon color="black" size={50} />
        </i>
      );
    }
  };
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
  return (
    <div className=" h-screen">
      <Goback text={"Settings"} />
      <div className="scrollBar h-[calc(100vh-70px-66px)] overflow-scroll md:h-[calc(100vh-66px)]">
        <div
          className="[&>button]:text-danger flex flex-col [&>button]:my-1 
        [&>button]:flex [&>button]:max-w-[max-content] [&>button]:rounded-lg
         [&>button]:bg-light-secondary [&>button]:p-2 [&>button]:text-red-400 [&>button]:dark:bg-dark-secondary "
        >
          <h2 className="mb-4 text-xl font-medium">Storage</h2>
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
                <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-[3px] border-gray-300 bg-accent-blue pb-[4px]  pl-[2px] group-hover:bg-blue-600">
                  {User.autoDownloadSettings[option.toLowerCase()] && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                    >
                      <motion.path
                        fill="none"
                        strokeWidth="3"
                        stroke="#fff"
                        d="M1 14.5l6.857 6.857L23.5 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />
                    </svg>
                  )}
                </div>
                <label for="myCheckbox">{option}</label>
              </div>
            ))}
          </div>
          <h3 className="my-2">Delete downloads</h3>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Free up space by deleting locally stored media files.
          </p>
          {["files", "videos", "photos"].map((option) => (
            <DeleteOption option={option} />
          ))}
        </div>

        {renderThemeChanger()}
      </div>
    </div>
  );
};

export default Settings;
