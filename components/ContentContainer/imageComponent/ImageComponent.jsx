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
import { MdClose, MdOutlineFileDownload } from "react-icons/md";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

const ImageComponent = ({ chat }) => {
  const { dataObject } = chat;
  const blurredSRC = dataObject.blurredPixelatedBlobDownloadURL;
  const downloadSRC = dataObject.downloadURL;
  const { User } = useContext(UserContext);
  const { deleteMediaTrigger } = useContext(SelectedChannelContext);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setisDownloaded] = useState(false);
  const [isDownloading, setisDownloading] = useState(false);
  const [loadingImg, setloadingImg] = useState(true);

  const [imageBlob, setimageBlob] = useState();
  const [blurredImageBlob, setblurredImageBlob] = useState();
  const [fullScreenMode, setfullScreenMode] = useState(false);

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
    const handleClick = (e) => {
      if (!e.target.closest(".Image")) {
        setfullScreenMode(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    getStoredImages();
  }, [downloadSRC, User]);
  useEffect(() => {
    validateImage();
  }, [deleteMediaTrigger, User]);

  const downloadImage = async (Url, type) => {
    if (!Url) return;
    if (type === "image") {
      setisDownloading(true);
    }
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
      setisDownloading(false);
      throw error;
    }
  };
  return (
    <div>
      <div className="relative flex h-full items-center justify-center">
        <div className="">
          {!imageBlob || chat.dataObject.status === "uploading" ? (
            <div
              className={` overflow-hidden`}
              style={{ height: chat.dataObject.imgHeight }}
            >
              {!blurredImageBlob ? (
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={285}
                  height={"100%"}
                />
              ) : (
                <img
                  src={URL.createObjectURL(blurredImageBlob)}
                  className="cursor-pointer object-cover"
                  width={300}
                  height={"100%"}
                  onClick={() => downloadImage(downloadSRC, "image")}
                />
              )}
            </div>
          ) : (
            <>
              {!imageBlob ? (
                <>No image available</>
              ) : (
                <img
                  onClick={() => setfullScreenMode(true)}
                  src={URL.createObjectURL(imageBlob)}
                  alt="Preview"
                  className="Image cursor-pointer object-cover"
                  width={300}
                  height={chat.dataObject.imgHeight || 300}
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
        <AnimatePresence>
          {fullScreenMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-secondary fixed inset-0 z-[999] flex flex-col
           items-center justify-center"
            >
              <div
                className="absolute top-4 right-4  flex h-[66px] items-center justify-end rounded-lg bg-white px-4
                text-[30px]  text-black dark:bg-black dark:text-white [&>i]:cursor-pointer"
              >
                <i>
                  <a
                    href={URL.createObjectURL(imageBlob)}
                    download={chat.dataObject.name}
                  >
                    <MdOutlineFileDownload />
                  </a>
                </i>

                <i className="ml-5" onClick={() => setfullScreenMode(false)}>
                  <MdClose />
                </i>
              </div>
              <img
                src={URL.createObjectURL(imageBlob)}
                alt="Preview"
                className={` Image
                h-full object-contain
               transition-all duration-500`}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
    </div>
  );
};
export default ImageComponent;
