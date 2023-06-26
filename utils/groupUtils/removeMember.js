import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export const removeMEmber = async (arr, groupId) => {
  try {
    const groupRef = doc(db, "groups", groupId.toString());
    await updateDoc(groupRef, { members: arrayRemove(...arr) });
  } catch (err) {
    console.error("Error removing members:", e);
  }
};
