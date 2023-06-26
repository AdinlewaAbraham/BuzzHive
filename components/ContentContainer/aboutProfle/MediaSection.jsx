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
        20
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
    const mediaChunkCount = 20
    const newMediaMessages = JSON.parse(JSON.stringify(mediaMessages)).splice(
      spliceIndex,
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
        <ImageList
          variant="masonry"
          cols={3}
          gap={8}
          className="scrollBar overflow-x-hidden"
          onScroll={handleOnScroll}
          ref={scrollContainerRef}
        >
          {/* <InfiniteScroll
                        pageStart={0}
                        loadMore={
                            loadMoreMediaFiles
                        }
                        hasMore={hasMore}
                        loader={<div>loading...</div>}
                    > */}
          {renderedMedia.map((message) =>
            message.type === "image" ? (
              <ImageListItem className="">
                <ImageComponent chat={message} />
              </ImageListItem>
            ) : (
              <ImageListItem>
                <VideoComponent chat={message} />
              </ImageListItem>
            )
          )}
          {/* </InfiniteScroll> */}
        </ImageList>
      )}
    </div>
  );
};

export default MediaSection;
