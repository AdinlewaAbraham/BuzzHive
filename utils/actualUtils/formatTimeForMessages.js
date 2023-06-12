export const formatTimeForMessages = (timestamp) => {
    if (!timestamp || typeof timestamp !== "object") {
      return "";
    }
  
    const { seconds, nanoseconds } = timestamp;
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    const date = new Date(milliseconds);
  
    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
  
    return date.toLocaleTimeString(undefined, options);
  };
  