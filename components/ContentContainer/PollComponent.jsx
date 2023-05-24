import React, { useContext, useMemo, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";
import { modifyPollVote } from "@/utils/messagesUtils/modifyPollVote";

const PollComponent = ({ PollObject }) => {
  const { ChatObject } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);
  console.log(PollObject);
  console.log(PollObject.dataObject);
  const { options, question, allowMultipleAnswers } = PollObject.dataObject;
  console.log(allowMultipleAnswers);
  const caclTotalVotes = useMemo(() => {
    return options.reduce((total, option) => total + option.voteCount, 0);
  }, [options]);
  console.log(caclTotalVotes);

  async function handleVote(optionId) {
    // logic for updating chats locally
    const messages = JSON.parse(localStorage.getItem(ChatObject.activeChatId));
    console.log(messages);
    const messageIndex = messages.findIndex(
      (message) => message.id === PollObject.id
    );
    const message = messages[messageIndex];
    const messageOptions = message["dataObject"]["options"];
    console.log(message.dataObject.allowMultipleAnswers);
    if (!allowMultipleAnswers) {
      console.log(allowMultipleAnswers);
      for (let i = 0; i < messageOptions.length; i++) {
        if (messageOptions[i]["id"] === optionId) {
          console.log(true);
          continue;
        }
        console.log(i);
        const votes = messageOptions[i]["votes"];
        console.log(messageOptions[i]["votes"]);
        console.log(messageOptions[i]);
        console.log(votes)
        if (!votes) return;
        const optionVotedFor = votes.findIndex((vote) => vote.id === User.id);
        if (optionVotedFor !== -1) {
          console.log("removing " + optionVotedFor);
          console.log("removing " + messageOptions[i]["id"]);
          console.log(messageOptions[i]);
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
    console.log(optionIndex);
    console.log(messageOptions);
    const votes = messageOptions[optionIndex]["votes"];
    if (!votes) return;
    console.log(votes);
    const containsId = votes.some((vote) => vote.id === User.id);
    console.log(containsId);
    modifyPollVote(
      ChatObject.activeChatType,
      PollObject.id,
      ChatObject.activeChatId,
      optionId,
      User.id,
      containsId ? "remove" : "add" // this handles vote toggle
    );
  }
  return (
    <div className="text-left">
      <h3>{question}</h3>

      <p>{allowMultipleAnswers ? "select one or more" : "select one"}</p>
      {options.map((option) => (
        <div
          key={option.id}
          className="flex items-center justify-center"
          onClick={(e) => {
            handleVote(option.id);
          }}
        >
          <input type="checkbox" name="" id="" className="mr-1" />
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
