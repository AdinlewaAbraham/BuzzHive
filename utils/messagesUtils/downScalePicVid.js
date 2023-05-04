import SelectedChannelContext from "@/context/SelectedChannelContext ";
export const downScalePicVid = async (file) => {
  if (!file) return;
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  console.log(isImage);
  console.log(isVideo);

  // Create an HTML5 Canvas element
  const canvas = document.createElement("canvas");

  // Load the file into the canvas
  let media;
  if (isImage) {
    console.log("ran");
    media = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  } else if (isVideo) {
    return file;
  }

  console.log(media);
  canvas.width = isVideo ? media.videoWidth : media.width;
  canvas.height = isVideo ? media.videoHeight : media.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(media, 0, 0, canvas.width, canvas.height);

  const downscaledBlob = await new Promise((resolve) => {
    canvas.toBlob(resolve, isImage ? "image/jpeg" : "video/mp4", 1);
  });
  console.log(downscaledBlob);
  return downscaledBlob;
};
