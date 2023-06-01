import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebaseUtils/firebase";
import { v4 as uuid } from "uuid";
import { sendMessage } from "./sendMessage";
import { sendGroupMessage } from "../groupUtils/sendGroupMessage";
import { useContext } from "react";

export const handleFileUpload = async (file, ChatObject, fileCaption, User) => {
  const time = new Date();
  try {
    if (!file) {
      return;
    }
    console.log(ChatObject);

    const id = uuid();
    const storageRef = ref(
      storage,
      `${ChatObject.activeChatType}/${ChatObject.activeChatId}/files/${id}`
    );

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
    alert(downloadURL);
    console.log("File available at", downloadURL);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
