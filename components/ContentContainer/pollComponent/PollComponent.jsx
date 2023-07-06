import React, { useContext, useMemo, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../../App";
import { modifyPollVote } from "@/utils/messagesUtils/modifyPollVote";
import { motion } from "framer-motion";
import { TbCircleCheckFilled } from "react-icons/tb";

const POllOption = ({
  option,
  handleVote,
  User,
  PollObject,
  caclTotalVotes,
}) => {
  const isVotedFor = option.votes.some((vote) => vote.id === User.id);

  return (
    <div
      key={option.id}
      className="pollParent group grid cursor-pointer grid-cols-[20px,1fr]  items-center justify-between gap-2 px-2"
      onClick={() => {
        handleVote(option.id);
      }}
    >
      <div
        className={`pollCheckbox mr-2 flex h-5 w-5 items-center justify-center rounded-full
    ${!isVotedFor && "border border-[#aaa]"}
  
    ${
      PollObject.senderId === User.id
        ? isVotedFor
          ? "bg-blue-800"
          : "bg-blue-300"
        : isVotedFor
        ? "bg-blue-800"
        : "bg-[#212529bf]"
    }
    p-1
    
  `}
      >
        {isVotedFor && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            className="mb-[3px] ml-[2px] flex items-end"
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

      <div className="w-full">
        <div className="flex justify-between">
          <p>{option.text}</p>
          <div className="flex items-center">
            <FaUserAlt size={7} />
            <p className="ml-[5px] text-[10px]"> {option.voteCount}</p>
          </div>
        </div>
        <svg width={`${100}%`} height="20" fill="yellow">
          <rect
            x="0"
            y="0"
            width="100%"
            height="5"
            fill="currentColor"
            rx="2"
            ry="2"
            className={`
            ${
              PollObject.senderId === User.id
                ? "text-blue-300"
                : "text-[#212529bf]"
            }  `}
          />
          <rect
            x="0"
            y="0"
            width={`${(option.voteCount / caclTotalVotes) * 100}%`}
            height="5"
            fill="currentColor"
            rx="2"
            ry="2"
            className={`
            transition-[width] duration-300
            ${
              PollObject.senderId === User.id
                ? "text-blue-800"
                : "text-blue-800"
            }`}
          />
        </svg>
      </div>
    </div>
  );
};

const PollComponent = ({ PollObject, searchText, searchedMessages }) => {
  const { ChatObject, setChats, Chats } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);
  const { options, question, allowMultipleAnswers } = PollObject.dataObject;

  const caclTotalVotes = useMemo(() => {
    return options.reduce((total, option) => total + option.voteCount, 0);
  }, [options]);

  async function handleVote(optionId) {
    if (PollObject.status === "pending") return;
    const promises = [];
    const messages = JSON.parse(localStorage.getItem(ChatObject.activeChatId));
    const messageIndex = messages.findIndex(
      (message) => message.id === PollObject.id
    );
    const message = messages[messageIndex];
    const messageOptions = message["dataObject"]["options"];
    if (!allowMultipleAnswers) {
      for (let i = 0; i < messageOptions.length; i++) {
        if (messageOptions[i]["id"] === optionId) {
          continue;
        }
        const votes = messageOptions[i]["votes"];
        if (!votes) return;
        const optionVotedFor = votes.findIndex((vote) => vote.id === User.id);

        if (optionVotedFor !== -1) {
          const promise = await modifyPollVote(
            ChatObject.activeChatType,
            PollObject.id,
            PollObject,
            ChatObject.activeChatId,
            messageOptions[i]["id"],
            User.id,
            "remove"
          );
          promises.push(promise);
        }
      }
    }

    const optionIndex = messageOptions.findIndex(
      (option) => option.id === optionId
    );
    const votes = messageOptions[optionIndex]["votes"];
    if (!votes) return;
    const containsId = votes.some((vote) => vote.id === User.id);
    const promise = await modifyPollVote(
      ChatObject.activeChatType,
      PollObject.id,
      PollObject,
      ChatObject.activeChatId,
      optionId,
      User.id,
      containsId ? "remove" : "add"
    );
    promises.push(promise);
    await Promise.all(promises);
  }

  return (
    <div className="text-left ">
      <h3 className="max-w-[300px]  whitespace-normal break-words ">
        {question?.split(" ").map((word, index) => (
          <span
            key={index}
            className={
              searchText
                .toLowerCase()
                .split(" ")
                .includes(word.toLowerCase()) &&
              searchText !== "" &&
              searchedMessages.includes(PollObject.id) &&
              "m-0 max-h-min max-w-min bg-red-500 p-0"
            }
          >
            {word}{" "}
          </span>
        ))}
      </h3>

      <p className="text-muted flex items-center text-sm ">
        <i className={` flex items-center`}>
          <TbCircleCheckFilled />
          {allowMultipleAnswers && (
            <i className="translate-x-[-6px] ">
              <TbCircleCheckFilled />
            </i>
          )}
        </i>
        <p className={`${!allowMultipleAnswers && "ml-1 "} `}>
          {allowMultipleAnswers ? "select one or more" : "select one"}
        </p>
      </p>
      {options.map((option) => (
        <POllOption
          option={option}
          handleVote={handleVote}
          User={User}
          PollObject={PollObject}
          caclTotalVotes={caclTotalVotes}
        />
      ))}
    </div>
  );
};

export default PollComponent;
