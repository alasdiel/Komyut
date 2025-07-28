// @type {import('tailwindcss').Config}
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        epilogue: ['Epilogue', 'sans-serif'],   
      },
      colors: {
        'komyutGreen': '#349C1C',
        komyutOrange: '#FC711C',
        komyutLightOrange: '#FDA23E',
        komyutBlue: '#1F4D9D',
        komyutWhite: '#FEFEFE',
        komyutGrey: '#343434',
        komyutLightGrey: '#D9D9D9',
      }
    }
  },
  plugins: [],
}
