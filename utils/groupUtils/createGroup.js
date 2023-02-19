import { db } from "../firebaseUtils/firebase";
import { collection, addDoc } from "firebase/firestore";
export const createGroup = async (
  isPublic,
  creator,
  groupName,
  email,
  photoUrl,
  bio
) => {
  try {
    const docRef = await addDoc(collection(db, "groups"), {
      id: "id",
      name: groupName,
      email: email,
      photoUrl: photoUrl,
      creator: creator,
      bio: bio,
      blockedUsers: [],
      groupInvites: [],
      members: [],
      isPublic: isPublic,
      admins: [creator],
    });
    console.log("group added to Firebase successfully");
  } catch (error) {
    console.error("Error adding user to Firebase: ", error);
  }
};
