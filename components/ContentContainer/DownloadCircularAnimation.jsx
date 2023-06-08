import React from "react";
import { HiOutlineDownload } from "react-icons/hi";
import { CircularProgress } from "@mui/joy";

const DownloadCircularAnimation = ({ progress, size }) => {
  return (
    <CircularProgress
      size={size ? size : "lg"}
      determinate={progress == 100 || progress == 0 ? false : true}
      value={progress == 100 || progress == 0 ? 25 : progress}
      variant="plain"
      thickness={4}
    >
      <i className="text-muted-light dark:text-muted-dark">
        <HiOutlineDownload size={size === "md" ? 20 : 30} color="black" />
      </i>
    </CircularProgress>
  );
};

export default DownloadCircularAnimation;
