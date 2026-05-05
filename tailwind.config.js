/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        mist: "#f6f8fb",
        brand: {
          50: "#effdf9",
          100: "#ccfbef",
          600: "#0f766e",
          700: "#0f5f59",
        },
      },
      boxShadow: {
        panel: "0 18px 50px rgba(23, 33, 43, 0.08)",
      },
    },
  },
  plugins: [],
};

