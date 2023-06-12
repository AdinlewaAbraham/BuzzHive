import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ModalComp = ({
  open,
  setOpen,
  discardFunc,
  header,
  description,
  discardText,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="Poll-input fixed inset-0 z-50 flex  items-center justify-center bg-gray-900 bg-opacity-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="w-[35%]
         max-w-[500px] rounded-lg bg-light-secondary dark:bg-dark-secondary"
          >
            <div className="rounded-t-lg bg-light-primary p-5 dark:bg-dark-primary">
              <h1 className="text-xl font-medium">{header}</h1>
              <p className="mt-1 text-sm">{description}</p>
            </div>
            <div className="z-[99] flex rounded-lg p-5 [&>button]:w-full [&>button]:rounded-lg [&>button]:py-2">
              <button
                className="detectMe mr-1  bg-light-primary p-4 dark:bg-dark-primary"
                onClick={() => setOpen(false)}
              >
                Go back
              </button>
              <button
                className="bg-blue-500 p-4"
                color="danger"
                onClick={() => {
                  discardFunc();
                  console.log("stuffing");
                }}
              >
                Yes Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalComp;
