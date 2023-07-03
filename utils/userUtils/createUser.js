import { db } from "../firebaseUtils/firebase";
import { collection, addDoc, setDoc, doc, getDoc } from "firebase/firestore";
import { sendMessage } from "../messagesUtils/sendMessage";
export const createUser = async (uid, displayname, email, photoUrl, bio) => {
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, {
      id: uid,
      name: displayname,
      queryName: displayname.toLowerCase(),
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

    const userId = uid;
    const welcomeText =
      "Hey there! 👋 Welcome to BuzzHive! This is a chat app I've built from scratch, designed to connect people and facilitate conversations. Explore different features and enjoy your time on BuzzHive! 😄";
    const senderId = "eaqHdrv5x1Z4jF7ZPoU6s7r1jOB2";

    const conversationId =
      userId > senderId ? userId + senderId : senderId + userId;
    await getDoc(doc(db, "conversations", conversationId))
      .then(async (querySnapshot) => {
        if (!querySnapshot.exists()) {
          await sendMessage(
            userId,
            senderId,
            welcomeText,
            senderId,
            "Abraham",
            "regular",
            new Date(),
            null,
            null,
            "welcomeText",
            () => {},
            false
          );
        }
      })
      .catch((error) => {
        console.error("Error checking collection:", error);
      });
  } catch (error) {
    console.error("Error adding user to Firebase: ", error);
  }
};
