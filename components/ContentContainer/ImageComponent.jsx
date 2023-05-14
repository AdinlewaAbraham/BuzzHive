import React, { useState, useEffect } from "react";


const ImageComponent = ({ src }) => {
  const [imageSrc, setImageSrc] = useState("");
  const [blurredImageSrc, setBlurredImageSrc] = useState("");

  useEffect(() => {
    const imageFromStorage = localStorage.getItem(src);
    if (imageFromStorage) {
      setImageSrc(imageFromStorage);
    }
  }, [src]);

  const handleDownloadImage = () => {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result;
          localStorage.setItem(src, base64String);
          setImageSrc(base64String);
          setBlurredImageSrc(sharp(base64String).blur(5).toDataURL());
        };
      });
  };

  return (
    <div>
      {imageSrc ? (
        <img src={imageSrc} alt="" />
      ) : (
        <>
          <img
            src={src}
            alt=""
          />
          <button onClick={handleDownloadImage}> some icon</button>
        </>
      )}
    </div>
  );
};

export default ImageComponent;
