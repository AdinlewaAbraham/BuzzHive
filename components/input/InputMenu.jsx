import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { RiGalleryLine } from "react-icons/ri";
import { TiChartBarOutline } from "react-icons/ti";
import { AiOutlineFile } from "react-icons/ai";
import { downScalePicVid } from "@/utils/messagesUtils/downScalePicVid";

const InputMenu = ({
  setfile,
  setshowMediaPicker,
  setpicVidmedia,
  setblurredPicVidmedia,
  setshowPollInput,
  showMediaPicker,
}) => {
  return (
    <AnimatePresence>
      {showMediaPicker && (
        <motion.div
          className="detectMe MediaPicker bg-primary fixed bottom-[62px]  z-[99] 
     w-[160px] overflow-hidden rounded-lg
      px-1 py-2  text-[15px]
     [&>div>div>svg]:mr-2 [&>div>div]:flex [&>div>div]:items-center 
     [&>div>div]:py-1 [&>div>div]:px-2 [&>div>label>svg]:mr-2 [&>div]:cursor-pointer
      [&>div]:rounded-md hover:[&>div]:bg-hover-light dark:hover:[&>div]:bg-hover-dark  "
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="file-input px-0 py-0 ">
            <label className="flex h-full w-full cursor-pointer items-center py-1 px-2">
              <i className="mr-2 text-muted-light dark:text-muted-dark">
                <AiOutlineFile />
              </i>
              File
              <input
                type="file"
                className="hidden h-full w-full cursor-pointer"
                onChange={(e) => {
                  if (e.target.files[0].size > 20971520) {
                    alert("Selected file exceeds the 20MB limit.");
                    e.target.value = null;
                    return;
                  }
                  e.target.files[0];
                  setfile(e.target.files[0]);
                  e.target.files[0];
                  setshowMediaPicker(false);
                }}
              />
            </label>
          </div>
          <div>
            <label className="flex h-full w-full cursor-pointer items-center py-1 px-2">
              <i className="mr-2 text-muted-light dark:text-muted-dark">
                <RiGalleryLine />
              </i>
              Photo or video
              <input
                type="file"
                className="hidden h-full w-full cursor-pointer"
                onChange={async (e) => {
                  if (e.target.files[0].size > 20971520) {
                    alert("Selected file exceeds the 20MB limit.");
                    e.target.value = null;
                    return;
                  }
                  if (e.target.files[0].type.startsWith("image")) {
                    setpicVidmedia({ type: "image/prop", loading: true });
                    setshowMediaPicker(false);
                    const blob = await downScalePicVid(
                      e.target.files[0],
                      0.7,
                      1,
                      0
                    );
                    const downscaledBlod = await downScalePicVid(
                      blob,
                      0.35,
                      0.1,
                      2
                    );
                    setpicVidmedia(blob);
                    setblurredPicVidmedia(downscaledBlod);
                  } else {
                    const videoObj = e.target.files[0];
                    videoObj;
                    setpicVidmedia(videoObj);
                    setblurredPicVidmedia(null);
                  }
                  setshowMediaPicker(false);
                }}
                accept="image/png, image/jpeg, video/mp4"
              />
            </label>
          </div>
          <div
            className="Poll-input"
            onClick={() => {
              setshowPollInput(true);
              setshowMediaPicker(false);
            }}
          >
            <div>
              <i className="mr-2 rotate-90 text-muted-light dark:text-muted-dark">
                <TiChartBarOutline />
              </i>
              Poll
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InputMenu;
