/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F14",
        surface: "#131A22",
        surface2: "#1B242E",
        line: "#243040",
        amber: "#FFB000",
        cyan: "#4FD1E8",
        danger: "#FF4757",
        ink: "#E8EDF2",
        muted: "#7C8B99",
      },
      fontFamily: {
        display: ["'Big Shoulders Display'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-20%)" },
          "100%": { transform: "translateX(520%)" },
        },
        blip: {
          "0%,100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.25)" },
        },
        giggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        sweep: "sweep 2.6s linear infinite",
        blip: "blip 1.8s ease-in-out infinite",
        giggle: "giggle 0.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
