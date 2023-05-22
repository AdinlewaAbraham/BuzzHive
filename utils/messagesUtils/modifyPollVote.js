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
  console.log(options);
  const updatedOptions = options.map((option) => {
    if (option.id === optionId) {
      const senderVoteIndex = option.votes.findIndex(
        (vote) => vote.id === senderId
      );

      if (actionType === "add") {
        console.log(User);
        if (senderVoteIndex === -1) {
          console.log(option.votes);
          const votes = option.votes;
          const newVotes = [
            ...votes,
            { id: senderId, displayName: User.name, displayImg: User.photoUrl },
          ];
          option.voteCount = newVotes.length;
          return { ...option, votes: [...newVotes] };
          // option.votes.push({ id: senderId, displayName: User.name, displayImg: User.photoUrl });
        }
      } else if (actionType === "remove") {
        console.log(User);
        if (senderVoteIndex !== -1) {
          const votes = option.votes;
          votes.splice(senderVoteIndex, 1)
          console.log(votes);
          option.voteCount = votes.length;
          return { ...option, votes: [...votes] };
        }
      }
    }

    return option;
  });
  updatedOptions.forEach((stuff)=>{
    console.log(stuff["votes"]);
    console.log(stuff);
  })

  await updateDoc(docRef, {
    "dataObject.options": updatedOptions,
  }).then((updatedOptions)=> console.log(updatedOptions));
}
