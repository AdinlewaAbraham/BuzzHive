import React, { useContext, useEffect, useRef, useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineSend } from "react-icons/ai";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { sendGroupMessage } from "@/utils/groupUtils/sendGroupMessage";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Checkbox from "../Checkbox";
import { motion } from "framer-motion";

const PollInput = ({ setshowPollInputFunc }) => {
  const { ChatObject, setChats, setallowScrollObject } = useContext(
    SelectedChannelContext
  );
  const [inputs, setInputs] = useState([
    { id: "1", value: "" },
    { id: "2", value: "" },
  ]);
  const [currentDraggedOptionId, setcurrentDraggedOptionId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [pollQuestion, setpollQuestion] = useState("");
  const [allowMultipleAnswers, setallowMultipleAnswers] = useState(false);

  const [animationParent] = useAutoAnimate({ duration: 300 });

  const [height, setHeight] = useState(window.innerHeight - 362);
  const targetDivRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (targetDivRef.current) {
        const { height } = targetDivRef.current.getBoundingClientRect();
        setHeight(height - 365);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleChange = (id, value) => {
    const newInputs = [...inputs];
    const index = newInputs.findIndex((input) => input.id === id);
    newInputs[index].value = value;
    if (value && index === newInputs.length - 1 && newInputs.length < 10) {
      newInputs.push({ id: String(Number(id) + 1), value: "" });
    }
    setInputs([...newInputs]);
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
    e;
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
    setshowPollInputFunc();
    if (!ChatObject.activeChatId) return;
    const newarr = [...inputs].filter((option) => option.value !== "");
    const options = mapInputs(newarr);
    if (options.length < 2) {
      alert("Please add value ");
      return;
    }
    options;
    inputs;
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

    const time = new Date();

    let currentTime = new Date().getTime();

    let seconds = Math.floor(currentTime / 1000);
    let nanoseconds = (currentTime % 1000) * 10 ** 6;

    let timestamp = { seconds: seconds, nanoseconds: nanoseconds };
    const pollObject = {
      type: "poll",
      id: "propId",
      reactions: [],
      senderId: User.id,
      text: null,
      timestamp,
      dataObject: dataOBJ || {},
      status: "pending",
    };
    setallowScrollObject({
      scrollTo: "bottom",
      scrollBehaviour: "smooth",
      allowScroll: true,
    });

    setChats((prevChats) => [...prevChats, pollObject]);
    if (ChatObject.activeChatType === "group") {
      sendGroupMessage(
        User.id,
        User.photoUrl,
        ChatObject.activeChatId,
        pollQuestion,
        User.name,
        "poll",
        time,
        {},
        dataOBJ,
        null,
        () => {},
        false
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
        dataOBJ,
        null,
        () => {},
        false
      );
    }
  }
  ChatObject;

  return (
    <>
      <div className="fixed inset-0 z-20" ref={targetDivRef}></div>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="detectMe bg-primary absolute bottom-[65px] left-2 z-30 flex w-[50%] min-w-[300px] flex-col overflow-hidden rounded-lg p-4 shadow-lg"
      >
        <h1 className="mb-2 text-xl font-semibold">Create a poll</h1>
        <p className="mb-1">Question</p>
        <input
          autoFocus
          type="text"
          placeholder="Type poll question"
          className=" bg-secondary mb-2 rounded-md px-2 py-2 focus:outline-none"
          onChange={(e) => {
            if (e.target.value.length > 200) return;
            setpollQuestion(e.target.value);
          }}
          value={pollQuestion}
        />
        <p className="mb-1">Options</p>
        <div
          className={`bg-secondary scrollBar max-h-[calc(100vh-365px)] overflow-x-hidden rounded-lg px-1
         ${
           height < 32 * inputs.length + 64
             ? "overflow-y-scroll"
             : "overflow-y-hidden"
         } `}
        >
          <ul ref={animationParent} className="">
            {inputs.map((input, index) => (
              <div
                key={input.id}
                className={`flex w-full items-center  
                           ${
                             index !== inputs.length - 1 &&
                             "border-b border-[#2c2b2b] "
                           } 
               p-2 transition-all duration-150 
               ${
                 currentDraggedOptionId === input.id &&
                 index !== inputs.length - 1
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
                  className=" z-50 w-full break-words bg-inherit outline-none"
                  key={input.id}
                  value={input.value}
                  onChange={(e) => {
                    handleChange(input.id, e.target.value);
                  }}
                  onBlur={() => handleBlur(input.id, index)}
                  placeholder="+  Add Option"
                  draggable={false}
                />
                <div className={`flex items-center p-1`}>
                  <RxHamburgerMenu />
                </div>
              </div>
            ))}
          </ul>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div
            onClick={() => setallowMultipleAnswers(!allowMultipleAnswers)}
            className="group flex cursor-pointer items-center"
          >
            <div className="relative">
              <div className="absolute inset-0"></div>
              <Checkbox isChecked={allowMultipleAnswers} />
            </div>
            Allow multiple answers
          </div>
          <div
            className="flex items-center rounded-md bg-blue-600 px-2 py-2"
            onClick={() => handlePollSend()}
          >
            <AiOutlineSend />
          </div>
        </div>
      </motion.div>
    </>
  );
};
export default PollInput;
