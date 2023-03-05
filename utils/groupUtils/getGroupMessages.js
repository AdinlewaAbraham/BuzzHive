import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";

export const getGroupMessages = async(groupId)=>{
    const groupMessageColRef = collection(db, "groups", groupId, "messages")
    const groupMessageSnapshot = await getDocs(groupMessageColRef)
    const chats = []
    groupMessageSnapshot.forEach((doc)=>{
        chats.push(doc.data())
    })
    return chats
}