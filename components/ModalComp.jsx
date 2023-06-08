import React from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import Typography from "@mui/joy/Typography";

const ModalComp = ({
  open,
  setOpen,
  discardFunc,
  header,
  description,
  discardText,
}) => {
  return (
    <>
      {open && (
        <div className="Poll-input fixed inset-0 z-50 flex  items-center justify-center bg-gray-900 bg-opacity-50">
          <div
            className="w-[35%]
         max-w-[500px] rounded-lg dark:bg-dark-secondary bg-light-secondary"
          >
            <div className="rounded-t-lg p-5 dark:bg-dark-primary bg-light-primary">
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
          </div>
        </div>
      )}
    </>
  );
};

export default ModalComp;
