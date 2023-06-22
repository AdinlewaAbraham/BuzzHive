import React, { useContext, useState } from "react";

import { BsEmojiSmile } from "react-icons/bs";
import { handleFileUpload } from "@/utils/messagesUtils/handleFileUpload";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";
import { AiOutlineSend } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaPaperPlane,
  FaFileAudio,
  FaFileCsv,
  FaFileArchive,
  FaFilePowerpoint,
  FaFileCode,
  FaFileImage,
  FaFileVideo,
} from "react-icons/fa";

export const RenderFileType = ({ type, size }) => {
  let fileType;

  switch (type) {
    case "application/pdf":
      fileType = <FaFilePdf size={size} />;
      break;

    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      fileType = <FaFileWord size={size} />;
      break;

    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      fileType = <FaFileExcel size={size} />;
      break;

    case "text/plain":
      fileType = <FaFileAlt size={size} />;
      break;

    case "audio/mpeg":
    case "audio/mp3":
      fileType = <FaFileAudio size={size} />;
      break;

    case "text/csv":
      fileType = <FaFileCsv size={size} />;
      break;

    case "application/zip":
      fileType = <FaFileArchive size={size} />;
      break;

    case "application/vnd.ms-powerpoint":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      fileType = <FaFilePowerpoint size={size} />;
      break;

    case "image/jpeg":
    case "image/png":
      fileType = <FaFileImage size={size} />;
      break;

    case "video/mp4":
    case "video/mpeg":
      fileType = <FaFileVideo size={size} />;
      break;

    default:
      if (
        type.startsWith("text/") ||
        type.startsWith("application/") ||
        type.endsWith("+xml")
      ) {
        fileType = <FaFileCode size={size} />;
      } else {
        fileType = <FaFileAlt size={size} />;
      }
      break;
  }

  return fileType;
};

const FileInput = ({ file, setfile }) => {
  const { User } = useContext(UserContext);
  const { ChatObject, setChats, Chats, setallowScrollObject } = useContext(SelectedChannelContext);
  const [fileCaption, setfileCaption] = useState("");

  function setChatsFunc(chats) {
    setChats(chats);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="file-input bg-primary absolute bottom-[65px] left-2 z-10 flex
       w-[50%] min-w-[260px] flex-col rounded-lg p-4 shadow-md "
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
      >
        <div className="flex flex-col items-center justify-center">
          <RenderFileType type={file.type} size={100} />
          {file.name}
        </div>

        <div className="mt-2 flex items-center justify-between ">
          <BsEmojiSmile />
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent px-4 py-2 placeholder-[#aaabaf] outline-none"
            placeholder="Caption (optional)"
            onChange={(e) => {
              setfileCaption(e.target.value);
            }}
          />
          <div
            className="flex items-center rounded-md bg-accent-blue px-2 py-2"
            onClick={async () => {
              const capturedId = JSON.parse(
                JSON.stringify(ChatObject.activeChatId)
              );
              const capturedFile = file;
              setfile(null);
              setallowScrollObject({
                scrollTo: "bottom",
                scrollBehaviour: "smooth",
                allowScroll: true,
              });
              await handleFileUpload(
                capturedFile,
                ChatObject,
                fileCaption,
                User,
                setChatsFunc,
                Chats,
                capturedId,
                ChatObject.activeChatId
              );
            }}
          >
            <AiOutlineSend />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileInput;
