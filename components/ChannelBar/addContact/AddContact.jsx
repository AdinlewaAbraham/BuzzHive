import { useGetChats } from "@/hooks/useGetChats";
import UserCard from "./UserCard";
import useFetchUsers from "@/hooks/useFetchUsers";
import { UserContext } from "../../App";
import { useContext } from "react";
import Goback from "../Goback";

const AddContact = () => {
  const { User } = useContext(UserContext);
  const { users, lastDoc, loading, handleScroll } = useFetchUsers();
  const neverUse = useGetChats(User.id);

  const handleOnScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    if (scrollHeight - scrollTop === clientHeight) {
      handleScroll();
    }
  };

  return (
    <div onScroll={handleOnScroll} className="">
      <Goback text="Add contact" />
      <div className="mb-3 mt-0 flex w-full items-center justify-center ">
        <input
          className=" w-[90%] rounded-lg bg-light-secondary px-3 py-2 placeholder-muted-light outline-none  dark:bg-dark-secondary dark:placeholder-muted-dark"
          type="text"
          name=""
          placeholder="Search"
          id=""
        />
      </div>
      {users.map((user) => (
        <UserCard
          name={user.name}
          id={user.id}
          image={user.photoUrl}
          user={user}
        />
      ))}
      {/* {loading &&
        [1, 2, 3, 4].map((key) => (
          <div
            className="flex cursor-pointer items-center rounded-lg px-4 py-3 "
            key={key}
          >
            <div className="skeleton mr-[10px] h-[50px] w-[50px] rounded-full"></div>
            <div>
              <div className="skeleton mb-[10px] h-[20px] w-[100px]"></div>
              <div className="skeleton h-[20px] w-[40px]"></div>
            </div>
          </div>
        ))} */}
    </div>
  );
};

export default AddContact;
