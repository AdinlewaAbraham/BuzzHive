import { useState, useRef } from "react";
import { VscPlay } from "react-icons/vsc";
import { CiPause1 } from "react-icons/ci";

import SelectedChannelContext from "@/context/SelectedChannelContext ";

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDurationChange = () => {
    setDuration(videoRef.current.duration);
  };
  function formatDuration(duration) {
    let seconds = Math.floor(duration % 60);
    let minutes = Math.floor((duration / 60) % 60);
    let hours = Math.floor(duration / 3600);

    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    hours = hours < 10 ? `0${hours}` : hours;

    if (hours > 0) {
      return `${hours}:${minutes}:${seconds}`;
    }
    return `${minutes}:${seconds}`;
  }

  return (
    <div className="relative media-container">
      <video onClick={handlePlayPause} 
        ref={videoRef}
        onDurationChange={handleDurationChange}
        className="w-full block mx-auto bg-red-800 fff"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute bottom-0 left-0 w-full flex justify-start items-center p-2 pb-6">
        <p className="text-[50px] mr-2 absolute ">{formatDuration(duration)}</p>
        <div className="flex items-center w-full justify-center">
          <button onClick={handlePlayPause} className="transition-all media-container">
            {isPlaying ? <CiPause1 size={30} /> : <VscPlay size={30} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
