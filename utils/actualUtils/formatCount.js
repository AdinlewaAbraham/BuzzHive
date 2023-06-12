export const formatCount = (count) => {
    if (count < 1e3) {
        return count.toString();
      } else if (count >= 1e3 && count < 1e6) {
        const formattedCount = (count / 1e3).toFixed(1);
        return formattedCount.endsWith('.0') ? `${Math.floor(formattedCount)}k` : `${formattedCount}k`;
      } else if (count >= 1e6 && count < 1e9) {
        const formattedCount = (count / 1e6).toFixed(1);
        return formattedCount.endsWith('.0') ? `${Math.floor(formattedCount)}M` : `${formattedCount}M`;
      } else if (count >= 1e9 && count < 1e12) {
        const formattedCount = (count / 1e9).toFixed(1);
        return formattedCount.endsWith('.0') ? `${Math.floor(formattedCount)}B` : `${formattedCount}B`;
      } else {
        const formattedCount = (count / 1e12).toFixed(1);
        return formattedCount.endsWith('.0') ? `${Math.floor(formattedCount)}T` : `${formattedCount}T`;
      }
};
