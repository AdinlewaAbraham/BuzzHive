import React from "react";
import { motion } from "framer-motion";


const Checkbox = ({ isChecked, size, styles  }) => {
  return (
    <div className={` ${styles} mr-2 flex h-${size || "5"} w-${size || "5"} items-center justify-center rounded-[3px]
     border-gray-300 bg-accent-blue pb-[4px]  pl-[2px] group-hover:bg-blue-600`}>
      {isChecked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="15"
          height="15"
        >

          <motion.path
            fill="none"
            strokeWidth="3"
            stroke="#fff"
            d="M1 14.5l6.857 6.857L23.5 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </svg>
      )}
    </div>
  );
};

export default Checkbox;
