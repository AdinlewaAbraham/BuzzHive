import React, { useContext, useEffect, useState } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { AiOutlineSend } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { handlePicVidUpload } from "@/utils/messagesUtils/handlePicVidUpload";
import VideoPlayer from "./VideoPlayer";
import { UserContext } from "../App";
import VideoThumbnail from "react-video-thumbnail";
import { downScalePicVid } from "@/utils/messagesUtils/downScalePicVid";

const MediaInput = ({
  picVidmedia,
  blurredPicVidmedia,
  setpicVidmediaToNull,
  setblurredPicVidmedia,
}) => {
  const { ChatObject } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);
  const [mediaCaption, setmediaCaption] = useState("");
  const [ImageBase64, setImageBase64] = useState();
  const isImage = picVidmedia.type.startsWith("image");
  console.log(isImage);

  async function base64toFile(base64String, fileName) {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return new File([blob], fileName, { type: mime });
  }

  useEffect(() => {
    if (isImage) return;
    console.log("Loading");
    async function processImage() {
      if (!ImageBase64) return;
      const ImgFile = await base64toFile(ImageBase64, picVidmedia.name);
      const downloadScaledImgFile = await downScalePicVid(
        ImgFile,
        0.35,
        0.1,
        2
      );
      setblurredPicVidmedia(downloadScaledImgFile);
      console.log(downloadScaledImgFile);
      console.log(blurredPicVidmedia);
    }
    processImage();

    return () => {};
  }, [ImageBase64, picVidmedia.name]);

  console.log(picVidmedia);
  return (
    <div className="absolute bottom-2 left-2 w-[80%] z-10 media-container">
      {picVidmedia.type.startsWith("image/") ? (
        <img src={URL.createObjectURL(picVidmedia)} alt="Downscaled media" />
      ) : (
        <>
          {blurredPicVidmedia && (
            <img
              src={URL.createObjectURL(blurredPicVidmedia)}
              alt=""
              width={300}
              height={300}
              className="fixed z-[99]  top-[150px]"
            />
          )}
          {/* dont want to render this comp below because i only need the thumbnail */}
            <VideoThumbnail
              videoUrl={URL.createObjectURL(picVidmedia)}
              thumbnailHandler={(thumbnail) => setImageBase64(thumbnail)}
              width={null}
              snapshotAtTime={5}
              height={null}
              renderThumbnail={false}
            />
          <VideoPlayer src={URL.createObjectURL(picVidmedia)} />
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