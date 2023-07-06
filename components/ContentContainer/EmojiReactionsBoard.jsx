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
            className="h-[300px] text-black dark:text-white "
            onClick={() => console.log(chat.id)}
        >
            {/* <button onClick={spamWithEmojis}>spam with emojis</button> */}
            <ul
                className="[&>li]: scrollBar mb-2 flex h-[40px] 
            max-w-[250px] overflow-x-auto overflow-y-hidden [&>li]:mr-3 [&>li]:cursor-pointer "
            >
                <li
                    className={` min-w-max ${selectedEmojiTray === "all" && "border-b-2 border-accent-blue"
                        } `}
                    onClick={() => setSelectedEmojiTray("all")}
                >
                    ALL {formatCount(reactions.length)}
                </li>
                {groupedReactionsArrayKeys.map((key) => (
                    <li
                        className={` min-w-max ${selectedEmojiTray === key && "border-b-2 border-accent-blue"
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
                    className="scrollBar h-[calc(100%-40px)] overflow-auto"
                    ref={scrollContainerRef}
                    onScroll={handleOnScroll}
                >
                    {renderUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Img
                                    src={user.displayImg}
                                    type="personal"
                                    personalSize={30}
                                    styles="rounded-full w-[40px] h-[40px] select-none"
                                    imgStyles="rounded-full w-[40px] h-[40px]"
                                />
                                <div className="truncate">
                                    <p className="truncate">{user.name}</p>
                                </div>
                            </div>
                            <Emoji unified={user.emoji} size={20} />
                        </div>
                    ))}
                </div>
            </AnimatePresence>
            <div>{ }</div>
        </div>
    );
};

export default EmojiReactionsBoard;
