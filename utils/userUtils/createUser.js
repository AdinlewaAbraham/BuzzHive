import { db } from "../firebaseUtils/firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
export const createUser = async (uid, displayname, email, photoUrl, bio) => {
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, {
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
      unReadMessages: {},
      autoDownloadSettings: {
        photos: false,
        videos: false,
        files: false,
      },
      isReadReceiptsOn: true,
      lastUsedEmojiTray: ["1f44d", "2764-fe0f", "1f602", "1f622", "1f92f"],
    });
    console.log("User added to Firebase successfully");
  } catch (error) {
    console.error("Error adding user to Firebase: ", error);
  }
};
