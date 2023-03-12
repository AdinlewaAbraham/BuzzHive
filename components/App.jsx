import React, { useEffect, useState, createContext } from "react";
import SideBar from "./sidebar/SideBar";
import ChannelBar from "./ChannelBar/ChannelBar";
import ContentContainer from "./ContentContainer/ContentContainer";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { SelectedChannelProvider } from "@/context/SelectedChannelContext ";
import { SigninWithGoogle } from "@/utils/userAuthentication/SigninWithGoogle";

import { createUser } from "@/utils/userUtils/createUser";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";

export const UserContext = createContext();

const App = () => {
  const [User, setUser] = useState({});
  const auth = getAuth();

  const [itu, setitu] = useState(false);

  onAuthStateChanged(auth, async (u) => {
    if (u) {
      setUser(u);
      setitu(true);
      const user = await getDoc(doc(db, "users", u.uid))

      if (!user.data()){
        createUser(u.uid, u.displayName, u.email, u.photoURL, "debo")
      }

    } else {
      setUser(null);
      console.log("user signed out");
      setitu(false);
    }
  });

  return (
    <>
      {itu ? (
        <UserContext.Provider value={{ User, setUser }}>
          <SelectedChannelProvider>
            <main className="flex">
              <SideBar />
              <ChannelBar />
              <ContentContainer />
            </main>
          </SelectedChannelProvider>
        </UserContext.Provider>
      ) : (
        <div className="h-screen flex justify-center items-center">
          <button
            className="bg-green-600 px-2 py-4 rounded-lg"
            onClick={() => {SigninWithGoogle()}}
          >
            sign in with google{" "}
          </button>
        </div>
      )}
    </>
  );
};

export default App;
