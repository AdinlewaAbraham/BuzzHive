import React, { useState } from "react";
import { MdGroup } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
const Img = (p) => {
  const [invalidURL, setinvalidURL] = useState(true);
  return (
    <div className={` ${!(p.src && invalidURL) && "bg-coverColor" } ${p.styles} [&>i]:flex [&>i]:items-center [&>i]:h-full [&>i]:justify-center `}>
      {p.src && invalidURL ? (
        <img
          src={p.src}
          alt="profile pic"
          className={`${p.imgStyles} h-full w-full object-cover`}
          onError={() => setinvalidURL(false)}
        />
      ) : p.type === "group" ? (
        <i>
          <MdGroup size={`${p.groupSize}%`} />
        </i>
      ) : (
        <i>
          <FaUserAlt size={`${p.personalSize}%`} />
        </i>
      )}
    </div>
  );
};

export default Img;
