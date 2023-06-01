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
import Img from "../Img";

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
  Chats;

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
      <div className="hidden flex-1  items-center justify-center overflow-hidden bg-gray-300 dark:bg-[#12171d] md:flex">
        no active chat right now
      </div>
    );
  }
  ReplyObject.divHeight;

  const mainContentStyle = {
    overflowY: "auto",
    height: `calc(100vh - 123px${
      ReplyObject.ReplyTextId ? ` - ${replyDivHeight}px` : ""
    })`,
  };
  return (
    showChats && (
      <div className={`flex-1 ${IsMobile ? "fixed inset-0" : ""}`}>
        <div className=" inset relative flex-col overflow-y-auto  bg-[#f0f2f5] dark:bg-[#12171d] md:flex ">
          {showProfile && (
            <AboutProfile
              setshowProfile={setshowProfile}
              ChatObject={ChatObject}
            />
          )}
          <div
            className="z-20 flex max-h-[66px] cursor-pointer  items-center justify-between bg-[#fcfcfc] px-[13px] dark:bg-[#1d232a] md:ml-[1px]"
            onClick={() => {
              //setshowProfile(true);
            }}
          >
            <div className="flex h-full items-center p-[13px]">
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
                className="flex h-full items-center"
                onClick={() => {
                  setshowProfile(true);
                }}
              >
                <div
                  className={`flex h-[40px] w-[40px] items-center rounded-full justify-center${
                    ChatObject.photoUrl === null ? "pt-[3px]" : ""
                  }`}
                >
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#dfe5e7] text-[#ffffff] dark:bg-gray-500">
                    <Img
                      src={ChatObject.photoUrl}
                      type={ChatObject.activeChatType}
                      styles="justify-center flex rounded-full items-center"
                      imgStyles="rounded-full w-full h-full"
                      groupSize={80}
                      personalSize={60}
                    />
                  </div>
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
            className="flex h-[calc(100vh-123px)] flex-col justify-end"
          >
            {Chats == null ? (
              <div className="text-center text-2xl">Loading</div>
            ) : Chats.length == 0 ? (
              <>you have nothing </>
            ) : (
              <div
                className="my-element  my-element scrollbar-thumb-rounded-[2px]  w-full overflow-y-auto  scrollbar-thin scrollbar-track-[transparent]
                scrollbar-thumb-[#ced0d1] dark:scrollbar-thumb-gray-500  "
              >
                {sortedChats &&
                  sortedChats.map((chat) => <MessageCard chat={chat} />)}
                <div ref={secondDivRef} id="scrollToMe"></div>
              </div>
            )}
            {
              <div
                onClick={() => {
                  ("click");
                  secondDivRef.current.scrollIntoView({ behavior: "smooth" });
                }}
                className="absolute right-[20px] z-10 hidden cursor-pointer rounded-lg p-3 dark:bg-[#1d232a]"
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
