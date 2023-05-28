import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { BsSun } from "react-icons/bs";
import { BsMoon } from "react-icons/bs";

const Settings = () => {
  const [Mounted, setMounted] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);

  const renderThemeChanger = () => {
    if (!Mounted) return null;
    const currenTheme = theme === "system" ? systemTheme : theme;

    if (currenTheme === "dark") {
      return (
        <i
          onClick={() => {
            setTheme("light");
          }}
        >
          <BsSun size={50} />
        </i>
      );
    } else {
      return (
        <i
          onClick={() => {
            setTheme("dark");
          }}
        >
          <BsMoon color="black" size={50} />
        </i>
      );
    }
  };
  return (
    <div className="flex justify-center items-center h-screen">
      {renderThemeChanger()}
    </div>
  );
};

export default Settings;
