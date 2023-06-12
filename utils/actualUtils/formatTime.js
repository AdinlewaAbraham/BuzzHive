export const formatTime = (time) => {
    const currentDate = new Date();
    const timestamp = time.seconds * 1000 + time.nanoseconds / 1e6;
    const timeDate = new Date(timestamp);
  
    // Check if it's today
    if (
      timeDate.getDate() === currentDate.getDate() &&
      timeDate.getMonth() === currentDate.getMonth() &&
      timeDate.getFullYear() === currentDate.getFullYear()
    ) {
      const formattedTime = timeDate.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
      return formattedTime.toLowerCase().replace(':00', '');
    }
  
    // Check if it's yesterday
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    if (
      timeDate.getDate() === yesterday.getDate() &&
      timeDate.getMonth() === yesterday.getMonth() &&
      timeDate.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }
  
    // For time older than yesterday
    const formattedDate = timeDate.toLocaleDateString([], {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    return formattedDate;
  };
  