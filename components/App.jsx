import React, { useEffect, useState, createContext, useMemo, use } from "react";
import SideBar from "./sidebar/SideBar";
import ChannelBar from "./ChannelBar/ChannelBar";
import ContentContainer from "./ContentContainer/ContentContainer";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { SelectedChannelProvider } from "@/context/SelectedChannelContext ";
import { SigninWithGoogle } from "@/utils/userAuthentication/SigninWithGoogle";

import { createUser } from "@/utils/userUtils/createUser";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";

export const UserContext = createContext();

const App = () => {
  const [User, setUser] = useState(null);
  const auth = getAuth();

  const [isAuthed, setIsAuthed] = useState(false);

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
          localStorage.setItem("user", JSON.stringify(userData)); // Save user data to local storage
        } else {
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData)); // Save user data to local storage
        }
      } else {
        setUser(null);
        setIsAuthed(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log(User);
    if (!User) {
      return;
    }
    const q = doc(db, "users", User.id);
    const unsub = onSnapshot(q, async (doc) => {
      console.log(doc.data());
      setUser(doc.data());
      localStorage.setItem("user", JSON.stringify(doc.data()));
      console.log(localStorage.getItem("user"));
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    console.log(userData)
    if (userData !== "undefined" && JSON.parse(userData)) {
      setUser(JSON.parse(userData));
      setIsAuthed(true);
    }
  }, []);

  const memoizedUser = useMemo(() => User, [User]);
  if (!memoizedUser && isAuthed) {
    return <p>Loading user...</p>;
  }

  return (
    <>
      {isAuthed ? (
        <UserContext.Provider value={{ User, setUser }}>
          <SelectedChannelProvider>
            <div className="flex flex-col-reverse h-full md:flex-row w-full overflow-y-hidden">
              <SideBar />
              <ChannelBar />
              <ContentContainer />
            </div>
          </SelectedChannelProvider>
        </UserContext.Provider>
      ) : null}
      {!isAuthed ? (
        <div className="h-screen flex justify-center items-center">
          <button
            className="bg-green-600 px-2 py-4 rounded-lg"
            onClick={() => {
              SigninWithGoogle();
            }}
          >
            sign in with google{" "}
          </button>
        </div>
      ) : null}
    </>
  );
};

export default App;
