import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebaseUtils/firebase";
import { v4 as uuidv4 } from "uuid";
import { sendMessage } from "./sendMessage";
import { sendGroupMessage } from "../groupUtils/sendGroupMessage";
import { useContext } from "react";
import { openDB } from "idb";

export const handleFileUpload = async (
  file,
  ChatObject,
  fileCaption,
  User,
  setChatsFunc,
  Chats,
  sendingFromChatRoomId
) => {
  const currentTime = new Date().getTime();

  const time = new Date()
  try {
    if (!file) {
      return;
    }

    const id = uuidv4();
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
      id: id,
    };
    const message = {
      type: "file",
      id: id,
      reactions: [],
      senderId: User.id,
      text: fileCaption || "",
      timestamp: time,
      dataObject: dataObj || {},
      status: "pending",
    };

    async function initializeFileDB() {
      const db = await openDB("myFilesDatabase", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("files")) {
            db.createObjectStore("files");
          }
        },
      });
      return db;
    }
    const db = await initializeFileDB();
    const tx = db.transaction("files", "readwrite");
    const store = tx.objectStore("files");
    await store.put(file, `file-${id}`);
    await tx.done;

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      const newAcctiveChatId = JSON.parse(
        sessionStorage.getItem("activeChatId")
      );
      if (sendingFromChatRoomId === newAcctiveChatId) {
        const messageIndex = Chats.findIndex((chat) => chat.id === id);
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

      switch (snapshot.state) {
        case "paused":
          break;
        case "running":
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
      filePath: snapshot.ref.fullPath
    };

    if (ChatObject.activeChatType == "group") {
      await sendGroupMessage(
        User.id,
        User.photoUrl,
        ChatObject.activeChatId,
        fileCaption || "",
        User.name,
        "file",
        time,
        null,
        fileObj,
        id,
        () => {},
        false
      );
    } else {
      await sendMessage(
        User.id,
        ChatObject.otherUserId,
        fileCaption || "",
        User.id,
        User.name,
        "file",
        time,
        null,
        fileObj,
        id,
        () => {},
        false
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
