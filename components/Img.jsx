import React, { useState } from "react";
import { MdGroup } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
const Img = (p) => {
  const [invalidURL, setinvalidURL] = useState(true);
  return (
    <div className={`bg-inherit ${p.styles}`}>
      {p.src && invalidURL ? (
        <img
          src={p.src}
          alt="profile pic"
          className={`${p.imgStyles} object-cover h-full w-full`}
          onError={() => setinvalidURL(false)}
        />
      ) : p.type === "group" ? (
        <MdGroup size={`${p.groupSize}%`} />
      ) : (
        <FaUserAlt size={`${p.personalSize}%`} />
      )}
    </div>
  );
};

export default Img;
