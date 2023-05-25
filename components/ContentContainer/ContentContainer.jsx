import { useContext, useState, useMemo, useEffect, useRef } from "react";
import Input from "../input/Input";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { MdGroup } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { AiOutlineSearch } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { AiOutlineArrowDown } from "react-icons/ai";
import AboutProfile from "./AboutProfile";
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
            <AboutProfile
              setshowProfile={setshowProfile}
              ChatObject={ChatObject}
            />
          )}
          <div
            className="flex justify-between md:ml-[1px] items-center dark:bg-[#1d232a] px-[13px] max-h-[66px] z-20 cursor-pointer"
            onClick={() => {
              //setshowProfile(true);
            }}
          >
            <div className="flex items-center h-full p-[13px]">
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
                className="flex items-center h-full"
                onClick={() => {
                  setshowProfile(true);
                }}
              >
                <div
                  className={`h-[40px] w-[40px] rounded-full flex item-center justify-center bg-gray-500 ${
                    ChatObject.photoUrl === null ? "pt-[3px]" : ""
                  }`}
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
                className="hidden absolute z-10 right-[20px] cursor-pointer p-3 dark:bg-[#1d232a] rounded-lg"
                style={{
                  bottom: `${
                    ReplyObject.ReplyTextId
                      ? `${replyDivHeight + 120}px`
                      : "120px"
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
