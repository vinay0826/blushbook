/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          primary: "#FFC0CB",
          background: "#FFF5F7",
          accent: "#E6A4B4",
          text: "#4A4A4A",
          hover: "#D7899F"
        }
      },
      boxShadow: {
        card: "0 8px 24px rgba(230, 164, 180, 0.15)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};
