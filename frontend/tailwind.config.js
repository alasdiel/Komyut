// @type {import('tailwindcss').Config}
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ec6b1e", // main orange color
        accent: "#fca311", // accent orange color
        blue: "#3b82f6", // light blue color
        red: "#e63946", // light red color
        "gray-light": "#f3f4f6", // lighter-gray
        "gray-dark": "#6b7280", // darker-gray
        bg: "#ffffff", // white bg
        footer: "#fb6a1d", // footer orange color
        "footer-accent": "#fca652", // footer accent orange color
      },
    },
  },
  plugins: [],
}

