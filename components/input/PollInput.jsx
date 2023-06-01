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
  const [pollQuestion, setpollQuestion] = useState("");
  const [allowMultipleAnswers, setallowMultipleAnswers] = useState(false);

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

  const mapInputs = (arr) => {
    const mappedArray = arr.map((input) => ({
      id: input.id,
      text: input.value,
      voteCount: 0,
      votes: [],
    }));

    return mappedArray;
  };
  function handlePollSend() {
    if (!ChatObject.activeChatId) return;
    const newarr = [...inputs].filter((option) => option.value !== "");
    console.log(newarr);
    const options = mapInputs(newarr);
    if (options.length < 2) {
      alert("Please add value ");
      return;
    }
    console.log(options);
    console.log(inputs);
    if (!pollQuestion) {
      alert("Please add poll question");
      return;
    }
    const dataOBJ = {
      question: pollQuestion,
      options: options,
      allowMultipleAnswers: allowMultipleAnswers,
    };
    const User = JSON.parse(localStorage.getItem("user"));
    console.log(User);
    const time = new Date();
    if (ChatObject.activeChatType === "group") {
      sendGroupMessage(
        User.id,
        ChatObject.activeChatId,
        pollQuestion,
        User.name,
        "poll",
        time,
        {},
        dataOBJ
      );
    } else {
      sendMessage(
        User.id,
        ChatObject.otherUserId,
        pollQuestion,
        User.id,
        User.name,
        "poll",
        time,
        {},
        dataOBJ
      );
    }
  }
  console.log(ChatObject);
  return (
    <div className="detectMe absolute bottom-2 left-2 z-10 flex w-[50%] min-w-[260px] flex-col rounded-lg p-4  dark:bg-black">
      <input
        type="text"
        placeholder="Type poll question"
        className=" mb-4 rounded-md px-2 py-1 focus:outline-none"
        onChange={(e) => setpollQuestion(e.target.value)}
        value={pollQuestion}
      />

      <div className="rounded-lg bg-gray-700 px-1 pb-[6px]">
        {inputs.map((input, index) => (
          <div
            key={input.id}
            className={`flex w-full items-center border-b p-2 ${
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
              className=" z-50 w-full bg-inherit outline-none"
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
      <div className="mt-5 flex items-center justify-between">
        {" "}
        <div onClick={() => setallowMultipleAnswers(!allowMultipleAnswers)}>
          <input
            type="checkbox"
            onChange={(e) => {
              console.log(e.target.checked);
              setallowMultipleAnswers(e.target.checked);
            }}
            checked={allowMultipleAnswers}
          />{" "}
          Allow multiple answers{" "}
        </div>
        <div
          className="flex items-center rounded-md bg-blue-600 px-2 py-2"
          onClick={() => handlePollSend()}
        >
          <AiOutlineSend />
        </div>
      </div>
    </div>
  );
};
export default PollInput;
