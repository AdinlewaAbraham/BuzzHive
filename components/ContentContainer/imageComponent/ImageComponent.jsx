import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiDownload } from "react-icons/fi";
import { useContext } from "react";
import { UserContext } from "../../App";
import { openDB } from "idb";
import DownloadCircularAnimation from "../DownloadCircularAnimation";
import UploadCircularAnimation from "../UploadCircularAnimation";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { Skeleton } from "@mui/material";

const ImageComponent = ({ blurredSRC, downloadSRC, messageId, chat }) => {
  const { User } = useContext(UserContext);
  const { deleteMediaTrigger } = useContext(SelectedChannelContext);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setisDownloaded] = useState(false);
  const [isDownloading, setisDownloading] = useState(false);
  const [loadingImg, setloadingImg] = useState(true);

  const [imageBlob, setimageBlob] = useState();
  const [blurredImageBlob, setblurredImageBlob] = useState();

  async function initializeDB() {
    const db = await openDB("myImagesDatabase", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      },
    });
    return db;
  }
  const getImgFromIndexedDB = async (key) => {
    const db = await initializeDB();
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const value = await store.get(key);
    await tx.done;
    return value;
  };
  const validateImage = async () => {
    const imageBlob = await getImgFromIndexedDB(`image-${chat.id}`);
    if (imageBlob) {
      setisDownloaded(true);
      console.log(true);
    } else {
      setisDownloaded(false);
      setimageBlob(null);
      setisDownloading(false);
    }
  };

  const getStoredImages = async () => {
    setloadingImg(true);
    const imageBlob = await getImgFromIndexedDB(`image-${chat.id}`);
    const blurredImageBlob = await getImgFromIndexedDB(
      `blurredImage-${chat.id}`
    );
    if (blurredImageBlob) {
      setblurredImageBlob(blurredImageBlob);
    } else {
      await downloadImage(blurredSRC, "blurredImage");
    }
    if (imageBlob) {
      setimageBlob(imageBlob);
      setisDownloaded(true);
    } else if (User.autoDownloadSettings.photos) {
      await downloadImage(downloadSRC, "image");
    } else {
      setisDownloaded(false);
      setimageBlob(null);
    }
  };
  useEffect(() => {
    getStoredImages();
  }, [downloadSRC, User]);
  useEffect(() => {
    validateImage();
  }, [deleteMediaTrigger, User]);

  const downloadImage = async (url, type) => {
    if (!url) return;
    console.log(url);
    console.log(type);
    setisDownloading(true);
    try {
      const response = await axios.get("/api/downloadImage", {
        params: { url },
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          console.log((loaded / total) * 100);
          setDownloadProgress((loaded / total) * 100);
        },
      });

      const blob = response.data;

      if (type === "blurredImage") {
        setblurredImageBlob(blob);
      } else {
        setimageBlob(blob);
      }

      setloadingImg(false);
      setisDownloaded(true);
      const db = await initializeDB();
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      await store.put(blob, `${type}-${chat.id}`);
      await tx.done;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className="">
        {!imageBlob || chat.dataObject.status === "uploading" ? (
          <>
            {!blurredImageBlob ? (
              <Skeleton
                animation="wave"
                variant="rectangular"
                width={285}
                height={240}
              />
            ) : (
              <img
                src={URL.createObjectURL(blurredImageBlob)}
                className="object-cover"
                width={300}
              />
            )}
          </>
        ) : (
          <>
            {!imageBlob ? (
              <>No image available</>
            ) : (
              <img
                src={URL.createObjectURL(imageBlob)}
                alt="Preview"
                className="object-cover"
                width={300}
              />
            )}
          </>
        )}
      </div>
      {chat.dataObject.status === "uploading" && (
        <div className="absolute">
          <UploadCircularAnimation progress={chat.dataObject.progress} />
        </div>
      )}

      {console.log(isDownloaded)}
      {!isDownloaded && (
        <>
          {isDownloading ? (
            <div className="absolute">
              <DownloadCircularAnimation progress={downloadProgress} />
            </div>
          ) : (
            <button
              className="absolute"
              onClick={() => downloadImage(downloadSRC, "image")}
            >
              <FiDownload color="black" size={30} />
            </button>
          )}
        </>
      )}
    </div>
  );
};
export default ImageComponent;
