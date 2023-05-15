import { useContext, useState, useMemo, useEffect, useRef } from "react";
import Input from "../input/Input";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { AiOutlineSearch } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { AiOutlineArrowDown } from "react-icons/ai";
import MessageCard from "./MessageCard";

const ContentContainer = () => {
  const {
    Chats,
    ChatObject,
    setChatObject,
    showChats,
    setshowChats,
    ReplyObject,
    replyDivHeight,
  } = useContext(SelectedChannelContext);
  console.log(Chats);

  const [sortedChats, setSortedChats] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [showProfile, setshowProfile] = useState(false);
  const [IsMobile, setIsMobile] = useState(false);
  const secondDivRef = useRef(null);

  useEffect(() => {
    const retard = () => {
      console.log(replyDivHeight);
    };
    return () => {
      retard();
    };
  }, [replyDivHeight]);
  useEffect(() => {
    function widthResizer() {
      const width = window.innerWidth < 768;
      setIsMobile(width);
    }

    widthResizer();

    window.addEventListener("resize", widthResizer);

    return () => window.removeEventListener("resize", widthResizer);
  }, []);

  useEffect(() => {
    if (ChatObject.photoUrl && ChatObject.photoUrl.props) {
      setPhotoUrl(ChatObject.photoUrl.props.src);
    }
  }, [ChatObject]);
  useEffect(() => {
    if (!IsMobile) setshowChats(true);
  }, [IsMobile]);

  useMemo(() => {
    if (Chats == []) return;
    if (Chats) {
      setSortedChats(Chats.sort((a, b) => a.timestamp - b.timestamp));
    }
  }, [Chats]);
  if (ChatObject.activeChatId == "") {
    return (
      <div className="bg-gray-300 dark:bg-[#12171d]  flex-1 overflow-hidden hidden items-center justify-center md:flex">
        no active chat right now
      </div>
    );
  }
  console.log(ReplyObject.divHeight);

  const mainContentStyle = {
    overflowY: "auto",
    height: `calc(100vh - 123px${
      ReplyObject.ReplyTextId ? ` - ${replyDivHeight}px` : ""
    })`,
  };

  console.log(replyDivHeight);

  return (
    showChats && (
      <div className={`flex-1 ${IsMobile ? "fixed inset-0" : ""}`}>
        <div className=" flex-col relative bg-gray-300 dark:bg-[#12171d]  overflow-y-auto inset md:flex ">
          {showProfile && (
            <div className="bg-pink-500 inset-0 absolute z-30 ">
              <div
                className="border-b p-[16px]"
                onClick={() => {
                  setshowProfile(false);
                }}
              >
                <div className="cursor-pointer">
                  <GiCancel size={30} />
                </div>
              </div>
            </div>
          )}
          <div
            className="flex justify-between md:ml-[1px] items-center dark:bg-[#1d232a] p-[13px] max-h-[66px] z-20 cursor-pointer"
            onClick={() => {
              //setshowProfile(true);
            }}
          >
            <div className="flex items-center">
              {IsMobile && (
                <div
                  className="mr-[15px]"
                  onClick={() => {
                    setshowChats(false);
                    setChatObject({ ...ChatObject, activeChatId: "" });
                  }}
                >
                  <BiArrowBack size={20} />
                </div>
              )}
              <div
                className={`h-[40px] w-[40px] rounded-full flex item-center justify-center bg-gray-500 ${
                  ChatObject.photoUrl === null ? "pt-[3px]" : ""
                }`}
                onClick={() => {
                  setshowProfile(true);
                }}
              >
                {ChatObject.photoUrl === null ? (
                  ChatObject.activeChatType === "group" ? (
                    <MdGroup size={30} />
                  ) : (
                    <IoMdPerson size={30} />
                  )
                ) : (
                  <img
                    src={ChatObject.photoUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full"
                  />
                )}
              </div>
              <div className="ml-[10px]">{ChatObject.displayName}</div>
            </div>

            <div className="px-[10px]">
              <AiOutlineSearch />
            </div>
          </div>
          <main
            style={mainContentStyle}
            className="h-[calc(100vh-123px)] flex flex-col justify-end"
          >
            {Chats == null ? (
              <div className="text-center text-2xl">Loading</div>
            ) : Chats.length == 0 ? (
              <>you have nothing </>
            ) : (
              <div
                className="w-full  my-element overflow-y-auto scrollbar-thin  scrollbar-thumb-rounded-[2px] scrollbar-thumb-blue-700
              scrollbar-track-blue-300 dark:scrollbar-thumb-gray-500 dark:scrollbar-track-[transparent] hover:scrollbar- "
              >
                {sortedChats &&
                  sortedChats.map((chat) => <MessageCard chat={chat} />)}
                <div ref={secondDivRef} id="scrollToMe"></div>
              </div>
            )}
            {
              <div
                onClick={() => {
                  console.log("click");
                  secondDivRef.current.scrollIntoView({ behavior: "smooth" });
                }}
                className="absolute z-10 right-[20px] cursor-pointer p-3 dark:bg-[#1d232a] rounded-lg"
                style={{
                  bottom: `${
                    ReplyObject.ReplyTextId
                      ? `${replyDivHeight + 70}px`
                      : "70px"
                  }`,
                }}
              >
                <AiOutlineArrowDown size={23} />
              </div>
            }
          </main>
          <Input />
        </div>
      </div>
    )
  );
};

export default ContentContainer;
