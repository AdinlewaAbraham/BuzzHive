import React from "react";
import { BiArrowBack } from "react-icons/bi";
const Goback = ({ text }) => {
  return (
    <div className="h-[66px] flex items-center">
    <div
      className="flex w-full cursor-pointer items-center rounded-lg
     p-3 hover:bg-hover-light dark:hover:bg-hover-dark"
    >
      <i className="mr-4">
        <BiArrowBack size={20} />
      </i>
      <h3>{text}</h3>
    </div></div>
  );
};

export default Goback;
