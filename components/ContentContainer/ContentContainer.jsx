import {
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import Input from "../input/Input";
import SelectedChannelContext from "@/context/SelectedChannelContext ";
import { UserContext } from "../App";
import { MdGroup } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { AiOutlineSearch } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { AiOutlineArrowDown, AiOutlineLine } from "react-icons/ai";
import AboutProfile from "./AboutProfile";
import MessageCard from "./MessageCard";
import Img from "../Img";
import { FaUserAlt } from "react-icons/fa";
import { formatChats } from "@/utils/actualUtils/formatChats";
import Menu from "@mui/joy/Menu";
import { GiCancel } from "react-icons/gi";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";
import { RxDividerVertical } from "react-icons/rx";
import { CircularProgress } from "@mui/joy";
import InfiniteScroll from 'react-infinite-scroller';

const ContentContainer = () => {
  const {
    Chats,
    setChats,
    ChatObject,
    setChatObject,
    showChats,
    setshowChats,
    ReplyObject,
    replyDivHeight,
    allowScrollObject,
    setallowScrollObject,
  } = useContext(SelectedChannelContext);
  const { User } = useContext(UserContext);

  const [sortedChats, setSortedChats] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [showProfile, setshowProfile] = useState(false);
  const [IsMobile, setIsMobile] = useState(false);
  const secondDivRef = useRef(null);
  const [invalidURL, setinvalidURL] = useState(true);
  const [Searchanchor, setSearchanchor] = useState(null);
  const isOpen = Boolean(Searchanchor);
  const [searchedMessages, setsearchedMessages] = useState([]);
  const [currentSearchIndex, setcurrentSearchIndex] = useState(-1);

  const [hasMoreTop, sethasMoreTop] = useState(true);

  const [showScrollTobottom, setshowScrollTobottom] = useState(false);
  const [SearchText, setSearchText] = useState("");

  const [showSearchPara, setshowSearchPara] = useState(false);
  const [activeIndexId, setactiveIndexId] = useState();

  const scrollContainerRef = useRef(null);
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
    setshowSearchPara(false);
  }, [isOpen]);

  useEffect(() => {
    if (ChatObject.photoUrl && ChatObject.photoUrl.props) {
      setPhotoUrl(ChatObject.photoUrl.props.src);
    }
  }, [ChatObject.photoUrl]);
  useEffect(() => {
    if (!IsMobile) setshowChats(true);
  }, [IsMobile]);

  useEffect(() => {
    if (secondDivRef.current && allowScrollObject.allowScroll) {
      if (allowScrollObject.scrollTo === "bottom") {
        secondDivRef.current?.scrollIntoView({
          behavior: allowScrollObject.scrollBehaviour,
        });
      } else if (allowScrollObject.scrollTo === "unreadId") {
        const element = document.getElementById("unreadId");
        element?.scrollIntoView();
        console.log(element);
      }
      setallowScrollObject({
        scrollTo: "",
        scrollBehaviour: "",
        allowScroll: false,
      });
    }
  }, [sortedChats]);

  useEffect(() => {
    console.log(searchedMessages[currentSearchIndex]);

    if (searchedMessages[currentSearchIndex]) {
      setactiveIndexId(searchedMessages[currentSearchIndex].id);
    }
  }, [currentSearchIndex]);

  useEffect(() => {
    sethasMoreTop(true)
  }, [ChatObject.activeChatId])

  useMemo(() => {
    if (Chats == []) return;
    if (Chats) {
      setSortedChats(
        Chats.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds)
      );
    }
  }, [Chats]);
  if (ChatObject.activeChatId == "") {
    return (
      <div className="hidden flex-1  items-center justify-center overflow-hidden bg-light-secondary dark:bg-dark-secondary md:flex">
        no active chat right now
      </div>
    );
  }

  const mainContentStyle = {
    overflowY: "auto",
    height: `calc(100vh - 123px${ReplyObject.ReplyTextId ? ` - ${replyDivHeight}px` : ""
      })`,
  };
  const handleSearch = (event) => {
    setSearchText(event.target.value);
    const searchText = event.target.value.toLowerCase();
    if (searchText) {
      setshowSearchPara(true);
    } else {
      setshowSearchPara(false);
    }
    const filteredChats = sortedChats.filter((chat) => {
      const searchWords = searchText.toLowerCase().split(" ");
      const chatWords = chat.text.toLowerCase().split(" ");

      return searchWords.every((searchWord) => chatWords.includes(searchWord));
    });

    const reversedChats = filteredChats.reverse();
    setsearchedMessages(reversedChats);
    setcurrentSearchIndex(-1);
  };
  return (
    showChats && (
      <div className={`flex-1 ${IsMobile ? "fixed inset-0" : ""}`}>
        <div className=" inset relative flex-col overflow-y-auto  bg-[#E0E0E0] dark:bg-[#12171d] md:flex ">
          {showProfile && (
            <AboutProfile
              setshowProfile={setshowProfile}
              ChatObject={ChatObject}
            />
          )}
          <div
            className="z-20 flex max-h-[66px] cursor-pointer  items-center justify-between bg-[#fcfcfc] px-[13px] dark:bg-[#1d232a] md:ml-[1px]"

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
                  className={`flex h-[40px] w-[40px] items-center rounded-full justify-center${ChatObject.photoUrl === null ? "pt-[3px]" : ""
                    }`}
                >
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#dfe5e7] text-[#ffffff] dark:bg-gray-500">
                    <div className="flex items-center justify-center rounded-full bg-inherit text-[30px]">
                      {ChatObject.photoUrl && invalidURL ? (
                        <img
                          src={ChatObject.photoUrl}
                          alt="profile pic"
                          className={`h-full rounded-full object-cover`}
                          onError={() => setinvalidURL(false)}
                        />
                      ) : ChatObject.activeChatType === "group" ? (
                        <i className="text-[30px]">
                          <MdGroup />
                        </i>
                      ) : (
                        <i className="text-[25px]">
                          <FaUserAlt />
                        </i>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-[10px]">{ChatObject.displayName}</div>
              </div>
            </div>

            <div
              className=" hover:bg-hover cursor-pointer rounded-lg  p-3 "
              onClick={(e) => {
                setSearchanchor(e.currentTarget);
              }}
            >
              <AiOutlineSearch />
            </div>
            <Menu
              anchorEl={Searchanchor}
              variant="plain"
              open={isOpen}
              disableFocusRipple={true}
              onClose={() => { }}
              placement={"bottom-end"}
              sx={{
                backgroundColor: "transparent",
                boxShadow: "none",
                paddingTop: "15px",
              }}
            >
              <div
                className="[&>i]: [&>i]:text-muted relative flex rounded-lg 
              bg-light-primary p-2 dark:bg-dark-primary
               [&>i]:cursor-pointer [&>i]:rounded-lg  [&>i]:p-2
               [&>i]:text-lg"
              >
                <div className="relative flex w-full items-center justify-center">
                  <input
                    autoFocus
                    type="text"
                    className=" mr-1 flex w-full items-center justify-center rounded-lg bg-light-secondary py-1 px-3
                   pr-[50px]  text-black placeholder-muted-light outline-none
                   dark:bg-dark-secondary  dark:text-white dark:placeholder-muted-dark"
                    placeholder="Search"
                    onChange={handleSearch}
                  />
                  {showSearchPara && (
                    <p className="text-muted absolute right-3 flex whitespace-nowrap text-center  text-[12px] ">
                      {searchedMessages.length === 0
                        ? 0
                        : currentSearchIndex + 1}{" "}
                      of {searchedMessages.length}
                    </p>
                  )}
                </div>
                <i
                  className="hover:bg-hover "
                  onClick={() => {
                    if (currentSearchIndex === searchedMessages.length - 1)
                      return;

                    const nextIndex = Math.min(
                      currentSearchIndex + 1,
                      searchedMessages.length - 1
                    );
                    const scrollToElement = searchedMessages[nextIndex];

                    if (scrollToElement) {
                      document
                        .getElementById(scrollToElement.id)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });

                      setcurrentSearchIndex(nextIndex);
                    }
                  }}
                >
                  <BsChevronUp />
                </i>
                <i
                  className="hover:bg-hover mr-1"
                  onClick={() => {
                    if (currentSearchIndex === 0) return;

                    const prevIndex = Math.max(currentSearchIndex - 1, 0);
                    const scrollToElement = searchedMessages[prevIndex];

                    if (scrollToElement) {
                      document
                        .getElementById(scrollToElement.id)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });

                      setcurrentSearchIndex(prevIndex);
                    }
                  }}
                >
                  <BsChevronDown />
                </i>
                <div className="text-muted flex items-center justify-center">
                  <i className="h-4">
                    <RxDividerVertical />
                  </i>
                </div>
                <i
                  className="hover:bg-hover"
                  onClick={() => {
                    setSearchanchor(null);
                    setSearchText("");
                    setsearchedMessages([]);
                    setactiveIndexId("");
                  }}
                >
                  <GiCancel />
                </i>
              </div>
            </Menu>
          </div>
          <main
            style={mainContentStyle}
            className="flex h-[calc(100vh-123px)] flex-col justify-end"
          >
            {Chats == null ? (
              <div className="mb-4 flex items-center justify-center text-center">
                <CircularProgress size="sm" variant="plain" />{" "}
                <p className="ml-2"> Loading...</p>
              </div>
            ) : Chats.length == 0 ? (
              <>{/* empty state comp */}</>
            ) : (
              <div
                className="scrollBar w-full overflow-y-auto"
                //  onScroll={handleScroll}
                ref={scrollContainerRef}
              >
                <InfiniteScroll
                  pageStart={0}
                  loadMore={() => {
                    const firstBottomMessage = Chats[0];
                    const messages = JSON.parse(
                      localStorage.getItem(`${ChatObject.activeChatId}`)
                    );

                    const newMessages = messages.filter(
                      (message) =>
                        message.timestamp?.seconds < firstBottomMessage.timestamp?.seconds
                    );
                    if (newMessages.length === 0 && hasMoreTop) {
                      sethasMoreTop(false);
                    }
                    const sortedMessages = newMessages.sort(
                      (a, b) => a.timestamp.seconds - b.timestamp.seconds
                    );
                    const first30 = sortedMessages.splice(-30);
                    const newChats = [...first30, ...sortedChats]
                    setChats(newChats);
                  }}
                  hasMore={hasMoreTop}
                  loader={
                    <div className="mb-5 mt-3 flex items-center justify-center">
                      <i className="mr-2">
                        <CircularProgress variant="plain" size="sm" />
                      </i>{" "}
                      loading more chats...
                    </div>}
                  useWindow={false}
                  isReverse
                >
                  {sortedChats &&
                    formatChats(sortedChats).map((chat) => (
                      <MessageCard
                        chat={chat}
                        searchText={SearchText}
                        activeIndexId={activeIndexId}
                        searchedMessages={searchedMessages.map(
                          (message) => message.id
                        )}
                      />
                    ))}
                </InfiniteScroll>
                <div ref={secondDivRef} id="scrollToMe"></div>
              </div>
            )}
            {showScrollTobottom && (
              <div
                onClick={() => {
                  secondDivRef.current.scrollIntoView({ behavior: "smooth" });
                }}
                className="absolute right-[20px] z-10 cursor-pointer rounded-lg p-3 dark:bg-[#1d232a]"
                style={{
                  bottom: `${ReplyObject.ReplyTextId
                    ? `${replyDivHeight + 120}px`
                    : "120px"
                    }`,
                }}
              >
                <AiOutlineArrowDown size={23} />
              </div>
            )}
          </main>
          <Input />
        </div>
      </div>
    )
  );
};

export default ContentContainer;
