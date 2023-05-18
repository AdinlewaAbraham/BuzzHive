import React, { useContext, useMemo } from "react";
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
  const totalVotes = useMemo(() => {
    console.log("Total votes ");
    return options.reduce((total, option) => total + option.voteCount, 0);
  }, [options]);
  function handleVote(optionId) {
    // logic for updating chats locally
    const messages = JSON.parse(localStorage.getItem(ChatObject.activeChatId));
    console.log(messages);
    const messageIndex = messages.findIndex(
      (message) => message.id === PollObject.id
    );
    const message = messages[messageIndex];
    const messageOptions = message["dataObject"]["options"];
    console.log(message.dataObject.allowMultipleAnswers);

    if (message.dataObject.allowMultipleAnswers) {
      console.log(messageOptions);
    } else {
      console.log(messageOptions);
      for (let i = 0; i < messageOptions.length; i++) {
        const votes = messageOptions[i]["votes"];
        console.log(messageOptions[i]["id"]);
        const optionVotedFor = votes.findIndex((vote) => vote.id === User.id);
        console.log(optionVotedFor);
        if (optionVotedFor !== -1) {
          modifyPollVote(
            ChatObject.activeChatType,
            PollObject.id,
            ChatObject.activeChatId,
            messageOptions[i]["id"],
            User.id,
            "remove"
          );
          console.log("true");
        }
        console.log(votes.findIndex((vote) => vote.id === User.id));
      }
    }

    const optionIndex = messageOptions.findIndex(
      (option) => option.id === optionId
    );
    console.log(optionIndex);
    console.log(messageOptions);
    const votes = messageOptions[optionIndex]["votes"];
    console.log(votes);
    let action = "add";
    if (votes) {
      const containsId = votes.some((vote) => vote.id === User.id);
      if (containsId) {
        action = "add";
      }
    }

    // continue from here

    modifyPollVote(
      ChatObject.activeChatType,
      PollObject.id,
      ChatObject.activeChatId,
      optionId,
      User.id,
      action
    );
  }
  return (
    <div className="text-left">
      <h3>{question}</h3>
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
                //width={`${totalVotes / option.voteCount}%`}
                width={`${60}%`}
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
