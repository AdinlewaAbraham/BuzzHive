import React, { useEffect, useState, createContext, useMemo, use } from "react";
import SideBar from "./sidebar/SideBar";
import ChannelBar from "./ChannelBar/ChannelBar";
import ContentContainer from "./ContentContainer/ContentContainer";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { SelectedChannelProvider } from "@/context/SelectedChannelContext ";

import { createUser } from "@/utils/userUtils/createUser";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { CircularProgress } from "@mui/joy";
import { useTheme } from "next-themes";
import LoginPage from "./login/LoginPage";
import axios from "axios";

export const UserContext = createContext();

const App = () => {
  const [User, setUser] = useState(null);
  const auth = getAuth();

  const [isAuthed, setIsAuthed] = useState(false);

  const { setTheme } = useTheme();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setIsAuthed(true);
        const userSnapshot = await getDoc(doc(db, "users", u.uid));
        const userData = userSnapshot.data();
        if (!userData) {
          await createUser(u.uid, u.displayName, u.email, u.photoURL, "hello");
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

  return (
    <>
      {isAuthed ? (
        memoizedUser ? (
          <UserContext.Provider value={{ User, setUser }}>
            <SelectedChannelProvider>
              <div className="flex h-screen w-screen flex-col-reverse overflow-hidden md:flex-row">
                <SideBar />
                <ChannelBar />
                <ContentContainer />
              </div>
            </SelectedChannelProvider>
          </UserContext.Provider>
        ) : (
          <div className="flex h-screen items-center justify-center">
            <div className="flex items-center justify-center rounded-lg bg-accent-blue px-2 py-4">
              <i className="mr-1 flex items-center">
                <CircularProgress size="sm" variant="plain" />
              </i>
              loading user...
            </div>
          </div>
        )
      ) : (
        <LoginPage />
      )}
    </>
  );
};

export default App;
