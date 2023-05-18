import {
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export async function modifyPollVote(
  type,
  messageId,
  activeChatId,
  optionId,
  senderId,
  actionType
) {
  const collectionName = type === "group" ? "groups" : "conversations";
  const docRef = doc(db, collectionName, activeChatId, "messages", messageId);

  const messageDoc = await getDoc(docRef);
  if (!messageDoc.exists()) return;

  const messageData = messageDoc.data();
  console.log(messageData);
  const { dataObject } = messageData;
  console.log(dataObject);
  const { options } = dataObject;
  console.log(options);
  const User = JSON.parse(localStorage.getItem("user"));
  console.log(User);
  const updatedOptions = options.map((option) => {
    if (option.id === optionId) {
      const senderVoteIndex = option.votes.findIndex(vote => vote.id === senderId);
    
      if (actionType === "add") {
        console.log(User);
        if (senderVoteIndex === -1) {
          console.log(option.votes);  //push not working
          option.votes.push({ id: senderId, displayName: User.name, displayImg: User.photoUrl });
          option.voteCount = option.voteCount + 1;
        }
      } else if (actionType === "remove") {
        console.log(User);
        if (senderVoteIndex !== -1) {
          console.log(User);
          option.votes.splice(senderVoteIndex, 1);
          option.voteCount = option.voteCount - 1;
        }
      }
    }    
    
    return option;
  });

  await updateDoc(docRef, {
    "dataobject.options": updatedOptions,
  });
}
