import React, { useContext, useMemo, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import useFetchUsers from "@/hooks/useFetchUsers";
import { createGroup } from "@/utils/groupUtils/createGroup";
import { UserContext } from "../App";

const AddGroup = () => {
  const { User } = useContext(UserContext);
  console.log(User);
  const { users } = useFetchUsers();
  const [selectedUsers, setselectedUsers] = useState([]);
  const [showAddGroupMenu, setshowAddGroupMenu] = useState(false);
  function handleSelect(user, checked) {
    if (checked) {
      setselectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
    } else {
      setselectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((u) => u.id !== user.id)
      );
    }
  }
  return (
    <div className="fixed z-10 bg-red-700 h-[80%] min-h-[430px] w-[300px] p-5 ">
      <div className="flex items-center">
        <BiArrowBack className="cursor-pointer" />{" "}
        <h1 className="text-2xl ml-2">New group</h1>
      </div>
      <input type="text" className="bg-white w-full mt-2 text-black" />
      {showAddGroupMenu ? (
        <>
          <input type="file" placeholder="add group profile pic" />{" "}
          <p>input group name</p>
          <input type="text" className="w-full" />
          <div className="flex w-full border mt-auto absolute left- right-0 bottom-2">
            <button
              className="w-1/2 py-2 bg-green-700 mr-1"
              onClick={() => {
                createGroup(
                  true,
                  User.uid,
                  "debogrroup",
                  null,
                  "debo is the greatest"
                );
              }}
            >
              Create
            </button>
            <button className="w-1/2 py-2 bg-gray-500">Cancel</button>
          </div>
        </>
      ) : (
        <>
          {selectedUsers.length > 0 && (
            <div className="flex mt-2">
              <button
                className="w-1/2 py-2 bg-green-700 mr-1"
                onClick={() => {
                  setshowAddGroupMenu(true);
                }}
              >
                next
              </button>{" "}
              <button className="w-1/2 py-2  bg-gray-500">cancel</button>
            </div>
          )}
          <p>All user</p>
          <div className="max-h-[300px] overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="flex items-center mt-2">
                <img
                  src={user.photoUrl}
                  alt=""
                  className="w-8 h-8 mr-2 rounded-full"
                />
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.bio}</p>
                </div>
                <input
                  type="checkbox"
                  className="ml-auto h-5 w-5"
                  onChange={(e) => {
                    handleSelect(user, e.target.checked);
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AddGroup;
