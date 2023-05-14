export async function  makeBlurredVideoThumbnail(file) {
    // Create an HTML5 Canvas element
    const canvas = document.createElement("canvas");
  
    // Load the file into the canvas
    const video = document.createElement("video");
    video.src = file;
    video.onload = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
    };
  
    // Get the thumbnail as a DataURL
    console.log(canvas.toDataURL("image/jpeg"))
    return canvas.toDataURL("image/jpeg");
  }
  