import SelectedChannelContext from "@/context/SelectedChannelContext ";

export const downScalePicVid = async (file, qualityScale, pixelScale, blurRadius) => {
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
  canvas.width = media.width * pixelScale;
  canvas.height = media.height * pixelScale;
  const ctx = canvas.getContext("2d");

  if (blurRadius > 0) {
    // Downscale the image and apply blur effect
    const scaledImg = await new Promise((resolve) => {
      const img = downscaleImage(media, 0.01, blurRadius);
      img.onload = () => resolve(img);
    });
    ctx.drawImage(scaledImg, 0, 0, canvas.width, canvas.height);
  } else {
    // Downscale the image without blur effect
    ctx.drawImage(media, 0, 0, canvas.width, canvas.height);
  }

  const downscaledBlob = await new Promise((resolve) => {
    canvas.toBlob(resolve, isImage ? "image/jpeg" : "video/mp4", qualityScale);
  });
  downscaledBlob.name = file.name
  console.log(downscaledBlob);
  return downscaledBlob;
};

function downscaleImage(img, scale, blur) {
  var canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (blur > 0) {
    ctx.filter = 'blur(' + blur + 'px)';
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
  }

  var scaledImg = new Image();
  scaledImg.src = canvas.toDataURL();

  return scaledImg;
}
