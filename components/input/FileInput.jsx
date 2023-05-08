import React from "react";
import {
  AiOutlineFilePdf,
  AiOutlineFileWord,
  AiOutlineFileExcel,
  AiOutlineFileText,
  AiOutlineSend,
  AiOutlineFile,
} from "react-icons/ai";
import {BsEmojiSmile} from "react-icons/bs"

const FileInput = ({ file }) => {
  let fileType;
  if (file.type === "application/pdf") {
    fileType = <AiOutlineFilePdf size={100} />;
  } else if (
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    fileType = <AiOutlineFileWord size={100} />;
  } else if (
    file.type === "application/vnd.ms-excel" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    fileType = <AiOutlineFileExcel size={100} />;
  } else if (file.type === "text/plain") {
    fileType = <AiOutlineFileText size={100} />;
  } else {
    fileType = <AiOutlineFile size={100} />;
  }

  return (
    <div className="file-input absolute bottom-2 left-2 w-[50%] z-10 dark:bg-black min-w-[260px] flex flex-col p-4  rounded-lg">
      <div className="flex flex-col justify-center items-center">
        {fileType}
        {file.name}
      </div>

      <div className="flex bg-black justify-between items-center p-2">
        <BsEmojiSmile />
        <input
          type="text"
          className="px-4 py-2 bg-transparent w-full outline-none placeholder-[#aaabaf]"
          placeholder="Caption (optional)"
        />
        <div
          className="bg-blue-600 flex items-center px-2 py-2 rounded-md"
          onClick={async () => {
            await handlePicVidUpload(picVidmedia, ChatObject).then(() => {
              setpicVidmedia(null);
            });
          }}
        >
          <AiOutlineSend />
        </div>
      </div>
    </div>
  );
};

export default FileInput;
