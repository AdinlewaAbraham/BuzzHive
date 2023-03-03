import { db } from "../firebaseUtils/firebase";
import { collection, getDoc, doc } from "firebase/firestore";

export const getUser = async (userId) => {
  const userDoc = doc(collection(db, "users"), userId.toString());
  try {
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      return userSnapshot.data();
    } else {
      throw new Error(`User with ID ${userId} does not exist.`);
    }
  } catch (error) {
    console.error(`Error retrieving user with ID ${userId}: ${error}`);
    throw error;
  }
};
