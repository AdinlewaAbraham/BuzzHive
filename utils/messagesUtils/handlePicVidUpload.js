import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebaseUtils/firebase";
import { v4 as uuidv4 } from "uuid";
import { sendMessage } from "./sendMessage";
import { sendGroupMessage } from "../groupUtils/sendGroupMessage";
import { URL } from "next/dist/compiled/@edge-runtime/primitives/url";
export const handlePicVidUpload = async (
  downscaledBlob,
  blurredPixelatedBlob,
  ChatObject,
  mediaCaption,
  User,
  time,
  setChatsFunc
) => {
  if (!downscaledBlob) return;
  console.log(downscaledBlob);
  const id = uuidv4();
  const propId = `trackingId${id}`;
  const isImage = downscaledBlob.type.includes("image");
  const storageRef = ref(
    storage,
    `${ChatObject.activeChatType}/${ChatObject.activeChatId}${
      isImage ? "images" : "videos"
    }/${id}`
  );
  let blurredPixelatedBlobDownloadURL;
  if (blurredPixelatedBlob) {
    console.log(blurredPixelatedBlob);
    const blurredPixelatedRef = ref(
      storage,
      `${ChatObject.activeChatType}/${ChatObject.activeChatId}${
        isImage ? "images" : "videos"
      }/${id}_blurred`
    );
    try {
      const blurredPixelatedUploadTask = uploadBytesResumable(
        blurredPixelatedRef,
        blurredPixelatedBlob
      );
      blurredPixelatedUploadTask.then(() => {
        getDownloadURL(blurredPixelatedRef).then(
          (blurredPixelatedDownloadURL) => {
            blurredPixelatedBlobDownloadURL = blurredPixelatedDownloadURL;
            console.log(
              "Blurred/pixelated file available at",
              blurredPixelatedBlobDownloadURL,
              " ",
              blurredPixelatedDownloadURL
            );
          }
        );
      });
    } catch (error) {
      console.error("Error uploading blurred/pixelated file:", error);
    }
  }
  try {
    const uploadTask = uploadBytesResumable(storageRef, downscaledBlob);
    //const thumbnail = blurredPixelatedBlob
    const dataObj = {
      name: downscaledBlob.name,
      size: downscaledBlob.size,
      type: downscaledBlob.type,
      status: "uploading",
      progress: 0,
      thumbnail: new Blob([blurredPixelatedBlob], { type: "image/jpeg" }),
    };
    console.log(blurredPixelatedBlob);
    const message = {
      type: isImage ? "image" : "video",
      id: propId,
      reactions: [],
      senderId: User.id,
      text: mediaCaption || "",
      timestamp: time,
      dataObject: dataObj || {},
      status: "pending",
    };
    const Chats = JSON.parse(localStorage.getItem(ChatObject.activeChatId));
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        console.log("Upload is " + progress + "% done");
        const newAcctiveChatId = JSON.parse(
          sessionStorage.getItem("activeChatId")
        );
        if (ChatObject.activeChatId === newAcctiveChatId) {
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
          console.log(blurredPixelatedBlobDownloadURL);
          const picORvideoObj = {
            downloadURL: downloadURL,
            blurredPixelatedBlobDownloadURL: blurredPixelatedBlobDownloadURL
              ? blurredPixelatedBlobDownloadURL
              : null,
            name: downscaledBlob.name,
            size: downscaledBlob.size,
            type: downscaledBlob.type,
          };
          ChatObject.activeChatType == "group"
            ? sendGroupMessage(
                User.id,
                ChatObject.activeChatId,
                mediaCaption,
                User.name,
                isImage ? "image" : "video",
                time,
                null,
                picORvideoObj
              )
            : sendMessage(
                User.id,
                ChatObject.activeChatId,
                mediaCaption,
                User.name,
                isImage ? "image" : "video",
                time,
                null,
                picORvideoObj
              );
          console.log("File available at", downloadURL);
        });
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
