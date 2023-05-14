import React, { useContext, useState } from "react";
import {
  AiOutlineFilePdf,
  AiOutlineFileWord,
  AiOutlineFileExcel,
  AiOutlineFileText,
  AiOutlineSend,
  AiOutlineFile,
} from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { handleFileUpload } from "@/utils/messagesUtils/handleFileUpload";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";

export const RenderFileType = ({ type, size }) => {
  let fileType;

  switch (type) {
    case "application/pdf":
      fileType = <AiOutlineFilePdf size={size} />;
      break;

    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      fileType = <AiOutlineFileWord size={size} />;
      break;

    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      fileType = <AiOutlineFileExcel size={size} />;
      break;

    case "text/plain":
      fileType = <AiOutlineFileText size={size} />;
      break;

    default:
      fileType = <AiOutlineFile size={size} />;
      break;
  }

  return fileType;
};

const FileInput = ({ file, setfile }) => {
  const { User } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);
  const [fileCaption, setfileCaption] = useState("");

  return (
    <div className="file-input absolute bottom-2 left-2 w-[50%] z-10 dark:bg-black min-w-[260px] flex flex-col p-4  rounded-lg">
      <div className="flex flex-col justify-center items-center">
        <RenderFileType type={file.type} size={100} />
        {file.name}
      </div>

      <div className="flex bg-black justify-between items-center p-2">
        <BsEmojiSmile />
        <input
          type="text"
          className="px-4 py-2 bg-transparent w-full outline-none placeholder-[#aaabaf]"
          placeholder="Caption (optional)"
          onChange={(e) => {
            setfileCaption(e.target.value);
          }}
        />
        <div
          className="bg-blue-600 flex items-center px-2 py-2 rounded-md"
          onClick={async () => {
            await handleFileUpload(file, ChatObject, fileCaption, User).then(
              () => {
                setfile(null);
                console.log("ran");
              }
            );
          }}
        >
          <AiOutlineSend />
        </div>
      </div>
    </div>
  );
};

export default FileInput;
