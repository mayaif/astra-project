/**
 * @format
 * @type {import('tailwindcss').Config}
 */

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#161622",
        secondary: {
          DEFAULT: "#FF9C01",
          50: "#FFD600",
          100: "#FF9001",
          200: "#FF8E01",
          300: "#FFBD00",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          100: "#CDCDE0",
        },
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
        mextralight: ["Manrope-ExtraLight", "sans-serif"],
        mlight: ["Manrope-Light", "sans-serif"],
        mregular: ["Manrope-Regular", "sans-serif"],
        mmedium: ["Manrope-Medium", "sans-serif"],
        msemibold: ["Manrope-SemiBold", "sans-serif"],
        mbold: ["Manrope-Bold", "sans-serif"],
        mextrabold: ["Manrope-ExtraBold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
