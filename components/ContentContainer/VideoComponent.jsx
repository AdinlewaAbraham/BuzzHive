import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import VideoThumbnail from "react-video-thumbnail";
import { BsFillPlayBtnFill } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import MediaPlayer from "./MediaPlayer";
import { openDB, deleteDB } from "idb";

const VideoComponent = ({
  blurredSRC,
  downloadSRC,
  messageId,
  messageText,
}) => {
  const { User } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);

  const [videoSrc, setVideoSrc] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isthumbnailrendered, setisthumbnailrendered] = useState(false);
  const [isDownloaded, setisDownloaded] = useState(false);
  const [videoPlayer, setvideoPlayer] = useState(false);
  const [VideoSize, setVideoSize] = useState(0);

  async function initializeDB() {
    const db = await openDB("myDatabase", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos");
        }
      },
    });
    return db;
  }
  const setVideoToIndexedDB = async (key, value) => {
    const db = await initializeDB();
    const tx = db.transaction("videos", "readwrite");
    const store = tx.objectStore("videos");
    await store.put(value, key);
    await tx.done;
  };

  const getVideoFromIndexedDB = async (key) => {
    const db = await initializeDB();
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const value = await store.get(key);
    await tx.done;
    return value;
  };

  async function getFileSize(downloadLink) {
    if (isDownloaded) return;
    console.log("started");
    return fetch(downloadLink).then((response) => {
      const contentLength = response.headers.get("Content-Length");
      if (contentLength) {
        // Convert the size from bytes to kilobytes, megabytes, etc.
        const fileSizeInBytes = parseInt(contentLength);
        const fileSizeInKB = fileSizeInBytes / 1024;
        const fileSizeInMB = fileSizeInKB / 1024;
        // You can return the size in the desired format
        console.log({
          bytes: fileSizeInBytes,
          kilobytes: fileSizeInKB,
          megabytes: fileSizeInMB,
        });
        return {
          bytes: fileSizeInBytes,
          kilobytes: fileSizeInKB,
          megabytes: fileSizeInMB,
        };
      } else {
        throw new Error("Unable to retrieve file size.");
      }
    });
  }
  useEffect(() => {
    async function getSize() {
      if (isDownloaded) return;
      const size = await getFileSize(downloadSRC);
      console.log(size);
      setVideoSize(size.megabytes);
    }
    getSize();
    return () => {};
  }, [downloadSRC]);

  useEffect(() => {
    const getStoredVideo = async () => {
      const storedVideo = await getVideoFromIndexedDB(`video-${messageId}`);
      if (storedVideo) {
        setVideoSrc(storedVideo);
        setisDownloaded(true);
      } else if (User.autoDownloadSettings.video) {
        downloadVideo();
      }
    };
    getStoredVideo();
  }, [messageId]);

  const downloadVideo = () => {
    // Set up request to download video from downloadSRC
    const request = new XMLHttpRequest();
    request.open("GET", downloadSRC, true);
    request.responseType = "blob";

    request.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        console.log(percentComplete);
        setDownloadProgress(percentComplete);
      }
    });

    request.addEventListener("load", async (event) => {
      if (request.status === 200) {
        // Convert downloaded video to base64 and save to indexedDB
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Video = reader.result;
          await setVideoToIndexedDB(`video-${messageId}`, base64Video);
          setVideoSrc(base64Video);
        };
        reader.readAsDataURL(request.response);
      } else {
        console.error(`Failed to download video (${request.status})`);
      }
    });

    setisDownloaded(true);
    request.send();
  };

  function playvideo() {
    setvideoPlayer(true);
    const storedVideo = localStorage.getItem(`video-${messageId}`);
    if (storedVideo) {
      setVideoSrc(storedVideo);
      setisDownloaded(true);
    } else {
      downloadVideo();
    }
    console.log("hello world");
  }
  return (
    <div key={messageId}>
      {console.log(downloadSRC)}
      {videoPlayer && (
        <MediaPlayer
          VideoSRC={videoSrc}
          setvideoPlayer={setvideoPlayer}
          messageText={messageText}
        />
      )}

      <div className="flex justify-center items-center relative">
        <div
          className={`z-[2] ${
            !isthumbnailrendered && "hidden"
          } relative flex items-center justify-center`}
          onClick={playvideo}
        >
          <VideoThumbnail
            videoUrl={downloadSRC}
            thumbnailHandler={(thumbnail) => {
              console.log(thumbnail);
              setisthumbnailrendered(true);
            }}
            width={300}
            snapshotAtTime={5}
            height={null}
            renderThumbnail={isthumbnailrendered}
          />
          <div className="absolute text-blue-500">
            <BsFillPlayBtnFill size={30} />
          </div>
          {!isDownloaded && (
            <div className="absolute  bottom-0 left-2 flex text-black">
              <HiDownload size={30} /> {VideoSize.toFixed(2)} MB
            </div>
          )}
        </div>
        {!isthumbnailrendered && (
          <div className="relative flex justify-center items-center w-[300px] min-h-[100px]">
            <img src={blurredSRC} width={300} />
            <div
              className="absolute m-12 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"></span>
            </div>
          </div>
        )}
      </div>

      {downloadProgress > 0 && downloadProgress < 100 && (
        <progress value={downloadProgress} max={100} />
      )}
    </div>
  );
};

export default VideoComponent;
