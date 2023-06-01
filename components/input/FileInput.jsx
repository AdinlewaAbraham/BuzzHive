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
    <div className="file-input absolute bottom-2 left-2 z-10 flex w-[50%] min-w-[260px] flex-col rounded-lg p-4  dark:bg-black">
      <div className="flex flex-col items-center justify-center">
        <RenderFileType type={file.type} size={100} />
        {file.name}
      </div>

      <div className="flex items-center justify-between bg-black p-2">
        <BsEmojiSmile />
        <input
          type="text"
          className="w-full bg-transparent px-4 py-2 placeholder-[#aaabaf] outline-none"
          placeholder="Caption (optional)"
          onChange={(e) => {
            setfileCaption(e.target.value);
          }}
        />
        <div
          className="flex items-center rounded-md bg-blue-600 px-2 py-2"
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
