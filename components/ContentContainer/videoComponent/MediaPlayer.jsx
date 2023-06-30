import React, { useState, useRef, useEffect } from "react";
import {
  BiArrowBack,
  BiPlay,
  BiPause,
  BiVolumeMute,
  BiVolumeFull,
} from "react-icons/bi";
import { motion } from "framer-motion";
import { MdClose, MdOutlineFileDownload } from "react-icons/md";

const MediaPlayer = ({ VideoSRC, setvideoPlayer, messageText, fileName }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (event) => {
    const video = videoRef.current;
    const seekTime = event.target.value;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const [showControls, setShowControls] = useState(true);
  const [timer, setTimer] = useState(null);

  const hideControls = () => {
    setShowControls(false);
  };

  const showControlsFunc = () => {
    setShowControls(true);
    resetTimer();
  };

  const resetTimer = () => {
    clearTimeout(timer);
    const timeout = setTimeout(hideControls, 3000);
    setTimer(timeout);
  };

  useEffect(() => {
    resetTimer();

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleInteraction = () => {
    showControlsFunc();
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99] flex items-center justify-center bg-[#111a20] px-[100px]"
    >
      <div
        className={`${
          showControls ? "" : "opacity-0"
        } absolute top-4 right-4 z-[99] flex h-[66px] items-center justify-end rounded-lg bg-white px-4
                text-[30px]  text-black dark:bg-black dark:text-white [&>i]:cursor-pointer`}
      >
        <i>
          <a href={VideoSRC} download={fileName}>
            <MdOutlineFileDownload />
          </a>
        </i>

        <i className="ml-5" onClick={() => setvideoPlayer(false)}>
          <MdClose />
        </i>
      </div>
      <div className="relative h-full w-full">
        <video
          onClick={togglePlay}
          ref={videoRef}
          src={VideoSRC}
          className="h-full w-full"
          onMouseMove={handleInteraction}
          autoPlay
        />
        <div className="absolute bottom-4 flex w-full flex-col items-center justify-center">
          {messageText !== "" && (
            <p
              className="mb-2 px-2 py-1"
              style={{ backgroundColor: "rgba(73, 63, 63, 0.7)" }}
            >
              {messageText}
            </p>
          )}
          <div
            className={`fixed bottom-0  w-full rounded-md p-2 ${
              showControls ? "" : "opacity-0"
            }`}
            onMouseMove={handleInteraction}
            onTouchStart={handleInteraction}
          >
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              step={0.1}
              onChange={handleSeek}
              className="h-1 w-full cursor-pointer "
            />
            <div className="flex w-full items-center justify-between">
              <button onClick={togglePlay} className=" text-[35px]">
                {isPlaying ? <BiPause /> : <BiPlay />}
              </button>
              <div className="flex px-2">
                <button onClick={toggleMute} className="mx-4 text-[20px]">
                  {isMuted ? <BiVolumeMute /> : <BiVolumeFull />}
                </button>
                <div className="flex items-center">
                  <span>{`${Math.floor(currentTime)}`}</span>
                  <span>/</span>
                  <span>{` ${Math.floor(duration)}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaPlayer;
