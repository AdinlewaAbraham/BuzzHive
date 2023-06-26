import Img from "@/components/Img";
import { db } from "@/utils/firebaseUtils/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { UserContext } from "@/components/App";
import { useContext } from "react";
import { MdPersonAddAlt1 } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Menu, MenuItem } from "@mui/joy";
import { useTheme } from "next-themes";

const ParticipantsComponent = ({ groupObject }) => {
  if (!groupObject) {
    return (
      <div className="flex h-[350px] w-full flex-col"> loading Members...</div>
    );
  }
  const { User } = useContext(UserContext);
  const { theme } = useTheme;
  const participantsId = groupObject.members;
  const [participants, setParticipants] = useState([]);
  const [lastParticipantId, setlastParticipantId] = useState(participantsId[0]);
  const [locked, setLocked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const Open = Boolean(anchorEl);
  const [hasMore, sethasMore] = useState(true);
  const loadMoreUsers = async () => {
    if (locked) return;
    setLocked(true);
    const spliceIndex = participantsId.findIndex(
      (participantId) => participantId === lastParticipantId
    );

    const fetchIds = JSON.parse(JSON.stringify(participantsId)).splice(
      spliceIndex,
      20
    ); //deep copy so it doesn't modify original
    console.log(fetchIds);
    setlastParticipantId(fetchIds[fetchIds.length - 1]);
    if (fetchIds.length < 20) {
      sethasMore(false);
    }
    const fetchedUsers = [];
    for (const participantId of fetchIds) {
      const userRef = doc(db, "users", participantId);
      const userSnapshot = await getDoc(userRef);
      fetchedUsers.push(userSnapshot.data());
    }
    console.log(fetchedUsers.length);
    setParticipants([...participants, ...fetchedUsers]);
    console.log(fetchedUsers);
    console.log(participantsId);
    setLocked(false);
  };
  const isAdmin = groupObject.admins.includes(User.id);
  return (
    <div className="scrollBar flex h-[350px] w-full flex-col overflow-y-auto">
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          loadMoreUsers();
        }}
        hasMore={hasMore}
        loader={<div>loading...</div>}
      >
        <div className="hover:bg-hover flex cursor-pointer  items-center truncate rounded-xl px-4  py-3">
          <i className="mr-4 flex h-[45px] w-[45px] items-center justify-center rounded-full bg-green-700 text-2xl">
            <MdPersonAddAlt1 />
          </i>
          Add participant
        </div>
        {participants.map((user) => (
          <div
            key={user.id}
            className=" hover:bg-hover flex cursor-pointer items-center justify-between truncate rounded-xl  px-4 py-3"
          >
            <div className="flex items-center ">
              <Img
                styles="rounded-full h-[45px] w-[45px] mr-4"
                imgStyles="rounded-full"
                src={user.photoUrl}
                type="notgroup"
                personalSize="45"
              />
              <div>
                <h4>{user.name}</h4>
                <p className="text-sm text-muted-light dark:text-muted-dark">
                  {user.bio}
                </p>
              </div>
            </div>
            <i className="" onClick={(e) => setAnchorEl(e.target)}>
              <BsThreeDotsVertical />
            </i>
          </div>
        ))}
      </InfiniteScroll>
      <Menu
        anchorEl={anchorEl}
        variant="plain"
        open={Open}
        onClose={() => setAnchorEl(null)}
        placement={"bottom-end"}
        sx={{
          backgroundColor:
            theme === "dark" || theme === "system" ? "#1d232a" : "#fcfcfc",
          boxShadow: "none",
          ".MuiOutlinedInput-notchedOutline": { border: 0 },
          padding: "7px",
          overflow: "hidden",
        }}
      >
        <ul>
          <li>Make group admin</li>
          <li>Remove</li>
        </ul>
      </Menu>
    </div>
  );
};

export default ParticipantsComponent;
