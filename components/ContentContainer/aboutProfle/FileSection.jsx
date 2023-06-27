import React, { useState, useEffect, useContext, useRef } from "react";
import FileComponent from "../fileComponent/FileComponent";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

const FileSection = () => {
  const { ChatObject } = useContext(SelectedChannelContext);
  const [fileMessages, setFileMessages] = useState(null);
  const [renderedFiles, setRenderedFiles] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [locked, setLocked] = useState(false);
  const [lastFile, setLastFile] = useState(null);

    const FileChunkCount = 20
  useEffect(() => {
    const getFileMessages = () => {
      const messages = JSON.parse(
        localStorage.getItem(ChatObject.activeChatId)
      );
      const fileMessages = messages.filter(
        (message) => message.type === "file"
      );
      console.log(fileMessages.length)
      setFileMessages(fileMessages);
      const firstRenderBatch = JSON.parse(JSON.stringify(fileMessages)).splice(
        0,
        FileChunkCount
      );
      setRenderedFiles(firstRenderBatch);
      setLastFile(firstRenderBatch[firstRenderBatch.length - 1]?.id);
    };

    return () => getFileMessages();
  }, [ChatObject.activeChatId]);

  const scrollContainerRef = useRef(null);
  const handleOnScroll = () => {
    const container = scrollContainerRef.current;

    if (!container) return;

    let triggerHeight = container.scrollTop + container.offsetHeight;
    if (triggerHeight >= container.scrollHeight - 20 && hasMore) {
      loadMoreFiles();
    }
  };
  const loadMoreFiles = () => {
    if (!fileMessages) return;
    if (locked) return;
    setLocked(true);
    const spliceIndex = fileMessages.findIndex(
      (media) => media.id === lastFile
    );
    const newFileMessages = JSON.parse(JSON.stringify(fileMessages)).splice(
      spliceIndex + 1,
      FileChunkCount
    );
    setLastFile(newFileMessages[newFileMessages.length - 1]?.id);
    if (newFileMessages.length < FileChunkCount) {
      console.log(newFileMessages.length);
      setHasMore(false);
    }
    setRenderedFiles([...renderedFiles, ...newFileMessages]);

    setLocked(false);
  };

  return (
    <div
      className="scrollBar h-[350px] w-full overflow-y-auto  pr-1"
      onScroll={handleOnScroll}
      ref={scrollContainerRef}
    >
      {fileMessages === null ? (
        <>Loading</>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {renderedFiles.map((message) => (
            <FileComponent chat={message} defaultColor />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileSection;
