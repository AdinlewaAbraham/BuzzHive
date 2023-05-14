import React, { useContext, useEffect, useState } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { AiOutlineSend } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { handlePicVidUpload } from "@/utils/messagesUtils/handlePicVidUpload";
import VideoPlayer from "./VideoPlayer";
import { UserContext } from "../App";

const MediaInput = ({
  picVidmedia,
  blurredPicVidmedia,
  setpicVidmediaToNull,
}) => {
  const { ChatObject } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);
  const [mediaCaption, setmediaCaption] = useState("");
  console.log(picVidmedia);

  return (
    <div className="absolute bottom-2 left-2 w-[80%] z-10 media-container">
      {picVidmedia.type.startsWith("image/") ? (
        <img src={URL.createObjectURL(picVidmedia)} alt="Downscaled media" />
      ) : (
        <>
            <img src={picVidmedia.blurredThumbnail} alt="" width={300} height={300}/>
          {/* <VideoPlayer src={URL.createObjectURL(picVidmedia)} /> */}
        </>
      )}

      <div className="flex bg-black justify-between items-center p-2">
        <BsEmojiSmile />
        <input
          type="text"
          className="px-4 py-2 bg-transparent w-full outline-none placeholder-[#aaabaf]"
          placeholder="Caption (optional)"
          onChange={(e) => {
            setmediaCaption(e.target.value);
          }}
        />
        <div
          className="bg-blue-600 flex items-center px-2 py-2 rounded-md"
          onClick={async () => {
            const time = new Date();
            await handlePicVidUpload(
              picVidmedia,
              blurredPicVidmedia,
              ChatObject,
              mediaCaption,
              User,
              time
            ).then(() => {
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
