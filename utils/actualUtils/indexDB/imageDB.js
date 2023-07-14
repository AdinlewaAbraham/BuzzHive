import { openDB } from "idb";
export const getImgFromIndexedDB = async (key) => {
    const db = await initializeDB();
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const value = await store.get(key);
    await tx.done;
    return value;
  };

  
 export async function initializeDB() {
    const db = await openDB("myImagesDatabase", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      },
    });
    return db;
  }