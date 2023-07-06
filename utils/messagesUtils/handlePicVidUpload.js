import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebaseUtils/firebase";
import { v4 as uuidv4 } from "uuid";
import { sendMessage } from "./sendMessage";
import { sendGroupMessage } from "../groupUtils/sendGroupMessage";
import { openDB } from "idb";
export const handlePicVidUpload = async (
  downscaledBlob,
  blurredPixelatedBlob,
  ChatObject,
  mediaCaption,
  User,
  time,
  setChatsFunc,
  videoLength
) => {
  if (!downscaledBlob) return;
  const id = uuidv4();
  const isImage = downscaledBlob.type.includes("image");
  const storageRef = ref(
    storage,
    `${ChatObject.activeChatType}/${ChatObject.activeChatId}${
      isImage ? "images" : "videos"
    }/${id}`
  );
  let blurredPixelatedBlobDownloadURL;
  async function initializeImageDB() {
    const db = await openDB("myImagesDatabase", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      },
    });
    return db;
  }
  async function initializeVideoDB() {
    const db = await openDB("myvideosDatabase", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos");
        }
      },
    });
    return db;
  }

  if (blurredPixelatedBlob) {
    const blurredPixelatedRef = ref(
      storage,
      `${ChatObject.activeChatType}/${ChatObject.activeChatId}/${
        isImage ? "images" : "videos"
      }/${id}_blurred`
    );
    try {
      const blurredPixelatedUploadTask = uploadBytesResumable(
        blurredPixelatedRef,
        blurredPixelatedBlob
      );
      // save to db
      if (isImage) {
        const db = await initializeImageDB();
        const tx = db.transaction("images", "readwrite");
        const store = tx.objectStore("images");
        await store.put(blurredPixelatedBlob, `blurredImage-${id}`);
        await tx.done;
      } else {
        const db = await initializeVideoDB();
        const tx = db.transaction("videos", "readwrite");
        const store = tx.objectStore("videos");
        await store.put(blurredPixelatedBlob, `Thumbnail-${id}`);
        await tx.done;
      }
      blurredPixelatedUploadTask.then(() => {
        getDownloadURL(blurredPixelatedRef).then(
          (blurredPixelatedDownloadURL) => {
            blurredPixelatedBlobDownloadURL = blurredPixelatedDownloadURL;
          }
        );
      });
    } catch (error) {
      console.error("Error uploading blurred/pixelated file:", error);
    }
  }
  try {
    // save to db
    if (isImage) {
      const db = await initializeImageDB();
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      await store.put(downscaledBlob, `image-${id}`);
      await tx.done;
    } else {
      const db = await initializeVideoDB();
      const tx = db.transaction("videos", "readwrite");
      const store = tx.objectStore("videos");
      await store.put(downscaledBlob, `video-${id}`);
      await tx.done;
    }
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

    const message = {
      type: isImage ? "image" : "video",
      id: id,
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

        const newAcctiveChatId = JSON.parse(
          sessionStorage.getItem("activeChatId")
        );
        const activeChats = JSON.parse(sessionStorage.getItem("activeChats"));

        if (ChatObject.activeChatId === newAcctiveChatId) {
          const messageIndex = activeChats.findIndex((chat) => chat.id === id);

          const updatedMessage = {
            ...message,
            dataObject: { ...message.dataObject, progress: progress },
          };
          if (messageIndex === -1) {
            setChatsFunc([...activeChats, updatedMessage]);
          } else {
            activeChats[messageIndex] = updatedMessage
            setChatsFunc(activeChats);
          }
        }

        switch (snapshot.state) {
          case "paused":
            break;
          case "running":
            break;
        }
      },
      (error) => {},
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const picORvideoObj = {
            downloadURL: downloadURL,
            blurredPixelatedBlobDownloadURL: blurredPixelatedBlobDownloadURL
              ? blurredPixelatedBlobDownloadURL
              : null,
            name: downscaledBlob.name,
            size: downscaledBlob.size,
            type: downscaledBlob.type,
            length: isImage ? null : videoLength,
            filePath: uploadTask.snapshot.ref.fullPath,
          };
          ChatObject.activeChatType == "group"
            ? sendGroupMessage(
                User.id,
                User.photoUrl,
                ChatObject.activeChatId,
                mediaCaption,
                User.name,
                isImage ? "image" : "video",
                time,
                null,
                picORvideoObj,
                id,
                () => {},
                null
              )
            : sendMessage(
                User.id,
                ChatObject.otherUserId,
                mediaCaption,
                User.id,
                User.name,
                isImage ? "image" : "video",
                time,
                null,
                picORvideoObj,
                id,
                () => {},
                null
              );
        });
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
