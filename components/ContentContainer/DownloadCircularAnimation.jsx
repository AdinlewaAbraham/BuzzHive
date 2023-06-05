import React from "react";
import { HiOutlineDownload } from "react-icons/hi";
import { CircularProgress } from "@mui/joy";

const DownloadCircularAnimation = ({ progress, size }) => {
  console.log(progress)
  return (
    <CircularProgress
      size="lg"
      determinate={progress == 100 || progress == 0 ? false : true}
      value={progress == 100 || progress == 0 ? 25 : progress}
      variant="plain"
      thickness={4}
    >
      <i className="text-muted-light dark:text-muted-dark">
        <HiOutlineDownload size={30} />
      </i>
    </CircularProgress>
  );
};

export default DownloadCircularAnimation;
