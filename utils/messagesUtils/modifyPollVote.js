import {
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export async function modifyPollVote(
  type,
  messageId,
  messageData,
  activeChatId,
  optionId,
  senderId,
  actionType
) {
  const collectionName = type === "group" ? "groups" : "conversations";
  const docRef = doc(db, collectionName, activeChatId, "messages", messageId);

  const { dataObject } = messageData;
  const { options } = dataObject;
  const User = JSON.parse(localStorage.getItem("user"));
  const updatedOptions = options.map((option) => {
    if (option.id === optionId) {
      const senderVoteIndex = option.votes.findIndex(
        (vote) => vote.id === senderId
      );

      if (actionType === "add") {
        if (senderVoteIndex === -1) {
          const votes = option.votes;
          const newVotes = [
            ...votes,
            { id: senderId, displayName: User.name, displayImg: User.photoUrl },
          ];
          option.voteCount = newVotes.length;
          return { ...option, votes: [...newVotes] };
        }
      } else if (actionType === "remove") {
        if (senderVoteIndex !== -1) {
          const votes = option.votes;
          votes.splice(senderVoteIndex, 1);
          option.voteCount = votes.length;
          return { ...option, votes: [...votes] };
        }
      }
    }

    return option;
  });
  updatedOptions.forEach((stuff) => {});

  await updateDoc(docRef, {
    "dataObject.options": updatedOptions,
  });
}
