import { db } from "../firebaseUtils/firebase";
import { collection, addDoc } from "firebase/firestore";
export const createGroup = async (
  isPublic,
  creator,
  groupName,
  photoUrl,
  bio
) => {
  try {
    const docRef = await addDoc(collection(db, "groups"), {
      id: "id",
      name: groupName,
      photoUrl: photoUrl,
      creator: creator,
      bio: bio,
      blockedUsers: [],
      groupInvites: [],
      members: [creator, "1ewf"],
      isPublic: isPublic,
      admins: [creator],
    });
    console.log("group added to Firebase successfully");
  } catch (error) {
    console.error("Error adding user to Firebase: ", error);
  }
};
