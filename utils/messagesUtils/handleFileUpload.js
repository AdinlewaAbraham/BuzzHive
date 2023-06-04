import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebaseUtils/firebase";
import { v4 as uuidv4 } from "uuid";
import { sendMessage } from "./sendMessage";
import { sendGroupMessage } from "../groupUtils/sendGroupMessage";
import { useContext } from "react";

export const handleFileUpload = async (
  file,
  ChatObject,
  fileCaption,
  User,
  setChatsFunc,
  Chats,
  sendingFromChatRoomId,
) => {
  const time = new Date();
  try {
    if (!file) {
      return;
    }
    console.log(ChatObject);

    const id = uuidv4();
    const propId = `trackingId${id}`;
    const storageRef = ref(
      storage,
      `${ChatObject.activeChatType}/${ChatObject.activeChatId}/files/${id}`
    );

    const uploadTask = uploadBytesResumable(storageRef, file);

    const dataObj = {
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    };
    const message = {
      type: "file",
      id: propId,
      reactions: [],
      senderId: User.id,
      text: fileCaption || "",
      timestamp: time,
      dataObject: dataObj || {},
      status: "pending",
    };

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      const newAcctiveChatId = JSON.parse(
        sessionStorage.getItem("activeChatId")
      );
      if (sendingFromChatRoomId === newAcctiveChatId) {
        const messageIndex = Chats.findIndex((chat) => chat.id === propId);
        if (messageIndex === -1) {
          setChatsFunc([
            ...Chats,
            {
              ...message,
              dataObject: { ...message.dataObject, progress: progress },
            },
          ]);
        } else {
          setChatsFunc([
            ...Chats,
            {
              ...message,
              dataObject: { ...message.dataObject, progress: progress },
            },
          ]);
        }
      }
      console.log("Upload is " + progress + "% done");

      switch (snapshot.state) {
        case "paused":
          console.log("Upload is paused");
          break;
        case "running":
          console.log("Upload is running");
          break;
      }
    });

    const snapshot = await uploadTask;
    const downloadURL = await getDownloadURL(snapshot.ref);
    const fileObj = {
      downloadURL: downloadURL,
      name: file.name,
      size: file.size,
      type: file.type,
    };

    if (ChatObject.activeChatType == "group") {
      await sendGroupMessage(
        User.id,
        ChatObject.activeChatId,
        fileCaption || fileCaption !== "" ? fileCaption : file.name,
        User.name,
        "file",
        time,
        null,
        fileObj
      );
    } else {
      await sendMessage(
        User.id,
        ChatObject.otherUserId,
        fileCaption || fileCaption !== "" ? fileCaption : file.name,
        User.id,
        User.name,
        "file",
        time,
        null,
        fileObj
      );
    }
    console.log("File available at", downloadURL);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
