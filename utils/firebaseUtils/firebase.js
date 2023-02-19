import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcSBgp6VSWXwd_EkPuQOyB_TAd89yVSdw",
  authDomain: "buzzhive-95058.firebaseapp.com",
  projectId: "buzzhive-95058",
  storageBucket: "buzzhive-95058.appspot.com",
  messagingSenderId: "242899859528",
  appId: "1:242899859528:web:d3763d798410bd8424c07d",
  measurementId: "G-H5BZ4Y6YQX"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);