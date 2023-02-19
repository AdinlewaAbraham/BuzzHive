import { getFirestore, collection, query, where, getDocs, collectionGroup, getDocs as getSubcollectionDocs } from "firebase/firestore";

import { async } from "@firebase/util";

export const getUserMessages = async (userId1, userId2) => {

    const db = getFirestore();
    const collectionRef = collection(db, 'conversations');
    const docId1 = `${userId1}_${userId2}`;
    const docId2 = `${userId2}_${userId1}`;
    const queryRef = query(collectionRef, where('__name__', 'in', [docId1, docId2]));
    const querySnapshot = await getDocs(queryRef);
    const conversations = [];
  
    querySnapshot.forEach(async(doc) => {
      const conversation = {
        id: doc.id,
        messages: []
      };
  
      // Get messages subcollection
      const messagesRef = collection(doc.ref, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
  
      messagesSnapshot.forEach((messageDoc) => {
        const message = messageDoc.data();
        conversation.messages.push(message);
      });
  
      conversations.push(conversation);
    });
  console.log(conversations)
    return conversations;
};
