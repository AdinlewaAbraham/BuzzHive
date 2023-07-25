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
import { Timestamp } from "firebase/firestore";

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
    case "audio/flac":
    case "audio/wav":
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
  const {
    ChatObject,
    setChats,
    Chats,
    setallowScrollObject,
    setChatRooms,
    chatRooms,
  } = useContext(SelectedChannelContext);
  const [fileCaption, setfileCaption] = useState("");

  function setChatsFunc(chats) {
    setChats(chats);
  }
  const handleFileSend = async () => {
    const capturedId = JSON.parse(JSON.stringify(ChatObject.activeChatId));
    const capturedFile = file;
    setfile(null);
    setallowScrollObject({
      scrollTo: "bottom",
      scrollBehaviour: "smooth",
      allowScroll: true,
    });
    const currentTime = new Date().getTime();
  
    const seconds = Math.floor(currentTime / 1000);
    const nanoseconds = (currentTime % 1000) * 10 ** 6;
    
    const time = new Timestamp(seconds, nanoseconds)
    const newChatRooms = chatRooms.map((room) => {
      if (room.id === ChatObject.activeChatId) {
        return {
          ...room,
          lastMessageSenderName: User.name,
          lastMessage: fileCaption,
          lastMessageType: "file",
          lastMessageStatus: "pending",
          timestamp: time,
          senderId: User.id,
          fileName: file.name
        };
      } else {
        return room;
      }
    });
    localStorage.setItem(`${User.id}_userChats`, JSON.stringify(newChatRooms));
    setChatRooms(newChatRooms);
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
  };
  return (
    <motion.div
      className="file-input bg-primary absolute bottom-[65px] left-2 z-30 flex
       w-[50%] min-w-[300px] flex-col overflow-hidden rounded-lg p-4 shadow-md"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
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
            if (e.target.value.length > 200) return;
            setfileCaption(e.target.value);
          }}
          value={fileCaption}
        />
        <div
          className="flex items-center rounded-md bg-accent-blue px-2 py-2"
          onClick={() => {
            handleFileSend();
          }}
        >
          <AiOutlineSend />
        </div>
      </div>
    </motion.div>
  );
};

export default FileInput;
