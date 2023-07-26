import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import VideoThumbnail from "react-video-thumbnail";
import { BsFillPlayBtnFill } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import MediaPlayer from "./MediaPlayer";
import { openDB } from "idb";
import { BsFillImageFill } from "react-icons/bs";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import DownloadCircularAnimation from "../DownloadCircularAnimation";
import UploadCircularAnimation from "../UploadCircularAnimation";
import { FiDownload } from "react-icons/fi";
import { BsCameraVideo } from "react-icons/bs";
import { formatDuration } from "@/utils/actualUtils/formatDuration";
import { Skeleton } from "@mui/material";
import { AnimatePresence } from "framer-motion";

const VideoComponent = ({ chat }) => {
  const { dataObject } = chat;
  const blurredSRC = dataObject.blurredPixelatedBlobDownloadURL;
  const downloadSRC = dataObject.downloadURL;
  const messageId = chat.id;
  const messageText = chat.text;

  const { User } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);


  const [blurredImgSRC, setblurredImgSRC] = useState(blurredSRC);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isDownloaded, setisDownloaded] = useState(false);
  const [videoPlayer, setvideoPlayer] = useState(false);
  const [loadingThumbnail, setloadingThumbnail] = useState(true);
  const [isDownloading, setisDownloading] = useState(false);
  const [DownloadProgress, setDownloadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  async function initializeDB() {
    const db = await openDB("myvideosDatabase", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos");
        }
      },
    });
    return db;
  }

  const getVideoFromIndexedDB = async (key) => {
    const db = await initializeDB();
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const value = await store.get(key);
    await tx.done;
    return value;
  };

  const getStoredVideoandVideoThumbnail = async () => {
    setloadingThumbnail(true);
    const storedVideo = await getVideoFromIndexedDB(`video-${messageId}`);
    if (storedVideo) {
      setVideoSrc(storedVideo);
      setisDownloaded(true);
    } else if (User.autoDownloadSettings.videos) {
      downloadVideo();
    } else {
      setisDownloaded(false);
    }

    const storedVideoThumnail = await getVideoFromIndexedDB(
      `Thumbnail-${messageId}`
    );
    if (storedVideoThumnail) {
      setblurredImgSRC(URL.createObjectURL(storedVideoThumnail));
    } else {
      const response = await fetch(blurredSRC);
      const blob = await response.blob();
      const db = await initializeDB();
      const tx = db.transaction("videos", "readwrite");
      const store = tx.objectStore("videos");
      await store.put(blob, `Thumbnail-${messageId}`);
      await tx.done;

      setblurredImgSRC(URL.createObjectURL(blob));
    }
    setloadingThumbnail(false);
  };

  useEffect(() => {
    getStoredVideoandVideoThumbnail();
  }, [messageId, User]);

  const downloadVideo = async () => {
    const request = new XMLHttpRequest();
    request.open("GET", downloadSRC, true);
    request.responseType = "blob";

    setisDownloading(true);
    request.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);

        setDownloadProgress(percentComplete);
      }
    });

    request.addEventListener("load", async (event) => {
      if (request.status === 200) {
        const blob = request.response;

        setVideoSrc(URL.createObjectURL(blob));
        setisDownloaded(true);

        const db = await initializeDB();
        const tx = db.transaction("videos", "readwrite");
        const store = tx.objectStore("videos");
        await store.put(blob, `video-${messageId}`);
        await tx.done;
        setisDownloading(false);
      } else {
        console.error(`Failed to download video (${request.status})`);
      }
    });

    request.send();
  };

  const playvideo = async () => {
    setvideoPlayer(true);
    const storedVideo = await getVideoFromIndexedDB(`video-${messageId}`);
    if (storedVideo) {
      setVideoSrc(URL.createObjectURL(storedVideo));
      setisDownloaded(true);
    } else {
      await downloadVideo();
    }
  };
  
  return (
    <div key={messageId}>
      <AnimatePresence>
        {videoPlayer && (
          <MediaPlayer
            VideoSRC={videoSrc}
            setvideoPlayer={setvideoPlayer}
            messageText={messageText}
            fileName={chat.dataObject.name}
          />
        )}
      </AnimatePresence>
      <div className=" flex items-center justify-center">
        <div
          className={`relative z-[2] flex items-center justify-center overflow-hidden `}
          style={{height: chat.dataObject.imgHeight}}
          onClick={() => {
            if (isDownloaded) {
              playvideo();
            } else {
              downloadVideo();
            }
          }}
        >
          {loadingThumbnail ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={285}
              height={'100%'}
            />
          ) : (
            <>
              {imageError ? (
                <i className="mb-2">
                  <BsFillImageFill size={200} />
                </i>
              ) : (
                <div className={`relative `}>
                  {!isDownloaded && (
                    <div className="absolute inset-0 backdrop-blur-sm"></div>
                  )}
                  <img
                    src={blurredImgSRC}
                    width={300}
                    height={'100%'}
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              <div className="absolute text-blue-500">
                {isDownloaded
                  ? !isDownloading &&
                    dataObject.status !== "uploading" && (
                      <BsFillPlayBtnFill size={30} />
                    )
                  : !isDownloading && <FiDownload color="black" size={30} />}
              </div>

              {isDownloading && (
                <div className=" absolute ">
                  <DownloadCircularAnimation progress={DownloadProgress} />
                </div>
              )}
              {dataObject.status === "uploading" && (
                <div className=" absolute ">
                  <UploadCircularAnimation progress={dataObject.progress} />
                </div>
              )}
              {!isDownloaded && (
                <div className="absolute bottom-0 left-2 flex text-black ">
                  {isDownloading ? (
                    <div>
                      <div className="text-muted mb-[4px] flex items-center text-xs">
                        <i className="mr-1">
                          <BsCameraVideo />
                        </i>
                        {dataObject.length && <>{dataObject.length}</>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted mb-[4px] flex items-center text-xs">
                      <i className="mr-1">
                        <FiDownload />
                      </i>
                      {(dataObject.size / (1024 * 1024)).toFixed(2)}MB
                    </div>
                  )}
                </div>
              )}
              {dataObject.status === "uploading" ||
                (isDownloaded && (
                  <div className="text-muted absolute bottom-0 left-2 mb-[4px] flex items-center text-[13px]">
                    <i className="mr-1">
                      <BsCameraVideo />
                    </i>
                    {dataObject.length && (
                      <>{formatDuration(dataObject.length, true)}</>
                    )}
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoComponent;
