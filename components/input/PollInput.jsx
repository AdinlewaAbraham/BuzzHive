import React, { useContext, useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineSend } from "react-icons/ai";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { sendGroupMessage } from "@/utils/groupUtils/sendGroupMessage";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";

const PollInput = () => {
  const { ChatObject } = useContext(SelectedChannelContext);
  const [inputs, setInputs] = useState([
    { id: "1", value: "" },
    { id: "2", value: "" },
  ]);
  const [currentDraggedOptionId, setcurrentDraggedOptionId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const handleChange = (id, value) => {
    const newInputs = [...inputs];
    const index = newInputs.findIndex((input) => input.id === id);
    newInputs[index].value = value;
    if (value && index === newInputs.length - 1 && newInputs.length < 10) {
      newInputs.push({ id: String(Number(id) + 1), value: "" });
    }
    setInputs(newInputs);
  };

  const handleBlur = (id, i) => {
    if (i === inputs.length - 1) return;
    const newInputs = [...inputs];
    const index = newInputs.findIndex((input) => input.id === id);
    if (!newInputs[index].value && newInputs.length > 1) {
      newInputs.splice(index, 1);
    }
    setInputs(newInputs);
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
    setDragIndex(inputs.findIndex((input) => input.id === id));
  };

  const handleDrop = (e, id) => {
    setcurrentDraggedOptionId(null);
    e.preventDefault();
    console.log(e);
    const sourceId = e.dataTransfer.getData("text/plain");
    const newInputs = [...inputs];
    const sourceIndex = newInputs.findIndex((input) => input.id === sourceId);
    const targetIndex = newInputs.findIndex((input) => input.id === id);
    const [removed] = newInputs.splice(sourceIndex, 1);
    newInputs.splice(targetIndex, 0, removed);
    setInputs(newInputs);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (dragIndex !== null && overIndex !== null && overIndex !== dragIndex) {
      setcurrentDraggedOptionId(id);
    }
  };
  function handlePollSend() {
    if (!ChatObject.activeChatId) return;
    const dataOBJ = {
      question: "pollQuestion",
      options: "pollOptions",
      votes: {
        option1: [],
        option2: [],
        // Add more options as needed
      },
    };
    const User = JSON.parse(localStorage.getItem("user"));
    console.log(User);
    return;
    if (ChatObject.activeChatType === "group") {
      sendGroupMessage();
    } else {
      sendMessage();
    }
  }
  return (
    <div className="detectMe absolute bottom-2 left-2 w-[50%] z-10 dark:bg-black min-w-[260px] flex flex-col p-4  rounded-lg">
      <input
        type="text"
        placeholder="Type poll question"
        className=" mb-4 px-2 py-1 rounded-md focus:outline-none"
      />

      <div className="rounded-lg px-1 pb-[6px] bg-gray-700">
        {inputs.map((input, index) => (
          <div
            className={`flex w-full border-b items-center p-2 ${
              currentDraggedOptionId === input.id
                ? dragIndex < index
                  ? "pb-10"
                  : "pt-10"
                : ""
            } ${index !== inputs.length - 1 ? "cursor-grab" : ""}`}
            draggable={index !== inputs.length - 1}
            onDragStart={(e) => {
              if (index === inputs.length - 1) return;
              setDragIndex(index);
              handleDragStart(e, input.id);
            }}
            onDrop={(e) => {
              if (index === inputs.length - 1) return;
              handleDrop(e, input.id);
            }}
            onDragOver={(e) => {
              if (index !== inputs.length - 1) {
                setOverIndex(index);
              }
              handleDragOver(e, input.id);
            }}
          >
            <input
              className=" w-full bg-inherit outline-none z-50"
              key={input.id}
              value={input.value}
              onChange={(e) => handleChange(input.id, e.target.value)}
              onBlur={() => handleBlur(input.id, index)}
              placeholder="+  Add Option"
              draggable={false}
            />
            <div className={`flex items-center p-1`}>
              <RxHamburgerMenu />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-5">
        {" "}
        <div>
          <input type="checkbox" /> Allow multiple answers{" "}
        </div>
        <div
          className="bg-blue-600 flex items-center px-2 py-2 rounded-md"
          onClick={handlePollSend()}
        >
          <AiOutlineSend />
        </div>
      </div>
    </div>
  );
};
export default PollInput;
