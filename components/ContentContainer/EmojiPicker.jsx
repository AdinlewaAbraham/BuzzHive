import React, { useEffect } from "react";
import { topEmojiUnified } from "@/utils/emojis";
import { Emoji } from "emoji-picker-react";
import Menu from "@mui/joy/Menu";

const EmojiPicker = ({
  setshowReactEmojiTray,
  addEmojiToLastUsedEmojiTray,
  handleEmojiReaction,
}) => {
  useEffect(() => {
    const event = window.addEventListener("click", (e) => {
      if (!e.target.closest(".emoji-picker")) {
        setshowReactEmojiTray(false);
      }
    });

    return () => event;
  }, []);
  return (
        <div className="emoji-picker scrollBar z-50 grid h-[300px] max-h-full  auto-cols-min grid-cols-6 gap-[2px] overflow-y-auto rounded-lg bg-light-primary p-2 dark:bg-dark-primary">
          {topEmojiUnified.map((emoji) => (
            <div
              key={emoji}
              className="flex items-center justify-center rounded-lg p-1"
            >
              <i
                onClick={() => {
                  addEmojiToLastUsedEmojiTray(emoji);
                  handleEmojiReaction(emoji);
                }}
                className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-lg p-1 hover:bg-hover-light dark:hover:bg-hover-dark"
              >
                <Emoji unified={emoji} size={25} />
              </i>
            </div>
          ))}
        </div>
  );
};

export default EmojiPicker;
