import React, { useEffect, useState } from "react";
import { ImCross } from "react-icons/im";
import { HiOutlinePhotograph } from "react-icons/hi";
import { TiChartBarOutline } from "react-icons/ti";
import { BsFileEarmark } from "react-icons/bs";
import { useTheme } from "next-themes";
import { getImgFromIndexedDB } from "@/utils/actualUtils/indexDB/imageDB";
import { openDB } from "idb";

const ReplyBoard = ({ chat, User, width, displayNameWidth }) => {
  const { theme } = useTheme();
  const [imgSrc, setImgSrc] = useState();

  const messageType = chat.replyObject?.replyMessageType;

  useEffect(() => {
    const getThumbnail = async () => {
      if (messageType === "image") {
        getStoredImages(chat.replyObject.replyTextId);
      }
      if (messageType === "video") {
        const storedVideoThumnail = await getVideoFromIndexedDB(
          `Thumbnail-${chat.replyObject.replyTextId}`
        );
        if (storedVideoThumnail) {
          setImgSrc(URL.createObjectURL(storedVideoThumnail));
        } else {
          setImgSrc(
            chat.replyObject.replyDataObject.blurredPixelatedBlobDownloadURL
          );
        }
      }
    };
    getThumbnail();
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
    } else setImgSrc(chat.replyObject.replyDataObject.downloadURL);
  };
  const getVideoFromIndexedDB = async (key) => {
    const db = await initializeDB();
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const value = await store.get(key);
    await tx.done;
    return value;
  };
  const handleClick = () => {
    const scrollToElement = document.getElementById(
      `${chat.replyObject.replyTextId}_mainCard`
    );
    const className =
      chat.replyObject.replyUserId === User.id
        ? "pulse-bg-user"
        : theme === "light"
        ? "pulse-bg-notUser-light"
        : "pulse-bg-notUser-dark";
    if (scrollToElement) {
      scrollToElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      scrollToElement.classList.remove(className);
      void scrollToElement.offsetWidth;
      scrollToElement.classList.add(className);
    }
  };
  const renderMessageType = () => {
    switch (messageType) {
      case "file":
        return <BsFileEarmark />;
      case "poll":
        return (
          <i className="mr-1 flex rotate-90">
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
    <div
      style={{ width: width > displayNameWidth ? width : displayNameWidth }}
      className={`relative flex h-[45px] cursor-pointer justify-between truncate rounded-lg px-2 pr-0 text-start
       ${
         chat.senderId === User.id
           ? "bg-blue-400"
           : "bg-light-secondary dark:bg-gray-500"
       } `}
      onClick={() => {
        handleClick();
      }}
    >
      <span
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          chat.senderId === User.id ? "bg-blue-900" : "bg-blue-400"
        }`}
      />
      <div className="truncate py-2 pr-2 ">
        <p className=" truncate text-[9px]">
          {chat.replyObject.replyUserId === User.id
            ? "You"
            : chat.replyObject.replyDisplayName}
        </p>
        <div className="flex items-center text-xs">
          <i className={`[&>svg]:mr-1`}>{renderMessageType()}</i>
          <p className=" truncate ">{chat.replyObject.replyText}</p>
        </div>
      </div>
      {(chat.replyObject.replyMessageType === "image" ||
        chat.replyObject.replyMessageType === "video") && (
        <img
          src={imgSrc}
          className=" ml-2 h-full min-w-[50px] max-w-[50px] rounded-l-lg object-cover"
          alt=""
        />
      )}
    </div>
  );
};

export default ReplyBoard;
