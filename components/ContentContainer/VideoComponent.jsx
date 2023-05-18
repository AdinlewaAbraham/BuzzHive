import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import VideoThumbnail from "react-video-thumbnail";
import { BsFillPlayBtnFill } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import MediaPlayer from "./MediaPlayer";
import { openDB, deleteDB } from "idb";
import {BsFillImageFill} from "react-icons/bs"

const VideoComponent = ({
  blurredSRC,
  downloadSRC,
  messageId,
  messageText,
}) => {
  const { User } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);

  const [blurredImgSRC, setblurredImgSRC] = useState(blurredSRC);
  const [videoSrc, setVideoSrc] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setisDownloaded] = useState(false);
  const [videoPlayer, setvideoPlayer] = useState(false);
  const [VideoSize, setVideoSize] = useState(0);
  const [loadingThumbnail, setloadingThumbnail] = useState(true);
  const [bufferedChunks, setBufferedChunks] = useState([]);

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
  }, [downloadSRC]);

  useEffect(() => {
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
        console.log(URL.createObjectURL(storedVideoThumnail));
        setblurredImgSRC(URL.createObjectURL(storedVideoThumnail));
      } else {
        // Save blurred image to IndexedDB
        const response = await fetch(blurredSRC);
        console.log(blurredSRC);
        setblurredImgSRC(blurredSRC);
        const blob = await response.blob();
        console.log(blob);
        const db = await initializeDB();
        const tx = db.transaction("videos", "readwrite");
        const store = tx.objectStore("videos");
        await store.put(blob, `Thumbnail-${messageId}`);
        await tx.done;

        setblurredImgSRC(URL.createObjectURL(blob));
        console.log(URL.createObjectURL(blob));
      }
      setloadingThumbnail(false);
    };

    getStoredVideoandVideoThumbnail();
  }, [messageId]);
  const downloadVideo = async () => {
    console.log("downloading video...");
    const request = new XMLHttpRequest();
    request.open("GET", downloadSRC, true);
    request.responseType = "blob";

    request.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setDownloadProgress(percentComplete);
        console.log(percentComplete);
      }
    });

    request.addEventListener("load", async (event) => {
      if (request.status === 200) {
        const blob = request.response;
        const chunk = new Blob([blob], { type: blob.type });

        // Buffer the downloaded chunk
        setBufferedChunks((prevChunks) => [...prevChunks, chunk]);

        // Save the downloaded chunk to IndexedDB
        const chunkIndex = prevChunks.length;
        await setVideoToIndexedDB(`chunk-${messageId}-${chunkIndex}`, chunk);

        if (event.loaded < event.total) {
          // Continue downloading the next chunk
          downloadVideo();
        } else {
          // All video chunks have been downloaded
          setisDownloaded(true);
          console.log("All video chunks downloaded");
        }
      } else {
        console.error(`Failed to download video (${request.status})`);
      }
    });

    request.send();
  };

  async function playvideo() {
    setvideoPlayer(true);
    const storedVideo = await getVideoFromIndexedDB(`video-${messageId}`);
    if (storedVideo) {
      console.log(storedVideo);
      setVideoSrc(URL.createObjectURL(storedVideo));
      setisDownloaded(true);
    } else {
      downloadVideo();
      // Combine and play the buffered video chunks
      const combinedChunks = new Blob(bufferedChunks, { type: "video/mp4" });
      console.log(combinedChunks);
      setVideoSrc(URL.createObjectURL(combinedChunks));
      setisDownloaded(true);

      // Save the combined video to IndexedDB
      await setVideoToIndexedDB(`video-${messageId}`, combinedChunks);

      console.log("Buffered video chunks played");
    }
  }

  const [imageError, setImageError] = useState(false);
  console.log(blurredImgSRC);
  return (
    <div key={messageId}>
      {console.log(videoSrc)}
      {videoPlayer && (
        <MediaPlayer
          VideoSRC={videoSrc}
          setvideoPlayer={setvideoPlayer}
          messageText={messageText}
        />
      )}

      <div className="flex justify-center items-center relative">
        <div
          className={`z-[2] relative flex items-center justify-center`}
          onClick={playvideo}
        >
          {loadingThumbnail ? (
            <div>loading...</div>
          ) : (
            <>
              {imageError ? (
                <BsFillImageFill size={250}/>
              ) : (
                <img
                  src={blurredImgSRC}
                  width={300}
                  onError={() => setImageError(true)}
                />
              )}
              <div className="absolute text-blue-500">
                <BsFillPlayBtnFill size={30} />
              </div>
              {!isDownloaded && (
                <div className="absolute  bottom-0 left-2 flex text-black">
                  <HiDownload size={30} /> {VideoSize.toFixed(2)} MB
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {downloadProgress > 0 && downloadProgress < 100 && (
        <progress value={downloadProgress} max={100} />
      )}
    </div>
  );
};

export default VideoComponent;
