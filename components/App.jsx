import React from "react";
import { createUser } from "@/utils/userUtils/createUser";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
import { createGroup } from "@/utils/groupUtils/createGroup";
import { getUserMessages } from "@/utils/messagesUtils/getUserMessaages";
import { addGroupMessage } from "@/utils/groupUtils/addGroupMessage";
import { getUser } from "@/utils/userUtils/getUser";
import { getLatestConversations } from "@/utils/userUtils/getAllMessages";

import { getUser1 } from "@/utils/userUtils/getAllMessages";
const App = () => {
  return (
    <div>
      <button
        onClick={() => [
          createUser(
            "1",
            "abraham",
            "f@gmail.com",
            "myphotosrrc",
            "i love living life"
          ),
        ]}
      >
        add user
      </button>{" "}
      <br />
      <button
        onClick={() => {
          sendMessage("debo", "debo", "who are you doing bro", "debo")
            .then((message) => {
              console.log("Message sent successfully:", message);
            })
            .catch((error) => {
              console.error("Failed to send message:", error);
            });
        }}
      >
        send messages
      </button>{" "}
      <br />
      <button
        onClick={() => {
          createGroup(
            true,
            "debo",
            "minters",
            "abraham@gmaii.com",
            "myphoto",
            "we love food"
          );
        }}
      >
        create group
      </button>{" "}
      <br />
      <button
        onClick={() => {
          getUserMessages("1", "3");
        }}
      >
        get conversations
      </button>
      <br />
      <button
        onClick={() => {
          addGroupMessage(
            "1",
            "8157qY05qL0fLFRTlMsF",
            "hello group second message"
          );
        }}
      >
        add group Message
      </button>
      <button
        onClick={() => {
          getUser("1");
        }}
      >
        get user
      </button>
      <br />
      <button
        onClick={() => {
          getLatestConversations("debo")
            .then((user1) => console.log(user1))
            .catch((error) => console.log(error));
        }}
      >
        get latest conversations
      </button>
    </div>
  );
};

export default App;
