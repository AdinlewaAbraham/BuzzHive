import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebaseUtils/firebase";
import { v4 as uuid } from "uuid";
export const handlePicVidUpload = async (downscaledBlob, ChatObject) => {
  if (!downscaledBlob) return;
console.log(downscaledBlob)
  const id = uuid();
  const isImage = downscaledBlob.type.includes("image");
  const storageRef = ref(
    storage,
    `${ChatObject.activeChatType}/${ChatObject.activeChatId}${
      isImage ? "images" : "videos"
    }/${id}`
  );
  try {
    const uploadTask = uploadBytesResumable(storageRef, downscaledBlob);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {},
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
        });
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
