import React from "react";
import { HiOutlineUpload } from "react-icons/hi";
import { CircularProgress } from "@mui/joy";

const UploadCircularAnimation = ({ progress }) => {
  return (
    <CircularProgress
      size="lg"
      determinate={progress == 100 || progress == 0 ? false : true}
      value={progress == 100 || progress == 0 ? 25 : progress}
      variant="plain"
      thickness={4}
    >
      <i className="text-muted-light dark:text-muted-dark">
        <HiOutlineUpload size={30} />
      </i>
    </CircularProgress>
  );
};

export default UploadCircularAnimation;
