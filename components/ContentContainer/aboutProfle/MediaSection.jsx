import React, { useContext, useState, useEffect } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import ImageComponent from "../imageComponent/ImageComponent";
import VideoComponent from "../videoComponent/VideoComponent";
import { ImageList, ImageListItem } from "@mui/material";
import InfiniteScroll from "react-infinite-scroller";
import { useRef } from "react";

const MediaSection = () => {
  const { ChatObject } = useContext(SelectedChannelContext);
  const [mediaMessages, setMediaMessages] = useState(null);
  const [renderedMedia, setRenderedMedia] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [locked, setLocked] = useState(false);
  const [lastMediaFile, setLastMediaFile] = useState(null);
  const mediaChunkCount = 5;
  useEffect(() => {
    const getMediaMessages = () => {
      const messages = JSON.parse(
        localStorage.getItem(ChatObject.activeChatId)
      );
      const MediaMessages = messages.filter(
        (message) => message.type === "video" || message.type === "image"
      );
      setMediaMessages(MediaMessages);
      const firstRenderBatch = JSON.parse(JSON.stringify(MediaMessages)).splice(
        0,
        mediaChunkCount
      );
      setRenderedMedia(firstRenderBatch);
      setLastMediaFile(firstRenderBatch[firstRenderBatch.length - 1]?.id);
    };

    return () => getMediaMessages();
  }, [ChatObject.activeChatId]);

  const scrollContainerRef = useRef(null);
  const handleOnScroll = () => {
    const container = scrollContainerRef.current;

    if (!container) return;

    let triggerHeight = container.scrollTop + container.offsetHeight;
    if (triggerHeight >= container.scrollHeight - 20 && hasMore) {
      loadMoreMediaFiles();
    }
  };

  const loadMoreMediaFiles = () => {
    if (!mediaMessages) return;
    if (locked) return;
    setLocked(true);
    const spliceIndex = mediaMessages.findIndex(
      (media) => media.id === lastMediaFile
    );
    const newMediaMessages = JSON.parse(JSON.stringify(mediaMessages)).splice(
      spliceIndex + 1,
      mediaChunkCount
    );
    setLastMediaFile(newMediaMessages[newMediaMessages.length - 1]?.id);
    if (newMediaMessages.length < mediaChunkCount) {
      console.log(newMediaMessages.length);
      setHasMore(false);
    }
    setRenderedMedia([...renderedMedia, ...newMediaMessages]);

    setLocked(false);
  };

  return (
    <div className=" flex h-[350px] w-full overflow-y-auto ">
      {mediaMessages === null ? (
        <>loading...</>
      ) : (
        <div
          className="scrollBar grid grid-cols-3 gap-2 overflow-x-hidden pr-1"
          onScroll={handleOnScroll}
          ref={scrollContainerRef}
        >
          {renderedMedia.map((message) => (
            <div className="flex h-[200px] items-center justify-center object-contain overflow-hidden bg-secondary cursor-pointer">
              {message.type === "image" ? (
                <ImageComponent chat={message} />
              ) : (
                <VideoComponent chat={message} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaSection;
