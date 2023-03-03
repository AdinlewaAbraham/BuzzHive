import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export const removeMEmber = async (arr, groupId) => {
  try {
    const groupRef = doc(db, "groups", groupId.toString());
    await updateDoc(groupRef, { members: arrayRemove(...arr) });
    console.log("Members removed successfully!");
  } catch (err) {
    console.log("Error removing members:", e);
  }
};
