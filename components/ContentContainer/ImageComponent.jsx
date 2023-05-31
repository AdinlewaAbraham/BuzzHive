import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiDownload } from "react-icons/fi";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { useContext } from "react";
import { UserContext } from "../App";

const ImageComponent = ({ blurredSRC, downloadSRC, messageId }) => {
  const { User } = useContext(UserContext);
  const { ChatObject } = useContext(SelectedChannelContext);
  (messageId);
  const [imageSrc, setImageSrc] = useState(blurredSRC);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [isDownloaded, setisDownloaded] = useState(false);
  const [loadingImg, setloadingImg] = useState(true);

  function dataURItoBlob(dataURI) {
    (dataURI);
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  useEffect(() => {
    setloadingImg(true);
    const imageFromStorage = localStorage.getItem(downloadSRC);
    if (imageFromStorage) {
      const blob = dataURItoBlob(imageFromStorage);
      const url = URL.createObjectURL(blob);
      setImageSrc(url);
      setisDownloaded(true);
      setloadingImg(false);
    }
  }, [downloadSRC]);

  const handleDownload = async () => {
    const messages = JSON.parse(localStorage.getItem(ChatObject.activeChatId));
    try {
      const response = await axios({
        url: downloadSRC,
        method: "GET",
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const messageIndex = messages.findIndex(
            (message) => message.id === messageId
          );
          setDownloadProgress((loaded / total) * 100);
        },
      });

      const blob = response.data;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        localStorage.setItem(downloadSRC, base64data);
        setisDownloaded(true);
        setImageSrc(base64data);
        setloadingImg(false);
      };
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (User.autoDownloadSettings.picture) {
      ("i ran");
      handleDownload();
    }
  }, []);

  return (
    <div className="relative">
      <div className="">
        {loadingImg ? (
          <img src={blurredSRC} className=" object-cover" width={300}/>
        ) : (
          <img
            src={imageSrc}
            alt="Preview"
            className=" object-cover"
            width={300}
          />
        )}
      </div>{" "}
      <div className="absolute flex justify-center top-[50%] left-[50%] items-center ">
        {(downloadProgress)}
        {(isDownloaded)}
        {downloadProgress !== 100 &&
          !isDownloaded &&
          downloadProgress !== 0 && (
            <div>
              <button onClick={handleDownload}>
                <FiDownload color="black" size={20} />
              </button>
              {downloadProgress && downloadProgress.toFixed(2) + "%"}
            </div>
          )}
      </div>
    </div>
  );
};
export default ImageComponent;
