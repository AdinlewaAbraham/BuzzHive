import React, { useContext, useEffect } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { AiOutlineSend } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { handlePicVidUpload } from "@/utils/messagesUtils/handlePicVidUpload";
import VideoPlayer from "./VideoPlayer";

const MediaInput = ({ picVidmedia, setpicVidmediaToNull }) => {
  const { ChatObject } = useContext(SelectedChannelContext);
  console.log(picVidmedia);

  return (
    <div className="absolute bottom-2 left-2 w-[80%] z-10 media-container">
      {picVidmedia.type.startsWith("image/") ? (
        <img src={URL.createObjectURL(picVidmedia)} alt="Downscaled media" />
      ) : (
        <VideoPlayer src={URL.createObjectURL(picVidmedia)} />
      )}

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
              setpicVidmediaToNull(null);
            });
          }}
        >
          <AiOutlineSend />
        </div>
      </div>
    </div>
  );
};

export default MediaInput;
