import React, { useContext, useMemo, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../../App";
import { modifyPollVote } from "@/utils/messagesUtils/modifyPollVote";
import { motion } from "framer-motion";

const PollComponent = ({ PollObject }) => {
  const { ChatObject } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);
  const { options, question, allowMultipleAnswers } = PollObject.dataObject;
  const caclTotalVotes = useMemo(() => {
    return options.reduce((total, option) => total + option.voteCount, 0);
  }, [options]);

  async function handleVote(optionId) {
    if (PollObject.status === "pending") return;
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
          await modifyPollVote(
            ChatObject.activeChatType,
            PollObject.id,
            ChatObject.activeChatId,
            messageOptions[i]["id"],
            User.id,
            "remove"
          );
        }
      }
    }

    const optionIndex = messageOptions.findIndex(
      (option) => option.id === optionId
    );
    const votes = messageOptions[optionIndex]["votes"];
    if (!votes) return;
    const containsId = votes.some((vote) => vote.id === User.id);
    modifyPollVote(
      ChatObject.activeChatType,
      PollObject.id,
      ChatObject.activeChatId,
      optionId,
      User.id,
      containsId ? "remove" : "add"
    );
  }
  return (
    <div className="text-left ">
      <h3 className="max-w-[300px]  whitespace-normal break-words ">
        {question}
      </h3>

      <p>{allowMultipleAnswers ? "select one or more" : "select one"}</p>
      {options.map((option) => (
        <div
          key={option.id}
          className="group flex cursor-pointer items-center justify-center"
          onClick={() => {
            handleVote(option.id);
          }}
        >
          <div
            className={`  mr-2 flex h-6 w-6 items-center justify-center
             rounded-full border border-black
           bg-accent-blue ${
             option.votes.some((vote) => vote.id === User.id) && "bg-blue-800"
           } p-1`}
          >
            {option.votes.some((vote) => vote.id === User.id) && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="15"
                height="15"
                className=" mb-[3px] ml-[2px] flex items-end"
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
          <div>
            <div className="flex justify-between">
              <p>{option.text}</p>
              <div className="flex items-center">
                <FaUserAlt size={7} />
                <p className="ml-[5px] text-[10px]"> {option.voteCount}</p>
              </div>
            </div>
            <svg width={`${100}%`} height="20" fill="yellow">
              <rect x="0" y="0" width="100%" height="5" fill="black" />
              <rect
                x="0"
                y="0"
                width={`${(option.voteCount / caclTotalVotes) * 100}%`}
                height="5"
                fill="red"
                rx="2"
                ry="2"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PollComponent;
