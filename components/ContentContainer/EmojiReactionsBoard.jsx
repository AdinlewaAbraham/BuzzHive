import { Emoji } from "emoji-picker-react";
import { AnimatePresence } from "framer-motion";
import React, { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import Img from "../Img";
import { formatCount } from "@/utils/actualUtils/formatCount";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";
import { faker } from "@faker-js/faker";
import { topEmojiUnified } from "@/utils/emojis";
import Badge from "../Badge";

const EmojiReactionsBoard = ({ chat }) => {
    const { reactions } = chat;

    const [selectedEmojiTray, setSelectedEmojiTray] = useState("all");

    const [renderUsers, setrenderUsers] = useState([]);

    const [hasMore, sethasMore] = useState(true);
    const [addUsersLoading, setaddUsersLoading] = useState(false);
    const renderLimit = 20;
    const groupedReactions = reactions.reduce((acc, reaction) => {
        const { emoji } = reaction;
        if (acc[emoji]) {
            acc[emoji].push(reaction);
        } else {
            acc[emoji] = [reaction];
        }
        return acc;
    }, {});

    const groupedReactionsArrayKeys = Object.keys(groupedReactions);

    useEffect(() => {
        sethasMore(true)
        if (selectedEmojiTray === "all") {
            const splicedUsersThatReacted = JSON.parse(
                JSON.stringify(reactions)
            ).splice(0, renderLimit);
            setrenderUsers(splicedUsersThatReacted);
            if (splicedUsersThatReacted.length < renderLimit) {
                sethasMore(false);
            }
        } else {
            const splicedUsersThatReacted = JSON.parse(
                JSON.stringify(groupedReactions[selectedEmojiTray])
            ).splice(0, renderLimit);
            setrenderUsers(splicedUsersThatReacted);
            if (splicedUsersThatReacted.length < renderLimit) {
                sethasMore(false);
            }
        }
    }, [selectedEmojiTray]);


    const loadMoreUsers = () => {
        if (addUsersLoading) return;
        setaddUsersLoading(true);
        const lastUser = renderUsers[renderUsers.length - 1];
        if (!lastUser) return;
        let arrayToExtractFrom = [];
        if (selectedEmojiTray === "all") {
            arrayToExtractFrom = JSON.parse(JSON.stringify(reactions));
        } else {
            arrayToExtractFrom = JSON.parse(
                JSON.stringify(groupedReactions[selectedEmojiTray])
            );
        }
        const spliceStartIndex = arrayToExtractFrom.findIndex(
            (user) => user.id === lastUser.id
        );

        const usersToBeAdded = arrayToExtractFrom.splice(
            spliceStartIndex + 1,
            renderLimit
        );
        if (usersToBeAdded.length < renderLimit) {
            sethasMore(false);
        }

        setrenderUsers((prevUsers) => [...prevUsers, ...usersToBeAdded]);

        setaddUsersLoading(false);
    };

    const scrollContainerRef = useRef(null);
    const handleOnScroll = () => {
        const container = scrollContainerRef.current;

        if (!container) return;

        let triggerHeight = container.scrollTop + container.offsetHeight;
        if (triggerHeight >= container.scrollHeight - 20 && hasMore) {
            loadMoreUsers();
        }
    };
    return (
        <div
            className="h-[300px] w-[300px] text-black dark:text-white p-2 "
        >
            <ul
                className="[&>li]: scrollBar mb-2 flex 
            w-full py-2 overflow-x-auto overflow-y-hidden [&>li]:mr-3 [&>li]:cursor-pointer "
            id="emojiBoard"
            >
                <li
                    className={` min-w-max ${selectedEmojiTray === "all" && "border-b-4 border-accent-blue"
                        } `}
                    onClick={() => setSelectedEmojiTray("all")}
                >
                    ALL {formatCount(reactions.length)}
                </li>
                {groupedReactionsArrayKeys.map((key) => (
                    <li
                        className={` min-w-max ${selectedEmojiTray === key && "border-b-4 border-accent-blue"
                            } flex `}
                        onClick={() => setSelectedEmojiTray(key)}
                    >
                        <Emoji unified={key} size={20} />
                        {formatCount(groupedReactions[key].length)}
                    </li>
                ))}
            </ul>
            <AnimatePresence>
                <div
                    className="scrollBar h-[calc(100%-60px)] overflow-auto"
                    ref={scrollContainerRef}
                    onScroll={handleOnScroll}
                    id="emojiBoard"
                >
                    {renderUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 ">
                            <div className="flex items-center">
                                <Img
                                    src={user.displayImg}
                                    type="personal"
                                    personalSize={30}
                                    styles="rounded-full w-[40px] h-[40px] select-none"
                                    imgStyles="rounded-full w-[40px] h-[40px]"
                                />
                                <div className="truncate ml-1 flex items-center">
                                    <p className="truncate">{user.name}</p>
                                    <Badge id={user.id} />
                                </div>
                            </div>
                            <Emoji unified={user.emoji} size={20} />
                        </div>
                    ))}
                </div>
            </AnimatePresence>
        </div>
    );
};

export default EmojiReactionsBoard;
