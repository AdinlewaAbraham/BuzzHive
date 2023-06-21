import { useState, useRef, useEffect } from "react";
import { VscPlay } from "react-icons/vsc";
import { CiPause1 } from "react-icons/ci";

import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { formatDuration } from "@/utils/actualUtils/formatDuration";

function VideoPlayer({ src, setvideoLengthFunc }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setvideoLengthFunc(duration);
  }, [duration]);

  const handlePlayPause = () => {
    if (!videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDurationChange = () => {
    setDuration(videoRef.current.duration);
  };

  return (
    <div className="media-container relative  rounded-t-lg ">
      <video
        onClick={handlePlayPause}
        ref={videoRef}
        onDurationChange={handleDurationChange}
        className="fff mx-auto block w-full rounded-t-lg bg-primary "
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute bottom-0 left-0 flex w-full items-center justify-start p-2 pb-6">
        <p className="absolute mr-2 text-[50px] ">{formatDuration(duration)}</p>
        <div className="flex w-full items-center justify-center">
          <button
            onClick={() => handlePlayPause()}
            className="media-container relative transition-all"
          >

            {isPlaying ? <CiPause1 size={30} /> : <VscPlay size={30} />}
            <div className="absolute inset-0 "></div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
