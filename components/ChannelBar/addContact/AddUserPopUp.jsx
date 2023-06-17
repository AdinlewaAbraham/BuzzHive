import React, { useContext, useEffect, useState } from "react";
import Img from "@/components/Img";
import { UserContext } from "@/components/App";
import { sendMessage } from "@/utils/messagesUtils/sendMessage";
import SelectedChannelContext from "@/context/SelectedChannelContext ";

const AddUserPopUp = ({ setShowUserPopupTofalse, user }) => {
    const { User } = useContext(UserContext);
    const { setSelectedChannel } = useContext(SelectedChannelContext)

    const [mycontacts, setmycontacts] = useState([]);
    const [addingUser, setaddingUser] = useState(false);
    useEffect(() => {
        const storedData = JSON?.parse(
            localStorage.getItem(`${User.id}_userChats`)
        );
        if (storedData) {
            setmycontacts(storedData.map((contact) => contact.id));
        }
    }, []);
    return (
        <div className=" rounded-xl p-4 px-8">
            <div className="flex w-44 flex-col items-center justify-center">
                <Img
                    src={user.photoUrl}
                    styles="rounded-full h-[60px] w-[60px] "
                    imgStyles="rounded-full "
                    personalSize="50"
                    type="personnal"
                />
                <div className="my-2 text-center">
                    <p className="">{user.name}</p>
                    <p className="text-sm text-muted-light dark:text-muted-dark">
                        {user.bio}
                    </p>
                </div>
                {mycontacts.includes(user.id) ? (
                    <button
                        className={`flex w-full items-center justify-center rounded-lg bg-accent-blue py-2  ${addingUser && "cursor-wait"} `}
                        onClick={() => {
                            if (addingUser) return
                            setaddingUser(true);
                            sendMessage(
                                User.id,
                                user.id,
                                `${User.name} added ${user.name}`,
                                User.id,
                                User.name,
                                "announcement",
                                new Date(),
                                null,
                                null,
                                null,
                                () => { }
                            ).then(() => {
                                setmycontacts([...mycontacts, user.id])
                                setaddingUser(false);

                                setTimeout(() => {
                                    setSelectedChannel("chats")
                                    setShowUserPopupTofalse
                                }, 1000)

                            });
                        }}
                    >
                        {addingUser ? "Adding contact..." : "Add Contact"}
                    </button>
                ) : (
                    <p className="text-green-500">Already in Contacts</p>
                )}
                <button
                    className={`mt-2 flex w-full items-center justify-center rounded-lg bg-gray-500 py-2  `}
                    onClick={setShowUserPopupTofalse}
                >
                    cancel
                </button>
            </div>
        </div>
    );
};

export default AddUserPopUp;
