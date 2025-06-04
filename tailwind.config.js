/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  // ✅ Correct preset path
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
