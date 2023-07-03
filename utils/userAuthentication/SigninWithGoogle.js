import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { db } from "../firebaseUtils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { sendMessage } from "../messagesUtils/sendMessage";

const sendWelcomeMessage = async (userId) => {
  const user1Id = userId;
  const user2Id = "eaqHdrv5x1Z4jF7ZPoU6s7r1jOB2";
  const q = doc(
    db,
    "conversations",
    user1Id > user2Id ? user1Id + user2Id : user2Id + user1Id
  );

  const snapshot = await getDoc(q);

  if (snapshot.exists()) return;
  try {
    const firstText =
      "Hey there! 👋 It's Abraham, and I'm excited to introduce you to my chat app, BuzzHive! I've been working on this project as part of my portfolio, and I'm thrilled to share it with you. So, buckle up and get ready for a buzzing experience! 🐝";
    const secondText =
      "Welcome to BuzzHive! This is a chat app I've built from scratch, and it's all about connecting people and facilitating conversations. With BuzzHive, you can chat with friends, share messages and media, and explore different features. It's a fun and interactive platform designed to keep you engaged and entertained. ✨";
    const thirdText =
      "Feel free to test run the app using my account. Go ahead and dive into the world of BuzzHive! Chat with others, try out different functionalities, and let me know what you think. Enjoy exploring BuzzHive! 😄";
    const lastText =
      "I hope you have a great time using BuzzHive and discovering its features. Happy chatting! 🎉";
    const messages = [firstText, secondText, thirdText, lastText];
    const senderId = "eaqHdrv5x1Z4jF7ZPoU6s7r1jOB2";
    messages.forEach(async (message) => {
      await sendMessage(
        senderId,
        userId,
        message,
        senderId,
        "Abraham",
        "regular",
        new Date(),
        null,
        null,
        null,
        () => {},
        false
      );
    });
  } catch (error) {
    console.error("Error sending messages:", error);
  }
};
export const SigninWithGoogle = (setisSigningInFunc) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async () => {
      setisSigningInFunc(false);
    })
    .catch((err) => {
      console.error(err);
      setisSigningInFunc(false);
    });
};
