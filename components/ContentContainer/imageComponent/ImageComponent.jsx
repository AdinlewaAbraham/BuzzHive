import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiDownload } from "react-icons/fi";
import { useContext } from "react";
import { UserContext } from "../../App";
import { openDB } from "idb";
import DownloadCircularAnimation from "../DownloadCircularAnimation";
import UploadCircularAnimation from "../UploadCircularAnimation";

const ImageComponent = ({ blurredSRC, downloadSRC, messageId, chat }) => {
  const { User } = useContext(UserContext);
  const [downloadProgress, setDownloadProgress] = useState(null);
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

  const getStoredFiles = async () => {
    setloadingImg(true);
    const imageBlob = await getImgFromIndexedDB(`image-${chat.id}`);
    const blurredImageBlob = await getImgFromIndexedDB(
      `blurredImage-${chat.id}`
    );
    if (imageBlob) {
      setimageBlob(imageBlob);
      setisDownloaded(true);
    } else if (User.autoDownloadSettings.file) {
      downloadImage(downloadSRC, "image");
    }
    if (blurredImageBlob) {
      setblurredImageBlob(blurredImageBlob);
    } else {
      downloadImage(blurredSRC, "blurredImage");
    }
  };
  useEffect(() => {
    getStoredFiles();
  }, [downloadSRC]);

  const downloadImage = async (Url, type) => {
    if (!Url) return;
    console.log(Url)
    console.log(type)
    setisDownloading(true);
    try {
      const response = await axios({
        url: Url,
        method: "GET",
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
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
    <div className="relative">
      <div className="">
        {loadingImg && !imageBlob ? (
          <>
            {!blurredImageBlob ? (
              <>loadingImg</>
            ) : (
              <img
                src={URL.createObjectURL(blurredImageBlob)}
                className=" object-cover"
                width={300}
              />
            )}
          </>
        ) : (
          <img
            src={URL.createObjectURL(imageBlob)}
            alt="Preview"
            className=" object-cover"
            width={300}
          />
        )}
      </div>
      {chat.dataObject.status === "uploading" && !loadingImg ? (
        <div>
          <UploadCircularAnimation progress={chat.dataObject.progress} />
        </div>
      ) : (
        <>
          {!isDownloaded && (
            <>
              {isDownloading ? (
                <div>
                  <DownloadCircularAnimation progress={downloadProgress} />
                </div>
              ) : (
                <button onClick={() => downloadImage(downloadSRC, "image")}>
                  <FiDownload color="black" size={30} />
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
export default ImageComponent;
