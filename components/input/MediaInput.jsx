import React, { useContext, useEffect, useState } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { AiOutlineSend } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { handlePicVidUpload } from "@/utils/messagesUtils/handlePicVidUpload";
import VideoPlayer from "./VideoPlayer";
import { UserContext } from "../App";
import VideoThumbnail from "react-video-thumbnail";
import { downScalePicVid } from "@/utils/messagesUtils/downScalePicVid";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "@mui/joy";
import { Timestamp } from "firebase/firestore";

const MediaInput = ({
  picVidmedia,
  blurredPicVidmedia,
  setpicVidmediaToNull,
  setblurredPicVidmedia,
}) => {
  const { ChatObject, setChats, setallowScrollObject } = useContext(
    SelectedChannelContext
  );
  const { User } = useContext(UserContext);
  const [mediaCaption, setmediaCaption] = useState("");
  const [ImageBase64, setImageBase64] = useState();
  const [videoLength, setvideoLength] = useState(0);
  const isImage = picVidmedia.type.startsWith("image");

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

    async function processImage() {
      if (!ImageBase64) return;
      const ImgFile = await base64toFile(ImageBase64, picVidmedia.name);
      const downloadScaledImgFile = await downScalePicVid(ImgFile, 0.7, 1, 0);
      setblurredPicVidmedia(downloadScaledImgFile);
    }
    processImage();

    return () => {};
  }, [ImageBase64, picVidmedia.name]);

  function setChatsFunc(state) {
    setChats(state);
  }
  function setvideoLengthFunc(state) {
    setvideoLength(state);
  }

  return (
    
      <motion.div
        className="media-container absolute bottom-[65px] left-2 z-30 w-[80%] min-w-[300px] overflow-hidden"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
        {picVidmedia.type.startsWith("image/") ? (
          picVidmedia?.loading ? (
            <div className="z-[999] flex h-[calc(100vh-195px)] items-center justify-center rounded-t-lg bg-white text-lg dark:bg-black ">
              <i className="mr-2">
                <CircularProgress size="md" variant="plain" />
              </i>
              Optimizing image for better performance...
            </div>
          ) : (
            <div className="z-[999] flex h-[calc(100vh-195px)] justify-center rounded-t-lg bg-white dark:bg-black ">
              <img
                src={URL.createObjectURL(picVidmedia)}
                alt="Downscaled media "
                className="object-contain"
              />
            </div>
          )
        ) : (
          <>
            {/* dont want to render  this component (<VideoThumbnail/>) below because i only need the thumbnail file */}
            <div className="hidden">
              <VideoThumbnail
                videoUrl={URL.createObjectURL(picVidmedia)}
                thumbnailHandler={(thumbnail) => setImageBase64(thumbnail)}
                width={null}
                snapshotAtTime={5}
                height={null}
                renderThumbnail={false}
              />
            </div>
            <VideoPlayer
              src={URL.createObjectURL(picVidmedia)}
              setvideoLengthFunc={setvideoLengthFunc}
            />
          </>
        )}

        <div className="bg-primary flex items-center justify-between rounded-b-lg p-2 ">
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent px-4 py-2 placeholder-[#aaabaf] outline-none"
            placeholder="Caption (optional)"
            onChange={(e) => {
              setmediaCaption(e.target.value);
            }}
          />
          <div
            className="flex items-center rounded-md bg-blue-600 px-2 py-2"
            onClick={async () => {
              let currentTime = new Date().getTime();

              let seconds = Math.floor(currentTime / 1000);
              let nanoseconds = (currentTime % 1000) * 10 ** 6;

              let time = new Timestamp(seconds, nanoseconds);
              setallowScrollObject({
                scrollTo: "bottom",
                scrollBehaviour: "smooth",
                allowScroll: true,
              });
              await handlePicVidUpload(
                picVidmedia,
                blurredPicVidmedia,
                ChatObject,
                mediaCaption,
                User,
                time,
                setChatsFunc,
                videoLength
              ).then(() => {
                setpicVidmediaToNull(null);
              });
            }}
          >
            <AiOutlineSend />
          </div>
        </div>
      </motion.div>
    
  );
};

export default MediaInput;
