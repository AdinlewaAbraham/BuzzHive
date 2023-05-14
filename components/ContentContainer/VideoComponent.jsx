import React, { useState, useEffect } from 'react';

const VideoComponent = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setIsDownloaded(false);
    setDownloadProgress(0);
  }, [src]);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);

      const reader = response.body.getReader();
      const contentLength = +response.headers.get('Content-Length');
      let receivedLength = 0;
      let chunks = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;
        setDownloadProgress((receivedLength / contentLength) * 100);
      }

      const blob = new Blob(chunks);

      const url = URL.createObjectURL(blob);

      setIsDownloaded(true);
      setIsPlaying(true);

      const videoPlayer = document.getElementById('video-player');
      videoPlayer.src = url;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <div>
        {isPlaying ? (
          <video id="video-player" controls width="300">
            <source src={null} />
          </video>
        ) : (
          <div
            className="w-full h-80 bg-center bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${src})`,
            }}
          />
        )}
      </div>
      <div className="absolute flex justify-center top-[50%] left-[50%] items-center ">
        {!isPlaying && !isDownloaded && downloadProgress > 0 && (
          <div>
            <button onClick={handleDownload}>Download</button>
            {downloadProgress.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoComponent;
