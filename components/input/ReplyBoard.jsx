import React, { useContext, useEffect, useRef } from "react";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";
import { motion } from "framer-motion";
import { ImCross } from "react-icons/im";
import { HiOutlinePhotograph } from "react-icons/hi";
import { TiChartBarOutline } from "react-icons/ti";
import { BsFileEarmark } from "react-icons/bs";
import { openDB } from "idb";
import { getImgFromIndexedDB } from "@/utils/actualUtils/indexDB/imageDB";
import { useState } from "react";

const ReplyBoard = ({ setReplyDivHeight }) => {
  const { User } = useContext(UserContext);
  const { replyObject, setReplyObject, replyDivHeight } = useContext(
    SelectedChannelContext
  );
  const elementRef = useRef(null);
  useEffect(() => {
    if (elementRef.current) {
      const height = elementRef.current.offsetHeight;
      setReplyDivHeight(height);
    }
  }, [replyObject]);
  const [imgSrc, setImgSrc] = useState();

  const messageType = replyObject?.replyMessageType;

  useEffect(() => {
    const getThumbnail = async () => {
      if (messageType === "image") {
        getStoredImages(replyObject.replyTextId);
      }
      if (messageType === "video") {
        const storedVideoThumnail = await getVideoFromIndexedDB(
          `Thumbnail-${replyObject.replyTextId}`
        );
        if (storedVideoThumnail) {
          setImgSrc(URL.createObjectURL(storedVideoThumnail));
        } else {
          setImgSrc(
            replyObject.replyDataObject.blurredPixelatedBlobDownloadURL
          );
        }
      }
    };
    return () => getThumbnail();
  }, []);
  async function initializeDB() {
    const db = await openDB("myvideosDatabase", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos");
        }
      },
    });
    return db;
  }
  const getStoredImages = async (id) => {
    const imageBlob = await getImgFromIndexedDB(`image-${id}`);
    const blurredImageBlob = await getImgFromIndexedDB(`blurredImage-${id}`);
    if (imageBlob) {
      setImgSrc(URL.createObjectURL(imageBlob));
    } else if (blurredImageBlob) {
      setImgSrc(URL.createObjectURL(blurredImageBlob));
    } else setImgSrc(replyObject.replyDataObject.downloadURL);
  };
  const getVideoFromIndexedDB = async (key) => {
    const db = await initializeDB();
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const value = await store.get(key);
    await tx.done;
    return value;
  };

  const renderMessageType = () => {
    switch (messageType) {
      case "file":
        return <BsFileEarmark />;
      case "poll":
        return (
          <i className="flex rotate-90">
            <TiChartBarOutline />
          </i>
        );
      case "image":
        return <HiOutlinePhotograph />;
      case "video":
        return <HiOutlinePhotograph />;
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-primary ml-[1px] max-h-[90px] w-full overflow-hidden py-2 pl-[54px] pr-[50px]"
      ref={elementRef}
    >
      <div
        className="relative flex items-center justify-between 
       overflow-hidden truncate rounded-lg bg-light-secondary  pl-2 dark:bg-hover-dark"
      >
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent-blue"></span>
        <div className="py-2 text-xs">
          <p className="">
            {replyObject.replyUserId === User.id
              ? "You"
              : replyObject.displayName}
          </p>

          <div className="text-muted mr-10 flex items-center truncate">
            <i
              className={`${
                !(messageType === "regular" || messageType === "reply") &&
                "mr-1"
              }`}
            >
              {renderMessageType()}
            </i>
            <p
              className=" scrollBar max-h-[48px] w-full
           overflow-y-auto overflow-x-hidden whitespace-normal"
            >
              {" "}
              {replyObject.replyText}
            </p>
          </div>
        </div>
        <div className="flex  h-full items-center">
          {messageType === "image" || messageType === "video" ? (
            <img
              src={imgSrc}
              className=" absolute right-10 h-full object-contain"
              alt=""
            />
          ) : null}
          <div
            className="absolute right-0 flex h-full w-10 cursor-pointer 
            items-center justify-center transition-all duration-150 
            hover:backdrop-brightness-105 dark:hover:backdrop-brightness-150
            "
            onClick={() => {
              setReplyObject({
                replyText: "",
                replyTextId: "",
                displayName: "",
                replyUserId: "",
                replyMessageType: "",
                replyDataObject: {},
              });
            }}
          >
            <i className="text-xs ">
              <ImCross />
            </i>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReplyBoard;
