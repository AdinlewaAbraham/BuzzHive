import { arrayUnion, doc } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export const blockUserFromGroup = async (arr, groupid) => {
  try {
    const groupRef = doc(db, "groups", groupid);
    await updateDoc(groupRef, { blockedUsers: arrayUnion(...arr) });
  } catch (e) {}
};
