import React, { useContext, useState, useEffect } from "react";
import { RenderFileType } from "@/components/input/FileInput";
import UploadCircularAnimation from "../UploadCircularAnimation";
import { UserContext } from "@/components/App";
import DownloadCircularAnimation from "../DownloadCircularAnimation";
import { FaFileDownload } from "react-icons/fa";
import { openDB } from "idb";
import { BsDot } from "react-icons/bs";

const FileComponent = ({ chat }) => {
  const downloadSRC = chat.dataObject.downloadURL;
  const [isDownloaded, setisDownloaded] = useState(false);
  const [isDownloading, setisDownloading] = useState(false);
  const [downloadProgress, setdownloadProgress] = useState(0);
  const [fileBlob, setfileBlob] = useState();
  const { User } = useContext(UserContext);

  async function initializeDB() {
    const db = await openDB("myFilesDatabase", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files");
        }
      },
    });
    return db;
  }

  const getFileFromIndexedDB = async (key) => {
    const db = await initializeDB();
    const tx = db.transaction("files", "readonly");
    const store = tx.objectStore("files");
    const value = await store.get(key);
    await tx.done;
    return value;
  };
  const downloadFile = async () => {
    try {
      setisDownloading(true);

      const response = await fetch(downloadSRC);

      if (!response.ok) {
        throw new Error(`Failed to download file (${response.status})`);
      }

      const contentLength = response.headers.get("Content-Length");
      const totalSize = parseInt(contentLength, 10);

      const reader = response.body.getReader();
      let receivedSize = 0;

      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedSize += value.length;

        const progress = Math.round((receivedSize / totalSize) * 100);
        setdownloadProgress(progress);
      }

      const contentType = response.headers.get("Content-Type");

      const blobOptions = { type: contentType };
      const blob = new Blob(chunks, blobOptions);
      setfileBlob(blob);
      setisDownloading(false);
      setisDownloaded(true);

      const db = await initializeDB();
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      await store.put(blob, `file-${chat.id}`);
      await tx.done;
    } catch (error) {
      console.error(error);
    }
  };

  const getStoredFiles = async () => {
    const storedFile = await getFileFromIndexedDB(`file-${chat.id}`);
    if (storedFile) {
      setfileBlob(storedFile);
      setisDownloaded(true);
    } else if (User.autoDownloadSettings.files) {
      downloadFile();
    } else {
      setisDownloaded(false);
    }
  };

  useEffect(() => {
    getStoredFiles();
  }, [User]);

  const openFile = () => {
    const fileURL = URL.createObjectURL(fileBlob);
    console.log(fileBlob);
    console.log(chat);
    window.open(fileURL, "_blank");
  };
  const saveFileToComputer = async () => {
    try {
      const options = {
        suggestedName: chat.dataObject.name,
      };

      const handle = await window.showSaveFilePicker(options);

      // Get the chosen file extension
      const extension = handle.name.split(".").pop();

      const writableStream = await handle.createWritable();

      await writableStream.write(fileBlob);

      await writableStream.close();

      console.log("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const getFileExtension = (fileName) => {
    const parts = fileName.split(".");
    return { baseName: parts[0], extName: parts[parts.length - 1] };
  };
  const { baseName, extName } = getFileExtension(chat.dataObject.name);
  return (
    <div
      className={`truncate rounded-sm bg-blue-400 p-2 ${
        chat.text !== "" && "mb-2"
      }`}
    >
      <div className="mb-4 flex">
        <div className="mr-2 flex h-[50px] items-center justify-center rounded-full text-[40px] text-white">
          {chat.dataObject.status === "uploading" ||
          chat.status === "pending" ? (
            <UploadCircularAnimation
              progress={chat.dataObject.progress}
              size={"md"}
            />
          ) : isDownloaded ? (
            <i onclick={() => {}}>
              <RenderFileType type={chat.dataObject.type} />
            </i>
          ) : isDownloading ? (
            <DownloadCircularAnimation
              progress={downloadProgress}
              size={"md"}
            />
          ) : (
            <div onClick={() => downloadFile()}>
              <RenderFileType type={chat.dataObject.type} />
            </div>
          )}
        </div>
        <div className="truncate text-start">
          <p className="overflow-hidden truncate whitespace-nowrap ">
            {baseName}
          </p>
          <p className=" flex items-center text-[13px] text-[#0c1424]">
            {(chat.dataObject.size / (1024 * 1024)).toFixed(2)}MB
            <i>
              <BsDot size={20} />
            </i>
            <p className="uppercase">{extName} File</p>
          </p>
        </div>
      </div>
      <div
        className={`[&>div>button]:w [&>div>button]:w-full [&>div>button]:rounded-sm
       [&>div>button]:bg-blue-300 ${
         (isDownloading || chat.dataObject.status === "uploading") &&
         "[&>div>button]:hover:cursor-not-allowed"
       }`}
      >
        {isDownloaded ? (
          <div className="flex w-full">
            <button
              className="mr-1"
              onClick={openFile}
              disabled={isDownloading || chat.dataObject.status === "uploading"}
            >
              Open
            </button>
            <button
              onClick={saveFileToComputer}
              disabled={isDownloading || chat.dataObject.status === "uploading"}
            >
              Save as...
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={downloadFile}
              disabled={isDownloading || chat.dataObject.status === "uploading"}
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileComponent;
