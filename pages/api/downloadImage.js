import axios from 'axios';

const downloadImage = async (url, type, setBlurredImageBlob, setImageBlob, setLoadingImg, setIsDownloaded) => {
  if (!url) return;

  try {
    const response = await axios({
      url: url,
      method: 'GET',
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        console.log((loaded / total) * 100);
      },
    });

    const blob = response.data;

    if (type === 'blurredImage') {
      setBlurredImageBlob(blob);
    } else {
      setImageBlob(blob);
    }

    setLoadingImg(false);
    setIsDownloaded(true);

    const db = await initializeDB();
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    await store.put(blob, `${type}-${chat.id}`);
    await tx.done;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Usage example
