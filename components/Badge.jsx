import { db } from "@/utils/firebaseUtils/firebase";
import { el } from "@faker-js/faker";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { MdVerified } from "react-icons/md";

const Badge = ({ id,styles }) => {
  const [verifiedUsers, setVerifiedUsers] = useState([
    "eaqHdrv5x1Z4jF7ZPoU6s7r1jOB2",
  ]);
  useEffect(() => {
    const getVerifiedUsers = async () => {
      const lsvu = localStorage.getItem("verifiedUsers");
      if (
        lsvu !== "[]" &&
        lsvu !== "{}" &&
        lsvu !== "undefined" &&
        lsvu !== "null" &&
        lsvu
      ) {
        setVerifiedUsers(JSON.parse(lsvu));
      } else {
        const verifiedUsersRef = doc(db, "users", "verifiedUsers");
        const snapShot = await getDoc(verifiedUsersRef);
        const { verifiedUsers } = snapShot.data();
        if (
          JSON.stringify(verifiedUsers) !== "[]" &&
          JSON.stringify(verifiedUsers) !== "{}" &&
          JSON.stringify(verifiedUsers) !== "undefined" &&
          JSON.stringify(verifiedUsers) !== "null" &&
          JSON.stringify(verifiedUsers)
        ) {
          localStorage.setItem("verifiedUsers", JSON.stringify(verifiedUsers));
        }
      }
    };

    return () => getVerifiedUsers();
  }, []);
  useEffect(() => {
    const verifiedUsersRef = doc(db, "users", "verifiedUsers");
    const unsub = onSnapshot(verifiedUsersRef, (snapShot) => {
      if (!snapShot.data()) return;
      const { verifiedUsers } = snapShot.data();
      if (
        JSON.stringify(verifiedUsers) !== "[]" &&
        JSON.stringify(verifiedUsers) !== "{}" &&
        JSON.stringify(verifiedUsers) !== "undefined" &&
        JSON.stringify(verifiedUsers) !== "null" &&
        JSON.stringify(verifiedUsers)
      ) {
        localStorage.setItem("verifiedUsers", JSON.stringify(verifiedUsers));
        setVerifiedUsers(verifiedUsers);
      }
    });
    return () => unsub();
  }, []);

  if (!verifiedUsers.includes(id)) return false;
  return (
    <div>
      <i className={`ml-2 flex items-center text-accent-blue ${styles}`}>
        <MdVerified />
      </i>
    </div>
  );
};

export default Badge;
