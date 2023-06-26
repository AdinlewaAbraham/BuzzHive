import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export const getGroup = async (groupId) => {
  const groupDoc = doc(db, "groups", groupId);
  try {
    const groupSnapshot = await getDoc(groupDoc);
    if (groupSnapshot.exists()) {
      return groupSnapshot.data();
    } else  throw new Error(`this group with this ID ${groupId} does not exists`);
  } catch (err) {
    console.error(`Error retrieving user with ID ${groupId}: ${err}`);
    throw err;
  }
};
