import React from "react";
import { createUser } from "@/utils/userUtils/createUser";
import { createMessage } from "@/utils/conversations/CreateConversation";
const App = () => {
  return (
    <div>
      <button
        onClick={() => [
          createUser(
            "uid",
            "abraham",
            "f@gmail.com",
            "myphotosrrc",
            "i love living life"
          ),
        ]}
      >
        add user
      </button>
      <button onClick={()=>{createMessage()}}>add messages</button>
    </div>
  );
};

export default App;
