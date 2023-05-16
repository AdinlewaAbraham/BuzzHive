import React, { useState, useRef, useEffect } from "react";
import {
  BiArrowBack,
  BiPlay,
  BiPause,
  BiVolumeMute,
  BiVolumeFull,
} from "react-icons/bi";
import { openDB } from 'idb';


const MediaPlayer = ({ VideoSRC, setvideoPlayer, messageText }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

  return (
    <div className="fixed inset-0 bg-[#111a20] z-[99] flex justify-center items-center px-[100px]">
      <button
        onClick={() => setvideoPlayer(false)}
        className="fixed top-5 left-5"
      >
        <BiArrowBack size={35} />
      </button>
      <div className="relative">
        <video
          onClick={togglePlay}
          ref={videoRef}
          src={VideoSRC}
          width={null}
        />
        <div className="absolute bottom-4 flex flex-col justify-center items-center w-full">
          <p
            className="px-2 py-1 mb-2"
            style={{ backgroundColor: "rgba(73, 63, 63, 0.7)" }}
          >
            {messageText}
          </p>
          <div className="flex bg-gray-700 p-2 rounded-md w-full">
            <button onClick={togglePlay}>
              {isPlaying ? <BiPause size={20} /> : <BiPlay size={20} />}
            </button>
            <button onClick={toggleMute}>
              {isMuted ? (
                <BiVolumeMute size={20} />
              ) : (
                <BiVolumeFull size={20} />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              step={0.1}
              onChange={handleSeek}
              className="w-full"
            />
            <span>{`${Math.floor(currentTime)} / ${Math.floor(
              duration
            )}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
