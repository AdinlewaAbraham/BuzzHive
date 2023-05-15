import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import VideoThumbnail from "react-video-thumbnail";
import { BsFillPlayBtnFill } from "react-icons/bs";

const VideoComponent = ({ blurredSRC, downloadSRC, messageId }) => {
  const { User } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);

  const [videoSrc, setVideoSrc] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isthumbnailrendered, setisthumbnailrendered] = useState(false);
  const [isDownloaded, setisDownloaded] = useState(false);
  const [videoPlayer, setvideoPlayer] = useState(false);

  useEffect(() => {
    const storedVideo = localStorage.getItem(`video-${messageId}`);
    if (storedVideo) {
      setVideoSrc(storedVideo);
      setisDownloaded(true);
    } else if (User.autoDownloadSettings.video) {
      downloadVideo();
    }
  }, [messageId]);

  const downloadVideo = () => {
    // Set up request to download video from downloadSRC
    const request = new XMLHttpRequest();
    request.open("GET", downloadSRC, true);
    request.responseType = "blob";

    request.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        console.log(percentComplete)
        setDownloadProgress(percentComplete);
      }
    });

    request.addEventListener("load", (event) => {
      if (request.status === 200) {
        // Convert downloaded video to base64 and save to local storage
        const reader = new FileReader();
        reader.onload = () => {
          const base64Video = reader.result;
          localStorage.setItem(`video-${messageId}`, base64Video);
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
        <div className="fixed inset-0 bg-black z-[99] flex justify-center items-center">
          <button
            onClick={() => {
              setvideoPlayer(false);
            }}
          >
            back
          </button>
          <video src={videoSrc} controls width={300} />
        </div>
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
