import { db } from "../firebaseUtils/firebase";
import { collection, addDoc } from "firebase/firestore";
export const createUser = async (uid, displayname, email, photoUrl, bio) => {
  try {
    const docRef = await addDoc(collection(db, "users",/*here will be uid*/), {
      id: uid,
      name: displayname,
      email: email,
      photoUrl: photoUrl,
      bio: bio,
      blockedUsers: [],
      friendRequests: [],
      groups: [],
      groupInvites: [],
      friends: [],
      groups: [],
      sentFriendRequests: [],
      receivedFriendRequests: [],
      darkMode: false,
    });
    console.log("User added to Firebase successfully");

    console.log("User messages subcollection created successfully");
  } catch (error) {
    console.error("Error adding user to Firebase: ", error);
  }
};
