import React, { useEffect, useState, createContext, useMemo, use } from "react";
import SideBar from "./sidebar/SideBar";
import ChannelBar from "./ChannelBar/ChannelBar";
import ContentContainer from "./ContentContainer/ContentContainer";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { SelectedChannelProvider } from "@/context/SelectedChannelContext ";
import { SigninWithGoogle } from "@/utils/userAuthentication/SigninWithGoogle";

import { createUser } from "@/utils/userUtils/createUser";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { FcGoogle } from "react-icons/fc";
import { CircularProgress } from "@mui/joy";
import { useTheme } from "next-themes";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";

export const UserContext = createContext();

const App = () => {
  const [User, setUser] = useState(null);
  const auth = getAuth();

  const [isAuthed, setIsAuthed] = useState(false);
  const [isSigningIn, setisSigningIn] = useState(false);

  const { setTheme } = useTheme();
  let isFunctionRunning = false;
  const sendME = async (userId) => {
    const welcomeText =
      "Hey there! 👋 Welcome to BuzzHive! This is a chat app I've built from scratch, designed to connect people and facilitate conversations. Explore different features and enjoy your time on BuzzHive! 😄";
    const senderId = "eaqHdrv5x1Z4jF7ZPoU6s7r1jOB2";

    const conversationId =
      userId > senderId ? userId + senderId : senderId + userId;
    console.log("this is running");
    await getDoc(doc(db, "conversations", conversationId))
      .then(async (querySnapshot) => {
        if (!querySnapshot.exists()) {
          await sendMessage(
            senderId,
            userId,
            welcomeText,
            senderId,
            "Abraham",
            "regular",
            new Date(),
            null,
            null,
            null,
            () => {},
            false
          );
        }
      })
      .catch((error) => {
        console.error("Error checking collection:", error);
      });
  };

  const sendWelcomeMessage = async (userId) => {
    try {
      const welcomeText =
        "Hey there! 👋 Welcome to BuzzHive! This is a chat app I've built from scratch, designed to connect people and facilitate conversations. Explore different features and enjoy your time on BuzzHive! 😄";
      const senderId = "eaqHdrv5x1Z4jF7ZPoU6s7r1jOB2";

      const conversationId =
        userId > senderId ? userId + senderId : senderId + userId;
      console.log("this is running");
      console.log(conversationId);
      await getDoc(doc(db, "conversations", conversationId))
        .then(async (querySnapshot) => {
          if (!querySnapshot.data()) {
            await sendMessage(
              senderId,
              userId,
              welcomeText,
              senderId,
              "Abraham",
              "regular",
              new Date(),
              null,
              null,
              null,
              () => {},
              false
            );
          }
        })
        .catch((error) => {
          console.error("Error checking collection:", error);
        });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      isFunctionRunning = false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        isFunctionRunning = true;
        setIsAuthed(true);
        const userSnapshot = await getDoc(doc(db, "users", u.uid));
        const userData = userSnapshot.data();
        if (!userData) {
          console.log("creating");
          await createUser(u.uid, u.displayName, u.email, u.photoURL, "hello");
          // const runWelcomeMessage = sendWelcomeMessage(u.uid);
          await sendWelcomeMessage(u.uid);
          const userSnapshot = await getDoc(doc(db, "users", u.uid));
          const userData = userSnapshot.data();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          if (userData.darkMode) {
            setTheme(userData.darkMode ? "dark" : "light");
          }
        } else {
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          if (userData.darkMode) {
            setTheme(userData.darkMode ? "dark" : "light");
          }
        }
      } else {
        setUser(null);
        setIsAuthed(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!User) {
      return;
    }
    const q = doc(db, "users", User.id);
    const unsub = onSnapshot(q, async (doc) => {
      console.log(doc.data());
      if (!doc.data()) return;
      setUser(doc.data());
      localStorage.setItem("user", JSON.stringify(doc.data()));
      if (doc.data().darkMode) {
        setTheme(doc.data().darkMode ? "dark" : "light");
      }
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData !== "undefined" && JSON.parse(userData)) {
      setUser(JSON.parse(userData));
      if (userData.darkMode) {
        setTheme(userData.darkMode ? "dark" : "light");
      }
      setIsAuthed(true);
    }
  }, []);

  const memoizedUser = useMemo(() => User, [User]);

  function setisSigningInFunc(state) {
    setisSigningIn(state);
  }
  return (
    <>
      <button
        className="fixed top-10 z-[999] bg-red-500"
        onClick={() => sendME(User.id)}
      >
        send you are welcome
      </button>
      {isAuthed ? (
        memoizedUser ? (
          <UserContext.Provider value={{ User, setUser }}>
            <SelectedChannelProvider>
              <div className="flex h-full w-full flex-col-reverse overflow-y-hidden md:flex-row">
                <SideBar />
                <ChannelBar />
                <ContentContainer />
              </div>
            </SelectedChannelProvider>
          </UserContext.Provider>
        ) : (
          <div className="flex h-screen items-center justify-center">
            <div className="rounded-lg bg-accent-blue px-2 py-4">
              <div className="flex items-center justify-center">
                <i className="mr-1 flex items-center">
                  <CircularProgress size="sm" variant="plain" />
                </i>
                loading user...
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="flex h-screen items-center justify-center">
          <div className="rounded-lg bg-accent-blue px-2 py-4">
            {!isSigningIn ? (
              <button
                className="flex items-center justify-center"
                onClick={() => {
                  setisSigningIn(true);
                  SigninWithGoogle(setisSigningInFunc);
                }}
              >
                <i className="mr-1 flex items-center">
                  <FcGoogle size={25} />
                </i>
                Sign in with Google
              </button>
            ) : (
              <div className="flex items-center justify-center">
                <i className="mr-2 flex items-center">
                  <CircularProgress size="sm" variant="plain" />
                </i>
                logging in...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default App;
