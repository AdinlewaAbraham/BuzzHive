import { sendGroupMessage } from "./sendGroupMessage";
import { db } from "../firebaseUtils/firebase";
import { collection, doc , setDoc} from "firebase/firestore";
export const createGroup = async (
  members,
  isPublic,
  creator,
  groupName,
  photoUrl,
  bio
) => {
  try {
    const groupsRef = collection(db, "groups");
    const newGroupRef = doc(groupsRef);

    const newGroup = {
      id: newGroupRef.id,
      name: groupName,
      photoUrl: photoUrl,
      creator: creator,
      bio: bio,
      blockedUsers: [],
      groupInvites: [],
      members: [creator, ...members],
      isPublic: isPublic,
      admins: [creator],
    };

    await setDoc(newGroupRef, newGroup);

    const groupID = newGroupRef.id;
    const senderId = creator;
    const messageText = `Welcome to the group ${groupName}!`;
    const time = new Date();
    await sendGroupMessage(senderId, groupID, messageText, time);

  } catch (error) {
    console.error("Error adding user to Firebase: ", error);
  }
};
