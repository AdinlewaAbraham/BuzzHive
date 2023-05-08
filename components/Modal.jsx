import { useState, useEffect } from "react";
const Modal = ({ onConfirm, onCancel }) => {
  const handleConfirm = () => {
    onConfirm();
    setIsVisible(false);
  };

  const handleCancel = () => {
    onCancel();
    setIsVisible(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-gray-900 opacity-75"></div>
        <div className="relative bg-white rounded-lg w-96">
          <div className="px-6 py-4">
            <h1 className="text-lg font-medium mb-4">
              Are you sure you want to exit?
            </h1>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded"
                onClick={handleConfirm}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Modal;
