import { useGetChats } from "@/hooks/useGetChats";
import UserCard from "./UserCard";
import useFetchUsers from "@/hooks/useFetchUsers";
import { UserContext } from "../../App";
import { useContext } from "react";

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
    <div onScroll={handleOnScroll}>
      {users.map((user) => (
        <UserCard name={user.name} id={user.id} image={user.photoUrl} />
      ))}
      {loading &&
        [1, 2, 3, 4].map((key) => (
          <div
            className="rounded-lg flex cursor-pointer items-center px-4 py-3 "
            key={key}
          >
            <div className="w-[50px] h-[50px] rounded-full skeleton mr-[10px]"></div>
            <div>
              <div className="w-[100px] h-[20px] skeleton mb-[10px]"></div>
              <div className="w-[40px] h-[20px] skeleton"></div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default AddContact;
