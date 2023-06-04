import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import VideoThumbnail from "react-video-thumbnail";
import { BsFillPlayBtnFill } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import MediaPlayer from "./MediaPlayer";
import { openDB } from "idb";
import { BsFillImageFill } from "react-icons/bs";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

const VideoComponent = ({
  blurredSRC,
  downloadSRC,
  messageId,
  messageText,
  dataObject,
}) => {
  const { User } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);

  const [blurredImgSRC, setblurredImgSRC] = useState(blurredSRC);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isDownloaded, setisDownloaded] = useState(false);
  const [videoPlayer, setvideoPlayer] = useState(false);
  const [loadingThumbnail, setloadingThumbnail] = useState(true);
  const [isDownloading, setisDownloading] = useState(false);
  const [DownloadProgress, setDownloadProgress] = useState(0);

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
    } else if (User.autoDownloadSettings.video) {
      downloadVideo();
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
  }, [messageId]);

  const downloadVideo = async () => {
    const request = new XMLHttpRequest();
    request.open("GET", downloadSRC, true);
    request.responseType = "blob";

    setisDownloading(true);
    request.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        if (percentComplete === 100) {
          setisDownloading(true);
        }
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
      console.log(storedVideo);
      setisDownloaded(true);
    } else {
      await downloadVideo();
    }
  };

  const [imageError, setImageError] = useState(false);

  return (
    <div key={messageId}>
      {videoPlayer && (
        <MediaPlayer
          VideoSRC={videoSrc}
          setvideoPlayer={setvideoPlayer}
          messageText={messageText}
        />
      )}

      <div className="relative flex items-center justify-center">
        <div
          className="relative z-[2] flex items-center justify-center"
          onClick={() => {
            if (isDownloaded) {
              playvideo();
            } else {
              downloadVideo();
            }
          }}
        >
          {loadingThumbnail ? (
            <div>loading...</div>
          ) : (
            <>
              {imageError ? (
                <BsFillImageFill size={250} />
              ) : (
                <img
                  src={blurredImgSRC}
                  width={300}
                  onError={() => setImageError(true)}
                />
              )}
              <div className="absolute text-blue-500">
                {isDownloaded ? (
                  <BsFillPlayBtnFill size={30} />
                ) : (
                  <div>
                    {" "}
                    {isDownloading && (
                      <div className="text-red-500">{DownloadProgress}</div>
                    )}{" "}
                    download
                  </div>
                )}
              </div>
              {!isDownloaded && (
                <div className="absolute bottom-0 left-2 flex text-black">
                  <HiDownload size={30} /> {dataObject.size.toFixed(2)} MB
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoComponent;
