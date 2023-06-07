import { sendGroupMessage } from "./sendGroupMessage";
import { db } from "../firebaseUtils/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebaseUtils/firebase";
export const createGroup = async (
  members,
  isPublic,
  creator,
  groupName,
  photoFile,
  bio,
  username
) => {
  try {
    const groupsRef = collection(db, "groups");
    const newGroupRef = doc(groupsRef);
    let photoUrl;
    if (photoFile) {
      const profileUploadRef = ref(storage, `groupIcons/${newGroupRef.id}`);
      const profileUploadTask = uploadBytesResumable(
        profileUploadRef,
        photoFile
      );

      await profileUploadTask;
      photoUrl = await getDownloadURL(profileUploadRef);
    }
    console.log(photoUrl);
    const newGroup = {
      id: newGroupRef.id,
      name: groupName,
      photoUrl: photoUrl || null,
      creator: creator,
      bio: bio,
      blockedUsers: [],
      groupInvites: [],
      members: [creator, ...members],
      isPublic: isPublic,
      admins: [creator],
    };

    await setDoc(newGroupRef, newGroup);

    const messageText = `${username} created ${groupName}!`;
    const time = new Date();
    await sendGroupMessage(
      creator,
      newGroupRef.id,
      messageText,
      username,
      "announcement",
      time,
      null,
      null,
      null
    );
  } catch (error) {
    console.error("Error adding user to Firebase: ", error);
  }
};
