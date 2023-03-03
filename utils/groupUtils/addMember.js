import { arrayUnion,  doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseUtils/firebase";
export const addMember = async(arr, groupUid) => {
    try{
    const groupRef = doc(db, "groups", groupUid)
    
    await updateDoc(groupRef, {
        members: arrayUnion(...arr),
      });

    console.log("Members added successfully!");
    }catch(e){
        console.log("Error adding members:", e);
    }
}