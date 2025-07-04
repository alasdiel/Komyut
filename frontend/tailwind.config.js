// @type {import('tailwindcss').Config}
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "oklch(0.675 0.1788 45.81)", // main orange color, #ec6b1e
        accent: "oklch(0.7859 0.1674 70.04)", // accent orange color
        #fca311
        blue: "oklch(0.6231 0.188 259.81)", // light blue color
        #3b82f6
        red: "oklch(0.6122 0.2082 22.24)", // light red color
        #e63946
        "gray-light": "oklch(0.967 0.0029 264.54)", // lighter-gray
        #f3f4f6
        "gray-dark": "oklch(0.551 0.0234 264.36)", // darker-gray
        #6b7280
        bg: "oklch(1 0 0)", // white bg
        #ffffff"
        footer: "oklch(0.6957 0.1943 43.24)", // footer orange color
        #fb6a1d
        "footer-accent": "oklch(0.6957 0.1943 43.24)", // footer accent orange color
        #fca652
      },
    },
  },
  plugins: [],
}

