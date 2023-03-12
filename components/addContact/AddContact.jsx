import UserCard from "./UserCard";
import useFetchUsers from "@/hooks/useFetchUsers";

const AddContact = () => {
  const { users, lastDoc, loading, handleScroll } = useFetchUsers();

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
      {loading && <div>User Loading...</div>}
    </div>
  );
};

export default AddContact;
