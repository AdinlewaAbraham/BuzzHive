import React from "react";

const PopUp = () => {
  return (
    <div className="popup z-50">
      <p>Do you want to forfeit your input?</p>
      <button onClick={() => setShowPopup(false)}>Cancel</button>
      <button
        onClick={() => {
          setShowPopup(false);
          // clear the inputs here
        }}
      >
        Forfeit
      </button>
    </div>
  );
};

export default PopUp;
