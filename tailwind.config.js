/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      idle: { min: "800px", max: "1023px" },
    },
    extend: {
      colors: {
        gray: {
          900: "#202225",
          800: "#2f3136",
          700: "#36393f",
          600: "#4f545c",
          400: "#d4d7dc",
          300: "#e3e5e8",
          200: "#ebedef",
          100: "#f2f3f5",
        },
        dark: {
          primary: "#1d232a",
          secondary: "#12171d",
        },
        light: {
          primary: "#fcfcfc",
          secondary: "#E0E0E0",
        },
        accent: {
          blue: "#3B82F6"
        },
        muted: {
          light: "#212529bf",
          dark: "#aaa",
        },
        hover: {
          light: "#f5f6f6",
          dark: "#36393f",
        },
        scrollbar: {
dark: "#666b7a",
light: "#666b7a",
        },
      },
    },
  },

  plugins: [require("tailwind-scrollbar")],
};
